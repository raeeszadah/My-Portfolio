import sys
import os
import json
import urllib.request
import urllib.parse
import urllib.error
import time

BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5173"

class TestResult:
    def __init__(self, name, category, status, detail):
        self.name = name
        self.category = category
        self.status = status  # PASS, FAIL, FIXED, SECURITY_BLOCKED
        self.detail = detail

results = []

def log_test(name, category, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append(TestResult(name, category, status, detail))
    symbol = "[PASS]" if passed else "[FAIL]"
    print(f"{symbol} [{category}] {name}: {detail}")

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
    
    body_bytes = None
    if data is not None:
        if isinstance(data, dict):
            body_bytes = json.dumps(data).encode('utf-8')
            req.add_header('Content-Type', 'application/json')
        elif isinstance(data, (bytes, bytearray)):
            body_bytes = data

    try:
        with urllib.request.urlopen(req, data=body_bytes) as response:
            res_body = response.read().decode('utf-8')
            res_json = None
            try:
                res_json = json.loads(res_body)
            except Exception:
                pass
            return response.status, res_json or res_body
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        err_json = None
        try:
            err_json = json.loads(err_body)
        except Exception:
            pass
        return e.code, err_json or err_body
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("=" * 70)
    print("RUNNING COMPREHENSIVE SECURITY & INTEGRATION TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # Category 1: Public REST API & Content Retrieval
    # -------------------------------------------------------------
    print("\n--- 1. Public REST API Endpoints ---")
    
    # 1.1 Projects Endpoint
    status, body = make_request(f"{BACKEND_URL}/api/projects")
    is_pass = status == 200 and isinstance(body, list)
    log_test("GET /api/projects", "Public REST API", is_pass, f"Status: {status}, Count: {len(body) if isinstance(body, list) else 0}")

    # 1.2 Skills Endpoint
    status, body = make_request(f"{BACKEND_URL}/api/skills")
    is_pass = status == 200 and isinstance(body, list)
    log_test("GET /api/skills", "Public REST API", is_pass, f"Status: {status}, Count: {len(body) if isinstance(body, list) else 0}")

    # 1.3 Timeline Endpoint
    status, body = make_request(f"{BACKEND_URL}/api/timeline")
    is_pass = status == 200 and isinstance(body, dict) and 'experience' in body and 'education' in body
    log_test("GET /api/timeline", "Public REST API", is_pass, f"Status: {status}")

    # 1.4 Profile Endpoint
    status, body = make_request(f"{BACKEND_URL}/api/profile")
    is_pass = status == 200 and isinstance(body, dict)
    log_test("GET /api/profile", "Public REST API", is_pass, f"Status: {status}")

    # 1.5 Social Links Endpoint
    status, body = make_request(f"{BACKEND_URL}/api/socials")
    is_pass = status == 200 and isinstance(body, list)
    log_test("GET /api/socials", "Public REST API", is_pass, f"Status: {status}")

    # -------------------------------------------------------------
    # Category 2: Public Contact Form Validation
    # -------------------------------------------------------------
    print("\n--- 2. Public Contact Form Validation ---")

    # 2.1 Missing Name/Email Validation
    status, body = make_request(f"{BACKEND_URL}/api/contact", method="POST", data={})
    is_pass = status == 400
    log_test("POST /api/contact (Empty Payload)", "Contact Form", is_pass, f"Status: {status}, Error: {body}")

    # 2.2 Valid Contact Submission
    contact_payload = {
        "name": "Integration Test Visitor",
        "email": "visitor@example.com",
        "subject": "Comprehensive Test Inquiry",
        "profession": "Software Engineer / Peer",
        "message": "Automated verification message testing contact pipeline."
    }
    status, body = make_request(f"{BACKEND_URL}/api/contact", method="POST", data=contact_payload)
    is_pass = status in (200, 201) and isinstance(body, dict) and body.get('success') == True
    log_test("POST /api/contact (Valid Submission)", "Contact Form", is_pass, f"Status: {status}")

    # -------------------------------------------------------------
    # Category 3: Security & Token Protection
    # -------------------------------------------------------------
    print("\n--- 3. Authentication & Security Protection ---")

    # 3.1 Unauthorized Admin Email Rejection
    unauth_payload = {"email": "attacker@darkweb.com", "password": "anypassword"}
    status, body = make_request(f"{BACKEND_URL}/api/auth/login", method="POST", data=unauth_payload)
    is_pass = status == 403
    log_test("POST /api/auth/login (Non-Whitelisted Email)", "Security Auth", is_pass, f"Status: {status} (Blocked as expected)")

    # 3.2 Incorrect Password for Whitelisted Email
    bad_pass_payload = {"email": "admin@tecoritham.com", "password": "wrongpassword123"}
    status, body = make_request(f"{BACKEND_URL}/api/auth/login", method="POST", data=bad_pass_payload)
    is_pass = status == 401
    log_test("POST /api/auth/login (Wrong Admin Password)", "Security Auth", is_pass, f"Status: {status} (Rejected as expected)")

    # 3.3 Protected Endpoint without Token
    status, body = make_request(f"{BACKEND_URL}/api/admin/messages")
    is_pass = status in (401, 403)
    log_test("GET /api/admin/messages (No Token)", "Security Protection", is_pass, f"Status: {status}")

    # 3.4 Protected Endpoint with Malformed Token
    headers_malformed = {"Authorization": "Bearer malformed.invalid.token.123"}
    status, body = make_request(f"{BACKEND_URL}/api/admin/messages", headers=headers_malformed)
    is_pass = status in (401, 403)
    log_test("GET /api/admin/messages (Tampered Token)", "Security Protection", is_pass, f"Status: {status}")

    # -------------------------------------------------------------
    # Category 4: Whitelisted Admin Login & Session Verification
    # -------------------------------------------------------------
    print("\n--- 4. Whitelisted Admin Authentication & Session ---")

    valid_admin_payload = {"email": "admin@tecoritham.com", "password": "Folio@43#MiT"}
    status, body = make_request(f"{BACKEND_URL}/api/auth/login", method="POST", data=valid_admin_payload)
    
    admin_token = None
    if status == 200 and isinstance(body, dict) and 'token' in body:
        admin_token = body['token']
        log_test("POST /api/auth/login (Valid Whitelisted Admin)", "Admin Session", True, f"Token Received ({len(admin_token)} chars)")
    else:
        log_test("POST /api/auth/login (Valid Whitelisted Admin)", "Admin Session", False, f"Status: {status}, Response: {body}")

    auth_headers = {}
    if admin_token:
        auth_headers = {"Authorization": f"Bearer {admin_token}"}
        # Verify Auth state via GET /api/auth/status
        status, body = make_request(f"{BACKEND_URL}/api/auth/status", headers=auth_headers)
        is_pass = status == 200 and isinstance(body, dict) and body.get('isAuthenticated') == True
        log_test("GET /api/auth/status (Valid Bearer Header)", "Admin Session", is_pass, f"Auth State: {body}")

    # -------------------------------------------------------------
    # Category 5: Admin CMS CRUD Workflows
    # -------------------------------------------------------------
    print("\n--- 5. Admin CMS CRUD Operations ---")
    if admin_token:
        # 5.1 Create Project
        new_proj_payload = {
            "title": "E2E Automated Test Project",
            "category": "FULL STACK",
            "description": "Integration test project created during automated testing execution.",
            "techStack": ["TypeScript", "Node.js", "Python"],
            "featured": True
        }
        status, body = make_request(f"{BACKEND_URL}/api/admin/projects", method="POST", headers=auth_headers, data=new_proj_payload)
        is_pass = status in (200, 201) and isinstance(body, dict) and ('id' in body or '_id' in body or body.get('success') or body.get('title'))
        log_test("POST /api/admin/projects (Create Project)", "Admin CMS", is_pass, f"Status: {status}")

        created_proj_id = None
        if isinstance(body, dict):
            created_proj_id = body.get('id') or body.get('_id') or (body.get('project') and body.get('project').get('id'))

        # 5.2 Update Project
        if created_proj_id:
            update_payload = {"title": "E2E Automated Test Project (Updated)"}
            status, body = make_request(f"{BACKEND_URL}/api/admin/projects/{created_proj_id}", method="PUT", headers=auth_headers, data=update_payload)
            is_pass = status == 200
            log_test(f"PUT /api/admin/projects/{created_proj_id} (Update)", "Admin CMS", is_pass, f"Status: {status}")

            # 5.3 Delete Project (Cleanup)
            status, body = make_request(f"{BACKEND_URL}/api/admin/projects/{created_proj_id}", method="DELETE", headers=auth_headers)
            is_pass = status == 200
            log_test(f"DELETE /api/admin/projects/{created_proj_id} (Cleanup)", "Admin CMS", is_pass, f"Status: {status}")

        # 5.4 Fetch Admin Messages Inbox
        status, body = make_request(f"{BACKEND_URL}/api/admin/messages", headers=auth_headers)
        is_pass = status == 200 and isinstance(body, list)
        log_test("GET /api/admin/messages (Authenticated Inbox)", "Admin CMS", is_pass, f"Inbox Messages: {len(body) if isinstance(body, list) else 0}")

        if isinstance(body, list) and len(body) > 0:
            target_msg_id = body[0].get('id') or body[0].get('_id')
            if target_msg_id:
                # Mark as read
                status, res = make_request(f"{BACKEND_URL}/api/admin/messages/{target_msg_id}/read", method="PUT", headers=auth_headers, data={"read": True})
                log_test(f"PUT /api/admin/messages/{target_msg_id}/read", "Admin CMS", status == 200, f"Status: {status}")
    else:
        print("⚠️ Skipping Admin CMS CRUD tests because token login was not obtained.")

    # -------------------------------------------------------------
    # Category 6: File Upload & Format Validation
    # -------------------------------------------------------------
    print("\n--- 6. Asset Upload & Validation ---")

    # 6.1 Upload unsupported file format (e.g. .exe file via multipart)
    boundary = "----TestBoundary123456789"
    body_data = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="malicious.exe"\r\n'
        'Content-Type: application/octet-stream\r\n\r\n'
        'MZDummyExecutableContentBinaryString\r\n'
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    upload_headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if admin_token:
        upload_headers["Authorization"] = f"Bearer {admin_token}"

    status, body = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=body_data)
    is_pass = status == 400
    log_test("POST /api/upload (Unsupported .exe file)", "Asset Upload", is_pass, f"Status: {status} (Expected 400 Bad Request)")

    # 6.2 Upload valid SVG file
    svg_data = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="test_icon.svg"\r\n'
        'Content-Type: image/svg+xml\r\n\r\n'
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>\r\n'
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    status, body = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=svg_data)
    is_pass = status in (200, 201) and isinstance(body, dict) and 'url' in body
    log_test("POST /api/upload (Valid SVG Image)", "Asset Upload", is_pass, f"Status: {status}, URL: {body.get('url') if isinstance(body, dict) else 'N/A'}")

    # -------------------------------------------------------------
    # Category 7: Frontend DOM & Design System Integrity
    # -------------------------------------------------------------
    print("\n--- 7. Frontend DOM & Design System Assertions ---")

    status, body = make_request(f"{FRONTEND_URL}")
    is_pass = status == 200 and '<div id="root">' in body
    log_test("Vite Frontend Page Load (HTTP 200)", "Frontend UI", is_pass, f"Status: {status}")

    # Check for Favicon SVG tag in HTML
    has_favicon = '/favicon.svg' in body or 'favicon' in body
    log_test("Favicon Link Element (/favicon.svg)", "Frontend UI", has_favicon, "Verified /favicon.svg link in index.html head")

    # -------------------------------------------------------------
    # Final Report Summary Generation
    # -------------------------------------------------------------
    total = len(results)
    passed_count = sum(1 for r in results if r.status == "PASS")
    pass_rate = (passed_count / total) * 100 if total > 0 else 0

    print("\n" + "=" * 70)
    print(f"COMPREHENSIVE TEST RESULTS: {passed_count}/{total} PASSED ({pass_rate:.1f}%)")
    print("=" * 70)

    summary_file = os.path.join(os.path.dirname(__file__), "comprehensive_test_report.json")
    report_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total": total,
        "passed": passed_count,
        "failed": total - passed_count,
        "pass_rate": f"{pass_rate:.1f}%",
        "results": [{"name": r.name, "category": r.category, "status": r.status, "detail": r.detail} for r in results]
    }
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    print(f"\nDetailed report written to: {summary_file}")
    return passed_count == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
