#!/usr/bin/env python3
"""
COFEPRIS Compliance App - Backend API Testing
Tests all API endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class COFEPRISAPITester:
    def __init__(self, base_url="https://sanitracker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict = None, headers: Dict = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.api_url}{endpoint}"
        
        # Prepare headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = {"raw_response": response.text[:200]}
                print(f"   Raw Response: {response.text[:200]}...")

            if success:
                self.log_test(name, True)
                return True, response_data
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, response_data

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "/health", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "nombre": "Usuario Test",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@cofepris.test",
            "password": "TestPassword123!",
            "telefono": "+52 55 1234 5678",
            "rfc": "TEST123456789",
            "razon_social": "Test Company SA"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "/auth/register", 
            200, 
            test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            print(f"   ✅ Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login with demo credentials"""
        login_data = {
            "email": "demo@cofepris.com",
            "password": "demo123"
        }
        
        success, response = self.run_test(
            "User Login", 
            "POST", 
            "/auth/login", 
            200, 
            login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            print(f"   ✅ Login token obtained: {self.token[:20]}...")
            return True
        return False

    def test_establishments_crud(self):
        """Test establishment CRUD operations"""
        if not self.token:
            self.log_test("Establishments CRUD", False, "No authentication token")
            return False

        # Test GET establishments (should be empty initially)
        success, _ = self.run_test(
            "Get Establishments", 
            "GET", 
            "/establishments", 
            200
        )

        # Test CREATE establishment
        establishment_data = {
            "giro": "CONSULTORIO_ODONTO",
            "servicios": ["Limpieza dental", "Ortodoncia"],
            "numero_salas": 2,
            "equipo_especial": ["Rayos X dental", "Autoclave"],
            "maneja_rpbi": True,
            "responsable_sanitario": True,
            "ubicacion_estado": "Ciudad de México",
            "farmacia_anexo": False,
            "notas_estatales": "Consultorio especializado en ortodoncia"
        }
        
        success, response = self.run_test(
            "Create Establishment", 
            "POST", 
            "/establishments", 
            200, 
            establishment_data
        )
        
        return success

    def test_regulatory_suggestions(self):
        """Test regulatory suggestions endpoint"""
        suggestion_request = {
            "giro": "CONSULTORIO_ODONTO",
            "servicios": ["Limpieza dental", "Ortodoncia"],
            "equipo_especial": ["Rayos X dental"],
            "maneja_rpbi": True,
            "responsable_sanitario": True,
            "ubicacion_estado": "Ciudad de México",
            "farmacia_anexo": False
        }
        
        success, response = self.run_test(
            "Regulatory Suggestions", 
            "POST", 
            "/suggestions", 
            200, 
            suggestion_request
        )
        
        if success:
            # Verify response structure
            required_fields = ['plantillas', 'tramites', 'justificacion', 'completitud_estimado']
            for field in required_fields:
                if field not in response:
                    self.log_test("Suggestions Response Structure", False, f"Missing field: {field}")
                    return False
            self.log_test("Suggestions Response Structure", True)
        
        return success

    def test_ai_consultation(self):
        """Test AI consultation endpoint"""
        if not self.token:
            self.log_test("AI Consultation", False, "No authentication token")
            return False

        consultation_request = {
            "perfil": {
                "giro": "CONSULTORIO_ODONTO",
                "servicios": ["Limpieza dental"],
                "maneja_rpbi": True,
                "ubicacion_estado": "Ciudad de México"
            },
            "pregunta": "¿Qué documentos necesito para cumplir con COFEPRIS en mi consultorio dental?"
        }
        
        success, response = self.run_test(
            "AI Consultation", 
            "POST", 
            "/ai/consultation", 
            200, 
            consultation_request
        )
        
        if success:
            # Verify AI response structure
            required_fields = ['razonamiento', 'respuesta', 'pregunta']
            for field in required_fields:
                if field not in response:
                    self.log_test("AI Response Structure", False, f"Missing field: {field}")
                    return False
            self.log_test("AI Response Structure", True)
        
        return success

    def test_document_templates(self):
        """Test document templates endpoint"""
        success, response = self.run_test(
            "Get Document Templates", 
            "GET", 
            "/templates", 
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            # Verify template structure
            template = response[0]
            required_fields = ['id', 'nombre', 'categoria', 'que_incluye', 'razones']
            for field in required_fields:
                if field not in template:
                    self.log_test("Template Structure", False, f"Missing field: {field}")
                    return False
            self.log_test("Template Structure", True)
        
        return success

    def test_tramites(self):
        """Test tramites endpoint"""
        success, response = self.run_test(
            "Get Tramites", 
            "GET", 
            "/tramites", 
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            # Verify tramite structure
            tramite = response[0]
            required_fields = ['id', 'nombre', 'autoridad', 'requisitos']
            for field in required_fields:
                if field not in tramite:
                    self.log_test("Tramite Structure", False, f"Missing field: {field}")
                    return False
            self.log_test("Tramite Structure", True)
        
        return success

    def test_payment_webhook(self):
        """Test payment webhook endpoint"""
        webhook_payload = {
            "user_id": "demo-user-123",
            "payment_status": "completed",
            "amount": 99.00,
            "currency": "MXN"
        }
        
        return self.run_test(
            "Payment Webhook", 
            "POST", 
            "/webhooks/pago", 
            200, 
            webhook_payload
        )

    def test_sample_data_init(self):
        """Test sample data initialization"""
        return self.run_test(
            "Initialize Sample Data", 
            "POST", 
            "/init/sample-data", 
            200
        )

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting COFEPRIS Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        test_sequence = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Establishments CRUD", self.test_establishments_crud),
            ("Regulatory Suggestions", self.test_regulatory_suggestions),
            ("AI Consultation", self.test_ai_consultation),
            ("Document Templates", self.test_document_templates),
            ("Tramites", self.test_tramites),
            ("Payment Webhook", self.test_payment_webhook),
            ("Sample Data Init", self.test_sample_data_init)
        ]
        
        for test_name, test_func in test_sequence:
            try:
                print(f"\n{'='*20} {test_name} {'='*20}")
                test_func()
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = COFEPRISAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())