#!/usr/bin/env python3
"""
Quick test to verify user registration with fresh user
"""

import requests
import uuid

BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

def test_fresh_registration():
    """Test registration with a completely new user"""
    unique_id = str(uuid.uuid4())[:8]
    test_user = {
        "username": f"testuser_{unique_id}",
        "email": f"test_{unique_id}@example.com",
        "password": "SecurePass123!",
        "full_name": f"Test User {unique_id}"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/register", json=test_user)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["user_id", "username", "email", "access_token", "token_type"]
            
            if all(field in data for field in required_fields):
                print("✅ PASS: Fresh User Registration - User registered successfully with valid token")
                return True
            else:
                missing = [f for f in required_fields if f not in data]
                print(f"❌ FAIL: Fresh User Registration - Missing fields: {missing}")
                return False
        else:
            print(f"❌ FAIL: Fresh User Registration - HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Fresh User Registration - Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_fresh_registration()