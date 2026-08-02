import logging
import time
from typing import Dict, Any, List
import numpy as np
from types import SimpleNamespace

logger = logging.getLogger(__name__)

class TrackingService:
    def __init__(self, track_buffer: int = 30):
        self.tracker = None
        try:
            from ultralytics.trackers.byte_tracker import BYTETracker
        except ImportError:
            logger.error("BYTETracker not available. Tracking disabled.")
            return
            
        # Initialize ByteTrack with default/optimized arguments
        args = SimpleNamespace(
            track_high_thresh=0.5,
            track_low_thresh=0.1,
            new_track_thresh=0.6,
            track_buffer=track_buffer,
            match_thresh=0.8,
            gmc_method="sparseOptFlow", # or None
            fuse_score=True
        )
        try:
            self.tracker = BYTETracker(args)
            logger.info("BYTETracker initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize BYTETracker: {e}")

    def update(self, raw_results) -> List[Dict[str, Any]]:
        """
        Takes raw YOLO Results object, updates ByteTrack, and returns formatted active tracks.
        """
        # If no raw_results, we can't update properly, return empty
        if raw_results is None or not hasattr(raw_results, 'boxes'):
            return []

        try:
            # Get current timestamp
            now = time.time()
            
            # Extract boxes object, handle None
            boxes = raw_results.boxes
            if boxes is None:
                # We can't update tracker with None, but we want to age out tracks
                # Passing empty tensor
                import torch
                boxes = torch.empty((0, 6), device=self.tracker.args.device if hasattr(self.tracker.args, "device") else "cpu")
            
            # BYTETracker.update expects `results` with `results.conf`, `results.xywh`, `results.cls`
            # which are available on raw_results.boxes (but ultralytics tracker might expect the raw det format)
            # Actually, `self.tracker.update(det)` expects a tensor `det` if we bypass the Ultralytics Results wrapper, 
            # OR we can just pass `raw_results.boxes` if Ultralytics handles it. 
            # In Ultralytics 8.x, BYTETracker.update expects a `Results.boxes` object directly, or a tensor?
            # Wait, looking at the previous traceback, it crashed because it tried to access `.conf` on `results`.
            # So `self.tracker.update()` expects a `Boxes` object, not `Results`.
            self.tracker.update(boxes)
            
            formatted_tracks = []
            
            # The original image shape is needed to normalize coordinates
            # Usually `raw_results.orig_shape` is available
            h, w = (640, 640)
            if hasattr(raw_results, 'orig_shape') and raw_results.orig_shape is not None:
                h, w = raw_results.orig_shape
            
            # Extract from tracked_stracks
            for st in self.tracker.tracked_stracks:
                # tlwh = top-left x, top-left y, width, height
                tlwh = st.tlwh
                x1, y1, tw, th = tlwh
                nx = float(x1) / w
                ny = float(y1) / h
                nw = float(tw) / w
                nh = float(th) / h
                
                # STrack state mapping: 1=New, 2=Tracked, 3=Lost, 4=Removed
                state_map = {1: "New", 2: "Tracked", 3: "Lost", 4: "Removed"}
                state_str = state_map.get(st.state, "Unknown")
                
                # Extract velocity from Kalman mean [x, y, a, h, vx, vy, va, vh]
                vx, vy = 0.0, 0.0
                if hasattr(st, 'mean') and st.mean is not None and len(st.mean) >= 6:
                    vx = float(st.mean[4])
                    vy = float(st.mean[5])
                    
                formatted_tracks.append({
                    "track_id": int(st.track_id),
                    "confidence": float(st.score),
                    "class": "phone",
                    "bbox": {
                        "x": nx,
                        "y": ny,
                        "width": nw,
                        "height": nh
                    },
                    "track_age": int(st.tracklet_len),
                    "track_state": state_str,
                    "velocity": {"vx": vx, "vy": vy},
                    "timestamp": now
                })
                
            # Extract from lost_stracks to communicate occlusions/loss to frontend
            for st in self.tracker.lost_stracks:
                tlwh = st.tlwh
                x1, y1, tw, th = tlwh
                nx, ny, nw, nh = float(x1)/w, float(y1)/h, float(tw)/w, float(th)/h
                
                state_map = {1: "New", 2: "Tracked", 3: "Lost", 4: "Removed"}
                state_str = state_map.get(st.state, "Lost")
                
                vx, vy = 0.0, 0.0
                if hasattr(st, 'mean') and st.mean is not None and len(st.mean) >= 6:
                    vx = float(st.mean[4])
                    vy = float(st.mean[5])
                    
                formatted_tracks.append({
                    "track_id": int(st.track_id),
                    "confidence": float(st.score),
                    "class": "phone",
                    "bbox": {
                        "x": nx,
                        "y": ny,
                        "width": nw,
                        "height": nh
                    },
                    "track_age": int(st.tracklet_len),
                    "track_state": state_str,
                    "velocity": {"vx": vx, "vy": vy},
                    "timestamp": now
                })
            
            return formatted_tracks
            
        except Exception as e:
            logger.error(f"Error during tracking update: {e}", exc_info=True)
            return []
