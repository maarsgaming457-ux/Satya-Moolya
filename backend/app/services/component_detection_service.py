import abc
import cv2
import numpy as np
from typing import Dict, Any, List, Optional
import time
import logging
from PIL import Image
from app.services.grounding_dino_loader import get_grounding_dino

logger = logging.getLogger(__name__)

# Expected components mapping per view
EXPECTED_COMPONENTS = {
    "Front": ["Screen", "Front Camera", "Front Sensors", "Earpiece Speaker"],
    "Back": ["Rear Camera Module", "Camera Lens", "Flash", "Rear Panel", "Logo", "Fingerprint Sensor"],
    "Bottom": ["Charging Port", "Speaker Grill", "Microphone"],
    "Left": ["SIM Tray", "Volume Buttons"],
    "Right": ["Power Button", "Alert Slider"],
    "Top": ["Secondary Microphone"]
}

class BaseComponentDetector(abc.ABC):
    """
    Abstract interface for Component Detection.
    Future ML models (YOLO, FasterRCNN) should subclass this and implement the predict() method.
    """
    
    @abc.abstractmethod
    def predict(self, frame: np.ndarray, view: str) -> Dict[str, Any]:
        """
        Takes an image frame and a target view angle.
        Returns a structured dictionary of detected and missing components.
        """
        pass
        
    def format_response(self, view: str, detected_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates detected components against the expected schema for the view.
        """
        expected = EXPECTED_COMPONENTS.get(view, [])
        detected_names = [c["name"] for c in detected_list]
        
        # Add missing components with visible=False
        for comp_name in expected:
            if comp_name not in detected_names:
                detected_list.append({
                    "id": comp_name.lower().replace(" ", "_"),
                    "name": comp_name,
                    "confidence": 0.0,
                    "visible": False,
                    "bbox": None
                })
                
        return {
            "frame": view,
            "components": detected_list
        }


class GroundingDinoComponentDetector(BaseComponentDetector):
    """
    Component detector using Grounding DINO for zero-shot detection.
    """
    
    def __init__(self, model_id: str = "IDEA-Research/grounding-dino-tiny"):
        self.processor, self.model, self.device = get_grounding_dino(model_id)
        
        # We search for all components at once to avoid multiple forward passes
        # Note: Grounding DINO uses "." to separate distinct phrases
        self.component_prompts = [
            "phone screen", "rear camera", "camera lens", "flash", 
            "sim tray", "power button", "volume button", 
            "charging port", "speaker", "microphone", 
            "logo", "fingerprint sensor"
        ]
        self.text_prompt = " . ".join(self.component_prompts) + " ."
        
    def predict(self, frame: np.ndarray, view: str) -> Dict[str, Any]:
        start_time = time.time()
        detected = []
        
        try:
            # Convert OpenCV BGR to PIL RGB
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            inputs = self.processor(images=pil_image, text=self.text_prompt, return_tensors="pt").to(self.device)
            
            import torch
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            results = self.processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                threshold=0.25,
                text_threshold=0.25,
                target_sizes=[pil_image.size[::-1]] # (height, width)
            )[0]
            
            # Map results
            labels = results.get("text_labels", results.get("labels", []))
            for score, label, box in zip(results["scores"], labels, results["boxes"]):
                conf = float(score.item())
                class_name = str(label)
                x1, y1, x2, y2 = box.tolist()
                
                # Filter out garbage
                if class_name not in self.component_prompts:
                    # Grounding DINO might sometimes return sub-phrases
                    matched = False
                    for p in self.component_prompts:
                        if class_name in p or p in class_name:
                            class_name = p
                            matched = True
                            break
                    if not matched:
                        continue
                
                # Standardize name formatting (e.g. "phone screen" -> "Screen")
                canonical_name = class_name.title().replace("Phone ", "")
                if class_name == "rear camera":
                    canonical_name = "Rear Camera Module"
                
                detected.append({
                    "id": canonical_name.lower().replace(" ", "_"),
                    "name": canonical_name,
                    "confidence": round(conf, 4),
                    "visible": True,
                    "occluded": False, # Basic assumption if detected
                    "bbox": {
                        "x1": int(x1),
                        "y1": int(y1),
                        "x2": int(x2),
                        "y2": int(y2)
                    }
                })
                
            logger.info(f"Grounding DINO detected {len(detected)} components in {(time.time() - start_time)*1000:.1f}ms")
            
        except Exception as e:
            logger.error(f"Error in Grounding DINO detection: {e}")
            
        return self.format_response(view, detected)
