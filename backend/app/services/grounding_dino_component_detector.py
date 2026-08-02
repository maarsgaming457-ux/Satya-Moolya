import logging
from typing import Dict, Any

import cv2
from PIL import Image

from app.services.grounding_dino_loader import get_grounding_dino

logger = logging.getLogger(__name__)


class GroundingDinoComponentDetector:
    def __init__(self):
        """
        Load Grounding DINO model and processor.
        """
        self.processor, self.model, self.device = get_grounding_dino()

        if self.model is None or self.processor is None:
            logger.warning("Grounding DINO could not be loaded.")

    def predict(self, image, angle: str = "front") -> Dict[str, Any]:
        """
        Detect mobile phone components.

        Returns:
        {
            "success": True/False,
            "components": [],
            "angle": angle
        }
        """

        if self.model is None or self.processor is None:
            return {
                "success": False,
                "components": [],
                "angle": angle,
                "message": "Grounding DINO model unavailable"
            }

        try:
            pil_image = Image.fromarray(
                cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            )

            prompt = "mobile phone, screen, camera, charging port, buttons"

            inputs = self.processor(
                images=pil_image,
                text=prompt,
                return_tensors="pt"
            ).to(self.device)

            import torch

            with torch.no_grad():
                outputs = self.model(**inputs)

            results = self.processor.post_process_grounded_object_detection(
                outputs,
                inputs.input_ids,
                box_threshold=0.25,
                text_threshold=0.25,
                target_sizes=[pil_image.size[::-1]]
            )[0]

            detections = []

            labels = results.get(
                "text_labels",
                results.get("labels", [])
            )

            for score, label, box in zip(
                results["scores"],
                labels,
                results["boxes"]
            ):

                detections.append({
                    "label": str(label),
                    "confidence": float(score.item()),
                    "bbox": [int(x) for x in box.tolist()]
                })

            return {
                "success": True,
                "components": detections,
                "angle": angle
            }

        except Exception as e:
            logger.exception("Grounding DINO prediction failed")

            return {
                "success": False,
                "components": [],
                "angle": angle,
                "message": str(e)
            }