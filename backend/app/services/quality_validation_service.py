import logging
import time
import cv2
import numpy as np
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class QualityValidationService:
    def __init__(self):
        # Thresholds
        self.MIN_BLUR_SCORE = 100.0
        self.MIN_BRIGHTNESS = 40.0
        self.MAX_BRIGHTNESS = 230.0
        self.MIN_PHONE_AREA = 0.15
        self.EDGE_MARGIN = 0.02
        
    def validate(self, frame: np.ndarray, tracks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates the frame quality and phone visibility.
        Returns a dictionary with acceptance status and detailed metrics.
        """
        start_time = time.time()
        
        # Default response
        response = {
            "accepted": False,
            "quality_score": 0,
            "metrics": {
                "blur": 0,
                "brightness": 0,
                "contrast": 0,
                "sharpness": 0,
                "visibility": 0
            },
            "reason": "No phone detected"
        }
        
        if frame is None or len(tracks) == 0:
            return response
            
        try:
            # 1. Visibility Check (Find the most confident or largest track)
            # For simplicity, we'll pick the track with the highest confidence
            primary_track = max(tracks, key=lambda t: t.get("confidence", 0))
            bbox = primary_track["bbox"]
            x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
            
            # Visibility logic
            if w * h < self.MIN_PHONE_AREA:
                response["reason"] = "Move Phone Closer"
                return response
                
            if (x < self.EDGE_MARGIN or y < self.EDGE_MARGIN or 
                (x + w) > (1.0 - self.EDGE_MARGIN) or (y + h) > (1.0 - self.EDGE_MARGIN)):
                response["reason"] = "Entire Phone Not Visible"
                return response
            
            response["metrics"]["visibility"] = 100
            
            # 2. Image Quality Checks (Compute on grayscale)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # We can optionally crop to the phone bounding box for accurate quality assessment
            img_h, img_w = gray.shape
            crop_x1 = max(0, int(x * img_w))
            crop_y1 = max(0, int(y * img_h))
            crop_x2 = min(img_w, int((x + w) * img_w))
            crop_y2 = min(img_h, int((y + h) * img_h))
            
            if crop_x2 > crop_x1 and crop_y2 > crop_y1:
                roi = gray[crop_y1:crop_y2, crop_x1:crop_x2]
            else:
                roi = gray
                
            # Brightness (Mean) and Contrast (Std Dev)
            mean_val, std_val = cv2.meanStdDev(roi)
            brightness = float(mean_val[0][0])
            contrast = float(std_val[0][0])
            
            response["metrics"]["brightness"] = int(brightness)
            response["metrics"]["contrast"] = int(contrast)
            
            if brightness < self.MIN_BRIGHTNESS:
                response["reason"] = "Too Dark"
                return response
            elif brightness > self.MAX_BRIGHTNESS:
                response["reason"] = "Too Bright"
                return response
                
            # Blur / Sharpness (Variance of Laplacian)
            laplacian_var = cv2.Laplacian(roi, cv2.CV_64F).var()
            blur_score = float(laplacian_var)
            
            response["metrics"]["blur"] = int(blur_score)
            response["metrics"]["sharpness"] = int(blur_score)
            
            if blur_score < self.MIN_BLUR_SCORE:
                response["reason"] = "Too Blurry"
                return response
                
            # If we passed all checks, accept the frame
            response["accepted"] = True
            response["reason"] = "Excellent Image"
            
            # Simple composite score (weighted sum, capped at 100)
            score = min(100, int((blur_score / 500.0) * 40 + (contrast / 100.0) * 30 + 30))
            response["quality_score"] = max(50, score) # Minimum 50 if accepted
            
            elapsed = (time.time() - start_time) * 1000
            if elapsed > 10:
                logger.warning(f"Quality validation took {elapsed:.1f}ms")
                
            return response
            
        except Exception as e:
            logger.error(f"Error during quality validation: {e}")
            response["reason"] = "Internal validation error"
            return response
