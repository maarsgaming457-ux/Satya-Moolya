import abc
import cv2
import numpy as np
import logging
import time
import uuid
from typing import Dict, Any, List
from PIL import Image
from app.services.grounding_dino_loader import get_grounding_dino

logger = logging.getLogger(__name__)

def get_dino_model():
    processor, model, device = get_grounding_dino("IDEA-Research/grounding-dino-tiny")
    return processor, model, device

class BaseDamageDetector(abc.ABC):
    """
    Abstract interface for Damage Detection.
    """
    
    @abc.abstractmethod
    def predict(self, frame: np.ndarray, component: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
        
    def determine_severity(self, damage_area_ratio: float, length_ratio: float = 0.0) -> str:
        """
        Standardized mathematical severity rules based on area/length ratio.
        """
        ratio = max(damage_area_ratio, length_ratio)
        if ratio < 0.05:
            return "Minor"
        elif ratio < 0.15:
            return "Moderate"
        elif ratio < 0.30:
            return "Major"
        else:
            return "Critical"

class GroundingDinoDamageDetector(BaseDamageDetector):
    """
    Damage detector using Grounding DINO for zero-shot localized detection.
    Analyzes only the region cropped to the specific component.
    """
    def __init__(self):
        self.processor, self.model, self.device = get_dino_model()

    def get_prompts_for_component(self, component_name: str) -> str:
        name = component_name.lower()
        if any(x in name for x in ["screen", "display", "rear panel", "glass"]):
            return "screen crack . hairline crack . broken glass . deep scratch . light scratch . display bleeding . dead pixels ."
        elif any(x in name for x in ["camera", "lens", "flash"]):
            return "camera lens crack . camera lens scratch . broken glass ."
        elif any(x in name for x in ["frame", "button", "sim tray", "port", "speaker", "grill", "microphone"]):
            return "frame dent . frame chip . deep scratch . paint loss ."
        else:
            return "crack . scratch . dent . broken ."

    def predict(self, frame: np.ndarray, component: Dict[str, Any]) -> List[Dict[str, Any]]:
        damages = []
        if not self.model or not self.processor:
            return damages

        bbox = component.get("bbox")
        if not bbox:
            return damages

        comp_name = component.get("name", "Unknown")
        
        # Don't analyze Logo
        if "logo" in comp_name.lower():
            return damages

        # Extract global bounding box
        height, width, _ = frame.shape
        
        # Determine if bbox is normalized (0-1) or absolute (pixels)
        # Using heuristic: if > 1, it's absolute
        x1, y1 = bbox.get("x1", bbox.get("x", 0)), bbox.get("y1", bbox.get("y", 0))
        x2, y2 = bbox.get("x2", bbox.get("width", 0)), bbox.get("y2", bbox.get("height", 0))
        
        if "width" in bbox: # It's x,y,w,h format
            w_val, h_val = x2, y2
            x2 = x1 + w_val
            y2 = y1 + h_val

        if x2 <= 1.0 and y2 <= 1.0 and (x2 > 0 or y2 > 0): # Normalized
            x1, y1 = int(x1 * width), int(y1 * height)
            x2, y2 = int(x2 * width), int(y2 * height)
        else:
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(width, x2), min(height, y2)
        
        w_crop, h_crop = x2 - x1, y2 - y1
        if w_crop <= 0 or h_crop <= 0:
            return damages

        roi = frame[y1:y2, x1:x2]
        component_area = w_crop * h_crop

        text_prompt = self.get_prompts_for_component(comp_name)

        try:
            pil_image = Image.fromarray(cv2.cvtColor(roi, cv2.COLOR_BGR2RGB))
            inputs = self.processor(images=pil_image, text=text_prompt, return_tensors="pt").to(self.device)
            
            import torch
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            results = self.processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                threshold=0.25,
                text_threshold=0.25,
                target_sizes=[pil_image.size[::-1]]
            )[0]

            labels = results.get("text_labels", results.get("labels", []))
            for score, label, box_tensor in zip(results["scores"], labels, results["boxes"]):
                conf = float(score.item())
                damage_type = str(label).title()
                
                # Grounding DINO may return partial matches, sanitize
                if damage_type.lower() not in text_prompt:
                    matched = False
                    for p in text_prompt.split(" . "):
                        if p.strip() in damage_type.lower() or damage_type.lower() in p.strip():
                            damage_type = p.strip().title()
                            matched = True
                            break
                    if not matched: continue

                dx1, dy1, dx2, dy2 = box_tensor.tolist()
                
                # Area logic
                dw, dh = dx2 - dx1, dy2 - dy1
                damage_area = dw * dh
                area_ratio = damage_area / component_area if component_area > 0 else 0
                
                # Length logic (useful for scratches/cracks)
                length = np.sqrt(dw**2 + dh**2)
                comp_diagonal = np.sqrt(w_crop**2 + h_crop**2)
                length_ratio = length / comp_diagonal if comp_diagonal > 0 else 0
                
                severity = self.determine_severity(area_ratio, length_ratio)

                # Translate to global coordinates
                global_x1 = x1 + dx1
                global_y1 = y1 + dy1
                global_w = dw
                global_h = dh
                
                # We return it in the requested schema
                damages.append({
                    "damage_id": str(uuid.uuid4()),
                    "damage_type": damage_type,
                    "component_name": comp_name,
                    "confidence": round(conf, 4),
                    "severity": severity,
                    "estimated_area_percentage": round(area_ratio * 100, 2),
                    "visible": True,
                    "timestamp": time.time(),
                    "bounding_box": {
                        "x": int(global_x1),
                        "y": int(global_y1),
                        "width": int(global_w),
                        "height": int(global_h)
                    }
                })
        except Exception as e:
            logger.error(f"Error analyzing damage for component {comp_name}: {e}", exc_info=True)
            
        return damages

class DamageDetectionEngine:
    """
    Orchestrates multiple specific damage detectors.
    """
    
    def __init__(self):
        self.detectors: List[BaseDamageDetector] = [
            GroundingDinoDamageDetector()
        ]
        
    def analyze(self, frame: np.ndarray, view: str, components: Any) -> Dict[str, Any]:
        """
        Iterates over all visible components and runs all registered damage detectors.
        """
        all_damages = []
        
        # Handle case where components is a dict returned by ComponentDetector
        if isinstance(components, dict):
            components_list = components.get("components", [])
        else:
            components_list = components
            
        for component in components_list:
            if not isinstance(component, dict) or not component.get("visible", False):
                continue
                
            for detector in self.detectors:
                detected_damages = detector.predict(frame, component)
                all_damages.extend(detected_damages)
                
        return {
            "frame": view,
            "damages": all_damages
        }
