import os
import json
import time
import cv2
import numpy as np
import psutil

from app.services.vision_service import VisionService

def compute_iou(boxA, boxB):
    # [x1, y1, x2, y2]
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0

    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    
    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

def run_validation():
    data_dir = "data"
    gt_path = os.path.join(data_dir, "ground_truth.json")
    phones_dir = os.path.join(data_dir, "phones")
    output_dir = os.path.join(data_dir, "output")
    
    os.makedirs(output_dir, exist_ok=True)
    for sub in ["correct", "missed", "false_positive", "low_confidence"]:
        os.makedirs(os.path.join(output_dir, sub), exist_ok=True)

    if not os.path.exists(gt_path):
        print("Ground truth not found!")
        return

    with open(gt_path, 'r') as f:
        ground_truth = json.load(f)

    vision = VisionService()
    if not vision.phone_model:
        print("Failed to load YOLOv8 phone model.")
        return

    metrics = {
        "tp": 0,
        "fp": 0,
        "fn": 0,
        "total_gt": 0,
        "latencies": [],
        "cpu_usage": [],
        "ram_usage": []
    }
    
    count = 0
    total = len(ground_truth)
    
    # Process gets current process info
    process = psutil.Process(os.getpid())
    
    for filename, gt_boxes in ground_truth.items():
        filepath = os.path.join(phones_dir, filename)
        img = cv2.imread(filepath)
        if img is None:
            continue
            
        metrics["total_gt"] += len(gt_boxes)
            
        # CPU/RAM Before
        cpu_before = psutil.cpu_percent(interval=None)
        
        # Inference
        t0 = time.time()
        
        # Run YOLO directly to get all boxes and confidences for this image
        # Since the API only returns the *best* box, we will test the raw underlying model
        # to properly calculate AP and F1 on all phones in the frame
        
        results = vision.phone_model(img, verbose=False)
        t1 = time.time()
        
        metrics["latencies"].append((t1 - t0) * 1000)
        metrics["cpu_usage"].append(psutil.cpu_percent(interval=None))
        metrics["ram_usage"].append(process.memory_info().rss / 1024 / 1024) # MB
        
        pred_boxes = []
        low_conf = False
        
        for r in results:
            if r.boxes is None: continue
            for box in r.boxes:
                cls_id = int(box.cls[0])
                if cls_id == 67: # Cell phone
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    pred_boxes.append({"box": [x1, y1, x2, y2], "conf": conf})
                    if conf < 0.5:
                        low_conf = True

        # Match predictions to GT using IoU > 0.5
        matched_gt = set()
        img_tp = 0
        img_fp = 0
        
        # Sort predictions by confidence
        pred_boxes.sort(key=lambda x: x["conf"], reverse=True)
        
        for p in pred_boxes:
            best_iou = 0
            best_gt_idx = -1
            
            for i, gt in enumerate(gt_boxes):
                if i in matched_gt: continue
                iou = compute_iou(p["box"], gt)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = i
                    
            if best_iou >= 0.5:
                img_tp += 1
                matched_gt.add(best_gt_idx)
            else:
                img_fp += 1
                
        img_fn = len(gt_boxes) - len(matched_gt)
        
        metrics["tp"] += img_tp
        metrics["fp"] += img_fp
        metrics["fn"] += img_fn
        
        # Draw and save examples (max 20 per category to save disk space)
        category = None
        if img_tp > 0 and img_fn == 0 and img_fp == 0:
            category = "correct"
        elif img_fn > 0:
            category = "missed"
        elif img_fp > 0:
            category = "false_positive"
            
        if low_conf and category == "correct":
            category = "low_confidence"
            
        if category:
            cat_dir = os.path.join(output_dir, category)
            if len(os.listdir(cat_dir)) < 20:
                # Draw GT in Green, Pred in Red
                draw_img = img.copy()
                for gt in gt_boxes:
                    cv2.rectangle(draw_img, (int(gt[0]), int(gt[1])), (int(gt[2]), int(gt[3])), (0, 255, 0), 2)
                for p in pred_boxes:
                    b = p["box"]
                    cv2.rectangle(draw_img, (int(b[0]), int(b[1])), (int(b[2]), int(b[3])), (0, 0, 255), 2)
                    cv2.putText(draw_img, f"{p['conf']:.2f}", (int(b[0]), int(b[1]-5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                
                cv2.imwrite(os.path.join(cat_dir, filename), draw_img)

        count += 1
        if count % 100 == 0:
            print(f"Processed {count}/{total} images...")

    tp = metrics["tp"]
    fp = metrics["fp"]
    fn = metrics["fn"]
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    avg_latency = np.mean(metrics["latencies"])
    avg_cpu = np.mean(metrics["cpu_usage"])
    avg_ram = np.mean(metrics["ram_usage"])
    
    print("\n====================================================")
    print("VALIDATION REPORT")
    print("====================================================")
    print(f"Total Images Tested: {total}")
    print(f"Total Ground Truth Phones: {metrics['total_gt']}")
    print("----------------------------------------------------")
    print(f"True Positives:  {tp}")
    print(f"False Positives: {fp}")
    print(f"False Negatives: {fn}")
    print("----------------------------------------------------")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("----------------------------------------------------")
    print(f"Average Latency: {avg_latency:.2f} ms")
    print(f"Average CPU Usage: {avg_cpu:.1f} %")
    print(f"Average RAM Usage: {avg_ram:.1f} MB")
    print("====================================================")
    
if __name__ == "__main__":
    run_validation()
