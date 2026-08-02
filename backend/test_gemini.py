import asyncio
import httpx
import uuid
import os
import json

BASE_URL = "http://localhost:8000/api/v1"
password = "Password123!"

async def setup_user(client: httpx.AsyncClient):
    email = f"gemini_{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Gemini Tester",
        "role": "seller"
    })
    res = await client.post("/auth/login", json={"email": email, "password": password})
    return res.json().get("access_token")

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        print("--- GEMINI VERIFICATION ---")
        
        token = await setup_user(client)
        client.headers.update({"Authorization": f"Bearer {token}"})
        
        # Create device
        res = await client.post("/devices", json={
            "category": "Smartphones",
            "description": "A test device for gemini validation",
            "brand": "Apple",
            "model": "iPhone 13",
            "condition": "Excellent",
            "storage_capacity": "128GB",
            "color": "Midnight",
            "purchase_year": 2021,
            "accessories_included": ["Box", "Cable"]
        })
        device_id = res.json().get("id")
        if not device_id:
            print(f"Failed to create device: {res.text}")
            return
        print(f"Device created: {device_id}")
        
        # Upload image
        image_path = r"C:\Users\maars\.gemini\antigravity\brain\80bff17b-2d85-49af-ac8a-294637c51421\iphone_13_1785341650791.jpg"
        if not os.path.exists(image_path):
            # Create a dummy image if it doesn't exist
            with open("dummy.jpg", "wb") as f:
                f.write(b"dummy image data")
            image_path = "dummy.jpg"

        with open(image_path, "rb") as f:
            files = {"image": ("iphone.jpg", f, "image/jpeg")}
            res = await client.post(f"/devices/{device_id}/images", files=files)
            print(f"Image upload status: {res.status_code}")
            
        # Start AI inspection
        print("Triggering AI Inspection...")
        res = await client.post(f"/inspections/{device_id}")
        print(f"Inspection Start Status: {res.status_code}")
        print(f"Inspection Start Response: {res.text}")

        # Wait a moment for background task to execute
        await asyncio.sleep(5)
        
        import time
        max_attempts = 15
        for _ in range(max_attempts):
            await asyncio.sleep(2)
            check_res = await client.get(f"/inspections/{device_id}")
            if check_res.status_code == 200:
                data = check_res.json()
                if data.get("condition") != "Pending AI Analysis":
                    print(f"Inspection Check Status: {check_res.status_code}")
                    print(f"Inspection Check Response: {json.dumps(data)}")
                    break
        else:
            print("Inspection timed out.")

if __name__ == "__main__":
    asyncio.run(main())
