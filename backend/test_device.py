import asyncio
import httpx
import uuid
import os

BASE_URL = "http://localhost:8000/api/v1"
test_email = f"device_test_{uuid.uuid4().hex[:8]}@example.com"
password = "Password123!"

IMAGE_PATH = r"C:\Users\maars\.gemini\antigravity\brain\80bff17b-2d85-49af-ac8a-294637c51421\iphone_13_1785341650791.jpg"

async def main():
    if not os.path.exists(IMAGE_PATH):
        # Create a dummy file if the path doesn't exist
        with open(IMAGE_PATH, "wb") as f:
            f.write(b"dummy image content")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        print("--- DEVICE MANAGEMENT VERIFICATION ---")
        
        # Setup: Register & Login
        res = await client.post("/auth/register", json={
            "email": test_email,
            "password": password,
            "full_name": "Test User",
            "role": "seller"
        })
        res = await client.post("/auth/login", json={
            "email": test_email,
            "password": password
        })
        token = res.json().get("access_token")
        client.headers.update({"Authorization": f"Bearer {token}"})

        # 1. Create device
        res = await client.post("/devices", json={
            "category": "smartphone",
            "brand": "Apple",
            "model": "iPhone 13",
            "storage_capacity": "128GB",
            "condition": "Excellent",
            "description": "Test device",
            "battery_health": 100,
            "purchase_year": 2022,
            "accessories_included": ["charger"]
        })
        if res.status_code == 201:
            print("PASS: Create device")
            device_id = res.json()["id"]
        else:
            print(f"FAIL: Create device. Status: {res.status_code} {res.text}")
            return

        # 2. Edit device
        res = await client.patch(f"/devices/{device_id}", json={
            "description": "Updated test device description",
            "battery_health": 98
        })
        if res.status_code == 200 and res.json().get("battery_health") == 98:
            print("PASS: Edit device")
        else:
            print(f"FAIL: Edit device. Status: {res.status_code} {res.text}")
            
        # 4. Upload multiple images, 7. Supabase upload, 8. DB Image URL
        successes = 0
        image_ids = []
        for i in range(2):
            with open(IMAGE_PATH, "rb") as f:
                files = {'image': (f'iphone_13_{i}.jpg', f, 'image/jpeg')}
                res = await client.post(f"/devices/{device_id}/images", files=files)
                if res.status_code in (200, 201):
                    image_data = res.json()
                    image_ids.append(image_data.get("id"))
                    if image_data.get("image_url") and "supabase" in image_data.get("image_url"):
                        successes += 1
                        
        if successes == 2:
            print("PASS: Upload multiple images")
            print("PASS: Supabase upload")
            print("PASS: Database image URL")
        else:
            print(f"FAIL: Image uploads (Success count: {successes}/2)")

        # 9. Device listing (GET /devices)
        res = await client.get("/devices")
        if res.status_code == 200 and len(res.json().get("items", [])) >= 1:
            print("PASS: Device listing")
        else:
            print(f"FAIL: Device listing. Status: {res.status_code} {res.text}")

        # 10. Device details page (GET /devices/{id})
        res = await client.get(f"/devices/{device_id}")
        if res.status_code == 200 and res.json()["id"] == device_id:
            print("PASS: Device details page")
        else:
            print(f"FAIL: Device details. Status: {res.status_code} {res.text}")
            
        # 6. Image deletion
        if len(image_ids) > 0:
            res = await client.delete(f"/devices/{device_id}/images/{image_ids[0]}")
            if res.status_code == 204 or res.status_code == 200:
                print("PASS: Image deletion")
            else:
                print(f"FAIL: Image deletion. Status: {res.status_code} {res.text}")

        # 3. Delete device
        res = await client.delete(f"/devices/{device_id}")
        if res.status_code == 204 or res.status_code == 200:
            # verify it's gone
            res2 = await client.get(f"/devices/{device_id}")
            if res2.status_code == 404:
                print("PASS: Delete device")
            else:
                print(f"FAIL: Delete device (Still exists). Status: {res2.status_code}")
        else:
            print(f"FAIL: Delete device. Status: {res.status_code} {res.text}")

if __name__ == "__main__":
    asyncio.run(main())
