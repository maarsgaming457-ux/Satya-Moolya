import logging
import time
import numpy as np
import threading
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FrameSelectionService:
    def __init__(self):
        # Rolling buffer dictionary
        # Format: { device_id: { "Front": { "score": 90.0, "frame": np.ndarray, "metadata": {} } } }
        self.best_frames: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def process_frame(
        self, 
        device_id: str, 
        frame: np.ndarray, 
        tracks: List[Dict[str, Any]], 
        validation: Dict[str, Any], 
        target_view: str, 
        frame_id: int
    ) -> Dict[str, Any]:
        """
        Evaluates a validated frame and decides whether to keep it as the best for the target view.
        """
        if not target_view:
            return {"selected": False, "reason": "No target view specified"}

        if not validation.get("accepted", False):
            return {"selected": False, "reason": "Frame rejected by validation"}

        # 1. Compute composite score
        val_score = validation.get("quality_score", 0)
        max_conf = max([t.get("confidence", 0) for t in tracks]) if tracks else 0
        
        # Weighted score: 70% from pure image quality, 30% from AI detection confidence
        composite_score = val_score * 0.7 + (max_conf * 100) * 0.3
        
        # 2. Check current best under lock
        with self._lock:
            if device_id not in self.best_frames:
                self.best_frames[device_id] = {}
                
            current_best = self.best_frames[device_id].get(target_view, {"score": -1})
            
            # 3. Replacement Policy
            # Replace if score is higher
            if composite_score > current_best["score"]:
                self.best_frames[device_id][target_view] = {
                    "score": composite_score,
                    "frame": frame.copy(),
                    "metadata": {
                        "frame_id": frame_id,
                        "quality_score": int(composite_score),
                        "tracks": tracks,
                        "validation": validation,
                        "view": target_view,
                        "timestamp": time.time()
                    }
                }
                logger.info(f"[{device_id}] Saved new best {target_view} frame (Score: {composite_score:.1f})")
                
                return {
                    "selected": True,
                    "view": target_view,
                    "quality_score": int(composite_score),
                    "reason": f"Highest quality {target_view} image"
                }
            
        return {
            "selected": False,
            "view": target_view,
            "quality_score": int(composite_score),
            "reason": "Existing frame has higher quality"
        }
