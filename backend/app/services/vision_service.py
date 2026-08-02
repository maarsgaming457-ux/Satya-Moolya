import os
import cv2
import numpy as np
import httpx
import logging
import uuid
import hashlib
import imagehash
from PIL import Image
from skimage.metrics import structural_similarity as ssim
from app.services.grounding_dino_loader import get_grounding_dino

logger = logging.getLogger(__name__)

class VisionService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self.__class__._initialized:
            return
        self.__class__._initialized = True

        self.custom_weights_path = "models/device_damage.pt"
        self.yolo_model = None
        self.florence_model = None
        self.florence_processor = None
        self.dino_device = "cpu"
        self.comp_detector = None
        
        try:
            from app.services.component_detection_service import GroundingDinoComponentDetector
            self.comp_detector = GroundingDinoComponentDetector()
        except Exception as e:
            logger.error(f"Failed to load GroundingDinoComponentDetector: {e}")

        try:
            self.florence_processor, self.florence_model, self.dino_device = get_grounding_dino()
            logger.info("VisionService Grounding DINO initialized on %s", self.dino_device)
        except Exception as e:
            logger.error(f"Failed to load Grounding DINO: {e}")
                
        if os.path.exists(self.custom_weights_path):
            try:
                from ultralytics import YOLO
                self.yolo_model = YOLO(self.custom_weights_path)
                logger.info(f"Loaded custom YOLO model from {self.custom_weights_path}")
            except Exception as e:
                logger.error(f"Failed to load custom YOLO model: {e}")
        else:
            logger.info("Custom damage YOLO weights not found; using Grounding DINO for damage prompts.")

    async def download_image_with_hash(self, url: str) -> tuple[np.ndarray, str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            file_hash = hashlib.md5(response.content).hexdigest()
            image_array = np.asarray(bytearray(response.content), dtype="uint8")
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            return image, file_hash

    def compute_phash(self, img: np.ndarray) -> imagehash.ImageHash:
        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        return imagehash.phash(pil_img)

    def are_images_duplicates(self, img1: np.ndarray, img2: np.ndarray, hash1=None, hash2=None) -> tuple[bool, float]:
        """Uses pHash + SSIM for robust duplicate detection."""
        try:
            if hash1 is not None and hash2 is not None:
                diff = hash1 - hash2
                if diff == 0:
                    return True, 1.0 # Identical pHash
                if diff > 15:
                    return False, 0.0 # Structurally different
            
            # SSIM fallback for near-identical hashes
            i1 = cv2.cvtColor(cv2.resize(img1, (256, 256)), cv2.COLOR_BGR2GRAY)
            i2 = cv2.cvtColor(cv2.resize(img2, (256, 256)), cv2.COLOR_BGR2GRAY)
            score, _ = ssim(i1, i2, full=True)
            return score > 0.85, score
        except Exception:
            return False, 0.0

    def check_quality(self, image: np.ndarray) -> dict:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)

        is_blurry = blur_score < 100.0
        is_too_dark = brightness < 30.0
        is_too_bright = brightness > 225.0

        return {
            "blur_score": float(blur_score),
            "brightness": float(brightness),
            "is_blurry": bool(is_blurry),
            "is_too_dark": bool(is_too_dark),
            "is_too_bright": bool(is_too_bright),
            "quality_acceptable": not (is_blurry or is_too_dark or is_too_bright)
        }

    # Stage 1: Phone Detection
    def detect_phone(self, image: np.ndarray) -> tuple[bool, list]:
        """Detects the smartphone in the frame and returns its bounding box using Grounding DINO."""
        print(f"\n--- AI FRAME TRACE ---")
        print(f"Image dimensions: {image.shape}")
        text_input = "smartphone. mobile phone. cell phone. phone. device."
        print(f"Grounding DINO prompt: {text_input}")
        
        if self.florence_model and self.florence_processor:
            try:
                pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                inputs = self.florence_processor(images=pil_image, text=text_input, return_tensors="pt").to(self.dino_device)
                import torch
                with torch.no_grad():
                    outputs = self.florence_model(**inputs)
                results = self.florence_processor.post_process_grounded_object_detection(
                    outputs, inputs.input_ids, box_threshold=0.2, text_threshold=0.2, target_sizes=[pil_image.size[::-1]]
                )[0]
                
                print(f"Raw detector output: {results}")
                
                best_conf = 0.0
                best_box = []
                
                labels = results.get("text_labels", results.get("labels", []))
                for score, label, box in zip(results["scores"], labels, results["boxes"]):
                    conf = float(score.item())
                    x1, y1, x2, y2 = box.tolist()
                    box_ints = [int(x1), int(y1), int(x2), int(y2)]
                    print(f"Detected Label: {label}, Confidence: {conf:.3f}, BBox: {box_ints}")
                    
                    if conf > best_conf:
                        best_conf = conf
                        best_box = box_ints
                        
                if best_conf > 0.2: # Threshold
                    print(f"Selected phone box: {best_box} with confidence {best_conf:.3f}")
                    return True, best_box
                else:
                    print(f"detect_phone returned False: Highest confidence {best_conf:.3f} was below threshold 0.2")
                    return False, []
                    
            except Exception as e:
                logger.error(f"Grounding DINO phone detection failed: {e}")
                print(f"detect_phone returned False: Exception occurred: {e}")
        else:
            print("detect_phone returned False: Grounding DINO model/processor not loaded")
        
        return False, []

    # Stage 2: Phone Tracking
    def track_phone(self, image: np.ndarray) -> int:
        """Tracks the phone using ByteTrack (stub implementation if no tracker)."""
        # In a full ByteTrack implementation, we would pass the bounding box from Stage 1
        # and maintain an internal tracker state. For now, we simulate a track ID.
        return 1

    def detect_components(self, image: np.ndarray, phone_bbox: list = None) -> list:
        """Detects phone components (Screen, Frame, Camera, etc)."""
        components = []
        if self.florence_model:
            try:
                if phone_bbox:
                    x1, y1, x2, y2 = phone_bbox
                    h, w = image.shape[:2]
                    x1, y1 = max(0, x1 - 20), max(0, y1 - 20)
                    x2, y2 = min(w, x2 + 20), min(h, y2 + 20)
                    crop = image[y1:y2, x1:x2]
                    pil_image = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
                    offset_x, offset_y = x1, y1
                else:
                    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                    offset_x, offset_y = 0, 0
                
                text_input = "smartphone screen. rear glass. smartphone frame. camera module. charging port. buttons. speaker. microphone. sim tray. fingerprint sensor. front camera. flash. logo. alert slider."
                inputs = self.florence_processor(images=pil_image, text=text_input, return_tensors="pt").to(self.dino_device)
                import torch
                with torch.no_grad():
                    outputs = self.florence_model(**inputs)
                results = self.florence_processor.post_process_grounded_object_detection(
                    outputs, inputs.input_ids, box_threshold=0.2, text_threshold=0.2, target_sizes=[pil_image.size[::-1]]
                )[0]
                
                labels = results.get("text_labels", results.get("labels", []))
                for score, label, box in zip(results["scores"], labels, results["boxes"]):
                    raw_conf = float(score.item())
                    scaled_conf = min(raw_conf + 0.5, 1.0)
                    bx1, by1, bx2, by2 = box.tolist()
                    components.append({
                        "class": str(label).lower(),
                        "confidence": scaled_conf,
                        "bounding_box": [int(bx1 + offset_x), int(by1 + offset_y), int(bx2 + offset_x), int(by2 + offset_y)],
                        "track_id": None
                    })
            except Exception as e:
                logger.error(f"Component detection failed: {e}")
        return components

    # Stage 4: Damage Detection
    def detect_damage(self, image: np.ndarray) -> list:
        """Detects damages (Scratch, Crack, Dent, etc)."""
        detections = []
        if self.yolo_model:
            results = self.yolo_model(image, verbose=False)
            for r in results:
                if r.boxes is None: continue
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    class_name = self.yolo_model.names[cls]
                    severity = "High" if conf > 0.8 else "Medium" if conf > 0.5 else "Low"
                    detections.append({
                        "class": class_name,
                        "confidence": conf,
                        "bounding_box": [int(x1), int(y1), int(x2), int(y2)],
                        "severity": severity
                    })
        elif self.florence_model:
            try:
                pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                text_input = "scratch. crack. dent. broken glass. bent frame. camera damage. screen burn. dead pixels. paint loss. water damage."
                inputs = self.florence_processor(images=pil_image, text=text_input, return_tensors="pt").to(self.dino_device)
                import torch
                with torch.no_grad():
                    outputs = self.florence_model(**inputs)
                results = self.florence_processor.post_process_grounded_object_detection(
                    outputs, inputs.input_ids, box_threshold=0.2, text_threshold=0.2, target_sizes=[pil_image.size[::-1]]
                )[0]
                
                labels = results.get("text_labels", results.get("labels", []))
                for score, label, box in zip(results["scores"], labels, results["boxes"]):
                    # Normalize DINO confidence to YOLO range (0.5-1.0) for consistency
                    raw_conf = float(score.item())
                    scaled_conf = min(raw_conf + 0.5, 1.0)
                    severity = "High" if scaled_conf > 0.8 else "Medium" if scaled_conf > 0.5 else "Low"
                    detections.append({
                        "class": str(label),
                        "confidence": scaled_conf,
                        "bounding_box": [int(b) for b in box.tolist()],
                        "severity": severity
                    })
            except Exception as e:
                logger.error(f"Damage detection failed: {e}")
        return detections

    # Stage 5: Quality Validation
    def validate_quality(self, image: np.ndarray, phone_bbox: list = None) -> dict:
        """Evaluates Blur, Brightness, Glare, Occlusion, Partial Phone."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        img_var = np.var(gray)
        # Adaptive normalization: scale Laplacian variance relative to image variance.
        # Multiply by 1000 to match the expected 100-500 operating range for webcams.
        blur_score = (lap_var / (img_var + 1e-6)) * 1000.0
        
        brightness = np.mean(gray)
        
        # Phone screens are smooth and often black, which naturally lack high-frequency texture.
        # Lowering the blur threshold from 100.0 to 15.0 to prevent false positives.
        is_blurry = blur_score < 15.0
        is_too_dark = brightness < 15.0
        is_too_bright = brightness > 240.0
        
        # Check partial phone occlusion
        is_partial = False
        if phone_bbox:
            x1, y1, x2, y2 = phone_bbox
            h, w = image.shape[:2]
            if x1 <= 10 or y1 <= 10 or x2 >= w - 10 or y2 >= h - 10:
                is_partial = True # Phone touches edges, likely partial

        return {
            "blur_score": float(blur_score),
            "brightness": float(brightness),
            "is_blurry": bool(is_blurry),
            "is_too_dark": bool(is_too_dark),
            "is_too_bright": bool(is_too_bright),
            "is_partial": bool(is_partial),
            "quality_acceptable": not (is_blurry or is_too_dark or is_too_bright or is_partial)
        }

    def get_color_for_class(self, class_name: str) -> str:
        name_lower = class_name.lower()
        if any(term in name_lower for term in ["crack", "broken", "bent", "shatter", "major"]):
            return "#FF0000" # Red
        if any(term in name_lower for term in ["scratch", "wear", "minor", "dent", "scuff"]):
            return "#FFFF00" # Yellow
        return "#00FF00" # Green

    def track_objects(self, image: np.ndarray) -> list:
        """
        Maintains backward compatibility, but internally uses the new stage pipeline for tracking damages.
        """
        _, phone_bbox = self.detect_phone(image)
        self.track_phone(image)
        damages = self.detect_damage(image)
        
        # Add colors for UI
        for d in damages:
            d["color"] = self.get_color_for_class(d["class"])
            d["track_id"] = None # Optional track ID assignment for damages
        return damages

    def infer_orientation(self, components: list) -> dict:
        """
        Infers the device's angle based on the aggregate presence of physical components.
        Returns:
        {
            "angle": "Front", 
            "confidence": 0.94, 
            "matched_components": [...]
        }
        """
        detected_classes = [c["class"] for c in components]
        
        def has_any(terms):
            return [cls for cls in detected_classes if any(t in cls for t in terms)]

        screen_matches = has_any(["screen", "display", "front camera", "earpiece"])
        back_matches = has_any(["rear", "camera module", "flash", "logo", "back"])
        left_matches = has_any(["volume", "sim tray"])
        right_matches = has_any(["power", "alert slider"])
        top_matches = has_any(["top frame", "microphone"])
        bottom_matches = has_any(["port", "charging", "speaker", "bottom"])
        
        scores = {
            "Front": len(screen_matches) * 2,
            "Back": len(back_matches) * 2,
            "Left": len(left_matches) * 1.5,
            "Right": len(right_matches) * 1.5,
            "Top": len(top_matches) * 1.5,
            "Bottom": len(bottom_matches) * 1.5
        }
        
        best_angle = max(scores, key=scores.get)
        best_score = scores[best_angle]
        
        if best_score == 0:
            return {
                "angle": "Unknown",
                "confidence": 0.0,
                "matched_components": []
            }
            
        matched_dict = {
            "Front": screen_matches,
            "Back": back_matches,
            "Left": left_matches,
            "Right": right_matches,
            "Top": top_matches,
            "Bottom": bottom_matches
        }
        
        return {
            "angle": best_angle,
            "confidence": min(0.5 + (best_score * 0.1), 0.98),
            "matched_components": list(set(matched_dict[best_angle]))
        }

    def detect_angles(self, image: np.ndarray) -> str:
        phone_detected, phone_bbox = self.detect_phone(image)
        if not phone_detected:
            return "Unknown"
        components = self.detect_components(image, phone_bbox)
        return self.infer_orientation(components).get("angle", "Unknown")

    async def validate_images(self, image_urls: list[str]) -> tuple[dict, list[dict]]:
        """
        Validates images (duplicate, blur, brightness) and returns a report and accepted image payloads.
        Returns: (report, accepted_images_payloads)
        """
        report = {
            "uploaded_images": len(image_urls),
            "accepted_images": 0,
            "rejected": {
                "duplicate": 0,
                "blurry": 0,
                "dark": 0,
                "bright": 0,
                "corrupted": 0,
                "wrong_angle": 0
            },
            "accepted_image_ids": []
        }
        
        accepted_payloads = []
        downloaded_images = [] # stores dicts with {img, file_hash, phash}
        
        import asyncio
        for url in image_urls:
            image_id = str(uuid.uuid4())
            try:
                img, file_hash = await self.download_image_with_hash(url)
                if img is None:
                    report["rejected"]["corrupted"] += 1
                    continue
                
                phash = await asyncio.to_thread(self.compute_phash, img)
                
                # Check for duplicates
                is_duplicate = False
                dup_score = 0.0
                for prev in downloaded_images:
                    if prev["file_hash"] == file_hash:
                        is_duplicate = True
                        dup_score = 1.0
                        break
                    
                    is_dup, score = await asyncio.to_thread(self.are_images_duplicates, img, prev["img"], phash, prev["phash"])
                    if is_dup:
                        is_duplicate = True
                        dup_score = score
                        break
                
                if is_duplicate:
                    report["rejected"]["duplicate"] += 1
                    continue
                
                downloaded_images.append({
                    "img": img,
                    "file_hash": file_hash,
                    "phash": phash
                })
                
                # Use basic fast validation without slow heavy AI models (Grounding DINO)
                quality = await asyncio.to_thread(self.validate_quality, img, None)
                
                if not quality["quality_acceptable"]:
                    if quality["is_blurry"]:
                        report["rejected"]["blurry"] += 1
                    elif quality["is_too_dark"]:
                        report["rejected"]["dark"] += 1
                    elif quality["is_too_bright"]:
                        report["rejected"]["bright"] += 1
                    continue
                
                angle = "Unknown"  # Fast-fail validation does not do angle detection
                # Angle logic goes here when implemented, for now we accept Unknown
                
                # Compute composite quality score
                # Higher var = better blur score. Brightness ideal is 127.
                blur_component = min(quality["blur_score"] / 500.0, 1.0) * 100
                bright_component = 100 - abs(127 - quality["brightness"])
                quality_score = (blur_component * 0.7) + (bright_component * 0.3)
                
                payload = {
                    "image_id": image_id,
                    "image_data": img,
                    "url": url,
                    "blur_score": quality["blur_score"],
                    "brightness": quality["brightness"],
                    "duplicate_score": dup_score,
                    "quality_score": quality_score,
                    "angle": angle,
                    "accepted": True
                }
                
                accepted_payloads.append(payload)
                report["accepted_image_ids"].append(image_id)
                
            except Exception as e:
                logger.error(f"Failed to validate image {url}: {e}")
                report["rejected"]["corrupted"] += 1
                
        report["accepted_images"] = len(accepted_payloads)
        return report, accepted_payloads

    async def run_ai_pipeline(self, accepted_images: list[dict]) -> list[dict]:
        """
        Processes pre-validated image dicts for object detection.
        Expects dict with 'image_data', 'url', 'image_id'
        """
        import asyncio
        results = []
        for payload in accepted_images:
            try:
                angle = await asyncio.to_thread(self.detect_angles, payload["image_data"])
                
                from app.services.damage_detection_service import DamageDetectionEngine
                damage_engine = DamageDetectionEngine()
                
                if self.comp_detector:
                    comp_results = await asyncio.to_thread(self.comp_detector.predict, payload["image_data"], angle)
                else:
                    comp_results = {"components": []}
                damage_results = await asyncio.to_thread(damage_engine.analyze, payload["image_data"], angle, comp_results)
                
                detections = comp_results.get("components", []) + damage_results.get("damages", [])
                
                results.append({
                    "image_id": payload["image_id"],
                    "url": payload["url"],
                    "quality": {
                        "blur_score": payload["blur_score"],
                        "brightness": payload["brightness"],
                        "quality_score": payload["quality_score"],
                        "is_blurry": False # By definition, if accepted it's not blurry
                    },
                    "angle": angle,
                    "detections": detections
                })
            except Exception as e:
                logger.error(f"Failed to process accepted image {payload.get('url')}: {e}")
                results.append({
                    "image_id": payload.get("image_id"),
                    "url": payload.get("url"),
                    "error": str(e)
                })
        return results
