from abc import ABC, abstractmethod

from app.schemas.inspection import DetectedDefect


class VisionEngine(ABC):
    @abstractmethod
    async def analyze_image(self, image_url: str) -> list[DetectedDefect]:
        raise NotImplementedError
