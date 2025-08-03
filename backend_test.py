#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Personal Dashboard Platform
Tests all authentication, dashboard, widget, and data management endpoints
"""

import requests
import json
import time
import os
from pathlib import Path
import tempfile
import csv

# Configuration
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "username": "sarah_fitness",
            "email": "sarah.fitness@example.com", 
            "password": "SecurePass123!",
            "full_name": "Sarah Johnson"
        }
        self.test_dashboard_id = None
        self.test_widget_id = None
        self.results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True, "API is healthy and responding")
                    return True
                else:
                    self.log_result("Health Check", False, "API responded but status not healthy", data)
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=self.test_user_data
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "username", "email", "access_token", "token_type"]
                
                if all(field in data for field in required_fields):
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_result("User Registration", True, "User registered successfully with valid token")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("User Registration", False, f"Missing fields in response: {missing}", data)
                    return False
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User Registration", False, f"Request failed: {str(e)}")
            return False
    
    def test_duplicate_registration(self):
        """Test duplicate email registration (should fail)"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=self.test_user_data
            )
            
            if response.status_code == 400:
                data = response.json()
                if "already registered" in data.get("detail", "").lower():
                    self.log_result("Duplicate Registration", True, "Correctly rejected duplicate email")
                    return True
                else:
                    self.log_result("Duplicate Registration", False, "Wrong error message", data)
                    return False
            else:
                self.log_result("Duplicate Registration", False, f"Should return 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Duplicate Registration", False, f"Request failed: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        try:
            login_data = {
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "username", "email", "access_token", "token_type"]
                
                if all(field in data for field in required_fields):
                    # Update token for subsequent requests
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_result("User Login", True, "Login successful with valid token")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("User Login", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("User Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            invalid_data = {
                "email": self.test_user_data["email"],
                "password": "WrongPassword123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=invalid_data)
            
            if response.status_code == 401:
                self.log_result("Invalid Login", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_result("Invalid Login", False, f"Should return 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test getting current user info with JWT token"""
        try:
            if not self.auth_token:
                self.log_result("Get Current User", False, "No auth token available")
                return False
                
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["user_id", "username", "email", "created_at"]
                
                if all(field in data for field in expected_fields):
                    if data["email"] == self.test_user_data["email"]:
                        self.log_result("Get Current User", True, "Retrieved user info successfully")
                        return True
                    else:
                        self.log_result("Get Current User", False, "Email mismatch in response", data)
                        return False
                else:
                    missing = [f for f in expected_fields if f not in data]
                    self.log_result("Get Current User", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Get Current User", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Current User", False, f"Request failed: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        try:
            # Temporarily remove auth header
            headers_backup = self.session.headers.copy()
            if "Authorization" in self.session.headers:
                del self.session.headers["Authorization"]
            
            response = self.session.get(f"{API_BASE}/auth/me")
            
            # Restore headers
            self.session.headers = headers_backup
            
            if response.status_code == 403:
                self.log_result("Unauthorized Access", True, "Correctly blocked unauthorized access")
                return True
            else:
                self.log_result("Unauthorized Access", False, f"Should return 403, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Unauthorized Access", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_dashboard(self):
        """Test creating a new dashboard"""
        try:
            dashboard_data = {
                "title": "Sarah's Fitness Journey",
                "description": "Tracking my daily workouts, nutrition, and progress towards my fitness goals",
                "template_type": "fitness",
                "is_public": False
            }
            
            response = self.session.post(f"{API_BASE}/dashboards", json=dashboard_data)
            
            if response.status_code == 200:
                data = response.json()
                if "dashboard_id" in data and "message" in data:
                    self.test_dashboard_id = data["dashboard_id"]
                    self.log_result("Create Dashboard", True, f"Dashboard created with ID: {self.test_dashboard_id}")
                    return True
                else:
                    self.log_result("Create Dashboard", False, "Missing dashboard_id in response", data)
                    return False
            else:
                self.log_result("Create Dashboard", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create Dashboard", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_public_dashboard(self):
        """Test creating a public dashboard"""
        try:
            dashboard_data = {
                "title": "Community Fitness Challenge",
                "description": "Join our 30-day fitness challenge and track progress together",
                "template_type": "fitness",
                "is_public": True
            }
            
            response = self.session.post(f"{API_BASE}/dashboards", json=dashboard_data)
            
            if response.status_code == 200:
                data = response.json()
                if "dashboard_id" in data:
                    self.log_result("Create Public Dashboard", True, "Public dashboard created successfully")
                    return True
                else:
                    self.log_result("Create Public Dashboard", False, "Missing dashboard_id", data)
                    return False
            else:
                self.log_result("Create Public Dashboard", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create Public Dashboard", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_user_dashboards(self):
        """Test retrieving user's dashboards"""
        try:
            response = self.session.get(f"{API_BASE}/dashboards")
            
            if response.status_code == 200:
                data = response.json()
                if "dashboards" in data and isinstance(data["dashboards"], list):
                    dashboards = data["dashboards"]
                    if len(dashboards) >= 1:  # Should have at least the dashboard we created
                        # Check if our test dashboard is in the list
                        found_dashboard = any(d.get("dashboard_id") == self.test_dashboard_id for d in dashboards)
                        if found_dashboard:
                            self.log_result("Get User Dashboards", True, f"Retrieved {len(dashboards)} dashboards")
                            return True
                        else:
                            self.log_result("Get User Dashboards", False, "Test dashboard not found in list")
                            return False
                    else:
                        self.log_result("Get User Dashboards", False, "No dashboards returned")
                        return False
                else:
                    self.log_result("Get User Dashboards", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Get User Dashboards", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get User Dashboards", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_specific_dashboard(self):
        """Test retrieving a specific dashboard"""
        try:
            if not self.test_dashboard_id:
                self.log_result("Get Specific Dashboard", False, "No test dashboard ID available")
                return False
                
            response = self.session.get(f"{API_BASE}/dashboards/{self.test_dashboard_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["dashboard_id", "title", "template_type", "created_at"]
                
                if all(field in data for field in required_fields):
                    if data["dashboard_id"] == self.test_dashboard_id:
                        self.log_result("Get Specific Dashboard", True, "Dashboard retrieved successfully")
                        return True
                    else:
                        self.log_result("Get Specific Dashboard", False, "Dashboard ID mismatch")
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Get Specific Dashboard", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Get Specific Dashboard", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Specific Dashboard", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_widget(self):
        """Test creating a widget for the dashboard"""
        try:
            if not self.test_dashboard_id:
                self.log_result("Create Widget", False, "No test dashboard ID available")
                return False
                
            widget_data = {
                "dashboard_id": self.test_dashboard_id,
                "widget_type": "chart",
                "title": "Weekly Workout Progress",
                "position": {"x": 0, "y": 0, "width": 6, "height": 4},
                "config": {
                    "chart_type": "line",
                    "x_axis": "date",
                    "y_axis": "workout_duration",
                    "color": "#3B82F6"
                },
                "data_source": {"type": "manual"}
            }
            
            response = self.session.post(f"{API_BASE}/widgets", json=widget_data)
            
            if response.status_code == 200:
                data = response.json()
                if "widget_id" in data and "message" in data:
                    self.test_widget_id = data["widget_id"]
                    self.log_result("Create Widget", True, f"Widget created with ID: {self.test_widget_id}")
                    return True
                else:
                    self.log_result("Create Widget", False, "Missing widget_id in response", data)
                    return False
            else:
                self.log_result("Create Widget", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create Widget", False, f"Request failed: {str(e)}")
            return False
    
    def test_add_data_points(self):
        """Test adding data points to a widget"""
        try:
            if not self.test_widget_id or not self.test_dashboard_id:
                self.log_result("Add Data Points", False, "Missing widget or dashboard ID")
                return False
            
            # Add multiple data points
            data_points = [
                {"workout_type": "Running", "duration": 45, "calories": 400, "date": "2024-01-15"},
                {"workout_type": "Weight Training", "duration": 60, "calories": 350, "date": "2024-01-16"},
                {"workout_type": "Yoga", "duration": 30, "calories": 150, "date": "2024-01-17"}
            ]
            
            success_count = 0
            for data_point in data_points:
                point_data = {
                    "dashboard_id": self.test_dashboard_id,
                    "widget_id": self.test_widget_id,
                    "data": data_point
                }
                
                response = self.session.post(f"{API_BASE}/data", json=point_data)
                if response.status_code == 200:
                    success_count += 1
            
            if success_count == len(data_points):
                self.log_result("Add Data Points", True, f"Successfully added {success_count} data points")
                return True
            else:
                self.log_result("Add Data Points", False, f"Only {success_count}/{len(data_points)} data points added")
                return False
                
        except Exception as e:
            self.log_result("Add Data Points", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_widget_data(self):
        """Test retrieving widget data"""
        try:
            if not self.test_widget_id:
                self.log_result("Get Widget Data", False, "No test widget ID available")
                return False
                
            response = self.session.get(f"{API_BASE}/data/{self.test_widget_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "data" in data and isinstance(data["data"], list):
                    data_points = data["data"]
                    if len(data_points) >= 3:  # Should have the 3 data points we added
                        self.log_result("Get Widget Data", True, f"Retrieved {len(data_points)} data points")
                        return True
                    else:
                        self.log_result("Get Widget Data", False, f"Expected 3+ data points, got {len(data_points)}")
                        return False
                else:
                    self.log_result("Get Widget Data", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Get Widget Data", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Widget Data", False, f"Request failed: {str(e)}")
            return False
    
    def test_discover_public_dashboards(self):
        """Test discovering public dashboards"""
        try:
            response = self.session.get(f"{API_BASE}/dashboards/public/discover")
            
            if response.status_code == 200:
                data = response.json()
                if "dashboards" in data and isinstance(data["dashboards"], list):
                    dashboards = data["dashboards"]
                    # Should have at least the public dashboard we created
                    if len(dashboards) >= 1:
                        # Check if all returned dashboards are public
                        all_public = all(d.get("is_public", False) for d in dashboards)
                        if all_public:
                            self.log_result("Discover Public Dashboards", True, f"Found {len(dashboards)} public dashboards")
                            return True
                        else:
                            self.log_result("Discover Public Dashboards", False, "Non-public dashboards in results")
                            return False
                    else:
                        self.log_result("Discover Public Dashboards", True, "No public dashboards found (acceptable)")
                        return True
                else:
                    self.log_result("Discover Public Dashboards", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Discover Public Dashboards", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Discover Public Dashboards", False, f"Request failed: {str(e)}")
            return False
    
    def test_csv_upload(self):
        """Test CSV file upload functionality"""
        try:
            if not self.test_dashboard_id or not self.test_widget_id:
                self.log_result("CSV Upload", False, "Missing dashboard or widget ID")
                return False
            
            # Create a temporary CSV file
            csv_data = [
                ["date", "exercise", "sets", "reps", "weight"],
                ["2024-01-18", "Bench Press", "3", "10", "135"],
                ["2024-01-18", "Squats", "3", "12", "185"],
                ["2024-01-18", "Deadlifts", "3", "8", "225"]
            ]
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
                writer = csv.writer(f)
                writer.writerows(csv_data)
                temp_file_path = f.name
            
            try:
                with open(temp_file_path, 'rb') as f:
                    files = {'file': ('workout_data.csv', f, 'text/csv')}
                    data = {
                        'dashboard_id': self.test_dashboard_id,
                        'widget_id': self.test_widget_id
                    }
                    
                    response = self.session.post(f"{API_BASE}/upload/csv", files=files, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    if "message" in result and "processed" in result["message"].lower():
                        self.log_result("CSV Upload", True, "CSV file uploaded and processed successfully")
                        return True
                    else:
                        self.log_result("CSV Upload", False, "Unexpected response format", result)
                        return False
                else:
                    self.log_result("CSV Upload", False, f"HTTP {response.status_code}", response.text)
                    return False
                    
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
                
        except Exception as e:
            self.log_result("CSV Upload", False, f"Request failed: {str(e)}")
            return False
    
    def test_invalid_csv_upload(self):
        """Test uploading non-CSV file (should fail)"""
        try:
            # Create a temporary text file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write("This is not a CSV file")
                temp_file_path = f.name
            
            try:
                with open(temp_file_path, 'rb') as f:
                    files = {'file': ('not_csv.txt', f, 'text/plain')}
                    
                    response = self.session.post(f"{API_BASE}/upload/csv", files=files)
                
                if response.status_code == 400:
                    self.log_result("Invalid CSV Upload", True, "Correctly rejected non-CSV file")
                    return True
                else:
                    self.log_result("Invalid CSV Upload", False, f"Should return 400, got {response.status_code}")
                    return False
                    
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
                
        except Exception as e:
            self.log_result("Invalid CSV Upload", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Testing")
        print("=" * 60)
        
        # Test sequence following user journey
        tests = [
            ("API Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("Duplicate Registration", self.test_duplicate_registration),
            ("User Login", self.test_user_login),
            ("Invalid Login", self.test_invalid_login),
            ("Get Current User", self.test_get_current_user),
            ("Unauthorized Access", self.test_unauthorized_access),
            ("Create Dashboard", self.test_create_dashboard),
            ("Create Public Dashboard", self.test_create_public_dashboard),
            ("Get User Dashboards", self.test_get_user_dashboards),
            ("Get Specific Dashboard", self.test_get_specific_dashboard),
            ("Create Widget", self.test_create_widget),
            ("Add Data Points", self.test_add_data_points),
            ("Get Widget Data", self.test_get_widget_data),
            ("Discover Public Dashboards", self.test_discover_public_dashboards),
            ("CSV Upload", self.test_csv_upload),
            ("Invalid CSV Upload", self.test_invalid_csv_upload)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if "❌ FAIL" in result["status"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return passed, failed

def main():
    """Main test execution"""
    print("Personal Dashboard Platform - Backend API Testing")
    print("Testing against:", BACKEND_URL)
    
    tester = BackendTester()
    passed, failed = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())