import asyncio
import httpx
import uuid

BASE_URL = "http://localhost:8000/api/v1"
test_email = f"auth_test_{uuid.uuid4().hex[:8]}@example.com"
password = "Password123!"

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("--- AUTHENTICATION VERIFICATION ---")
        
        # 1. Register a new user & Validate registration fields
        try:
            # Try invalid email
            res = await client.post("/auth/register", json={
                "email": "not-an-email",
                "password": password,
                "full_name": "Test User",
                "role": "seller"
            })
            if res.status_code == 422:
                print("PASS: Validate all registration fields (caught invalid email)")
            else:
                print(f"FAIL: Registration field validation. Status: {res.status_code}")
            
            # Register valid user
            res = await client.post("/auth/register", json={
                "email": test_email,
                "password": password,
                "full_name": "Test User",
                "role": "seller"
            })
            if res.status_code in (200, 201):
                print("PASS: Register a new user")
            else:
                print(f"FAIL: Register user. Status: {res.status_code} Response: {res.text}")
                
            # 2. Duplicate email handling
            res = await client.post("/auth/register", json={
                "email": test_email,
                "password": password,
                "full_name": "Test User 2",
                "role": "buyer"
            })
            if res.status_code == 400:
                print("PASS: Duplicate email handling")
            else:
                print(f"FAIL: Duplicate email. Status: {res.status_code} Response: {res.text}")
                
            # 3. Login with invalid credentials
            res = await client.post("/auth/login", json={
                "email": test_email,
                "password": "WrongPassword!"
            })
            if res.status_code in (400, 401):
                print("PASS: Login with invalid credentials")
            else:
                print(f"FAIL: Invalid login. Status: {res.status_code} Response: {res.text}")
                
            # 4. Login with valid credentials & JWT generation
            res = await client.post("/auth/login", json={
                "email": test_email,
                "password": password
            })
            if res.status_code == 200:
                print("PASS: Login with valid credentials")
                token = res.json().get("access_token")
                if token:
                    print("PASS: JWT token generation")
                else:
                    print("FAIL: JWT token generation (token missing in response)")
            else:
                print(f"FAIL: Valid login. Status: {res.status_code} Response: {res.text}")
                token = None
                
            # 5. Protected routes
            if token:
                client.headers.update({"Authorization": f"Bearer {token}"})
                res = await client.get("/auth/me")
                if res.status_code == 200:
                    print("PASS: Protected routes")
                else:
                    print(f"FAIL: Protected routes. Status: {res.status_code} Response: {res.text}")
                    
        except Exception as e:
            print(f"FAIL: Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
