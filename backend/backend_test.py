"""
Backend API tests for 210Codelabs Corporation website.
Tests contact form submission, admin authentication, and message management.
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://bright-tomorrow-lab--3vgwcyhh.preview.emergentagent.com/api"
ADMIN_PASSWORD = "pCagavaQEfgcHeG5"

class APITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.token = None
        self.test_message_ids = []

    def test(self, name, fn):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"TEST {self.tests_run}: {name}")
        print('='*60)
        try:
            fn()
            self.tests_passed += 1
            print(f"✅ PASSED")
            return True
        except AssertionError as e:
            print(f"❌ FAILED: {e}")
            return False
        except Exception as e:
            print(f"❌ ERROR: {e}")
            return False

    def assert_eq(self, actual, expected, msg=""):
        if actual != expected:
            raise AssertionError(f"{msg} Expected {expected}, got {actual}")
        print(f"  ✓ {msg or 'Assertion passed'}: {actual}")

    def assert_in(self, item, container, msg=""):
        if item not in container:
            raise AssertionError(f"{msg} Expected {item} in {container}")
        print(f"  ✓ {msg or 'Contains check passed'}")

    # ========== Contact Form Tests ==========
    
    def test_contact_valid(self):
        """POST /api/contact with valid payload returns 201 with id"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "organization": "Test Corp",
            "interest": "AI Engineering",
            "message": "This is a test message with enough characters to pass validation.",
            "consent": True,
            "website": ""
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 201, "Status code")
        data = resp.json()
        print(f"  Response: {data}")
        self.assert_in("ok", data, "Response has 'ok' field")
        self.assert_in("id", data, "Response has 'id' field")
        self.assert_eq(data["ok"], True, "'ok' is True")
        if data["id"] != "ignored":
            self.test_message_ids.append(data["id"])

    def test_contact_invalid_email(self):
        """POST /api/contact with invalid email returns 422"""
        payload = {
            "name": "Test User",
            "email": "not-an-email",
            "interest": "AI Engineering",
            "message": "This is a test message.",
            "consent": True
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 422, "Status code for invalid email")

    def test_contact_short_message(self):
        """POST /api/contact with short message returns 422"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "interest": "AI Engineering",
            "message": "Short",
            "consent": True
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 422, "Status code for short message")

    def test_contact_no_consent(self):
        """POST /api/contact with consent=false returns 422"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "interest": "AI Engineering",
            "message": "This is a test message.",
            "consent": False
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 422, "Status code for no consent")

    def test_contact_invalid_interest(self):
        """POST /api/contact with invalid interest returns 422"""
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "interest": "Invalid Interest",
            "message": "This is a test message.",
            "consent": True
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 422, "Status code for invalid interest")

    def test_contact_honeypot(self):
        """POST /api/contact with honeypot filled returns 201 but doesn't store"""
        payload = {
            "name": "Bot User",
            "email": "bot@example.com",
            "interest": "AI Engineering",
            "message": "This is a bot message.",
            "consent": True,
            "website": "http://spam.com"
        }
        resp = requests.post(f"{BASE_URL}/contact", json=payload)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 201, "Status code")
        data = resp.json()
        print(f"  Response: {data}")
        self.assert_eq(data["ok"], True, "'ok' is True")
        self.assert_eq(data["id"], "ignored", "ID is 'ignored' for honeypot")

    # ========== Admin Auth Tests ==========

    def test_admin_login_wrong_password(self):
        """POST /api/admin/login with wrong password returns 401"""
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": "wrongpassword"})
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 401, "Status code for wrong password")

    def test_admin_login_correct(self):
        """POST /api/admin/login with correct password returns token"""
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD})
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        print(f"  Response keys: {data.keys()}")
        self.assert_in("token", data, "Response has 'token' field")
        self.assert_in("expires_at", data, "Response has 'expires_at' field")
        self.token = data["token"]
        print(f"  Token received: {self.token[:20]}...")

    # ========== Admin Messages Tests ==========

    def test_admin_messages_no_auth(self):
        """GET /api/admin/messages without token returns 401"""
        resp = requests.get(f"{BASE_URL}/admin/messages")
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 401, "Status code without auth")

    def test_admin_messages_list(self):
        """GET /api/admin/messages with token lists messages"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.get(f"{BASE_URL}/admin/messages", headers=headers)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        print(f"  Response keys: {data.keys()}")
        self.assert_in("items", data, "Response has 'items' field")
        self.assert_in("total", data, "Response has 'total' field")
        self.assert_in("counts", data, "Response has 'counts' field")
        print(f"  Total messages: {data['total']}")
        print(f"  Items in page: {len(data['items'])}")

    def test_admin_messages_search(self):
        """GET /api/admin/messages with search query"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.get(f"{BASE_URL}/admin/messages?q=test", headers=headers)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        print(f"  Search results: {data['total']} messages")

    def test_admin_messages_status_filter(self):
        """GET /api/admin/messages with status filter"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        headers = {"Authorization": f"Bearer {self.token}"}
        for status in ["new", "read", "archived"]:
            resp = requests.get(f"{BASE_URL}/admin/messages?status={status}", headers=headers)
            print(f"  Status filter '{status}': {resp.status_code}")
            self.assert_eq(resp.status_code, 200, f"Status code for filter '{status}'")
            data = resp.json()
            print(f"    Messages with status '{status}': {data['total']}")

    def test_admin_message_get(self):
        """GET /api/admin/messages/{id} returns message details"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        if not self.test_message_ids:
            print("  ⚠️  No test messages created, skipping")
            return
        msg_id = self.test_message_ids[0]
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.get(f"{BASE_URL}/admin/messages/{msg_id}", headers=headers)
        print(f"  Status: {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        print(f"  Message: {data.get('name')} - {data.get('email')}")
        self.assert_eq(data["id"], msg_id, "Message ID matches")

    def test_admin_message_patch(self):
        """PATCH /api/admin/messages/{id} updates status"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        if not self.test_message_ids:
            print("  ⚠️  No test messages created, skipping")
            return
        msg_id = self.test_message_ids[0]
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Update to read
        resp = requests.patch(f"{BASE_URL}/admin/messages/{msg_id}", 
                            json={"status": "read"}, headers=headers)
        print(f"  PATCH to 'read': {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        self.assert_eq(data["status"], "read", "Status updated to 'read'")
        
        # Update to archived
        resp = requests.patch(f"{BASE_URL}/admin/messages/{msg_id}", 
                            json={"status": "archived"}, headers=headers)
        print(f"  PATCH to 'archived': {resp.status_code}")
        self.assert_eq(resp.status_code, 200, "Status code")
        data = resp.json()
        self.assert_eq(data["status"], "archived", "Status updated to 'archived'")

    def test_admin_message_delete(self):
        """DELETE /api/admin/messages/{id} removes message"""
        if not self.token:
            raise AssertionError("No token available. Run login test first.")
        if not self.test_message_ids:
            print("  ⚠️  No test messages created, skipping")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Delete all test messages
        for msg_id in self.test_message_ids:
            resp = requests.delete(f"{BASE_URL}/admin/messages/{msg_id}", headers=headers)
            print(f"  DELETE {msg_id}: {resp.status_code}")
            self.assert_eq(resp.status_code, 200, f"Status code for deleting {msg_id}")
            data = resp.json()
            self.assert_eq(data["ok"], True, "'ok' is True")
        
        self.test_message_ids = []
        print(f"  ✓ All test messages deleted")

    # ========== Run All Tests ==========

    def run_all(self):
        """Run all tests in order"""
        print("\n" + "="*60)
        print("210CODELABS BACKEND API TEST SUITE")
        print("="*60)
        
        # Contact form tests
        print("\n\n📝 CONTACT FORM TESTS")
        print("-"*60)
        self.test("Valid contact submission", self.test_contact_valid)
        self.test("Invalid email", self.test_contact_invalid_email)
        self.test("Short message", self.test_contact_short_message)
        self.test("No consent", self.test_contact_no_consent)
        self.test("Invalid interest", self.test_contact_invalid_interest)
        self.test("Honeypot filled", self.test_contact_honeypot)
        
        # Admin auth tests
        print("\n\n🔐 ADMIN AUTHENTICATION TESTS")
        print("-"*60)
        self.test("Wrong password", self.test_admin_login_wrong_password)
        self.test("Correct password", self.test_admin_login_correct)
        
        # Admin messages tests
        print("\n\n📬 ADMIN MESSAGES TESTS")
        print("-"*60)
        self.test("List without auth", self.test_admin_messages_no_auth)
        self.test("List with auth", self.test_admin_messages_list)
        self.test("Search messages", self.test_admin_messages_search)
        self.test("Status filters", self.test_admin_messages_status_filter)
        self.test("Get message by ID", self.test_admin_message_get)
        self.test("Update message status", self.test_admin_message_patch)
        self.test("Delete message", self.test_admin_message_delete)
        
        # Summary
        print("\n\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = APITester()
    return tester.run_all()

if __name__ == "__main__":
    sys.exit(main())
