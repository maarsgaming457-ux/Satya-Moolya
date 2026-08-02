import asyncio
import sys
import uuid
import json

from app.services.vision_service import VisionService
from app.services.gemini_service import GeminiService
from app.services.pricing_service import PricingService

# A mock Device object to pass to PricingService
class MockDevice:
    def __init__(self):
        self.brand = "Apple"
        self.model = "iPhone 13"
        self.storage_capacity = "128GB"
        self.purchase_year = 2021
        self.id = uuid.uuid4()

async def main():
    print("==========================================")
    print("1. Uploaded Images")
    print("==========================================")
    
    # 5 Sample images (mix of good and bad quality if possible, but let's just use some sample public images)
    image_urls = [
        "https://images.unsplash.com/photo-1592890288564-76628a30a657?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # iPhone front
        "https://images.unsplash.com/photo-1512054502232-10a0a035d672?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # iPhone side/back
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # new valid URL
        "https://images.unsplash.com/photo-1605236453806-6ff36851218e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # cracked phone
        "https://images.unsplash.com/photo-1592890288564-76628a30a657?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=10"   # blurry small image
    ]
    for i, url in enumerate(image_urls):
        print(f"Image {i+1}: {url}")

    print("\n==========================================")
    print("2 & 3. Vision Pipeline (OpenCV + Grounding DINO/YOLO)")
    print("==========================================")
    
    vision_service = VisionService()
    if vision_service.yolo_model:
        print(f"Loaded YOLO Model: {vision_service.yolo_model.model_name}")
    else:
        print("Loaded Fallback Model: Grounding DINO (zero-shot object detection)")
    
    print("\nExecuting VisionService.process_images()...")
    vision_data = await vision_service.process_images(image_urls)
    
    for vd in vision_data:
        print(f"\n--- Image {vd.get('image_id')} ---")
        if "error" in vd:
            print(f"Error: {vd['error']}")
            continue
            
        print("Accepted!")
        
        yolo = vd.get("detections", [])
        print(f"Detections ({len(yolo)} objects):")
        for obj in yolo:
            print(f"  - Class: {obj.get('class')}, Conf: {obj.get('confidence'):.2f}, Box: {obj.get('bounding_box')}, Severity: {obj.get('severity')}")

    print("\n==========================================")
    print("4. Gemini Vision Request")
    print("==========================================")
    
    gemini_service = GeminiService()
    
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
    print("Exact Structured Prompt Sent to Gemini:")
    print(prompt)
    
    print("\n==========================================")
    print("5. Gemini Vision Response")
    print("==========================================")
    print("Executing GeminiService.analyze_device()...")
    
    analysis_result = await gemini_service.analyze_device(
        device_id=str(uuid.uuid4()), image_urls=image_urls, vision_data=vision_data
    )
    print("\nResponse from Gemini:")
    print(json.dumps(analysis_result, indent=2))
    
    print("\n==========================================")
    print("6. Pricing Engine")
    print("==========================================")
    
    device = MockDevice()
    pricing_service = PricingService()
    
    print(f"Fetching market price via Google Search for {device.brand} {device.model} {device.storage_capacity}...")
    base_price = await pricing_service.get_market_price(device.brand, device.model, device.storage_capacity)
    print(f"Current Market Price (Base): ${base_price:.2f}")
    
    # Calculate Valuation Step-by-Step
    print("\nDepreciation Calculation:")
    import datetime
    current_year = datetime.datetime.now().year
    age = current_year - device.purchase_year
    if age < 0: age = 0
    age_depreciation = min(age * 0.15, 0.60)
    print(f"  - Device Age: {age} years")
    print(f"  - Age Depreciation Penalty: {age_depreciation*100:.0f}%")
    current_value = base_price * (1 - age_depreciation)
    print(f"  - Value after Age: ${current_value:.2f}")
    
    inspection_score = analysis_result.get("inspection_score", 0)
    condition_multiplier = max(inspection_score / 100.0, 0.10)
    print(f"  - Condition Multiplier (Score {inspection_score}/100): {condition_multiplier:.2f}x")
    current_value *= condition_multiplier
    print(f"  - Value after Condition: ${current_value:.2f}")
    
    issue_deductions = {
        "cracked screen": 0.20,
        "broken glass": 0.20,
        "damaged camera": 0.15,
        "charging port damage": 0.10,
        "speaker damage": 0.10,
        "dents": 0.05,
        "scratches": 0.02
    }
    
    detected_issues = analysis_result.get("detected_issues", [])
    total_deduction_pct = 0.0
    lower_issues = [iss.lower() for iss in detected_issues]
    
    print(f"  - Damage Deductions:")
    for issue in lower_issues:
        for key, penalty in issue_deductions.items():
            if key in issue:
                print(f"    - Applied penalty for '{key}' in '{issue}': {penalty*100:.0f}%")
                total_deduction_pct += penalty
                
    total_deduction_pct = min(total_deduction_pct, 0.50)
    print(f"  - Total Damage Deduction Penalty (Capped at 50%): {total_deduction_pct*100:.0f}%")
    current_value *= (1 - total_deduction_pct)
    
    current_value = min(current_value, base_price)
    current_value = max(current_value, base_price * 0.05)
    
    print(f"\nFinal Resale Price: ${current_value:.2f}")
    
    print("\n==========================================")
    print("7. Trust Score Calculation")
    print("==========================================")
    blurry_count = sum(1 for v in vision_data if v.get("quality", {}).get("is_blurry", False))
    trust_penalty = (blurry_count / max(len(image_urls), 1)) * 40
    trust_score = max(100 - trust_penalty, 0)
    print(f"Total Images: {len(image_urls)}")
    print(f"Blurry Images Detected: {blurry_count}")
    print(f"Mathematical Formula: 100 - ((blurry_count / total_images) * 40)")
    print(f"Calculation: 100 - (({blurry_count} / {len(image_urls)}) * 40) = {trust_score:.2f}")
    print(f"Final Trust Score: {int(trust_score)}")
    
    print("\n==========================================")
    print("8. Final AI Report Generation")
    print("==========================================")
    report = {
        "inspection_score": analysis_result.get("inspection_score"),
        "trust_score": int(trust_score),
        "estimated_price": round(current_value, 2),
        "condition": analysis_result.get("condition"),
        "summary": analysis_result.get("summary"),
        "detected_issues": analysis_result.get("detected_issues"),
        "confidence": analysis_result.get("confidence"),
    }
    print(json.dumps(report, indent=2))
    
    print("\n[END OF PIPELINE EXECUTION]")

if __name__ == "__main__":
    asyncio.run(main())
