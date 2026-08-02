import time
import os
import cv2
import numpy as np

# We import the exact class used in the backend to ensure accurate benchmark
from app.services.vision_service import VisionService

def generate_dummy_image():
    # Generate a random noise image (640x480x3)
    return np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)

def run_benchmark():
    print("Initializing VisionService and loading YOLOv8n...")
    t0 = time.time()
    vision_service = VisionService()
    t1 = time.time()
    print(f"Model Load Time: {(t1 - t0):.3f}s")
    
    if not vision_service.phone_model:
        print("Failed to load YOLOv8 phone model. Benchmark aborted.")
        return
        
    print(f"Model Path: yolov8n.pt")
    
    # Warmup
    dummy = generate_dummy_image()
    vision_service.detect_phone(dummy)
    
    # Real Benchmark
    num_images = 100
    latencies = []
    detections = 0
    
    print(f"\nRunning inference on {num_images} generated images...")
    
    for i in range(num_images):
        img = generate_dummy_image()
        t_start = time.time()
        found, box = vision_service.detect_phone(img)
        t_end = time.time()
        
        latencies.append((t_end - t_start) * 1000)
        if found:
            detections += 1
            
    avg_latency = sum(latencies) / len(latencies)
    
    print("\n--- Benchmark Results ---")
    print(f"Total Images: {num_images}")
    print(f"Total Detections (Class 67): {detections}")
    print(f"Average Inference Latency: {avg_latency:.1f}ms")
    print(f"Min Latency: {min(latencies):.1f}ms")
    print(f"Max Latency: {max(latencies):.1f}ms")
    
    # Since these are random noise images, Recall will be 0 (no actual phones). 
    # Precision is inherently bounded by the model's false positive rate on noise.
    
    print("\nDetectionService is no longer mocked. It uses real YOLOv8 inference!")

if __name__ == "__main__":
    run_benchmark()
