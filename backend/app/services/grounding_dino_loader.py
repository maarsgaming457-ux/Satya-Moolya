import logging
import os
from functools import lru_cache
from typing import Any

logger = logging.getLogger(__name__)

try:
    import torch
    from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

    HAS_GROUNDING_DINO_DEPS = True
except ImportError:
    torch = None
    AutoProcessor = None
    AutoModelForZeroShotObjectDetection = None
    HAS_GROUNDING_DINO_DEPS = False


DEFAULT_GROUNDING_DINO_MODEL_ID = os.getenv(
    "GROUNDING_DINO_MODEL_ID", "IDEA-Research/grounding-dino-base"
)


class GroundingDinoLoadError(RuntimeError):
    pass


@lru_cache(maxsize=2)
def get_grounding_dino(model_id: str = DEFAULT_GROUNDING_DINO_MODEL_ID) -> tuple[Any, Any, str]:
    if not HAS_GROUNDING_DINO_DEPS:
        raise GroundingDinoLoadError("transformers and torch are required for Grounding DINO")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    attempts = ({"local_files_only": True}, {"local_files_only": False})
    last_error: Exception | None = None

    for kwargs in attempts:
        try:
            mode = "local cache" if kwargs["local_files_only"] else "remote download"
            logger.info("Loading Grounding DINO %s from %s on %s", model_id, mode, device)
            processor = AutoProcessor.from_pretrained(model_id, **kwargs)
            model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id, **kwargs)
            model = model.to(device).eval()
            logger.info("Grounding DINO %s loaded successfully from %s", model_id, mode)
            return processor, model, device
        except Exception as exc:
            last_error = exc
            logger.warning(
                "Grounding DINO %s load failed with local_files_only=%s: %s",
                model_id,
                kwargs["local_files_only"],
                exc,
            )

    raise GroundingDinoLoadError(f"Unable to load Grounding DINO {model_id}: {last_error}")
