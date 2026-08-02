from app.ai.vision.base import VisionEngine
from app.schemas.inspection import DetectedDefect


class PlaceholderVisionService(VisionEngine):
    async def analyze_image(self, image_url: str) -> list[DetectedDefect]:
        return [
            DetectedDefect(
                type="minor_scratches",
                severity="low",
                confidence=0.82,
                image_url=image_url,
                notes="Light cosmetic scratches detected near the outer frame.",
            )
        ]
