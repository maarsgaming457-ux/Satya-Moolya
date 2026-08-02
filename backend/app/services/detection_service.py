import logging
import time
import cv2
from typing import Dict, Any, List
import numpy as np
from app.services.grounding_dino_loader import get_grounding_dino

logger = logging.getLogger(__name__)

class DetectionService:
    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.50):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.device = "cpu"
        
        # State for internal tracking
        self.tracked_box = None
        self.failed_detections = 0
        self.frame_count = 0
        self.interleave_frames = 5
        self.last_results = None

        try:
            from ultralytics import YOLO
            import torch
            self._results_class = None
        except ImportError:
            logger.error("Ultralytics package not found. Detection service disabled.")
            return
            
        try:
            if torch.cuda.is_available():
                self.device = "cuda"
            elif torch.backends.mps.is_available():
                self.device = "mps"
                
            logger.info(f"Loading YOLO model {model_name} on {self.device}...")
            self.model = YOLO(model_name)
            
            dummy_input = np.zeros((640, 640, 3), dtype=np.uint8)
            self.model(dummy_input, device=self.device, verbose=False)
            logger.info("YOLO model loaded and warmed up successfully.")
            
            # Load Grounding DINO fallback
            try:
                self.dino_processor, self.dino_model, dino_device = get_grounding_dino()
                self.dino_device = dino_device
                logger.info("Grounding DINO loaded successfully for fallback validation.")
            except Exception as e:
                logger.error(f"Failed to load Grounding DINO fallback: {e}")
                self.dino_model = None
                self.dino_processor = None
                
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.model = None

    def _phone_presence_filter(self, frame: np.ndarray) -> bool:
        """Lightweight preprocessing to check if a phone is likely present."""
        if frame is None:
            return False
            
        # Downscale for performance
        small = cv2.resize(frame, (320, 240))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        
        # Canny edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return False
            
        # Find max contour area relative to frame
        max_area = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > max_area:
                max_area = area
                
        # If the largest edge boundary is extremely small, likely no phone
        total_area = 320 * 240
        if (max_area / total_area) < 0.01:
            return False
            
        return True
        
    def _get_roi(self, shape, box):
        """Expands bounding box by 20% to create ROI"""
        h, w = shape[:2]
        x1, y1, x2, y2 = box
        bw, bh = x2 - x1, y2 - y1
        
        pad_w = bw * 0.20
        pad_h = bh * 0.20
        
        rx1 = max(0, int(x1 - pad_w))
        ry1 = max(0, int(y1 - pad_h))
        rx2 = min(w, int(x2 + pad_w))
        ry2 = min(h, int(y2 + pad_h))
        
        return rx1, ry1, rx2, ry2

    def _create_mock_results(self, frame, box, conf):
        """Creates an ultralytics Results object from a manually provided box."""
        from ultralytics.engine.results import Results
        import torch
        x1, y1, x2, y2 = box
        data = torch.tensor([[x1, y1, x2, y2, conf, 67.0]], device=self.device)
        res = Results(orig_img=frame, path='', names={67: 'cell phone'}, boxes=data)
        return res
        
    def _run_internal_pipeline(self, frame: np.ndarray):
        if self.model is None or frame is None:
            return None
            
        self.frame_count += 1
        
        # Stage 1: Phone Presence Filter
        if not self._phone_presence_filter(frame):
            # No phone present according to lightweight filter
            # Reset tracker
            self.tracked_box = None
            self.failed_detections = 0
            self.last_results = None
            return None
            
        # Stage 2: YOLO with Interleaving and ROI
        if self.tracked_box is not None:
            # Skip YOLO and use tracking prediction
            if self.frame_count % self.interleave_frames != 0:
                if self.last_results is not None:
                    return self.last_results
                    
            # Run YOLO on ROI
            rx1, ry1, rx2, ry2 = self._get_roi(frame.shape, self.tracked_box)
            roi_frame = frame[ry1:ry2, rx1:rx2]
            
            # Avoid crashing on zero area ROI
            if roi_frame.size == 0:
                self.tracked_box = None
                return None
                
            results = self.model.predict(
                source=roi_frame, 
                device=self.device, 
                classes=[67], 
                conf=self.confidence_threshold,
                verbose=False
            )
            
            if len(results) > 0 and hasattr(results[0], 'boxes') and len(results[0].boxes) > 0:
                # Phone found in ROI
                local_box = results[0].boxes.xyxy[0].cpu().numpy()
                conf = float(results[0].boxes.conf[0].cpu().numpy())
                
                # Project back to global coords
                gx1 = rx1 + local_box[0]
                gy1 = ry1 + local_box[1]
                gx2 = rx1 + local_box[2]
                gy2 = ry1 + local_box[3]
                
                self.tracked_box = [gx1, gy1, gx2, gy2]
                self.failed_detections = 0
                
                # Generate global Results object
                self.last_results = self._create_mock_results(frame, self.tracked_box, conf)
                return self.last_results
            else:
                self.failed_detections += 1
                
                # Graceful degradation logic
                if self.failed_detections == 4:
                    # Grounding DINO Fallback
                    if hasattr(self, 'dino_model') and self.dino_model is not None:
                        try:
                            from PIL import Image
                            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                            inputs = self.dino_processor(images=pil_image, text="smartphone.", return_tensors="pt").to(self.dino_device)
                            import torch
                            with torch.no_grad():
                                outputs = self.dino_model(**inputs)
                            results_dino = self.dino_processor.post_process_grounded_object_detection(
                                outputs, inputs.input_ids, threshold=0.3, text_threshold=0.3, target_sizes=[pil_image.size[::-1]]
                            )[0]
                            
                            if len(results_dino["boxes"]) > 0:
                                best_idx = results_dino["scores"].argmax()
                                box = results_dino["boxes"][best_idx].cpu().numpy().tolist()
                                conf = float(results_dino["scores"][best_idx].cpu().numpy())
                                
                                self.tracked_box = box
                                self.failed_detections = 0
                                self.last_results = self._create_mock_results(frame, self.tracked_box, conf)
                                return self.last_results
                        except Exception as e:
                            logger.error(f"DINO fallback failed: {e}")
                            
                if self.failed_detections >= 5:
                    # Tracker totally lost
                    self.tracked_box = None
                    self.last_results = None
                    return None
                    
                # Continue returning ZOH tracker prediction
                return self.last_results

        else:
            # Full frame YOLO
            results = self.model.predict(
                source=frame, 
                device=self.device, 
                classes=[67], 
                conf=self.confidence_threshold,
                verbose=False
            )
            
            if len(results) > 0 and hasattr(results[0], 'boxes') and len(results[0].boxes) > 0:
                box = results[0].boxes.xyxy[0].cpu().numpy()
                conf = float(results[0].boxes.conf[0].cpu().numpy())
                self.tracked_box = box.tolist()
                self.failed_detections = 0
                
                self.last_results = self._create_mock_results(frame, self.tracked_box, conf)
                return self.last_results
                
            return None

    def detect_phone(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """Used by older components. Returns standard dict list."""
        start_time = time.time()
        res = self._run_internal_pipeline(frame)
        
        detections = []
        if res is not None and hasattr(res, 'boxes') and len(res.boxes) > 0:
            box = res.boxes.xyxyn[0].cpu().numpy()
            conf = float(res.boxes.conf[0].cpu().numpy())
            
            x1, y1, x2, y2 = box
            detections.append({
                "class": "phone",
                "confidence": conf,
                "bbox": {
                    "x": float(x1),
                    "y": float(y1),
                    "width": float(x2 - x1),
                    "height": float(y2 - y1)
                }
            })
            
        inference_time = (time.time() - start_time) * 1000
        if inference_time > 150:
            logger.warning(f"Detection latency high: {inference_time:.1f}ms")
            
        return detections

    def detect_raw(self, frame: np.ndarray):
        """Used by websocket tracking pipeline. Returns raw Ultralytics Results."""
        return self._run_internal_pipeline(frame)
