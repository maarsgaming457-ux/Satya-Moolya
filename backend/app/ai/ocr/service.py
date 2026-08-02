from app.ai.ocr.base import OcrEngine


class PlaceholderOCRService(OcrEngine):
    async def extract_text(self, image_url: str) -> dict[str, str]:
        return {
            "source_image_url": image_url,
            "serial_number": "PLACEHOLDER-SERIAL-12345",
            "imei": "000000000000000",
            "label_text": "Placeholder device label text extracted by OCR.",
        }
