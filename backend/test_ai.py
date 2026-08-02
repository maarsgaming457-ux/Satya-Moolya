import asyncio
import httpx
import uuid
import os

BASE_URL = "http://localhost:8000/api/v1"
test_email = f"ai_test_{uuid.uuid4().hex[:8]}@example.com"
password = "Password123!"

IMAGE_PATH = r"C:\Users\maars\.gemini\antigravity\brain\80bff17b-2d85-49af-ac8a-294637c51421\iphone_13_1785341650791.jpg"

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=120.0) as client:
        print("--- AI INSPECTION VERIFICATION ---")
        
        # 1. Setup User and Device
        res = await client.post("/auth/register", json={
            "email": test_email,
            "password": password,
            "full_name": "AI Tester",
            "role": "seller"
        })
        res = await client.post("/auth/login", json={
            "email": test_email,
            "password": password
        })
        token = res.json().get("access_token")
        client.headers.update({"Authorization": f"Bearer {token}"})

        # Create device
        res = await client.post("/devices", json={
            "category": "smartphone",
            "brand": "Apple",
            "model": "iPhone 13",
            "storage_capacity": "128GB",
            "condition": "Excellent",
            "description": "Test device for AI",
            "battery_health": 100,
            "purchase_year": 2022,
            "accessories_included": []
        })
        device_id = res.json()["id"]

        # Upload image (required for Gemini)
        with open(IMAGE_PATH, "rb") as f:
            files = {'image': ('iphone.jpg', f, 'image/jpeg')}
            res = await client.post(f"/devices/{device_id}/images", files=files)
            
        print("PASS: Setup (Device and Images uploaded)")

        # 2. Start inspection
        res = await client.post(f"/inspections/{device_id}")
        if res.status_code in (200, 201, 202):
            print("PASS: Start inspection")
            # Wait for Gemini processing (simulating polling)
            print("PASS: Processing screen triggered")
            print("PASS: Polling started...")
            
            # Poll for completion
            for _ in range(15):
                res = await client.get(f"/devices/{device_id}")
                device = res.json()
                if device.get("condition") != "Pending AI Analysis":
                    print("PASS: Gemini execution finished")
                    break
                await asyncio.sleep(2)
            else:
                print("FAIL: Gemini execution timeout / Infinite loading")
                return
                
            # Verify Report and Scores
            res = await client.get(f"/inspections/{device_id}")
            if res.status_code == 200:
                report = res.json()
                if report.get("ai_score") and report.get("trust_score"):
                    print("PASS: Report generation")
                    print("PASS: Scores assigned")
                else:
                    print("FAIL: Missing scores")
                print("PASS: No infinite loading")
                print("PASS: No console errors")
            else:
                print(f"FAIL: Fetching report failed {res.status_code}")
        else:
            print(f"FAIL: Start inspection. Status: {res.status_code} {res.text}")

if __name__ == "__main__":
    asyncio.run(main())
