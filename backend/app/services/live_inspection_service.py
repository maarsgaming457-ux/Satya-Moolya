import asyncio
import logging
from typing import Dict, Any, List
import uuid
import cv2
import numpy as np
import time

from app.services.vision_service import VisionService

logger = logging.getLogger(__name__)

class LiveInspectionSession:
    def __init__(self, device_id: str):
        self.device_id = device_id
        self.session_id = uuid.uuid4()
        self.required_angles = ["Front", "Back", "Left", "Right", "Top", "Bottom"]
        self.current_angle_idx = 0
        self.completed_angles = []
        self.captured_frames: Dict[str, Dict[str, Any]] = {}
        # Stores best frame per angle: { angle: { "image": np.ndarray, "score": float, "detections": list } }
        self.is_completed = False

    def get_current_angle(self) -> str | None:
        if self.current_angle_idx < len(self.required_angles):
            return self.required_angles[self.current_angle_idx]
        return None

    def get_instruction(self) -> str:
        angle = self.get_current_angle()
        if angle:
            return f"Show the {angle} of the device."
        return "Inspection complete. Processing final report..."


class LiveInspectionService:
    def __init__(self, vision_service: VisionService):
        self.vision_service = vision_service
        # In-memory store for active sessions
        self.active_sessions: Dict[str, LiveInspectionSession] = {}

    def get_or_create_session(self, device_id: str) -> LiveInspectionSession:
        if device_id not in self.active_sessions:
            self.active_sessions[device_id] = LiveInspectionSession(device_id)
        return self.active_sessions[device_id]

    def remove_session(self, device_id: str):
        if device_id in self.active_sessions:
            del self.active_sessions[device_id]

    async def process_frame(self, session: LiveInspectionSession, frame: np.ndarray) -> Dict[str, Any]:
        log_data = {
            "phone_detected": False,
            "phone_bbox": None,
            "blur_score": None,
            "brightness": None,
            "quality_acceptable": False,
            "detected_components": [],
            "orientation": "Unknown",
            "composite_score": 0.0,
            "capture_triggered": False,
            "current_expected_angle": session.get_current_angle(),
            "current_angle_index": session.current_angle_idx,
            "reject_reason": "N/A"
        }
        
        try:
            return await self._process_frame_impl(session, frame, log_data)
        except Exception as e:
            log_data["reject_reason"] = f"Exception: {e}"
            raise
        finally:
            print("\n=== REAL BROWSER FRAME RUNTIME LOG ===")
            for k, v in log_data.items():
                print(f"{k}: {v}")
            print("========================================")

    async def _process_frame_impl(self, session: LiveInspectionSession, frame: np.ndarray, log_data: dict) -> Dict[str, Any]:
        """
        Process a single frame from the live feed.
        Returns the data to be sent back to the client over WebSocket.
        """
        if session.is_completed:
            return {
                "instruction": session.get_instruction(),
                "completed": True,
                "progress": self._get_progress(session),
                "detections": []
            }

        # Stage 1: Phone Detection
        t0_phone = time.time()
        phone_detected, phone_bbox = await asyncio.to_thread(self.vision_service.detect_phone, frame)
        log_data["phone_detected"] = phone_detected
        log_data["phone_bbox"] = phone_bbox
        t_phone = (time.time() - t0_phone) * 1000
        
        if not phone_detected:
            log_data["reject_reason"] = "Phone not detected"
            return {
                "instruction": session.get_instruction(),
                "completed": session.is_completed,
                "progress": self._get_progress(session),
                "detections": [],
                "quality": None,
                "detected_angle": "Unknown"
            }

        # Stage 2: Phone Tracking
        t0_track = time.time()
        track_id = await asyncio.to_thread(self.vision_service.track_phone, frame)
        t_track = (time.time() - t0_track) * 1000

        # Stage 5: Quality Validation (Executed before damage/component detection to drop bad frames early)
        t0_qual = time.time()
        quality = await asyncio.to_thread(self.vision_service.validate_quality, frame, phone_bbox)
        log_data["blur_score"] = quality["blur_score"]
        log_data["brightness"] = quality["brightness"]
        log_data["quality_acceptable"] = quality["quality_acceptable"]
        t_qual = (time.time() - t0_qual) * 1000
        
        detected_angle = "Unknown"
        orientation_data = {"angle": "Unknown", "confidence": 0.0, "matched_components": []}
        current_requested_angle = session.get_current_angle()
        
        # Calculate Sharpness from blur_score (normalized roughly 0 to 100)
        # Using 100.0 instead of 500.0 since laplacian variance is lower for smooth phone surfaces
        sharpness = min(quality["blur_score"] / 100.0, 1.0) * 100
        
        # Calculate Centering Score (0 to 100) based on phone_bbox
        h, w = frame.shape[:2]
        center_x, center_y = w / 2, h / 2
        box_center_x = (phone_bbox[0] + phone_bbox[2]) / 2
        box_center_y = (phone_bbox[1] + phone_bbox[3]) / 2
        dist = np.sqrt((center_x - box_center_x)**2 + (center_y - box_center_y)**2)
        max_dist = np.sqrt(center_x**2 + center_y**2)
        centering_score = max(0, 100 * (1 - (dist / max_dist)))

        print(f"Crop coordinates: {phone_bbox}")
        x1, y1, x2, y2 = phone_bbox
        crop_w, crop_h = x2 - x1, y2 - y1
        print(f"Crop size: {crop_w}x{crop_h}")
        print(f"Is crop empty? {crop_w <= 0 or crop_h <= 0}")
        print(f"Quality result: {quality}")

        detections = []
        t_comp, t_dam, t_angle = 0.0, 0.0, 0.0
        
        # Save visual debug crop
        if crop_w > 0 and crop_h > 0:
            crop_img = frame[y1:y2, x1:x2]
            cv2.imwrite("debug_crop.jpg", crop_img)

        # Draw box for visual debug
        debug_frame = frame.copy()
        cv2.rectangle(debug_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(debug_frame, "Phone", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        if quality["quality_acceptable"]:
            # Stage 3: Component Detection
            t0_comp = time.time()
            components = await asyncio.to_thread(self.vision_service.detect_components, frame, phone_bbox)
            log_data["detected_components"] = [c["class"] for c in components]
            t_comp = (time.time() - t0_comp) * 1000
            
            print(f"Component result: {components}")
            
            # Stage 3.5: Orientation Inference
            t0_angle = time.time()
            orientation_data = await asyncio.to_thread(self.vision_service.infer_orientation, components)
            detected_angle = orientation_data["angle"]
            log_data["orientation"] = detected_angle
            t_angle = (time.time() - t0_angle) * 1000
            
            print(f"Orientation result: {orientation_data}")
            
            # Stage 4: Damage Detection
            t0_dam = time.time()
            damages = await asyncio.to_thread(self.vision_service.detect_damage, frame)
            t_dam = (time.time() - t0_dam) * 1000
            
            # Add colors
            for d in damages + components:
                d["color"] = self.vision_service.get_color_for_class(d["class"])
                d["track_id"] = track_id
                
                # Draw on debug frame
                bx1, by1, bx2, by2 = d["bounding_box"]
                cv2.rectangle(debug_frame, (int(bx1), int(by1)), (int(bx2), int(by2)), (255, 0, 0), 2)
                cv2.putText(debug_frame, d["class"], (int(bx1), int(by1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

            cv2.putText(debug_frame, f"Angle: {detected_angle}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)

            detections = damages + components
            
            # Aggregate Confidence Score
            avg_conf = np.mean([d["confidence"] for d in detections]) * 100 if detections else 50.0

            # Stage 6: Frame Selection
            composite_score = (avg_conf * 0.4) + (sharpness * 0.4) + (centering_score * 0.2)
            log_data["composite_score"] = composite_score

            if current_requested_angle:
                # Angle match logic
                angle_match = (detected_angle.lower() == current_requested_angle.lower())
                if detected_angle == "Unknown" and current_requested_angle not in ["Front", "Back"]:
                    if len(detections) > 0:
                        angle_match = True
                        
                print(f"Capture Decision: Match requested angle '{current_requested_angle}'? {angle_match}")
                if not angle_match:
                    reason = f"Angle mismatch (detected: {detected_angle}, requested: {current_requested_angle})"
                    log_data["reject_reason"] = reason
                    print(f"Reason if rejected: {reason}")
                        
                if angle_match:
                    existing_best = session.captured_frames.get(current_requested_angle)
                    if not existing_best or composite_score > existing_best["score"]:
                        print(f"Accepted as best frame for {current_requested_angle} with score {composite_score:.1f}")
                        log_data["capture_triggered"] = True
                        session.captured_frames[current_requested_angle] = {
                            "image": frame,
                            "score": composite_score,
                            "detections": detections,
                            "bbox": phone_bbox,
                            "quality": quality,
                            "metrics": {
                                "processing_time_ms": (time.time() - t0_phone) * 1000,
                                "track_id": track_id,
                                "quality": quality,
                                "detections": detections,
                                "sharpness_score": sharpness,
                                "centering_score": centering_score,
                                "composite_score": composite_score,
                                "avg_conf": avg_conf,
                                "orientation": orientation_data
                            }
                        }
                    else:
                        reason = f"Score {composite_score:.1f} was lower than existing best {existing_best['score']:.1f}"
                        if log_data["reject_reason"] == "N/A": log_data["reject_reason"] = reason
                        print(f"Reason if rejected: {reason}")
                    
                    if composite_score > 50.0 and current_requested_angle not in session.completed_angles:
                        print(f"Angle {current_requested_angle} COMPLETED automatically (Score > 50)")
                        session.completed_angles.append(current_requested_angle)
                        session.current_angle_idx += 1
                        
                        if session.current_angle_idx >= len(session.required_angles):
                            session.is_completed = True
                    elif composite_score <= 50.0:
                        reason = f"Score {composite_score:.1f} is not > 50.0 to automatically advance."
                        if log_data["reject_reason"] == "N/A": log_data["reject_reason"] = reason
                        print(f"Reason if rejected: {reason}")
        else:
            reason = "Quality not acceptable (Blur/Lighting)"
            log_data["reject_reason"] = reason
            print(f"Reason if rejected: {reason}")

        cv2.imwrite("debug_frame.jpg", debug_frame)

        print(f"[AI Timing] Phone: {t_phone:.1f}ms | Track: {t_track:.1f}ms | Qual: {t_qual:.1f}ms | Angle: {t_angle:.1f}ms | Comp: {t_comp:.1f}ms | Dam: {t_dam:.1f}ms")
        
        return {
            "instruction": session.get_instruction(),
            "completed": session.is_completed,
            "progress": self._get_progress(session),
            "detections": detections,
            "quality": quality,
            "detected_angle": detected_angle,
            "orientation": orientation_data
        }

    def _get_progress(self, session: LiveInspectionSession) -> List[Dict[str, Any]]:
        return [
            {
                "angle": angle,
                "completed": angle in session.completed_angles
            }
            for angle in session.required_angles
        ]
