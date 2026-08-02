import asyncio
import websockets
import json
import cv2
import numpy as np

async def test_backend():
    uri = "ws://127.0.0.1:8000/api/v1/live-inspection/test-device-id"
    print(f"Connecting to {uri}")
    async with websockets.connect(uri) as websocket:
        print("Connected.")
        
        # Create a black frame (640x480)
        black_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        _, buffer = cv2.imencode('.jpg', black_frame)
        jpeg_bytes = buffer.tobytes()
        
        print("Sending black frame...")
        await websocket.send(jpeg_bytes)
        
        while True:
            try:
                response = await websocket.recv()
                print("Received:", response)
                
                # Send another frame
                await asyncio.sleep(0.1)
                await websocket.send(jpeg_bytes)
            except websockets.exceptions.ConnectionClosed as e:
                print(f"Connection closed by server: code={e.code}, reason={e.reason}")
                break
            except Exception as e:
                print("Exception:", e)
                break

if __name__ == "__main__":
    asyncio.run(test_backend())
