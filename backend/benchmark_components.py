import os
import cv2
import json
import time
import psutil
from app.services.component_detection_service import GroundingDinoComponentDetector

def main():
    print("Loading Grounding DINO Component Detector...")
    detector = GroundingDinoComponentDetector()
    
    phones_dir = "data/phones"
    if not os.path.exists(phones_dir):
        print(f"Error: {phones_dir} not found.")
        return
        
    images = [os.path.join(phones_dir, f) for f in os.listdir(phones_dir) if f.endswith(".jpg")]
    images = images[:300] # Use 300 images as requested
    print(f"Benchmarking on {len(images)} images...")
    
    os.makedirs("benchmark/component_examples", exist_ok=True)
    
    metrics = {
        "total_images": len(images),
        "total_components_detected": 0,
        "component_counts": {},
        "latencies_ms": [],
        "ram_usage_mb": []
    }
    
    process = psutil.Process(os.getpid())
    
    for i, img_path in enumerate(images):
        frame = cv2.imread(img_path)
        if frame is None:
            continue
            
        start = time.time()
        # View is unknown, but Grounding DINO searches for all prompts anyway
        results = detector.predict(frame, "Unknown")
        latency = (time.time() - start) * 1000
        
        # Log memory
        ram_mb = process.memory_info().rss / (1024 * 1024)
        metrics["latencies_ms"].append(latency)
        metrics["ram_usage_mb"].append(ram_mb)
        
        detected_list = [c for c in results.get("components", []) if c.get("visible", False) and c.get("confidence", 0) > 0.3]
        metrics["total_components_detected"] += len(detected_list)
        
        for c in detected_list:
            name = c["name"]
            metrics["component_counts"][name] = metrics["component_counts"].get(name, 0) + 1
            
            # Draw on some examples
            if i < 20: # Save first 20 as examples
                bbox = c["bbox"]
                x1, y1, x2, y2 = bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"{name} {c['confidence']:.2f}", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                            
        if i < 20:
            cv2.imwrite(f"benchmark/component_examples/example_{i}.jpg", frame)
            
        if (i + 1) % 50 == 0:
            print(f"Processed {i + 1}/{len(images)} images. Avg Latency: {sum(metrics['latencies_ms'])/len(metrics['latencies_ms']):.1f}ms")
            
    # Compute aggregates
    avg_latency = sum(metrics["latencies_ms"]) / len(metrics["latencies_ms"]) if metrics["latencies_ms"] else 0
    avg_ram = sum(metrics["ram_usage_mb"]) / len(metrics["ram_usage_mb"]) if metrics["ram_usage_mb"] else 0
    
    print("\n====================================================")
    print("BENCHMARK RESULTS")
    print("====================================================")
    print(f"Total Images: {metrics['total_images']}")
    print(f"Total Components Detected: {metrics['total_components_detected']}")
    print(f"Average Latency: {avg_latency:.2f} ms")
    print(f"Average RAM Usage: {avg_ram:.2f} MB")
    print("\nComponent Breakdown:")
    for k, v in sorted(metrics["component_counts"].items(), key=lambda item: item[1], reverse=True):
        print(f"  - {k}: {v}")
        
    # Save to JSON
    with open("benchmark/component_metrics.json", "w") as f:
        json.dump({
            "total_images": metrics["total_images"],
            "total_components": metrics["total_components_detected"],
            "avg_latency_ms": avg_latency,
            "avg_ram_mb": avg_ram,
            "counts": metrics["component_counts"]
        }, f, indent=4)
        
    # Save markdown report
    with open("benchmark/component_report.md", "w") as f:
        f.write("# ComponentDetectionService Benchmark Report\n\n")
        f.write(f"- **Files Modified:** `component_detection_service.py`, `vision_service.py`\n")
        f.write(f"- **Dependencies Installed:** `transformers`, `torch`, `torchvision`, `accelerate`\n")
        f.write(f"- **Grounding DINO Version:** `IDEA-Research/grounding-dino-tiny` (from huggingface)\n")
        f.write(f"- **Prompts Used:** `phone screen . rear camera . camera lens . flash . sim tray . power button . volume button . charging port . speaker . microphone . logo . fingerprint sensor`\n\n")
        
        f.write(f"## Metrics\n")
        f.write(f"- **Images Tested:** {metrics['total_images']}\n")
        f.write(f"- **Total Components Detected:** {metrics['total_components_detected']}\n")
        f.write(f"- **Average Inference Latency:** {avg_latency:.2f} ms\n")
        f.write(f"- **Average Peak RAM Usage:** {avg_ram:.2f} MB\n\n")
        
        f.write(f"## Component Detection Breakdown\n")
        for k, v in sorted(metrics["component_counts"].items(), key=lambda item: item[1], reverse=True):
            f.write(f"- **{k}**: {v} detections\n")
            
        f.write(f"\n## Conclusion\n")
        f.write("ComponentDetectionService is now a **REAL AI model** using Grounding DINO for zero-shot component extraction.\n")

if __name__ == "__main__":
    main()
