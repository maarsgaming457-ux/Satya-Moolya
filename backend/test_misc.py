import asyncio
import httpx
import uuid

BASE_URL = "http://localhost:8000/api/v1"
password = "Password123!"

async def setup_user(client: httpx.AsyncClient):
    email = f"misc_{uuid.uuid4().hex[:8]}@example.com"
    await client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": f"Misc Tester",
        "role": "buyer"
    })
    res = await client.post("/auth/login", json={"email": email, "password": password})
    return res.json().get("access_token")

async def main():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        print("--- MISCELLANEOUS VERIFICATION ---")
        
        token = await setup_user(client)
        client.headers.update({"Authorization": f"Bearer {token}"})
        
        # Profile
        res = await client.get("/auth/me")
        if res.status_code == 200:
            print("PASS: Profile (GET /auth/me)")
        else:
            print(f"FAIL: Profile. Status: {res.status_code} {res.text}")
            
        # Notifications
        res = await client.get("/notifications")
        if res.status_code == 200:
            print("PASS: Notifications")
        else:
            print(f"FAIL: Notifications. Status: {res.status_code} {res.text}")
            
        # Logout
        res = await client.post("/auth/logout")
        if res.status_code == 200:
            print("PASS: Logout")
        else:
            print(f"FAIL: Logout. Status: {res.status_code} {res.text}")

if __name__ == "__main__":
    asyncio.run(main())
