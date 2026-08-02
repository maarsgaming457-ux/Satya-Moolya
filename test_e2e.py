import requests
import time

BASE_URL = "http://localhost:8000/api/v1"
session = requests.Session()

def print_result(step, res):
    print(f"[{res.status_code}] {step}")
    if res.status_code >= 400:
        print("ERROR:", res.text)

# 1. Register
res = session.post(f"{BASE_URL}/auth/register", json={
    "email": "testuser@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "seller"
})
print_result("Register User", res)

# 2. Login
res = session.post(f"{BASE_URL}/auth/login", json={
    "email": "testuser@example.com",
    "password": "password123"
})
print_result("Login User", res)
token = res.json().get("access_token") if res.status_code == 200 else ""
session.headers.update({"Authorization": f"Bearer {token}"})

# 3. Get Current User
res = session.get(f"{BASE_URL}/auth/me")
print_result("Get Current User", res)
user_id = res.json().get("id") if res.status_code == 200 else ""

# 4. Create Device
res = session.post(f"{BASE_URL}/devices", json={
    "brand": "Apple",
    "model": "iPhone 13",
    "category": "Smartphone",
    "condition": "Good",
    "purchase_year": 2021,
    "description": "Storage: 128GB, RAM: 4GB, Color: Blue"
})
print_result("Create Device", res)
device_id = res.json().get("id") if res.status_code == 200 else ""

# 5. Upload Image
with open('test_e2e.py', 'rb') as f: # Just upload the script as a dummy image for testing
    res = session.post(f"{BASE_URL}/devices/{device_id}/images", files={"image": ("test.jpg", f, "image/jpeg")})
print_result("Upload Image", res)

# 6. Run AI Inspection (mocked internally or fails?)
res = session.post(f"{BASE_URL}/inspections/{device_id}")
print_result("Run AI Inspection", res)

# 7. Create Marketplace Listing
res = session.post(f"{BASE_URL}/marketplace", json={
    "device_id": device_id,
    "price": 500.0,
    "description": "Great phone for sale"
})
print_result("Create Marketplace Listing", res)
listing_id = res.json().get("id") if res.status_code == 200 else ""

# 8. Create another user for negotiation
session2 = requests.Session()
session2.post(f"{BASE_URL}/auth/register", json={
    "email": "buyer@example.com",
    "password": "password123",
    "full_name": "Buyer User",
    "role": "buyer"
})
res = session2.post(f"{BASE_URL}/auth/login", json={
    "email": "buyer@example.com",
    "password": "password123"
})
token2 = res.json().get("access_token") if res.status_code == 200 else ""
session2.headers.update({"Authorization": f"Bearer {token2}"})

# 9. Test Negotiation
res = session2.post(f"{BASE_URL}/negotiations/offer", json={
    "listing_id": listing_id,
    "offered_price": 450.0
})
print_result("Create Negotiation Offer (Buyer)", res)
neg_id = res.json().get("id") if res.status_code == 200 else ""

# 10. Accept Offer (Seller)
res = session.post(f"{BASE_URL}/negotiations/accept", json={
    "negotiation_id": neg_id
})
print_result("Accept Offer (Seller)", res)

# 11. Create Order (Buyer)
res = session2.post(f"{BASE_URL}/orders", json={
    "listing_id": listing_id
})
print_result("Create Order", res)

