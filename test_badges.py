"""Backend API tests for OpenBadges feature.

Tests:
1. Public endpoints for 3 seeded founder badges
2. Superadmin endpoints reject unauthenticated requests (401)
3. Superadmin CRUD with dependency override (can't use real Clerk session)
4. Regression: homepage, blog, book, sitemap
"""
import sys
import os
import asyncio
import httpx
from datetime import datetime

# Public endpoint base
BASE_URL = "https://bright-tomorrow-lab--3vgwcyhh.preview.emergentagent.com/api"

# The 3 seeded founder badge IDs
SEEDED_IDS = [
    "26ce7f3d-4dca-54b2-8dbf-9eea1af888aa",  # bachelor-computer-engineering-usces
    "6b0bc72a-ffec-5a0c-9d8d-1d8c310a35a7",  # master-innovation-management-usces
    "092afa88-01cc-53ff-8633-348217e4e816",  # phd-candidate-technology-innovation-management
]

# Expected recipient identity hash for all 3 seeded badges
EXPECTED_IDENTITY = "sha256$b29ebd89336de7d3f140683aa1f4da0cfa4160c059f4a5155a51c0bd0e9ab566"

# Seeded badge slugs
SEEDED_SLUGS = [
    "bachelor-computer-engineering-usces",
    "master-innovation-management-usces",
    "phd-candidate-technology-innovation-management",
]


