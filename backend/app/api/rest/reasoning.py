import logging
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspection/reasoning", tags=["Reasoning"])

# Singleton engine
engine = GeminiService()

@router.post("")
async def generate_inspection_summary(
    inspection_data: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Consumes the aggregated JSON from all 6 views (components and damages) 
    and uses Gemini to reason over the results and generate a structured summary.
    """
    if not inspection_data:
        raise HTTPException(status_code=400, detail="Missing inspection data")
        
    try:
        results = await engine.generate_summary(inspection_data)
        return results
        
    except Exception as e:
        logger.error(f"Error in reasoning endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during Gemini reasoning")
