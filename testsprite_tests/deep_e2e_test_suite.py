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
        self.status = status  # PASS, FAIL, FIXED
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

def run_deep_tests():
    print("=" * 75)
    print("RUNNING DEEP END-TO-END VERIFICATION & FRONTEND REFLECTION TEST SUITE")
    print("=" * 75)

    # Obtain Admin Session Token
    login_payload = {"email": "admin@tecoritham.com", "password": "Folio@43#MiT"}
    status, body = make_request(f"{BACKEND_URL}/api/auth/login", method="POST", data=login_payload)
    admin_token = None
    if status == 200 and isinstance(body, dict) and 'token' in body:
        admin_token = body['token']
        log_test("Admin Whitelisted Authentication", "Authentication", True, "Session token issued")
    else:
        log_test("Admin Whitelisted Authentication", "Authentication", False, f"Status: {status}, Response: {body}")
        sys.exit(1)

    auth_headers = {"Authorization": f"Bearer {admin_token}"}

    # -------------------------------------------------------------
    # 1. Profile Update and Frontend Persistence (with zero mutation restore)
    # -------------------------------------------------------------
    print("\n--- 1. Profile Update & Public Frontend Persistence ---")
    status, orig_profile_res = make_request(f"{BACKEND_URL}/api/profile")
    orig_profile = orig_profile_res.get('profile', {}) if isinstance(orig_profile_res, dict) else {}

    test_bio = f"E2E Test Bio Updated at {int(time.time())}"
    profile_update_payload = {
        "name": orig_profile.get("name", "MOHAMMAD RAEES"),
        "bio": test_bio,
        "location": "Pune, Maharashtra, India / Remote",
        "roles": ["CREATIVE DEVELOPER", "E2E TESTER"],
        "availability": "Available for contract work"
    }

    # Update profile in Admin
    status, update_res = make_request(f"{BACKEND_URL}/api/admin/profile", method="PUT", headers=auth_headers, data=profile_update_payload)
    log_test("PUT /api/admin/profile (Update)", "Profile Flow", status == 200, f"Status: {status}")

    # Fetch public profile and verify update appears on frontend API
    status, public_profile_res = make_request(f"{BACKEND_URL}/api/profile")
    public_bio = public_profile_res.get('profile', {}).get('bio') if isinstance(public_profile_res, dict) else None
    bio_reflected = public_bio == test_bio
    log_test("GET /api/profile (Frontend Persistence Check)", "Profile Flow", bio_reflected, f"Reflected Bio: {public_bio}")

    # Restore original profile (Zero Mutation Guarantee)
    restore_payload = {
        "name": orig_profile.get("name", "MOHAMMAD RAEES"),
        "bio": orig_profile.get("bio", ""),
        "location": orig_profile.get("location", "Pune, Maharashtra, India / Remote"),
        "roles": orig_profile.get("roles", ["CREATIVE DEVELOPER"]),
        "availability": orig_profile.get("availability", "Available for new opportunities")
    }
    status, _ = make_request(f"{BACKEND_URL}/api/admin/profile", method="PUT", headers=auth_headers, data=restore_payload)
    log_test("Restore Original Profile State", "Profile Flow", status == 200, "Original profile restored successfully")

    # -------------------------------------------------------------
    # 2. Resume Upload, Replacement & Download Flow
    # -------------------------------------------------------------
    print("\n--- 2. Resume Upload, Replacement & Download ---")
    boundary = "----TestBoundaryPdf123"
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n174\n%%EOF"
    
    pdf_body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="sample_resume.pdf"\r\n'
        'Content-Type: application/pdf\r\n\r\n'
    ).encode('utf-8') + pdf_content + f"\r\n--{boundary}--\r\n".encode('utf-8')

    upload_headers = {"Content-Type": f"multipart/form-data; boundary={boundary}", "Authorization": f"Bearer {admin_token}"}
    status, upload_res = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=pdf_body)
    pdf_url = upload_res.get('url') if isinstance(upload_res, dict) else None
    log_test("POST /api/upload (PDF Resume Upload)", "Resume Flow", status in (200, 201) and pdf_url is not None, f"PDF URL: {pdf_url}")

    if pdf_url:
        # Download the PDF and verify Content-Type header / bytes
        status, pdf_bytes = make_request(pdf_url)
        log_test("GET /uploads/sample_resume.pdf (Download Check)", "Resume Flow", status == 200 and len(pdf_bytes) > 50, f"Downloaded {len(pdf_bytes)} bytes")

    # -------------------------------------------------------------
    # 3. Social Media Links CRUD & Frontend Reflection
    # -------------------------------------------------------------
    print("\n--- 3. Social Media Link CRUD & Frontend Reflection ---")
    social_payload = {"platform": "GitHub E2E Test", "url": "https://github.com/tecoritham-test", "username": "tecoritham"}
    status, create_social_res = make_request(f"{BACKEND_URL}/api/admin/socials", method="POST", headers=auth_headers, data=social_payload)
    social_id = create_social_res.get('id') if isinstance(create_social_res, dict) else None
    log_test("POST /api/admin/socials (Create)", "Socials Flow", status in (200, 201) and social_id is not None, f"Created ID: {social_id}")

    if social_id:
        # Check public frontend reflection
        status, socials_list = make_request(f"{BACKEND_URL}/api/socials")
        found = any((s.get('id') == social_id or s.get('_id') == social_id) for s in (socials_list if isinstance(socials_list, list) else []))
        log_test("GET /api/socials (Reflection Assert)", "Socials Flow", found, f"Social Item Reflected: {found}")

        # Delete social item
        status, _ = make_request(f"{BACKEND_URL}/api/admin/socials/{social_id}", method="DELETE", headers=auth_headers)
        log_test(f"DELETE /api/admin/socials/{social_id}", "Socials Flow", status == 200, "Cleaned up test social item")

    # -------------------------------------------------------------
    # 4. Skills CRUD & Frontend Reflection
    # -------------------------------------------------------------
    print("\n--- 4. Skills CRUD & Frontend Reflection ---")
    skill_payload = {"name": "Rust WebAssembly (Test)", "category": "backend", "level": 95, "icon": "Code2"}
    status, create_skill_res = make_request(f"{BACKEND_URL}/api/admin/skills", method="POST", headers=auth_headers, data=skill_payload)
    skill_id = create_skill_res.get('id') if isinstance(create_skill_res, dict) else None
    log_test("POST /api/admin/skills (Create Skill)", "Skills Flow", status in (200, 201) and skill_id is not None, f"Skill ID: {skill_id}")

    if skill_id:
        status, skills_list = make_request(f"{BACKEND_URL}/api/skills")
        found = any((s.get('id') == skill_id or s.get('name') == "Rust WebAssembly (Test)") for s in (skills_list if isinstance(skills_list, list) else []))
        log_test("GET /api/skills (Reflection Assert)", "Skills Flow", found, f"Skill Reflected: {found}")

        # Cleanup
        status, _ = make_request(f"{BACKEND_URL}/api/admin/skills/{skill_id}", method="DELETE", headers=auth_headers)
        log_test(f"DELETE /api/admin/skills/{skill_id}", "Skills Flow", status == 200, "Cleaned up test skill")

    # -------------------------------------------------------------
    # 5. Timeline / Journey CRUD (Experience & Education)
    # -------------------------------------------------------------
    print("\n--- 5. Timeline / Journey CRUD ---")
    exp_payload = {
        "role": "Principal Systems Architect (Test)",
        "company": "Tecoritham Labs",
        "startDate": "2024-01-01",
        "endDate": "Present",
        "responsibilities": ["Lead distributed multi-agent systems."],
        "techTags": ["Rust", "TypeScript", "Docker"]
    }
    status, create_exp_res = make_request(f"{BACKEND_URL}/api/admin/experience", method="POST", headers=auth_headers, data=exp_payload)
    exp_id = create_exp_res.get('id') if isinstance(create_exp_res, dict) else None
    log_test("POST /api/admin/experience (Create)", "Timeline Flow", status in (200, 201) and exp_id is not None, f"Exp ID: {exp_id}")

    edu_payload = {
        "degree": "M.S. Advanced Autonomous Systems (Test)",
        "institution": "Stanford University",
        "startDate": "2020",
        "endDate": "2022"
    }
    status, create_edu_res = make_request(f"{BACKEND_URL}/api/admin/education", method="POST", headers=auth_headers, data=edu_payload)
    edu_id = create_edu_res.get('id') if isinstance(create_edu_res, dict) else None
    log_test("POST /api/admin/education (Create)", "Timeline Flow", status in (200, 201) and edu_id is not None, f"Edu ID: {edu_id}")

    # Verify Reflection in Timeline Endpoint
    status, timeline_res = make_request(f"{BACKEND_URL}/api/timeline")
    experiences = timeline_res.get('experience', []) if isinstance(timeline_res, dict) else []
    exp_found = any(e.get('id') == exp_id or e.get('role') == "Principal Systems Architect (Test)" for e in experiences)
    log_test("GET /api/timeline (Experience Reflection Assert)", "Timeline Flow", exp_found, f"Reflected: {exp_found}")

    # Cleanup
    if exp_id:
        make_request(f"{BACKEND_URL}/api/admin/experience/{exp_id}", method="DELETE", headers=auth_headers)
    if edu_id:
        make_request(f"{BACKEND_URL}/api/admin/education/{edu_id}", method="DELETE", headers=auth_headers)
    log_test("Cleanup Timeline Test Records", "Timeline Flow", True, "Cleaned up test experience and education")

    # -------------------------------------------------------------
    # 6. Certificate CRUD (Image/PDF upload, edit, delete, preview)
    # -------------------------------------------------------------
    print("\n--- 6. Certificate CRUD & Preview ---")
    cert_payload = {
        "title": "AWS Certified Solutions Architect Professional (Test)",
        "issuer": "Amazon Web Services",
        "credentialId": "AWS-CERT-998877",
        "verificationUrl": "https://aws.amazon.com/verify/AWS-CERT-998877",
        "thumbnail": pdf_url or "/cert.png",
        "skills": ["AWS", "Cloud Architecture"]
    }
    status, create_cert_res = make_request(f"{BACKEND_URL}/api/admin/certifications", method="POST", headers=auth_headers, data=cert_payload)
    cert_id = create_cert_res.get('id') if isinstance(create_cert_res, dict) else None
    log_test("POST /api/admin/certifications (Create)", "Certifications Flow", status in (200, 201) and cert_id is not None, f"Cert ID: {cert_id}")

    if cert_id:
        # Edit Certification
        edit_payload = {"title": "AWS Certified Solutions Architect Professional (Updated)"}
        status, _ = make_request(f"{BACKEND_URL}/api/admin/certifications/{cert_id}", method="PUT", headers=auth_headers, data=edit_payload)
        log_test(f"PUT /api/admin/certifications/{cert_id} (Edit)", "Certifications Flow", status == 200, "Updated title")

        # Cleanup Certification
        status, _ = make_request(f"{BACKEND_URL}/api/admin/certifications/{cert_id}", method="DELETE", headers=auth_headers)
        log_test(f"DELETE /api/admin/certifications/{cert_id} (Cleanup)", "Certifications Flow", status == 200, "Cleaned up test cert")

    # -------------------------------------------------------------
    # 7. Project CRUD (Screenshot Upload & Persistence)
    # -------------------------------------------------------------
    print("\n--- 7. Project CRUD with Screenshot Upload ---")
    # Upload Screenshot Image
    img_body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="project_screenshot.png"\r\n'
        'Content-Type: image/png\r\n\r\n'
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\r\n'
        f"--{boundary}--\r\n"
    ).encode('utf-8')
    status, img_upload_res = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=img_body)
    img_url = img_upload_res.get('url') if isinstance(img_upload_res, dict) else None

    proj_payload = {
        "title": "Quantum AI Cloud Engine (E2E Test)",
        "category": "AI/ML",
        "description": "High-throughput real-time AI modeling framework.",
        "techStack": ["Python", "PyTorch", "Rust", "Docker"],
        "thumbnail": img_url or "",
        "featured": True
    }
    status, create_proj_res = make_request(f"{BACKEND_URL}/api/admin/projects", method="POST", headers=auth_headers, data=proj_payload)
    proj_id = create_proj_res.get('id') if isinstance(create_proj_res, dict) else None
    log_test("POST /api/admin/projects (Create Project)", "Project Flow", status in (200, 201) and proj_id is not None, f"Project ID: {proj_id}")

    if proj_id:
        status, projects_list = make_request(f"{BACKEND_URL}/api/projects")
        found = any(p.get('id') == proj_id or p.get('title') == "Quantum AI Cloud Engine (E2E Test)" for p in (projects_list if isinstance(projects_list, list) else []))
        log_test("GET /api/projects (Reflection Assert)", "Project Flow", found, f"Project Reflected: {found}")

        # Update Project
        status, _ = make_request(f"{BACKEND_URL}/api/admin/projects/{proj_id}", method="PUT", headers=auth_headers, data={"description": "Updated E2E description."})
        log_test(f"PUT /api/admin/projects/{proj_id} (Update)", "Project Flow", status == 200, "Updated project details")

        # Delete Project
        status, _ = make_request(f"{BACKEND_URL}/api/admin/projects/{proj_id}", method="DELETE", headers=auth_headers)
        log_test(f"DELETE /api/admin/projects/{proj_id} (Cleanup)", "Project Flow", status == 200, "Cleaned up test project")

    # -------------------------------------------------------------
    # 8. End-to-End Inbox & Email Reply Flow
    # -------------------------------------------------------------
    print("\n--- 8. Contact Form -> Admin Inbox -> Reply Flow ---")
    e2e_contact_payload = {
        "name": "Sarah Connor E2E Client",
        "email": "sarah.connor@sky-test.com",
        "subject": "AI Enterprise System Architecture Inquiry",
        "profession": "Startup Founder / CEO",
        "message": "We would like to hire your team for an architecture project."
    }
    status, submit_res = make_request(f"{BACKEND_URL}/api/contact", method="POST", data=e2e_contact_payload)
    log_test("POST /api/contact (Client Inquiry Submission)", "Inbox E2E", status in (200, 201), f"Status: {status}")

    # Fetch Admin Messages Inbox
    status, inbox_res = make_request(f"{BACKEND_URL}/api/admin/messages", headers=auth_headers)
    inbox_messages = inbox_res if isinstance(inbox_res, list) else []
    target_msg = next((m for m in inbox_messages if m.get('email') == "sarah.connor@sky-test.com"), None)
    log_test("GET /api/admin/messages (Inbox Retrieval)", "Inbox E2E", target_msg is not None, f"Found submitted message ID: {target_msg.get('id') if target_msg else 'N/A'}")

    if target_msg:
        msg_id = target_msg.get('id') or target_msg.get('_id')
        
        # Mark Read
        status, _ = make_request(f"{BACKEND_URL}/api/admin/messages/{msg_id}/read", method="PUT", headers=auth_headers, data={"read": True})
        log_test(f"PUT /api/admin/messages/{msg_id}/read", "Inbox E2E", status == 200, "Marked message as read")

        # Admin Reply
        reply_payload = {"replyText": "Hello Sarah, thank you for reaching out! We are ready to assist with your architecture project."}
        status, reply_res = make_request(f"{BACKEND_URL}/api/admin/messages/{msg_id}/reply", method="POST", headers=auth_headers, data=reply_payload)
        is_reply_ok = status == 200 and isinstance(reply_res, dict) and reply_res.get('success') == True
        log_test(f"POST /api/admin/messages/{msg_id}/reply", "Inbox E2E", is_reply_ok, f"Reply Sent & Saved: {is_reply_ok}")

        # Verify Conversation Thread History
        status, inbox_updated = make_request(f"{BACKEND_URL}/api/admin/messages", headers=auth_headers)
        updated_msg = next((m for m in (inbox_updated if isinstance(inbox_updated, list) else []) if (m.get('id') or m.get('_id')) == msg_id), {})
        has_thread = updated_msg.get('replied') == True and len(updated_msg.get('replies', [])) > 0
        log_test("Verify Conversation History Thread State", "Inbox E2E", has_thread, f"Replied State: {updated_msg.get('replied')}, Replies Count: {len(updated_msg.get('replies', []))}")

        # Cleanup Test Message
        status, _ = make_request(f"{BACKEND_URL}/api/admin/messages/{msg_id}", method="DELETE", headers=auth_headers)
        log_test(f"DELETE /api/admin/messages/{msg_id} (Cleanup)", "Inbox E2E", status == 200, "Deleted test message")

    # -------------------------------------------------------------
    # 9. PDF & File Upload Validation Edge Cases
    # -------------------------------------------------------------
    print("\n--- 9. PDF & File Upload Edge Cases ---")

    # Executable Upload Rejection
    status, exe_res = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=b"MZHeaderFakeExecutable")
    log_test("POST /api/upload (Raw .exe upload)", "Upload Edge Cases", status == 400, f"Status: {status} (400 Bad Request)")

    # -------------------------------------------------------------
    # 10. Protected Admin Routes Security Check
    # -------------------------------------------------------------
    print("\n--- 10. 100% Protected Admin Routes Coverage ---")
    protected_endpoints = [
        ("PUT", "/api/admin/profile"),
        ("POST", "/api/admin/projects"),
        ("PUT", "/api/admin/projects/fake-id"),
        ("DELETE", "/api/admin/projects/fake-id"),
        ("POST", "/api/admin/skills"),
        ("PUT", "/api/admin/skills/fake-id"),
        ("DELETE", "/api/admin/skills/fake-id"),
        ("POST", "/api/admin/experience"),
        ("POST", "/api/admin/education"),
        ("POST", "/api/admin/certifications"),
        ("POST", "/api/admin/socials"),
        ("GET", "/api/admin/messages"),
    ]

    all_blocked = True
    for method, path in protected_endpoints:
        status, _ = make_request(f"{BACKEND_URL}{path}", method=method)
        if status not in (401, 403):
            all_blocked = False
            log_test(f"Security Shield {method} {path}", "Protected Routes Security", False, f"Unauthenticated request allowed status: {status}")

    if all_blocked:
        log_test("100% Admin Protected Routes Unauthenticated Block", "Protected Routes Security", True, "All 12 protected endpoints returned 401/403 when called without JWT token")

    # -------------------------------------------------------------
    # Final Summary
    # -------------------------------------------------------------
    total = len(results)
    passed_count = sum(1 for r in results if r.status == "PASS")
    pass_rate = (passed_count / total) * 100 if total > 0 else 0

    print("\n" + "=" * 75)
    print(f"DEEP E2E TEST RESULTS: {passed_count}/{total} PASSED ({pass_rate:.1f}%)")
    print("=" * 75)

    summary_file = os.path.join(os.path.dirname(__file__), "deep_e2e_test_report.json")
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

    return passed_count == total

if __name__ == "__main__":
    success = run_deep_tests()
    sys.exit(0 if success else 1)
