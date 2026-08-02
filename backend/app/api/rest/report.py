import logging
from fastapi import APIRouter, HTTPException, Body, BackgroundTasks
from typing import Dict, Any

from app.services.report_service import ReportGeneratorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspection/report", tags=["Report"])

# Singleton service
report_service = ReportGeneratorService()

@router.post("")
async def generate_inspection_report(
    payload: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Consumes the completely aggregated pipeline payload and generates
    a PDF and JSON report.
    """
    if not payload.get("device") or not payload.get("inspection"):
        raise HTTPException(status_code=400, detail="Incomplete inspection data provided.")
        
    try:
        results = await report_service.generate_report(payload)
        return results
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during report generation")
