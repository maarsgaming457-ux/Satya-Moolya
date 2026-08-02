import logging
import uuid
from fastapi import HTTPException, status, BackgroundTasks
from app.models.inspection import Inspection
from app.models.user import User
from app.repositories.device_image_repository import DeviceImageRepository
from app.repositories.device_repository import DeviceRepository
from app.repositories.inspection_repository import InspectionRepository
from app.services.gemini_service import GeminiService
from app.core.database import get_sessionmaker
from app.schemas.inspection import InspectionResponse

logger = logging.getLogger(__name__)


from app.services.vision_service import VisionService
from app.services.pricing_service import PricingService
from app.services.report_service import ReportGeneratorService
from app.models.device import DeviceStatus

async def _run_ai_inspection_task(
    inspection_id: uuid.UUID,
    device_id: uuid.UUID,
    accepted_images: list[dict],
    gemini_service: GeminiService,
    functional_tests: dict | None = None,
    seller_claims: dict | None = None,
):
    try:
        # 1. Process Vision (Object Detection Only)
        vision_service = VisionService()
        vision_data = await vision_service.run_ai_pipeline(accepted_images)

        # 2. Get Gemini Analysis
        image_urls = [img["url"] for img in accepted_images]
        analysis_result = await gemini_service.analyze_device(
            device_id=device_id, image_urls=image_urls, vision_data=vision_data
        )
    except Exception as e:
        logger.error(f"GeminiService analysis failed for device {device_id}: {e}")
        # In a real system, you might mark the inspection as FAILED here
        return

    # 3. Calculate Trust Score Breakdown
    trust_score_breakdown = {
        "base_score": 100,
        "penalties": []
    }
    
    blurry_count = sum(1 for v in vision_data if v.get("quality", {}).get("is_blurry", False))
    if blurry_count > 0:
        penalty = (blurry_count / max(len(accepted_images), 1)) * 40
        trust_score_breakdown["penalties"].append({
            "reason": f"{blurry_count} blurry images detected",
            "amount": -round(penalty, 2)
        })
        
    if not functional_tests:
        trust_score_breakdown["penalties"].append({
            "reason": "Missing Functional Tests",
            "amount": -20.0
        })
        
    total_penalty = sum(p["amount"] for p in trust_score_breakdown["penalties"])
    trust_score = max(100 + total_penalty, 0)
    trust_score_breakdown["final_score"] = int(trust_score)
    
    try:
        async_session_factory = get_sessionmaker()
        async with async_session_factory() as session:
            device_repo = DeviceRepository(session)
            device = await device_repo.get_by_id(device_id)
            if not device:
                return

            if not getattr(device, 'has_invoice', False):
                trust_score_breakdown["penalties"].append({
                    "reason": "Missing Invoice",
                    "amount": -10.0
                })
            
            if not getattr(device, 'has_warranty', False):
                trust_score_breakdown["penalties"].append({
                    "reason": "Out of Warranty / No Proof",
                    "amount": -5.0
                })

            if not getattr(device, 'accessories', []):
                trust_score_breakdown["penalties"].append({
                    "reason": "Missing Original Accessories",
                    "amount": -5.0
                })

            if functional_tests:
                skipped_tests = sum(1 for v in functional_tests.values() if v == "Skip")
                if skipped_tests > 0:
                    trust_score_breakdown["penalties"].append({
                        "reason": f"{skipped_tests} Skipped Functional Tests",
                        "amount": -(skipped_tests * 2.0)
                    })

            # Re-calculate
            total_penalty = sum(p["amount"] for p in trust_score_breakdown["penalties"])
            trust_score = max(100 + total_penalty, 0)
            trust_score_breakdown["final_score"] = int(trust_score)

            # 4. Pricing
            from app.services.pricing_engine import ProductionPricingEngine
            pricing_engine = ProductionPricingEngine()
            
            # Format inputs for RuleBasedPricingEngine
            device_dict = {
                "brand": getattr(device, 'brand', "Unknown"),
                "model": getattr(device, 'model', "Unknown"),
                "storage": getattr(device, 'storage_capacity', "Unknown")
            }
            
            # Extract views and damages from vision_data
            views = []
            for vd in vision_data:
                damages_list = []
                for det in vd.get("detections", []):
                    if "damage_type" in det:
                        damages_list.append({
                            "component": det.get("component", "Unknown"),
                            "severity": det.get("severity", "Minor"),
                            "damage_type": det.get("damage_type", "Unknown")
                        })
                views.append({
                    "damages": damages_list
                })
            
            inspection_dict = {
                "overall_condition": analysis_result.get("condition", "Good"),
                "confidence": analysis_result.get("confidence", 0.90),
                "views": views
            }
            
            pricing_result = pricing_engine.calculate_price(device_dict, inspection_dict)
            
            if pricing_result.get("error"):
                logger.warning(f"Pricing engine error: {pricing_result.get('message')}")
                estimated_price = 0
            else:
                estimated_price = pricing_result.get("Final Resale Value", 0)
            
            # Update device status
            if device.status == DeviceStatus.DRAFT or device.status == DeviceStatus.PENDING_INSPECTION:
                device.status = DeviceStatus.INSPECTED
            
            repo = InspectionRepository(session)
            inspection = await repo.get_by_id(inspection_id)
            if inspection:
                inspection.inspection_score = analysis_result.get("inspection_score", 0)
                inspection.trust_score = int(trust_score)
                inspection.estimated_price = estimated_price
                inspection.condition = analysis_result.get("condition", "Unknown")
                inspection.summary = analysis_result.get("summary", "Analysis complete")
                inspection.detected_issues = analysis_result.get("detected_issues", [])
                inspection.confidence = analysis_result.get("confidence", 0.0)
                inspection.valuation_breakdown = {"breakdown": pricing_result.get("breakdown", [])}
                inspection.evidence_report = []
                inspection.trust_score_breakdown = trust_score_breakdown
                inspection.evidence_schema = []
                inspection.pricing_schema = pricing_result
                inspection.claim_verification_results = {}
                if functional_tests:
                    inspection.functional_tests = functional_tests
                
                # 5. Generate Professional Report
                try:
                    report_svc = ReportGeneratorService()
                    report_urls = await report_svc.generate_report(inspection)
                    inspection.generated_files = {
                        "pdf": report_urls.get("pdf_url"),
                        "json": report_urls.get("json_url")
                    }
                    await session.commit()
                    logger.info(f"Report generated successfully for inspection {inspection_id}")
                except Exception as e:
                    logger.error(f"Failed to generate reports for {inspection_id}: {e}")
                
                logger.info(
                    f"Updated inspection {inspection_id} successfully in background."
                )
    except Exception as e:
        logger.error(f"Failed to save inspection results for device {device_id}: {e}")


