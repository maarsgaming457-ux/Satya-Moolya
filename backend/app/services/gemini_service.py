import json
import logging
import hashlib
from typing import Any, Dict

from google import genai
from google.genai import types
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Unified Service layer for interacting with Google's Gemini Vision API.
    """
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            self.model_name = "gemini-2.5-flash"
        else:
            self.client = None
            self.model_name = None
            
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _generate_cache_key(self, data: Dict[str, Any]) -> str:
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

    async def analyze_device(self, **kwargs: Any) -> dict[str, Any]:
        """
        Analyzes device condition based on vision data.
        """
        if not self.client:
            return {"error": True, "message": "Gemini API key not configured"}

        device_id = kwargs.get("device_id")
        image_urls = kwargs.get("image_urls", [])
        vision_data = kwargs.get("vision_data", [])

        if not image_urls:
            logger.error(f"No image URLs provided for device {device_id}.")
            return {"error": True, "message": f"No image URLs provided for device {device_id}."}

        try:
            vision_context = "Computer Vision pre-analysis results:\n"
            for i, vd in enumerate(vision_data):
                vision_context += f"- Image ID {vd.get('image_id', i+1)}: Detections: {vd.get('detections', [])}\n"

            prompt = f"""
            You are an expert electronics inspector evaluating a pre-owned device.
            Here is the Computer Vision (Grounding DINO/YOLO) pre-analysis data for the images provided:
            {vision_context}
            
            Based ONLY on the provided Computer Vision detections, evaluate the device's condition.
            You are NOT to perform your own visual detection. You MUST rely entirely on the detections listed above.
            For every detected issue you find, you MUST cite the image ID (e.g., "Cracked screen detected [Image ID X]").
            
            Respond STRICTLY with a valid JSON object matching this exact schema and no other text:
            {{
              "inspection_score": int (0-100, where 100 is flawless condition based on the evidence),
              "condition": str (one of: "Like New", "Excellent", "Good", "Fair", "Needs Repair"),
              "summary": str (a 1-2 sentence summary of the device condition citing specific evidence),
              "detected_issues": [str] (list of specific issues observed WITH citations. Empty list if none.),
              "confidence": float (0.0-1.0, your confidence in this assessment based on the quality of detections)
            }}
            """

            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"GeminiService analysis failed for device {device_id}: {e}", exc_info=True)
            return {"error": True, "message": str(e)}

    async def evaluate_offer(self, **kwargs: Any) -> dict[str, Any]:
        """
        Evaluates a buyer's offer using AI.
        """
        if not self.client:
            return {"error": True, "message": "Gemini API key not configured"}
            
        seller_asking_price = kwargs.get("seller_asking_price", 0)
        buyer_offer = kwargs.get("buyer_offer", 0)

        try:
            prompt = f"""
            You are an expert negotiator in a pre-owned electronics marketplace.
            The seller's asking price is {seller_asking_price}.
            The buyer's offer is {buyer_offer}.
            
            Evaluate this offer and suggest a counter-offer.
            Respond STRICTLY with a valid JSON object matching this exact schema and no other text:
            {{
              "seller_asking_price": int,
              "buyer_offer": int,
              "suggested_counter_offer": int,
              "acceptance_probability": int (0-100),
              "negotiation_summary": str (1-2 sentences of advice)
            }}
            """
            
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"GeminiService evaluate_offer failed: {e}", exc_info=True)
            return {"error": True, "message": str(e)}

    async def generate_summary(self, inspection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Consumes the aggregated JSON from all views and generates a structured summary using Gemini.
        Includes deterministic SHA256 caching for unchanged inspections.
        """
        cache_key = self._generate_cache_key(inspection_data)
        
        if cache_key in self._cache:
            logger.info("GeminiService: Returning cached reasoning summary.")
            return self._cache[cache_key]

        if not self.client:
            return {"error": True, "message": "Gemini API key not configured"}
            
        logger.info("GeminiService: Invoking real Gemini API for reasoning summary...")

        try:
            prompt = f"""
            You are an expert smartphone technician and AI inspector.
            Your sole responsibility is to reason over structured JSON data representing physical phone damage.
            You must NEVER invent, assume, or hallucinate damages that are not explicitly present in the JSON.
            If data is missing, clearly state it.
            Your job is to identify contradictions, highlight critical issues, and provide a professional summary.
            
            Analyze the following smartphone inspection JSON data:
            
            {json.dumps(inspection_data, indent=2)}
            
            Provide a detailed, professional assessment following this exact JSON structure:
            {{
              "overall_condition": "Excellent|Good|Fair|Poor",
              "confidence": float (between 0 and 1),
              "summary": "concise paragraph summarizing the state",
              "critical_findings": ["list", "of", "major", "issues"],
              "repair_recommendations": ["list", "of", "suggested", "repairs"],
              "manual_review": ["list", "of", "components", "needing", "human", "eyes"],
              "warnings": ["list", "of", "logical", "contradictions", "or", "missing", "views"]
            }}
            """

            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            result = json.loads(response.text)
            
            # Cache only successful real responses
            self._cache[cache_key] = result
            
            return result
        except Exception as e:
            logger.error(f"GeminiService reasoning failed: {e}", exc_info=True)
            return {"error": True, "message": str(e)}