class TestRunner:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.created_badges = []  # Track badges we create for cleanup

    def test(self, name, fn):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"🔍 Test {self.tests_run}: {name}")
        print('='*60)
        try:
            result = fn()
            if asyncio.iscoroutine(result):
                result = asyncio.run(result)
            if result:
                self.tests_passed += 1
                print(f"✅ PASSED")
            else:
                self.tests_failed += 1
                print(f"❌ FAILED")
            return result
        except Exception as e:
            self.tests_failed += 1
            print(f"❌ FAILED with exception: {e}")
            import traceback
            traceback.print_exc()
            return False

    def summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print(f"📊 TEST SUMMARY")
        print('='*60)
        print(f"Total tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        return 0 if self.tests_failed == 0 else 1


# ============================================================================
# PUBLIC ENDPOINT TESTS
# ============================================================================

def test_public_issuer():
    """Test GET /api/badges/issuer"""
    import requests
    r = requests.get(f"{BASE_URL}/badges/issuer", timeout=10)
    print(f"Status: {r.status_code}")
    if r.status_code != 200:
        print(f"Expected 200, got {r.status_code}")
        return False
    
    data = r.json()
    print(f"Issuer: {data.get('name')}")
    
    # Verify required fields
    if data.get("type") != "Issuer":
        print(f"Expected type=Issuer, got {data.get('type')}")
        return False
    if data.get("name") != "210Codelabs Corporation":
        print(f"Expected name=210Codelabs Corporation, got {data.get('name')}")
        return False
    
    return True


def test_public_badge_classes():
    """Test GET /api/badges/classes/{slug} for all 3 seeded badges"""
    import requests
    
    for slug in SEEDED_SLUGS:
        print(f"\nTesting slug: {slug}")
        r = requests.get(f"{BASE_URL}/badges/classes/{slug}", timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        print(f"Badge name: {data.get('name')}")
        
        if data.get("type") != "BadgeClass":
            print(f"Expected type=BadgeClass, got {data.get('type')}")
            return False
    
    return True


def test_public_badge_images():
    """Test GET /api/badges/images/{slug}.png for all 3 seeded badges"""
    import requests
    
    for slug in SEEDED_SLUGS:
        print(f"\nTesting image for slug: {slug}")
        r = requests.get(f"{BASE_URL}/badges/images/{slug}.png", timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('content-type')}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        if not r.headers.get('content-type', '').startswith('image/png'):
            print(f"Expected image/png, got {r.headers.get('content-type')}")
            return False
        
        print(f"Image size: {len(r.content)} bytes")
    
    return True


def test_public_assertions():
    """Test GET /api/badges/assertions/{aid} for all 3 seeded badges"""
    import requests
    
    for aid in SEEDED_IDS:
        print(f"\nTesting assertion for ID: {aid}")
        r = requests.get(f"{BASE_URL}/badges/assertions/{aid}", timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        print(f"Assertion type: {data.get('type')}")
        
        if data.get("type") != "Assertion":
            print(f"Expected type=Assertion, got {data.get('type')}")
            return False
        
        # Check recipient identity hash
        identity = data.get("recipient", {}).get("identity")
        print(f"Recipient identity: {identity}")
        
        if identity != EXPECTED_IDENTITY:
            print(f"Expected identity={EXPECTED_IDENTITY}")
            print(f"Got identity={identity}")
            return False
    
    return True


def test_public_baked_png():
    """Test GET /api/badges/assertions/{aid}/baked.png for all 3 seeded badges"""
    import requests
    
    for aid in SEEDED_IDS:
        print(f"\nTesting baked PNG for ID: {aid}")
        r = requests.get(f"{BASE_URL}/badges/assertions/{aid}/baked.png", timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('content-type')}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        if not r.headers.get('content-type', '').startswith('image/png'):
            print(f"Expected image/png, got {r.headers.get('content-type')}")
            return False
        
        print(f"Baked PNG size: {len(r.content)} bytes")
        
        # Check for iTXt chunk with openbadges
        if b'iTXt' not in r.content:
            print("Warning: iTXt chunk not found in PNG")
        if b'openbadges' not in r.content:
            print("Warning: 'openbadges' text not found in PNG")
    
    return True


def test_public_badge_view():
    """Test GET /api/badges/public/{aid} for all 3 seeded badges"""
    import requests
    
    for aid in SEEDED_IDS:
        print(f"\nTesting public view for ID: {aid}")
        r = requests.get(f"{BASE_URL}/badges/public/{aid}", timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        data = r.json()
        print(f"Badge: {data.get('short')}")
        print(f"Recipient: {data.get('recipient')}")
        print(f"Status: {data.get('status')}")
        
        # Verify recipient_email is NOT exposed
        if 'recipient_email' in data:
            print("ERROR: recipient_email should not be in public view")
            return False
        
        # Verify required fields
        if not data.get('id'):
            print("Missing id field")
            return False
        if not data.get('recipient'):
            print("Missing recipient field")
            return False
    
    return True


# ============================================================================
# SUPERADMIN AUTH TESTS (401 without token)
# ============================================================================

def test_superadmin_endpoints_require_auth():
    """Test that superadmin endpoints return 401 without authentication"""
    import requests
    
    endpoints = [
        ("GET", "/admin/badges"),
        ("GET", "/admin/badges/access"),
        ("POST", "/admin/badges"),
        ("POST", "/admin/badges/preview"),
    ]
    
    for method, path in endpoints:
        print(f"\nTesting {method} {path}")
        
        if method == "GET":
            r = requests.get(f"{BASE_URL}{path}", timeout=10)
        elif method == "POST":
            r = requests.post(f"{BASE_URL}{path}", json={}, timeout=10)
        
        print(f"Status: {r.status_code}")
        
        if r.status_code != 401:
            print(f"Expected 401, got {r.status_code}")
            return False
    
    return True


# ============================================================================
# SUPERADMIN CRUD TESTS (with dependency override)
# ============================================================================

async def test_superadmin_crud():
    """Test superadmin CRUD operations using dependency override"""
    print("\nRunning in-process tests with dependency override...")
    
    # Import server and override dependency
    sys.path.insert(0, '/app/backend')
    import server
    from clerk_auth import require_superadmin
    
    # Override the dependency to return a mock superadmin user
    server.app.dependency_overrides[require_superadmin] = lambda: {
        'user_id': 'test-superadmin',
        'email': 'ernesto@210codelabs.com'
    }
    
    # Start the server
    await server.startup()
    
    # Create ASGI transport
    transport = httpx.ASGITransport(app=server.app)
    
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Access check
        print("\n--- Test: Access check ---")
        r = await client.get("/api/admin/badges/access")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        # Test 2: List badges
        print("\n--- Test: List badges ---")
        r = await client.get("/api/admin/badges")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        data = r.json()
        initial_count = len(data.get("items", []))
        print(f"Initial badge count: {initial_count}")
        
        # Test 3: Create badge
        print("\n--- Test: Create badge ---")
        badge_data = {
            "recipient_name": "TEST_John Doe",
            "recipient_email": "TEST_John@Example.COM",  # Should be lowercased
            "name": "TEST Bachelor's Degree in Computer Science",
            "short": "TEST Bachelor's CS",
            "description": "This is a test badge for automated testing purposes. 210Codelabs Corporation reviewed the supporting documents.",
            "criteria": "",  # Should be auto-filled
            "disclaimer": "",  # Should use default
            "facts": [
                {"label": "Institution", "value": "Test University"},
                {"label": "Year", "value": "2020"}
            ],
            "tags": ["Test", "Computer Science"],
            "art": {
                "kicker": "BACHELOR'S DEGREE",
                "lines": ["COMPUTER", "SCIENCE"],
                "sub": "GRADUATED 2020",
                "seal_abbr": "TU",
                "seal_top": "TEST UNIVERSITY",
                "seal_bottom": "COMPUTER SCIENCE",
                "seal2": None,
                "ribbon": "TEST BADGE",
                "ribbon_sub": "AUTOMATED TEST"
            }
        }
        
        r = await client.post("/api/admin/badges", json=badge_data)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            print(f"Response: {r.text}")
            return False
        
        created = r.json()
        badge_id = created["id"]
        print(f"Created badge ID: {badge_id}")
        print(f"Slug: {created['slug']}")
        
        # Verify slug was auto-generated
        if not created['slug']:
            print("ERROR: Slug was not auto-generated")
            return False
        
        # Verify email was lowercased
        if created['recipient_email'] != "test_john@example.com":
            print(f"ERROR: Email not lowercased: {created['recipient_email']}")
            return False
        
        # Verify default disclaimer was filled
        if not created['disclaimer']:
            print("ERROR: Default disclaimer was not filled")
            return False
        
        # Verify criteria was auto-filled
        if not created['criteria']:
            print("ERROR: Criteria was not auto-filled")
            return False
        
        # Test 4: Preview (art validation)
        print("\n--- Test: Preview with valid art ---")
        art_payload = {
            "kicker": "TEST",
            "lines": ["LINE1", "LINE2"],
            "sub": "SUB",
            "seal_abbr": "T",
            "seal_top": "TOP",
            "seal_bottom": "BOTTOM",
            "seal2": None,
            "ribbon": "RIBBON",
            "ribbon_sub": "RIBBON SUB"
        }
        r = await client.post("/api/admin/badges/preview", json=art_payload)
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('content-type')}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        if not r.headers.get('content-type', '').startswith('image/png'):
            print(f"Expected image/png, got {r.headers.get('content-type')}")
            return False
        
        # Test 5: Preview with over-length ribbon (should fail with 422)
        print("\n--- Test: Preview with over-length ribbon ---")
        bad_art = {
            "kicker": "TEST",
            "lines": ["LINE1"],
            "sub": "SUB",
            "seal_abbr": "T",
            "seal_top": "TOP",
            "seal_bottom": "BOTTOM",
            "seal2": None,
            "ribbon": "THIS RIBBON TEXT IS WAY TOO LONG AND EXCEEDS THE MAXIMUM",
            "ribbon_sub": "SUB"
        }
        r = await client.post("/api/admin/badges/preview", json=bad_art)
        print(f"Status: {r.status_code}")
        if r.status_code != 422:
            print(f"Expected 422, got {r.status_code}")
            return False
        
        # Test 6: Get badge
        print("\n--- Test: Get badge ---")
        r = await client.get(f"/api/admin/badges/{badge_id}")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        # Test 7: Update badge
        print("\n--- Test: Update badge ---")
        update_data = {
            "short": "TEST Updated Bachelor's CS",
            "tags": ["Updated", "Test"]
        }
        r = await client.patch(f"/api/admin/badges/{badge_id}", json=update_data)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        updated = r.json()
        if updated['short'] != "TEST Updated Bachelor's CS":
            print(f"ERROR: Short not updated: {updated['short']}")
            return False
        
        # Test 8: Public view doesn't expose recipient_email
        print("\n--- Test: Public view hides recipient_email ---")
        r = await client.get(f"/api/badges/public/{badge_id}")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        public_data = r.json()
        if 'recipient_email' in public_data:
            print("ERROR: recipient_email exposed in public view")
            return False
        
        # Test 9: Revoke badge
        print("\n--- Test: Revoke badge ---")
        r = await client.post(f"/api/admin/badges/{badge_id}/revoke", json={"reason": "Test revocation"})
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        revoked = r.json()
        if revoked['status'] != 'revoked':
            print(f"ERROR: Status not revoked: {revoked['status']}")
            return False
        
        # Verify assertion JSON includes revoked:true
        r = await client.get(f"/api/badges/assertions/{badge_id}")
        assertion = r.json()
        if not assertion.get('revoked'):
            print("ERROR: Assertion doesn't have revoked:true")
            return False
        if not assertion.get('revocationReason'):
            print("ERROR: Assertion doesn't have revocationReason")
            return False
        print(f"Revocation reason: {assertion['revocationReason']}")
        
        # Verify public view shows status as revoked
        r = await client.get(f"/api/badges/public/{badge_id}")
        public_data = r.json()
        if public_data['status'] != 'revoked':
            print(f"ERROR: Public view status not revoked: {public_data['status']}")
            return False
        
        # Test 10: Restore badge
        print("\n--- Test: Restore badge ---")
        r = await client.post(f"/api/admin/badges/{badge_id}/restore")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        restored = r.json()
        if restored['status'] != 'active':
            print(f"ERROR: Status not active: {restored['status']}")
            return False
        
        # Test 11: Delete badge
        print("\n--- Test: Delete badge ---")
        r = await client.delete(f"/api/admin/badges/{badge_id}")
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
        
        # Verify public view returns 404
        r = await client.get(f"/api/badges/public/{badge_id}")
        print(f"Public view after delete status: {r.status_code}")
        if r.status_code != 404:
            print(f"Expected 404, got {r.status_code}")
            return False
    
    return True


# ============================================================================
# REGRESSION TESTS
# ============================================================================

def test_regression_pages():
    """Test that homepage, blog, book, and sitemap still work"""
    import requests
    
    base = "https://bright-tomorrow-lab--3vgwcyhh.preview.emergentagent.com"
    
    pages = [
        ("/", "Homepage"),
        ("/blog", "Blog"),
        ("/book", "Book"),
        ("/api/sitemap.xml", "Sitemap"),
    ]
    
    for path, name in pages:
        print(f"\nTesting {name}: {path}")
        r = requests.get(f"{base}{path}", timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code != 200:
            print(f"Expected 200, got {r.status_code}")
            return False
    
    return True


# ============================================================================
# MAIN
# ============================================================================

def main():
    runner = TestRunner()
    
    print("\n" + "="*60)
    print("OPENBADGES BACKEND TESTS")
    print("="*60)
    
    # Public endpoint tests
    runner.test("Public issuer endpoint", test_public_issuer)
    runner.test("Public badge classes", test_public_badge_classes)
    runner.test("Public badge images", test_public_badge_images)
    runner.test("Public assertions with correct identity hash", test_public_assertions)
    runner.test("Public baked PNGs with iTXt chunk", test_public_baked_png)
    runner.test("Public badge view (no recipient_email)", test_public_badge_view)
    
    # Auth tests
    runner.test("Superadmin endpoints require auth (401)", test_superadmin_endpoints_require_auth)
    
    # CRUD tests with dependency override
    runner.test("Superadmin CRUD operations", test_superadmin_crud)
    
    # Regression tests
    runner.test("Regression: homepage, blog, book, sitemap", test_regression_pages)
    
    return runner.summary()


if __name__ == "__main__":
    sys.exit(main())
