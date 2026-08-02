import asyncio
import websockets
import json
import cv2
import uuid
import numpy as np

async def test_live_inspection():
    device_id = str(uuid.uuid4())
    uri = f"ws://localhost:8000/api/v1/live-inspection/{device_id}"
    
    # Create a dummy image
    img = cv2.imread("iphone_13_1785341650791.jpg")
    if img is None:
        print("Test image not found. Creating a blank image.")
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        
    _, buffer = cv2.imencode('.jpg', img)
    frame_bytes = buffer.tobytes()

    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Send frame
            await websocket.send(frame_bytes)
            print("Sent frame.")
            
            # Receive response
            response = await websocket.recv()
            data = json.loads(response)
            
            print(f"Received JSON response:")
            print(json.dumps(data, indent=2))
            
            if "progress" in data and "instruction" in data:
                print("Live Inspection pipeline is functioning correctly!")
    except Exception as e:
        print(f"WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_live_inspection())