class InspectionService:
    def __init__(
        self,
        *,
        device_repository: DeviceRepository,
        device_image_repository: DeviceImageRepository,
        inspection_repository: InspectionRepository,
        gemini_service: GeminiService,
    ) -> None:
        self.device_repository = device_repository
        self.device_image_repository = device_image_repository
        self.inspection_repository = inspection_repository
        self.gemini_service = gemini_service

    async def create_inspection(
        self,
        device_id: uuid.UUID,
        current_user: User,
        background_tasks: BackgroundTasks,
        functional_tests: dict | None = None,
        seller_claims: dict | None = None,
    ) -> InspectionResponse:
        logger.info(
            f"Starting inspection for device {device_id} by user {current_user.id}"
        )

        device = await self.device_repository.get_by_id_and_owner(
            device_id=device_id, owner_id=current_user.id
        )
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or not owned by user.",
            )

        images, _ = await self.device_image_repository.list_by_device(device.id)
        image_urls = [img.image_url for img in images]

        vision_service = VisionService()
        validation_report, accepted_images = await vision_service.validate_images(image_urls)

        if validation_report["accepted_images"] < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation_report,
            )

        # Persist a draft inspection to database immediately
        inspection = Inspection(
            device_id=device.id,
            inspection_score=0,
            trust_score=0,
            estimated_price=0,
            condition="Pending AI Analysis",
            summary="Inspection is running in the background. Please check back shortly.",
            detected_issues=[],
            confidence=0.0,
            functional_tests=functional_tests
        )

        created_inspection = await self.inspection_repository.create(inspection)
        logger.info(
            f"Successfully created pending inspection {created_inspection.id} for device {device.id}"
        )

        # Queue AI processing in background
        background_tasks.add_task(
            _run_ai_inspection_task,
            created_inspection.id,
            device.id,
            accepted_images,
            self.gemini_service,
            functional_tests,
            seller_claims
        )

        return InspectionResponse.model_validate(created_inspection)

    async def get_latest_inspection(
        self, device_id: uuid.UUID, current_user: User
    ) -> InspectionResponse:
        device = await self.device_repository.get_by_id_and_owner(
            device_id=device_id, owner_id=current_user.id
        )
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or not owned by user.",
            )

        inspection = await self.inspection_repository.get_latest_by_device(device.id)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No inspection found for this device.",
            )
        return InspectionResponse.model_validate(inspection)

    async def get_device_inspections(
        self,
        device_id: uuid.UUID,
        current_user: User,
        limit: int = 100,
        offset: int = 0,
    ) -> list[InspectionResponse]:
        device = await self.device_repository.get_by_id_and_owner(
            device_id=device_id, owner_id=current_user.id
        )
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or not owned by user.",
            )

        inspections = await self.inspection_repository.list_by_device(
            device.id, limit=limit, offset=offset
        )
        return [InspectionResponse.model_validate(i) for i in inspections]
