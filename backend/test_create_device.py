import requests
import time
import sys

BASE_URL = 'http://localhost:8000/api/v1'

# 1. Register and login
email = f"user_{int(time.time())}@example.com"
res = requests.post(f'{BASE_URL}/auth/register', json={
    'email': email,
    'password': 'password123',
    'full_name': 'Device Tester',
    'role': 'seller'
})

res = requests.post(f'{BASE_URL}/auth/login', json={
    'email': email,
    'password': 'password123'
})
token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Create Device
device_data = {
    'brand': 'Apple',
    'model': 'iPhone 14',
    'category': 'smartphone',
    'condition': 'good',
    'purchase_year': 2026,
    'description': 'Storage: 256GB, RAM: 8GB, Color: Midnight'
}

res = requests.post(f'{BASE_URL}/devices', json=device_data, headers=headers)
print('Status Code:', res.status_code)
print('Response:', res.text)
