import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Replace these admin credentials with valid ones for testing
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "strongpassword123"

def get_jwt_token(email, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        token = data.get("token") or data.get("accessToken")
        assert token, "JWT token missing in login response"
        return token
    except requests.RequestException as e:
        assert False, f"Admin login failed: {e}"

def test_getadmincontactmessagesmanagement():
    token = None
    created_message_id = None

    # Step 1: Submit a contact form message to have a message to PATCH
    contact_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a test contact message for TC006."
    }

    try:
        # Create a contact message first (public endpoint)
        resp_contact = requests.post(f"{BASE_URL}/api/contact", json=contact_payload, timeout=TIMEOUT)
        assert resp_contact.status_code == 201, f"Failed to create contact message, got {resp_contact.status_code}"

        # Step 2: Obtain JWT token via admin login
        token = get_jwt_token(ADMIN_EMAIL, ADMIN_PASSWORD)
        headers = {"Authorization": f"Bearer {token}"}

        # Step 3: GET /api/admin/contact-messages with valid JWT token
        resp_get = requests.get(f"{BASE_URL}/api/admin/contact-messages", headers=headers, timeout=TIMEOUT)
        assert resp_get.status_code == 200, f"GET contact-messages failed with status {resp_get.status_code}"
        messages = resp_get.json()
        assert isinstance(messages, list), "Expected a list of contact messages"

        # Find the created message by matching email and message content
        found_message = None
        for m in messages:
            if (
                m.get("email") == contact_payload["email"] and
                m.get("message") == contact_payload["message"] and
                m.get("name") == contact_payload["name"]
            ):
                found_message = m
                break

        assert found_message, "Created contact message not found in admin GET"
        created_message_id = found_message.get("id")
        assert created_message_id, "Found contact message missing 'id'"

        # Step 4: PATCH /api/admin/contact-messages/:id with valid JWT token to update status
        patch_payload = {"status": "resolved"}
        resp_patch = requests.patch(
            f"{BASE_URL}/api/admin/contact-messages/{created_message_id}",
            headers={**headers, "Content-Type": "application/json"},
            json=patch_payload,
            timeout=TIMEOUT,
        )
        assert resp_patch.status_code == 200, f"PATCH update failed with status {resp_patch.status_code}"
        updated_message = resp_patch.json()
        assert updated_message.get("status") == "resolved", "Status not updated to 'resolved'"

        # Step 5: Attempt GET /api/admin/contact-messages without JWT token (unauthorized)
        resp_get_unauth = requests.get(f"{BASE_URL}/api/admin/contact-messages", timeout=TIMEOUT)
        assert resp_get_unauth.status_code in (401, 403), "Expected 401 or 403 without auth on GET"

        # Step 6: Attempt PATCH /api/admin/contact-messages/:id without JWT token (unauthorized)
        resp_patch_unauth = requests.patch(
            f"{BASE_URL}/api/admin/contact-messages/{created_message_id}",
            json=patch_payload,
            timeout=TIMEOUT,
        )
        assert resp_patch_unauth.status_code in (401, 403), "Expected 401 or 403 without auth on PATCH"

    finally:
        # Cleanup: If API provides a DELETE for contact messages, attempt to delete.
        if token and created_message_id:
            try:
                headers = {"Authorization": f"Bearer {token}"}
                delete_url = f"{BASE_URL}/api/admin/contact-messages/{created_message_id}"
                del_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # 204 expected on success or 404 if already deleted or not allowed
                if del_resp.status_code not in (204, 404):
                    print(f"Warning: unexpected status {del_resp.status_code} on cleanup DELETE")
            except Exception:
                pass

test_getadmincontactmessagesmanagement()
