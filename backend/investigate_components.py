import os
import cv2
import json
import time
import numpy as np
from PIL import Image, ImageDraw
import torch
import warnings

# Suppress warnings for clean output
warnings.filterwarnings("ignore")

from app.services.vision_service import VisionService

def main():
    print("========================================================")
    print("COMPONENT DETECTION INVESTIGATION")
    print("========================================================")

    # Initialize VisionService
    vs = VisionService()
    
    # 1. Load Image
    img_path = "tests/validation/real_data/images/phone_0.jpg"
    img = cv2.imread(img_path)
    if img is None:
        print(f"Failed to load {img_path}")
        return

    # 2. YOLO Phone Detection (Mocked as in test script, or we can use the real model if loaded)
    t0 = time.time()
    phone_detected, phone_bbox = vs.detect_phone(img)
    t1 = time.time()
    
    if not phone_detected or len(phone_bbox) == 0:
        # Fallback to test mock
        print("Using mocked bbox as real YOLO detection failed or was not used")
        phone_bbox = [100, 100, 500, 500]
        phone_detected = True

    print("VERIFY YOLO")
    print(f"Phone bbox: {phone_bbox}")
    print(f"Confidence: N/A (using mocked or extracted)")
    
    h, w = img.shape[:2]
    x1, y1, x2, y2 = phone_bbox
    print(f"Width: {w}")
    print(f"Height: {h}")
    
    # Crop logic from detect_components:
    cx1, cy1 = max(0, x1 - 20), max(0, y1 - 20)
    cx2, cy2 = min(w, x2 + 20), min(h, y2 + 20)
    
    print(f"Crop coordinates: [{cx1}, {cy1}, {cx2}, {cy2}]")
    print(f"Was the crop inside the image? {'YES' if (cx1>=0 and cy1>=0 and cx2<=w and cy2<=h) else 'NO'}")
    print(f"Was the crop clipped? {'YES' if (x1-20 < 0 or y1-20 < 0 or x2+20 > w or y2+20 > h) else 'NO'}")
    
    crop = img[cy1:cy2, cx1:cx2]
    
    print("\nVERIFY THE CROPPED IMAGE")
    ch, cw = crop.shape[:2]
    print(f"resolution: {cw}x{ch}")
    print(f"width: {cw}")
    print(f"height: {ch}")
    gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    print(f"mean brightness: {np.mean(gray_crop):.2f}")
    
    cv2.imwrite("debug_phone_crop.jpg", crop)
    print("Saved debug_phone_crop.jpg")
    
    pil_image = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
    offset_x, offset_y = cx1, cy1
    
    text_input = "smartphone screen. rear glass. smartphone frame. camera module. charging port. buttons. speaker. microphone. sim tray. fingerprint sensor. front camera. flash. logo. alert slider."
    
    print("\nVERIFY GROUNDING DINO INPUT")
    print("Checkpoint: IDEA-Research/grounding-dino-base")
    print("Processor: GroundingDinoProcessor")
    print("Model: GroundingDinoForObjectDetection")
    print(f"Prompt: {text_input}")
    print("Threshold: 0.2")
    print("Text Threshold: 0.2")
    print(f"Target Size: {pil_image.size[::-1]}")
    
    inputs = vs.florence_processor(images=pil_image, text=text_input, return_tensors="pt")
    
    t2 = time.time()
    with torch.no_grad():
        outputs = vs.florence_model(**inputs)
        results = vs.florence_processor.post_process_grounded_object_detection(
            outputs, inputs.input_ids, threshold=0.2, text_threshold=0.2, target_sizes=[pil_image.size[::-1]]
        )[0]
    t3 = time.time()
    
    print(f"\nGrounding DINO execution time: {(t3-t2)*1000:.1f}ms")
    
    print("\nVERIFY RAW MODEL OUTPUT")
    print(f"scores: {results['scores'].tolist()}")
    print(f"boxes: {results['boxes'].tolist()}")
    print(f"labels: {results['labels']}")
    text_labels = results.get("text_labels", [])
    print(f"text_labels: {text_labels}")
    
    print("\nVERIFY COMPONENT PARSER")
    components = []
    labels = results.get("text_labels", results.get("labels"))
    
    draw = ImageDraw.Draw(pil_image)
    
    for score, label, box in zip(results["scores"], labels, results["boxes"]):
        raw_conf = float(score.item())
        scaled_conf = min(raw_conf + 0.5, 1.0)
        bx1, by1, bx2, by2 = box.tolist()
        
        # draw on debug image
        draw.rectangle([bx1, by1, bx2, by2], outline="red", width=2)
        draw.text((bx1, by1), str(label), fill="red")
        
        comp = {
            "class": str(label).lower(),
            "confidence": scaled_conf,
            "bounding_box": [int(bx1 + offset_x), int(by1 + offset_y), int(bx2 + offset_x), int(by2 + offset_y)],
            "track_id": None
        }
        components.append(comp)
        
        print(f"Every detected component:")
        print(f"Raw label: {label}")
        print(f"Normalized label: {str(label).lower()}")
        print(f"Confidence: {scaled_conf:.4f} (raw: {raw_conf:.4f})")
        print(f"Bounding box: {comp['bounding_box']}")
        print(f"Was it accepted? YES")
        
    pil_image.save("debug_dino_boxes.jpg")
    print("Saved debug_dino_boxes.jpg")
    
    print("\nVERIFY ORIENTATION INPUT")
    input_list = [c["class"] for c in components]
    print(json.dumps(input_list, indent=2))
    
    with open("debug_orientation_input.json", "w") as f:
        json.dump(components, f, indent=2)
    print("Saved debug_orientation_input.json")
    
    print("\nVERIFY FRONT IMAGE")
    has_screen = any("screen" in c for c in input_list)
    has_front_cam = any("front camera" in c for c in input_list)
    has_alert_slider = any("alert slider" in c for c in input_list)
    
    print(f"Was a screen detected? {'YES' if has_screen else 'NO'}")
    print(f"Was a front camera detected? {'YES' if has_front_cam else 'NO'}")
    print(f"Was an alert slider detected? {'YES' if has_alert_slider else 'NO'}")
    print("Why? (See raw labels and mocked YOLO box)")

if __name__ == "__main__":
    main()
