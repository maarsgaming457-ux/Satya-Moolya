import logging
import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any

from app.services.component_detection_service import GroundingDinoComponentDetector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspection/components", tags=["Component Detection"])

# Singleton detector
detector = GroundingDinoComponentDetector()

@router.post("")
async def detect_components(
    view: str = Form(...),
    image: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Analyzes the provided image for specific hardware components based on the view.
    This runs entirely independently of the WebSocket stream, meant for final high-quality frames.
    """
    if view not in ["Front", "Back", "Left", "Right", "Top", "Bottom"]:
        raise HTTPException(status_code=400, detail="Invalid view specified")
        
    try:
        # Read the image file into a numpy array
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = await asyncio.to_thread(cv2.imdecode, nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        # Run detection (Offloaded)
        results = await asyncio.to_thread(detector.predict, frame, view)
        
        return results
        
    except Exception as e:
        logger.error(f"Error in component detection endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during detection")
