import asyncio
import os
from google import genai
from google.genai import types

async def test_genai():
    # Provide a dummy API key just to test if the method signature works
    # Or load real API key if available
    from app.core.config import settings
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # We will test async generation
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents='Return JSON {"status": "ok"}',
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        print("Response:", response.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test_genai())
