import asyncio
import time
import uuid
import os
import json
import logging
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_engine, get_sessionmaker, Base
from app.models.user import User
from app.models.device import Device
from app.models.inspection import Inspection
from app.dependencies.auth import get_current_user

from app.services.vision_service import VisionService



# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Verification")

engine = get_engine()
async_session = get_sessionmaker()

async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# We will override auth to avoid dealing with JWTs in the test
test_user_id = uuid.uuid4()
async def mock_get_current_user():
    user = User(
        id=test_user_id,
        email=f"verify_{test_user_id}@test.com",
        full_name="Verification User",
        password_hash="dummy_hash",
        is_verified=True,
        is_active=True,
        role="customer"
    )
    return user

app.dependency_overrides[get_current_user] = mock_get_current_user

def run_verification():
    print("==========================================================")
    print("STARTING COMPLETE PIPELINE VERIFICATION")
    print("==========================================================")
    
    # 1. Setup DB
    asyncio.run(setup_db())
    device_id = uuid.uuid4()
    
    # 2. Insert Device
    async def insert_device():
        async with async_session() as session:
            user = await mock_get_current_user()
            dev = Device(
                id=device_id,
                owner_id=user.id,
                brand="Apple",
                model="iPhone 14",
                category="Smartphone",
                purchase_year=2023,
                condition="Good",
                description="Test",
                has_invoice=True,
                has_warranty=True,
                accessories=["charger"]
            )
            session.add(user)
            session.add(dev)
            await session.commit()
    asyncio.run(insert_device())
    
    metrics = {}
    
    # Load sample image
    with open("sample_phone.jpg", "rb") as f:
        image_bytes = f.read()
    
    client = TestClient(app)
    
    # ---------------------------------------------------------
    # STAGE: WEBSOCKET & AI MODELS (YOLO, Tracking, DINO)
    # ---------------------------------------------------------
    print("STAGE: WebSocket & Live Inspection")
    t0_ws = time.time()
    try:
        with client.websocket_connect(f"/api/v1/live-inspection/{device_id}") as websocket:
            metrics["ws_connection"] = "Established"
            frames_sent = 0
            frames_received = 0
            
            # Send 5 frames to simulate streaming
            for i in range(5):
                t_frame = time.time()
                websocket.send_bytes(image_bytes)
                frames_sent += 1
                
                try:
                    # The backend processes the frame and sends back JSON
                    response = websocket.receive_json()
                    frames_received += 1
                    
                    if i == 4:
                        # Capture the last response to verify AI model outputs
                        metrics["live_ws_output"] = response
                except Exception as e:
                    print(f"WS receive error: {e}")
            
            # Send a fake command to finish if it doesn't auto finish
            # The backend closes the socket when it detects completed angles
            # Our live_inspection checks if composite score > 70 for 6 angles.
            # We'll just close it.
    except Exception as e:
        metrics["ws_connection"] = f"Failed: {e}"
        print(e)
    t_ws = (time.time() - t0_ws) * 1000
    print(f"Execution Finished: {t_ws:.2f} ms")
    
    # ---------------------------------------------------------
    # STAGE: REST API - UPLOAD IMAGES
    # ---------------------------------------------------------
    print("\nSTAGE: Image Upload")
    import cv2
    import numpy as np
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    
    transforms = [
        img_np,
        cv2.flip(img_np, 1),
        cv2.flip(img_np, 0),
        cv2.flip(img_np, -1),
        cv2.rotate(img_np, cv2.ROTATE_90_CLOCKWISE)
    ]
    
    t0_upload = time.time()
    for i in range(5):
        _, encoded = cv2.imencode('.jpg', transforms[i])
        mod_bytes = encoded.tobytes()
        response = client.post(
            f"/api/v1/devices/{device_id}/images",
            files={"image": (f"sample_phone_{i}.jpg", mod_bytes, "image/jpeg")}
        )
        if response.status_code != 201:
            print(f"Failed to upload image {i}: {response.text}")
    t_upload = (time.time() - t0_upload) * 1000
    print(f"Execution Finished: {t_upload:.2f} ms")
    
    # ---------------------------------------------------------
    # STAGE: REST API - TRIGGER INSPECTION (Gemini, Pricing, Report)
    # ---------------------------------------------------------
    print("\nSTAGE: Background Inspection (Gemini, Pricing, Database, PDF, JSON)")
    t0_insp = time.time()
    response = client.post(
        f"/api/v1/inspections/{device_id}",
        json={"functional_tests": {"wifi": "Pass", "bluetooth": "Pass"}}
    )
    if response.status_code != 201:
        print(f"Failed to start inspection: {response.text}")
    else:
        insp_id = response.json().get("id")
        print(f"Inspection created: {insp_id}. Waiting for background task...")
        
        # Poll database until status is completed
        completed = False
        t0_poll = time.time()
        final_inspection = None
        while time.time() - t0_poll < 60:
            resp = client.get(f"/api/v1/inspections/{device_id}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "completed":
                    completed = True
                    final_inspection = data
                    break
            time.sleep(2)
        
        t_insp = (time.time() - t0_insp) * 1000
        print(f"Execution Finished: {t_insp:.2f} ms, Success: {completed}")
        metrics["final_inspection"] = final_inspection
        
    # ---------------------------------------------------------
    # STAGE: REST API - INSPECTION HISTORY RETRIEVAL
    # ---------------------------------------------------------
    print("\nSTAGE: Inspection History Retrieval")
    t0_hist = time.time()
    response = client.get(f"/api/v1/inspections/history/{device_id}")
    t_hist = (time.time() - t0_hist) * 1000
    print(f"Execution Finished: {t_hist:.2f} ms, Success: {response.status_code == 200}")
    if response.status_code == 200:
        history = response.json()
        print(f"Found {len(history)} inspections.")
        
    # Write metrics to JSON for analysis
    with open("verification_metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)
        
    print("\nVerification execution completed. Data saved to verification_metrics.json")

if __name__ == "__main__":
    run_verification()
