import requests
import time
import sys

BASE_URL = 'http://localhost:8000/api/v1'

def run_tests():
    print('--- Auth Setup ---')
    # Register user
    email = f"user_{int(time.time())}@example.com"
    requests.post(f'{BASE_URL}/auth/register', json={
        'email': email,
        'password': 'password123',
        'full_name': 'Device Tester',
        'role': 'seller'
    })
    
    # Login
    res = requests.post(f'{BASE_URL}/auth/login', json={
        'email': email,
        'password': 'password123'
    })
    if res.status_code != 200:
        print('Failed to login:', res.text)
        sys.exit(1)
    
    token = res.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    print('\n--- TEST 1: CREATE DEVICE ---')
    device_data = {
        'make': 'Apple',
        'model': 'iPhone 13',
        'condition': 'good',
        'storage_capacity': '128GB',
        'color': 'Midnight',
        'imei': '123456789012345'
    }
    res = requests.post(f'{BASE_URL}/devices', json=device_data, headers=headers)
    print('Create Device:', res.status_code)
    if res.status_code != 201:
        print('Response:', res.text)
        sys.exit(1)
    
    device_id = res.json()['id']
    print('Created Device ID:', device_id)
    
    print('\n--- TEST 2: LIST DEVICES ---')
    res = requests.get(f'{BASE_URL}/devices', headers=headers)
    print('List Devices:', res.status_code)
    print('Count:', res.json().get('total'))
    
    print('\n--- TEST 3: GET DEVICE ---')
    res = requests.get(f'{BASE_URL}/devices/{device_id}', headers=headers)
    print('Get Device:', res.status_code)
    
    print('\n--- TEST 4: UPDATE DEVICE ---')
    res = requests.patch(f'{BASE_URL}/devices/{device_id}', json={'condition': 'excellent', 'estimated_price': 500}, headers=headers)
    print('Update Device:', res.status_code)
    print('Updated Condition:', res.json().get('condition'))
    print('Updated Price:', res.json().get('estimated_price'))
    
    print('\n--- TEST 5: DELETE DEVICE ---')
    res = requests.delete(f'{BASE_URL}/devices/{device_id}', headers=headers)
    print('Delete Device:', res.status_code)
    
    res = requests.get(f'{BASE_URL}/devices/{device_id}', headers=headers)
    print('Get Deleted Device:', res.status_code)
    
    print('\n--- TEST: SECURITY ---')
    res = requests.post(f'{BASE_URL}/devices', json=device_data)
    print('Create without auth:', res.status_code)
    
run_tests()
