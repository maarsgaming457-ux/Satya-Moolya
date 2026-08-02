import logging
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any

from app.services.pricing_engine import ProductionPricingEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspection/pricing", tags=["Pricing"])

# Singleton engine
engine = ProductionPricingEngine()

@router.post("")
async def calculate_price(
    payload: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Consumes structured JSON containing device metadata and the final inspection results
    (including Gemini reasoning output) to calculate a deterministic fair market value.
    """
    device = payload.get("device")
    inspection = payload.get("inspection")
    
    if not device or not inspection:
        raise HTTPException(status_code=400, detail="Missing 'device' or 'inspection' payload")
        
    try:
        results = engine.calculate_price(device, inspection)
        
        if results.get("error"):
            raise HTTPException(status_code=400, detail=results.get("message"))
            
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in pricing endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during price calculation")
