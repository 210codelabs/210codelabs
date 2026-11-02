"""Test suite for SEO endpoints, booking emails + self-service manage booking feature."""
import asyncio
import sys
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

# Load environment
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / ".env")

BASE_URL = "https://bright-tomorrow-lab--3vgwcyhh.preview.emergentagent.com/api"
WEBHOOK_CRON_SECRET = os.environ.get("WEBHOOK_CRON_SECRET", "")
MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "test_database")


class BookingEmailsTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.appointment_id = None
        self.manage_token = None
        self.db = None

    async def setup_db(self):
        """Connect to MongoDB to verify internal state."""
        try:
            client = AsyncIOMotorClient(MONGO_URL)
            self.db = client[DB_NAME]
            print("✅ Connected to MongoDB")
        except Exception as e:
            print(f"⚠️  Could not connect to MongoDB: {e}")

    async def run_test(self, name, test_func):
        """Run a single test and record result."""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"🔍 Test {self.tests_run}: {name}")
        print(f"{'='*60}")
        try:
            await test_func()
            self.tests_passed += 1
            print(f"✅ PASSED: {name}")
            self.test_results.append({"test": name, "status": "passed"})
            return True
        except AssertionError as e:
            print(f"❌ FAILED: {name}")
            print(f"   Reason: {e}")
            self.test_results.append({"test": name, "status": "failed", "error": str(e)})
            return False
        except Exception as e:
            print(f"❌ ERROR: {name}")
            print(f"   Exception: {e}")
            self.test_results.append({"test": name, "status": "error", "error": str(e)})
            return False

    async def test_create_booking(self):
        """Test POST /api/crm/booking creates appointment with manage_token."""
        import httpx
        
        # Get an available slot first
        async with httpx.AsyncClient(timeout=30.0) as client:
            slots_response = await client.get(
                f"{self.base_url}/crm/booking/slots?appt_type=discovery&days=7"
            )
            slots = slots_response.json()["slots"]
            assert len(slots) > 0, "Need at least one available slot"
            
            start_time = slots[0]  # Use first available slot
            print(f"Using available slot: {start_time}")
            
            response = await client.post(
                f"{self.base_url}/crm/booking",
                json={
                    "appt_type": "discovery",
                    "start_at": start_time,
                    "name": "Test User",
                    "email": "test@example.com",
                    "phone": "+1234567890",
                    "company": "Test Company",
                    "timezone": "America/Chicago",
                    "notes": "Test booking for email feature"
                }
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert data.get("ok") is True, "Response should have ok=True"
            assert "appointment_id" in data, "Response should include appointment_id"
            
            self.appointment_id = data["appointment_id"]
            print(f"✓ Created appointment: {self.appointment_id}")
            
            # Wait a moment for background task
            await asyncio.sleep(2)
            
            # Verify in database
            if self.db is not None:
                appt = await self.db.crm_appointments.find_one({"id": self.appointment_id}, {"_id": 0})
                assert appt is not None, "Appointment should exist in database"
                assert "manage_token" in appt, "Appointment should have manage_token"
                assert len(appt["manage_token"]) >= 20, "manage_token should be long random string"
                
                self.manage_token = appt["manage_token"]
                print(f"✓ Appointment has manage_token: {self.manage_token[:10]}...")
                
                # Check if confirmation email was recorded
                if "emails" in appt and "confirmation" in appt["emails"]:
                    print(f"✓ Confirmation email recorded: {appt['emails']['confirmation']}")
                else:
                    print(f"⚠️  Confirmation email not yet recorded (may still be processing)")

    async def test_get_booking_slots(self):
        """Test GET /api/crm/booking/slots returns available slots."""
        import httpx
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/crm/booking/slots?appt_type=discovery&days=7"
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert "slots" in data, "Response should include slots array"
            assert "duration_minutes" in data, "Response should include duration_minutes"
            assert isinstance(data["slots"], list), "slots should be a list"
            
            print(f"✓ Returned {len(data['slots'])} available slots")
            if data["slots"]:
                print(f"  First slot: {data['slots'][0]}")

    async def test_get_manage_booking(self):
        """Test GET /api/crm/booking/manage/{token} returns appointment details."""
        import httpx
        
        if not self.manage_token:
            raise AssertionError("No manage_token available (create booking first)")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test valid token
            response = await client.get(
                f"{self.base_url}/crm/booking/manage/{self.manage_token}"
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            # Verify public view fields
            required_fields = ["appt_type", "type_label", "duration_minutes", "modality", 
                             "start_at", "end_at", "status", "name", "when_label"]
            for field in required_fields:
                assert field in data, f"Response should include {field}"
            
            print(f"✓ All required fields present")
            print(f"  Type: {data['type_label']}")
            print(f"  When: {data['when_label']}")
            print(f"  Status: {data['status']}")
            
            # Test bogus token returns 404
            response = await client.get(
                f"{self.base_url}/crm/booking/manage/bogus_token_12345"
            )
            assert response.status_code == 404, "Bogus token should return 404"
            print(f"✓ Bogus token correctly returns 404")

    async def test_reschedule_booking(self):
        """Test POST /api/crm/booking/manage/{token}/reschedule updates appointment."""
        import httpx
        
        if not self.manage_token:
            raise AssertionError("No manage_token available (create booking first)")
        
        # Get a valid future slot
        async with httpx.AsyncClient(timeout=30.0) as client:
            slots_response = await client.get(
                f"{self.base_url}/crm/booking/slots?appt_type=discovery&days=7"
            )
            slots = slots_response.json()["slots"]
            assert len(slots) > 0, "Need at least one available slot"
            
            new_slot = slots[0]
            print(f"Rescheduling to: {new_slot}")
            
            # Reschedule
            response = await client.post(
                f"{self.base_url}/crm/booking/manage/{self.manage_token}/reschedule",
                json={"start_at": new_slot}
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert data["start_at"] == new_slot, "start_at should be updated"
            
            print(f"✓ Appointment rescheduled successfully")
            
            # Verify in database
            if self.db is not None:
                await asyncio.sleep(1)
                appt = await self.db.crm_appointments.find_one({"id": self.appointment_id}, {"_id": 0})
                assert appt["start_at"] == new_slot, "Database should reflect new time"
                assert "rescheduled_at" in appt, "Should record rescheduled_at"
                assert "reminder_sent_at" not in appt, "Should clear reminder_sent_at"
                print(f"✓ Database updated correctly")
            
            # Test reject past time
            past_time = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
            response = await client.post(
                f"{self.base_url}/crm/booking/manage/{self.manage_token}/reschedule",
                json={"start_at": past_time}
            )
            assert response.status_code == 400, "Past time should return 400"
            print(f"✓ Past time correctly rejected with 400")

    async def test_cancel_booking(self):
        """Test POST /api/crm/booking/manage/{token}/cancel sets status=cancelled."""
        import httpx
        
        if not self.manage_token:
            raise AssertionError("No manage_token available (create booking first)")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/crm/booking/manage/{self.manage_token}/cancel"
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert data["status"] == "cancelled", "Status should be cancelled"
            
            print(f"✓ Appointment cancelled successfully")
            
            # Verify in database
            if self.db is not None:
                await asyncio.sleep(1)
                appt = await self.db.crm_appointments.find_one({"id": self.appointment_id}, {"_id": 0})
                assert appt["status"] == "cancelled", "Database should show cancelled"
                print(f"✓ Database updated correctly")
            
            # Try to reschedule cancelled appointment (should fail)
            slots_response = await client.get(
                f"{self.base_url}/crm/booking/slots?appt_type=discovery&days=7"
            )
            slots = slots_response.json()["slots"]
            if slots:
                response = await client.post(
                    f"{self.base_url}/crm/booking/manage/{self.manage_token}/reschedule",
                    json={"start_at": slots[0]}
                )
                assert response.status_code == 400, "Cancelled booking reschedule should return 400"
                print(f"✓ Cannot reschedule cancelled booking (400)")

    async def test_booking_reminders_cron(self):
        """Test POST /api/cron/booking-reminders with auth and no-double-send."""
        import httpx
        
        if self.db is None:
            print("⚠️  Skipping cron test (no database connection)")
            return
        
        # Create a test appointment ~2 hours in the future
        test_appt_id = f"test_reminder_{int(datetime.now().timestamp())}"
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        
        await self.db.crm_appointments.insert_one({
            "id": test_appt_id,
            "contact_id": "test_contact",
            "appt_type": "discovery",
            "type_label": "Discovery call",
            "duration_minutes": 30,
            "start_at": start_time.isoformat(),
            "end_at": (start_time + timedelta(minutes=30)).isoformat(),
            "status": "scheduled",
            "name": "Reminder Test User",
            "email": "reminder@example.com",
            "timezone": "America/Chicago",
            "manage_token": "test_token_for_reminder",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"✓ Created test appointment for reminder: {test_appt_id}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test unauthorized (no token)
            response = await client.post(f"{self.base_url}/cron/booking-reminders")
            assert response.status_code == 401, "No auth should return 401"
            print(f"✓ Unauthorized request correctly returns 401")
            
            # Test authorized
            response = await client.post(
                f"{self.base_url}/cron/booking-reminders",
                headers={"Authorization": f"Bearer {WEBHOOK_CRON_SECRET}"}
            )
            
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {data}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert "ok" in data and data["ok"] is True, "Response should have ok=True"
            assert "checked" in data, "Response should include checked count"
            assert "sent" in data, "Response should include sent count"
            
            print(f"✓ Cron endpoint authorized and returned: checked={data['checked']}, sent={data['sent']}")
            
            # Verify reminder was sent
            await asyncio.sleep(1)
            appt = await self.db.crm_appointments.find_one({"id": test_appt_id}, {"_id": 0})
            assert "reminder_sent_at" in appt, "Should set reminder_sent_at"
            print(f"✓ Reminder sent and reminder_sent_at set")
            
            # Call cron again - should not send duplicate
            response = await client.post(
                f"{self.base_url}/cron/booking-reminders",
                headers={"Authorization": f"Bearer {WEBHOOK_CRON_SECRET}"}
            )
            data = response.json()
            print(f"Second call response: {data}")
            
            # The sent count should be 0 on second call (no double-send)
            assert data["sent"] == 0, "Should not send duplicate reminder"
            print(f"✓ No double-send: sent={data['sent']} on second call")
            
            # Cleanup
            await self.db.crm_appointments.delete_one({"id": test_appt_id})

    async def test_sitemap_xml(self):
        """Test GET /api/sitemap.xml returns valid XML with all required URLs."""
        import httpx
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self.base_url}/sitemap.xml")
            
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert "application/xml" in response.headers.get("content-type", ""), "Content-Type should be application/xml"
            
            # Parse XML
            try:
                root = ET.fromstring(response.text)
                print(f"✓ Valid XML parsed")
            except ET.ParseError as e:
                raise AssertionError(f"Invalid XML: {e}")
            
            # Extract all URLs
            ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = [loc.text for loc in root.findall(".//ns:loc", ns)]
            
            print(f"✓ Found {len(urls)} URLs in sitemap")
            
            # Extract base URL from first URL in sitemap
            if urls:
                from urllib.parse import urlparse
                parsed = urlparse(urls[0])
                base = f"{parsed.scheme}://{parsed.netloc}"
                print(f"  Base URL: {base}")
            
            # Check required static pages
            required_pages = [
                "/", "/about", "/capabilities", "/work", "/investors", "/blog", "/contact", "/book",
                "/legal/privacy-policy", "/legal/terms-of-use", "/legal/cookie-policy", "/legal/accessibility",
                "/work/intelligent-operations-platform", "/work/next-gen-saas-platform",
                "/work/enterprise-cloud-modernization", "/work/decentralized-ecosystem"
            ]
            
            for page in required_pages:
                expected_url = f"{base}{page}"
                assert any(expected_url == url for url in urls), f"Missing required page: {page}"
            
            print(f"✓ All required static pages present")
            
            # Check for blog posts (if any published)
            blog_urls = [url for url in urls if "/blog/" in url and url != f"{base}/blog"]
            print(f"✓ Found {len(blog_urls)} blog post URLs")
            if blog_urls:
                print(f"  Example: {blog_urls[0]}")

    async def test_robots_txt(self):
        """Test GET /api/robots.txt returns correct disallow rules and sitemap."""
        import httpx
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self.base_url}/robots.txt")
            
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('content-type')}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert "text/plain" in response.headers.get("content-type", ""), "Content-Type should be text/plain"
            
            content = response.text
            print(f"Content:\n{content}")
            
            # Check required disallow rules
            required_disallows = [
                "Disallow: /admin/",
                "Disallow: /admin",
                "Disallow: /sign-in",
                "Disallow: /sign-up",
                "Disallow: /book/manage/",
                "Disallow: /api/"
            ]
            
            for rule in required_disallows:
                assert rule in content, f"Missing required rule: {rule}"
            
            print(f"✓ All required Disallow rules present")
            
            # Check sitemap line
            assert "Sitemap:" in content, "Missing Sitemap directive"
            assert "/api/sitemap.xml" in content, "Sitemap should point to /api/sitemap.xml"
            print(f"✓ Sitemap directive present")

    async def test_blog_posts_list(self):
        """Test GET /api/blog/posts returns published posts."""
        import httpx
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{self.base_url}/blog/posts")
            
            print(f"Status: {response.status_code}")
            data = response.json()
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert "items" in data, "Response should include items array"
            assert "total" in data, "Response should include total count"
            assert isinstance(data["items"], list), "items should be a list"
            
            print(f"✓ Returned {len(data['items'])} posts (total: {data['total']})")
            
            if data["items"]:
                post = data["items"][0]
                required_fields = ["id", "slug", "title", "meta_description", "excerpt", "category", "published_at"]
                for field in required_fields:
                    assert field in post, f"Post should include {field}"
                print(f"✓ First post has all required fields")
                print(f"  Title: {post['title']}")
                print(f"  Slug: {post['slug']}")

    async def test_blog_post_detail(self):
        """Test GET /api/blog/posts/{slug} returns specific post."""
        import httpx
        
        # First get a published post slug
        async with httpx.AsyncClient(timeout=30.0) as client:
            list_response = await client.get(f"{self.base_url}/blog/posts")
            posts = list_response.json()["items"]
            
            if not posts:
                print("⚠️  No published posts to test")
                return
            
            slug = posts[0]["slug"]
            print(f"Testing with slug: {slug}")
            
            response = await client.get(f"{self.base_url}/blog/posts/{slug}")
            
            print(f"Status: {response.status_code}")
            data = response.json()
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            # Check required fields
            required_fields = ["id", "slug", "title", "meta_description", "body_html", "key_takeaways", "faq"]
            for field in required_fields:
                assert field in data, f"Post should include {field}"
            
            print(f"✓ Post detail has all required fields")
            print(f"  Title: {data['title']}")
            print(f"  Has body_html: {len(data.get('body_html', '')) > 0}")
            print(f"  Key takeaways: {len(data.get('key_takeaways', []))}")
            print(f"  FAQ items: {len(data.get('faq', []))}")
            
            # Test 404 for non-existent slug
            response = await client.get(f"{self.base_url}/blog/posts/non-existent-slug-12345")
            assert response.status_code == 404, "Non-existent slug should return 404"
            print(f"✓ Non-existent slug correctly returns 404")

    async def run_all_tests(self):
        """Run all tests in sequence."""
        print("\n" + "="*60)
        print("SEO + BOOKING EMAILS + MANAGE BOOKING TEST SUITE")
        print("="*60)
        
        await self.setup_db()
        
        # SEO tests first
        print("\n" + "="*60)
        print("SEO ENDPOINTS")
        print("="*60)
        await self.run_test("Sitemap.xml endpoint", self.test_sitemap_xml)
        await self.run_test("Robots.txt endpoint", self.test_robots_txt)
        await self.run_test("Blog posts list", self.test_blog_posts_list)
        await self.run_test("Blog post detail", self.test_blog_post_detail)
        
        # Booking tests
        print("\n" + "="*60)
        print("BOOKING ENDPOINTS")
        print("="*60)
        await self.run_test("Create booking with manage_token", self.test_create_booking)
        await self.run_test("Get available booking slots", self.test_get_booking_slots)
        await self.run_test("Get manage booking details", self.test_get_manage_booking)
        await self.run_test("Reschedule booking", self.test_reschedule_booking)
        await self.run_test("Cancel booking", self.test_cancel_booking)
        await self.run_test("Booking reminders cron (auth + no-double-send)", self.test_booking_reminders_cron)
        
        # Print summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        return 0 if self.tests_passed == self.tests_run else 1


async def main():
    tester = BookingEmailsTester()
    return await tester.run_all_tests()


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
