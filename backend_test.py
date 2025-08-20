import requests
import sys
import json
from datetime import datetime

class CodeQuestAPITester:
    def __init__(self, base_url="https://code-quest-7.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"testuser{timestamp}@example.com",
            "username": f"testuser{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True, test_user_data
        return False, {}

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "user/profile",
            200
        )
        return success

    def test_get_challenges(self):
        """Test getting challenges list"""
        success, response = self.run_test(
            "Get Challenges List",
            "GET",
            "challenges",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            return True, response
        elif success:
            self.log_test("Challenges List Validation", False, "No challenges found")
            return False, []
        return False, []

    def test_get_single_challenge(self, challenge_id):
        """Test getting a single challenge"""
        success, response = self.run_test(
            "Get Single Challenge",
            "GET",
            f"challenges/{challenge_id}",
            200
        )
        return success, response

    def test_create_challenge(self):
        """Test creating a new challenge"""
        challenge_data = {
            "title": "Test Challenge",
            "description": "A test challenge for API testing",
            "type": "coding",
            "difficulty": "easy",
            "xp_reward": 20,
            "language": "python",
            "starter_code": "# Write your test code here\n",
            "solution": "print('Test solution')"
        }
        
        success, response = self.run_test(
            "Create Challenge",
            "POST",
            "challenges",
            200,
            data=challenge_data
        )
        
        if success and 'id' in response:
            return True, response['id']
        return False, None

    def test_code_submission_python_success(self, challenge_id):
        """Test successful Python code submission"""
        submission_data = {
            "challenge_id": challenge_id,
            "code": "print('Hello, World!')",
            "language": "python"
        }
        
        success, response = self.run_test(
            "Python Code Submission (Success)",
            "POST",
            "submit/code",
            200,
            data=submission_data
        )
        
        if success and response.get('success') == True:
            return True
        elif success:
            self.log_test("Python Code Execution Validation", False, f"Code execution failed: {response}")
            return False
        return False

    def test_code_submission_python_failure(self, challenge_id):
        """Test failing Python code submission"""
        submission_data = {
            "challenge_id": challenge_id,
            "code": "print('Hello, World!')\nraise Exception('Test error')",
            "language": "python"
        }
        
        success, response = self.run_test(
            "Python Code Submission (Failure)",
            "POST",
            "submit/code",
            200,
            data=submission_data
        )
        
        if success and response.get('success') == False:
            return True
        elif success:
            self.log_test("Python Code Failure Validation", False, f"Expected failure but got: {response}")
            return False
        return False

    def test_code_submission_javascript(self, challenge_id):
        """Test JavaScript code submission"""
        submission_data = {
            "challenge_id": challenge_id,
            "code": "console.log('Hello from JavaScript!');",
            "language": "javascript"
        }
        
        success, response = self.run_test(
            "JavaScript Code Submission",
            "POST",
            "submit/code",
            200,
            data=submission_data
        )
        
        if success and response.get('success') == True:
            return True
        elif success:
            self.log_test("JavaScript Code Execution Validation", False, f"Code execution failed: {response}")
            return False
        return False

    def test_multiple_choice_submission_correct(self, challenge_id, correct_answer):
        """Test correct multiple choice submission"""
        submission_data = {
            "challenge_id": challenge_id,
            "answer": correct_answer
        }
        
        success, response = self.run_test(
            "Multiple Choice Submission (Correct)",
            "POST",
            "submit/multiple-choice",
            200,
            data=submission_data
        )
        
        if success and response.get('success') == True:
            return True
        elif success:
            self.log_test("Multiple Choice Correct Validation", False, f"Expected success but got: {response}")
            return False
        return False

    def test_multiple_choice_submission_incorrect(self, challenge_id, correct_answer):
        """Test incorrect multiple choice submission"""
        # Use a wrong answer
        wrong_answer = "Wrong answer"
        if correct_answer == "Wrong answer":
            wrong_answer = "Another wrong answer"
            
        submission_data = {
            "challenge_id": challenge_id,
            "answer": wrong_answer
        }
        
        success, response = self.run_test(
            "Multiple Choice Submission (Incorrect)",
            "POST",
            "submit/multiple-choice",
            200,
            data=submission_data
        )
        
        if success and response.get('success') == False:
            return True
        elif success:
            self.log_test("Multiple Choice Incorrect Validation", False, f"Expected failure but got: {response}")
            return False
        return False

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        
        if success and isinstance(response, list):
            return True
        elif success:
            self.log_test("Leaderboard Validation", False, "Leaderboard should return a list")
            return False
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CodeQuest API Tests")
        print("=" * 50)
        
        # Test user registration and login
        reg_success, user_data = self.test_user_registration()
        if not reg_success:
            print("❌ Registration failed, stopping tests")
            return self.print_summary()
        
        # Test login with the same user
        if not self.test_user_login(user_data):
            print("❌ Login failed, stopping tests")
            return self.print_summary()
        
        # Test profile
        self.test_get_profile()
        
        # Test challenges
        challenges_success, challenges = self.test_get_challenges()
        
        if challenges_success and len(challenges) > 0:
            # Test getting a single challenge
            first_challenge = challenges[0]
            self.test_get_single_challenge(first_challenge['id'])
            
            # Test code submissions if it's a coding challenge
            if first_challenge.get('type') == 'coding':
                self.test_code_submission_python_success(first_challenge['id'])
                self.test_code_submission_python_failure(first_challenge['id'])
                
                if first_challenge.get('language') == 'javascript':
                    self.test_code_submission_javascript(first_challenge['id'])
            
            # Test multiple choice if it's a multiple choice challenge
            elif first_challenge.get('type') == 'multiple_choice':
                correct_answer = first_challenge.get('correct_answer')
                if correct_answer:
                    self.test_multiple_choice_submission_correct(first_challenge['id'], correct_answer)
                    self.test_multiple_choice_submission_incorrect(first_challenge['id'], correct_answer)
        
        # Test creating a new challenge
        create_success, new_challenge_id = self.test_create_challenge()
        if create_success:
            # Test code submission on the new challenge
            self.test_code_submission_python_success(new_challenge_id)
        
        # Test leaderboard
        self.test_leaderboard()
        
        return self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "No tests run")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['name']}: {result['details']}")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = CodeQuestAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())