import asyncio
import cv2
import numpy as np
import logging
from app.services.vision_service import VisionService
from app.services.live_inspection_service import LiveInspectionService, LiveInspectionSession

logging.basicConfig(level=logging.INFO)

async def run_test():
    vision_service = VisionService()
    live_service = LiveInspectionService(vision_service)
    
    device_id = "test-device-123"
    session = live_service.get_or_create_session(device_id)
    
    # Create a solid bright red frame (simulating a good bright image with some color to trigger detections if possible)
    # But since YOLO detects 'cell phone' and Grounding DINO detects components...
    # Grounding DINO will work on a real image. I'll load an image from tests/ if there is one.
    # Otherwise, I will just generate a random high contrast frame and see if it runs without exceptions.
    frame = np.ones((640, 480, 3), dtype=np.uint8) * 128
    cv2.rectangle(frame, (100, 100), (380, 540), (50, 50, 50), -1) # fake phone
    
    # Override YOLO to force it to detect a phone for the sake of the test, otherwise it might exit early
    def fake_detect_phone(image):
        return True, [100, 100, 380, 540]
    vision_service.detect_phone = fake_detect_phone
    
    # We want to see process_frame output!
    print(f"Angle before: {session.get_current_angle()}")
    print(f"current_angle_idx before: {session.current_angle_idx}")
    
    result = await live_service.process_frame(session, frame)
    
    print("\n[VERIFICATION LOGS]")
    print(f"Number of detections: {len(result['detections'])}")
    if result['detections']:
        avg_conf = np.mean([d["confidence"] for d in result["detections"]]) * 100
        print(f"Average confidence: {avg_conf:.2f}")
    else:
        print("Average confidence: 50.0")
    print(f"Component count: {len([d for d in result['detections'] if 'color' in d])}") # Just roughly
    
    # Calculate composite score used internally to show if it exceeded 70
    sharpness = min(result["quality"]["blur_score"] / 500.0, 1.0) * 100
    avg_conf_internal = np.mean([d["confidence"] for d in result["detections"]]) * 100 if result["detections"] else 50.0
    h, w = frame.shape[:2]
    center_x, center_y = w / 2, h / 2
    box_center_x = (100 + 380) / 2
    box_center_y = (100 + 540) / 2
    dist = np.sqrt((center_x - box_center_x)**2 + (center_y - box_center_y)**2)
    max_dist = np.sqrt(center_x**2 + center_y**2)
    centering_score = max(0, 100 * (1 - (dist / max_dist)))
    composite_score = (avg_conf_internal * 0.4) + (sharpness * 0.4) + (centering_score * 0.2)
    
    print(f"\ncomposite_score: {composite_score:.2f}")
    print(f"Front completed: {'Front' in session.completed_angles}")
    print(f"current_angle_idx after: {session.current_angle_idx}")
    print(f"Current instruction: {result['instruction']}")
    
if __name__ == '__main__':
    asyncio.run(run_test())
