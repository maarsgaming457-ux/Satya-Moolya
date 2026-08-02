import logging
import json
import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any

from app.services.damage_detection_service import DamageDetectionEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspection/damage", tags=["Damage Detection"])

# Singleton engine
engine = DamageDetectionEngine()

@router.post("")
async def detect_damage(
    view: str = Form(...),
    components_json: str = Form(...),
    image: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Analyzes the provided image and previously detected components for physical damage.
    """
    if view not in ["Front", "Back", "Left", "Right", "Top", "Bottom"]:
        raise HTTPException(status_code=400, detail="Invalid view specified")
        
    try:
        components = json.loads(components_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid components JSON")
        
    try:
        # Read the image file into a numpy array
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = await asyncio.to_thread(cv2.imdecode, nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        # Run detection engine (Offloaded)
        results = await asyncio.to_thread(engine.analyze, frame, view, components)
        
        return results
        
    except Exception as e:
        logger.error(f"Error in damage detection endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during damage detection")
