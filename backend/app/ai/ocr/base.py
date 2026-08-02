from abc import ABC, abstractmethod


class OcrEngine(ABC):
    @abstractmethod
    async def extract_text(self, image_url: str) -> dict[str, str]:
        raise NotImplementedError
