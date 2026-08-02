import asyncio
import uuid
import httpx
import os
import cv2
import numpy as np

API_BASE_URL = "http://localhost:8000/api/v1"

async def create_user_and_device(client):
    user_payload = {
        "email": f"test_{uuid.uuid4()}@example.com",
        "password": "Password123!",
        "full_name": "Test User",
        "role": "buyer"
    }
    res = await client.post("/auth/register", json=user_payload)
    if res.status_code != 201:
        print(f"Failed to register user: {res.text}")
        return None, None
    
    login_data = {
        "email": user_payload["email"],
        "password": user_payload["password"]
    }
    res = await client.post("/auth/login", json=login_data)
    if res.status_code != 200:
        return None, None
        
    access_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    dev_payload = {
        "brand": "Apple",
        "model": "iPhone 12",
        "category": "Smartphone",
        "condition": "Good",
        "purchase_year": 2021,
        "serial_number": f"SN{uuid.uuid4().hex[:8]}",
        "description": "Test device"
    }
    res = await client.post("/devices", json=dev_payload, headers=headers)
    if res.status_code != 201:
        return None, None
    return res.json()["id"], headers

async def upload_image(client, device_id, headers, filename):
    with open(filename, "rb") as f:
        files = {"image": (filename, f, "image/jpeg")}
        res = await client.post(f"/devices/{device_id}/images", files=files, headers=headers)
        return res

def create_valid_image(index):
    img = np.random.randint(0, 256, (500, 500, 3), dtype=np.uint8)
    img[:, :, index % 3] = 255
    img[:, :, (index+1) % 3] = index * 20
    fname = f"valid_{index}_{uuid.uuid4().hex[:4]}.jpg"
    cv2.imwrite(fname, img)
    return fname

def create_blurry_image(index):
    img = np.zeros((500, 500, 3), dtype=np.uint8)
    img[:] = (100, 100, 100) # Flat color has low variance (blurry)
    fname = f"blurry_{index}_{uuid.uuid4().hex[:4]}.jpg"
    cv2.imwrite(fname, img)
    return fname

async def run_test(name, client, setup_fn, expected_status):
    print(f"\n{'='*50}\n{name}\n{'='*50}")
    device_id, headers = await create_user_and_device(client)
    
    files_to_upload, files_to_delete = setup_fn()
    
    for fname in files_to_upload:
        await upload_image(client, device_id, headers, fname)
        
    print(f"Triggering inspection for {len(files_to_upload)} images...")
    res = await client.post(f"/inspections/{device_id}", headers=headers)
    print(f"Status Code: {res.status_code}")
    
    if res.status_code == expected_status:
        print(f"PASS ({expected_status} received as expected)")
        if expected_status == 400:
            print(f"Validation Report: {res.json()['detail']}")
    else:
        print(f"FAIL! Expected {expected_status}, got {res.status_code}")
        print(f"Response: {res.json()}")
        
    for fname in files_to_delete:
        if os.path.exists(fname):
            os.remove(fname)

async def main():
    async with httpx.AsyncClient(base_url=API_BASE_URL, timeout=300.0) as client:
        
        # TEST 1: 5 uploaded -> 5 accepted -> PASS (201)
        def setup_t1():
            f = [create_valid_image(i) for i in range(5)]
            return f, f
        await run_test("TEST 1: 5 uploaded -> 5 accepted -> PASS", client, setup_t1, 201)
        
        # TEST 2: 8 uploaded -> 3 rejected -> 5 accepted -> PASS (201)
        def setup_t2():
            f1 = [create_valid_image(i) for i in range(5)]
            f2 = [create_blurry_image(i) for i in range(3)]
            return f1 + f2, f1 + f2
        await run_test("TEST 2: 8 uploaded -> 3 rejected -> 5 accepted -> PASS", client, setup_t2, 201)
        
        # TEST 3: 5 uploaded -> 2 accepted -> HTTP 400
        def setup_t3():
            f1 = [create_valid_image(i) for i in range(2)]
            f2 = [create_blurry_image(i) for i in range(3)]
            return f1 + f2, f1 + f2
        await run_test("TEST 3: 5 uploaded -> 2 accepted -> HTTP 400", client, setup_t3, 400)
        
        # TEST 4: 4 uploaded -> 4 accepted -> HTTP 400
        def setup_t4():
            f = [create_valid_image(i) for i in range(4)]
            return f, f
        await run_test("TEST 4: 4 uploaded -> 4 accepted -> HTTP 400", client, setup_t4, 400)
        
        # TEST 5: 10 uploaded -> 5 accepted -> PASS (201)
        def setup_t5():
            f1 = [create_valid_image(i) for i in range(5)]
            f2 = [create_blurry_image(i) for i in range(5)]
            return f1 + f2, f1 + f2
        await run_test("TEST 5: 10 uploaded -> 5 accepted -> PASS", client, setup_t5, 201)
        
        # TEST 6: All blurry -> HTTP 400
        def setup_t6():
            f = [create_blurry_image(i) for i in range(5)]
            return f, f
        await run_test("TEST 6: All blurry -> HTTP 400", client, setup_t6, 400)
        
        # TEST 7: All duplicates -> HTTP 400
        def setup_t7():
            base_fname = create_valid_image(0)
            # Create exact file copies to ensure hash/phash match
            copies = []
            for i in range(4):
                cname = f"dup_{i}_{base_fname}"
                import shutil
                shutil.copy(base_fname, cname)
                copies.append(cname)
            all_files = [base_fname] + copies
            return all_files, all_files
        await run_test("TEST 7: All duplicates -> HTTP 400", client, setup_t7, 400)

if __name__ == "__main__":
    asyncio.run(main())
