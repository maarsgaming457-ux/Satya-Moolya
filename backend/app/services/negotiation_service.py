import logging
import uuid
from collections.abc import Sequence
from decimal import Decimal

from fastapi import HTTPException, status, BackgroundTasks

from app.models.marketplace import ListingStatus
from app.models.negotiation import Negotiation
from app.models.user import User
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.marketplace_repository import MarketplaceRepository
from app.repositories.negotiation_repository import NegotiationRepository
from app.schemas.negotiation import NegotiationOfferCreate
from app.services.gemini_service import GeminiService
from app.core.database import get_sessionmaker
from app.schemas.negotiation import NegotiationResponse

logger = logging.getLogger(__name__)


async def _run_ai_negotiation_task(
    negotiation_id: uuid.UUID,
    listing_id: uuid.UUID,
    seller_asking_price: Decimal,
    buyer_offer: Decimal,
    inspection_score: float,
    estimated_price: Decimal,
    gemini_service: GeminiService,
):
    try:
        ai_eval = await gemini_service.evaluate_offer(
            listing_id=listing_id,
            seller_asking_price=seller_asking_price,
            buyer_offer=buyer_offer,
            inspection_score=inspection_score,
            estimated_price=estimated_price,
        )
    except Exception as e:
        logger.error(f"GeminiService evaluate_offer failed: {e}")
        return

    async_session_factory = get_sessionmaker()
    async with async_session_factory() as session:
        repo = NegotiationRepository(session)
        negotiation = await repo.get_by_id(negotiation_id)
        if negotiation:
            negotiation.suggested_counter_offer = ai_eval.get(
                "suggested_counter_offer", 0
            )
            negotiation.acceptance_probability = ai_eval.get(
                "acceptance_probability", 0
            )
            negotiation.negotiation_summary = ai_eval.get(
                "negotiation_summary", "Evaluation complete."
            )
            await session.commit()
            logger.info(
                f"Updated negotiation {negotiation_id} successfully in background."
            )


class NegotiationService:
    def __init__(
        self,
        *,
        negotiation_repository: NegotiationRepository,
        marketplace_repository: MarketplaceRepository,
        inspection_repository: InspectionRepository,
        gemini_service: GeminiService,
    ) -> None:
        self.negotiation_repository = negotiation_repository
        self.marketplace_repository = marketplace_repository
        self.inspection_repository = inspection_repository
        self.gemini_service = gemini_service

    async def submit_offer(
        self,
        data: NegotiationOfferCreate,
        current_user: User,
        background_tasks: BackgroundTasks,
    ) -> NegotiationResponse:
        logger.info(
            f"User {current_user.id} submitting offer for listing {data.listing_id}"
        )

        listing = await self.marketplace_repository.get_by_id(data.listing_id)
        if not listing or listing.status != ListingStatus.ACTIVE:
            logger.warning(
                f"Listing {data.listing_id} is not available for negotiation."
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found or is no longer active.",
            )

        if listing.seller_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sellers cannot negotiate their own listings.",
            )

        inspection = await self.inspection_repository.get_latest_by_device(
            listing.device_id
        )
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Inspection data not found for this listing.",
            )

        # Create the initial negotiation record synchronously
        negotiation = Negotiation(
            listing_id=listing.id,
            buyer_id=current_user.id,
            offered_price=data.offered_price,
            suggested_counter_offer=0,
            acceptance_probability=0,
            negotiation_summary="Pending AI Evaluation",
        )

        created = await self.negotiation_repository.create(negotiation)
        logger.info(f"Successfully started negotiation {created.id}")

        # Dispatch AI task to background
        background_tasks.add_task(
            _run_ai_negotiation_task,
            created.id,
            listing.id,
            listing.price,
            data.offered_price,
            inspection.inspection_score,
            inspection.estimated_price,
            self.gemini_service,
        )

        return NegotiationResponse.model_validate(created)

    async def get_negotiation_history(
        self,
        listing_id: uuid.UUID,
        current_user: User,
        limit: int = 100,
        offset: int = 0,
    ) -> list[NegotiationResponse]:
        listing = await self.marketplace_repository.get_by_id(listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found.",
            )

        history = await self.negotiation_repository.list_by_listing(
            listing_id, limit=limit, offset=offset
        )
        return [NegotiationResponse.model_validate(n) for n in history]

    async def get_user_negotiations(
        self,
        current_user: User,
        status: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[NegotiationResponse]:
        history = await self.negotiation_repository.list_user_negotiations(
            current_user.id, status=status, limit=limit, offset=offset
        )
        return [NegotiationResponse.model_validate(n) for n in history]
