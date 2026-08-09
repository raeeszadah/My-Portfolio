import requests

BASE_URL = "http://localhost:5000"
ADMIN_CONTACT_MESSAGES_URL = f"{BASE_URL}/api/admin/contact-messages"
AUTH_LOGIN_URL = f"{BASE_URL}/api/auth/login"
TIMEOUT = 30

# Admin credentials for authentication (should be set to valid test admin)
ADMIN_CREDENTIALS = {
    "email": "admin@example.com",
    "password": "adminpassword"
}

def get_jwt_token():
    try:
        resp = requests.post(AUTH_LOGIN_URL, json=ADMIN_CREDENTIALS, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("token")
        assert token, "JWT token not found in login response"
        return token
    except requests.RequestException as e:
        assert False, f"Admin login failed: {str(e)}"

def create_contact_message_for_test():
    # Create a new contact message via public /api/contact for PATCH testing
    # Use a valid contact form submission
    url = f"{BASE_URL}/api/contact"
    contact_payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "message": "This is a test contact message"
    }
    try:
        resp = requests.post(url, json=contact_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        # The created message ID might be returned in the response or must be fetched later
        # If not returned, list and find by unique content
        return data.get("id")
    except requests.RequestException as e:
        assert False, f"Failed to create contact message for test: {str(e)}"

def delete_contact_message(message_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        # No explicit DELETE route for contact-messages given in PRD,
        # so we skip deletion if none exists. Alternatively, skip cleanup.
        # If DELETE existed: requests.delete(f"{ADMIN_CONTACT_MESSAGES_URL}/{message_id}", headers=headers, timeout=TIMEOUT)
        pass
    except Exception:
        pass  # best effort cleanup

def test_get_and_patch_admin_contact_messages_management():
    # Get JWT token for auth
    token = get_jwt_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test GET /api/admin/contact-messages with valid JWT (should return 200 and a list)
    try:
        get_resp = requests.get(ADMIN_CONTACT_MESSAGES_URL, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Expected 200, got {get_resp.status_code}"
        messages = get_resp.json()
        # Expecting a list of messages (empty list is acceptable)
        assert isinstance(messages, list), "Expected list of contact messages"

    except requests.RequestException as e:
        assert False, f"GET admin contact-messages failed: {str(e)}"

    # 2. Setup: create a new contact message for PATCH testing
    # If message id is not available, create one and patch it
    message_id = None
    try:
        # Try to pick an existing message to patch, else create one
        if messages and isinstance(messages, list):
            message_id = messages[0].get("id")
        if not message_id:
            message_id = create_contact_message_for_test()
        assert message_id, "No contact message ID available for PATCH test"
    except AssertionError as e:
        assert False, str(e)

    try:
        # 3. Test PATCH /api/admin/contact-messages/:id with valid JWT and status update
        patch_payload = {"status": "read"}
        patch_resp = requests.patch(f"{ADMIN_CONTACT_MESSAGES_URL}/{message_id}", json=patch_payload, headers=headers, timeout=TIMEOUT)
        assert patch_resp.status_code == 200, f"Expected 200 on PATCH, got {patch_resp.status_code}"
        updated_message = patch_resp.json()
        assert updated_message.get("status") == "read", "Message status not updated to 'read'"
    except requests.RequestException as e:
        assert False, f"PATCH admin contact-message failed: {str(e)}"
    finally:
        # Clean up: optionally delete created contact message if it was newly created
        if message_id:
            try:
                delete_contact_message(message_id, token)
            except Exception:
                pass

    # 4. Test GET /api/admin/contact-messages without JWT or invalid JWT (expect 401/403)
    try:
        no_auth_resp = requests.get(ADMIN_CONTACT_MESSAGES_URL, timeout=TIMEOUT)
        assert no_auth_resp.status_code in (401, 403), f"Expected 401/403 without auth, got {no_auth_resp.status_code}"
    except requests.RequestException as e:
        assert False, f"GET admin contact-messages without auth failed: {str(e)}"

    # 5. Test PATCH /api/admin/contact-messages/:id without JWT or invalid JWT (expect 401/403)
    invalid_headers = {"Authorization": "Bearer invalidtoken"}
    try:
        patch_resp_unauth = requests.patch(f"{ADMIN_CONTACT_MESSAGES_URL}/{message_id}", json={"status": "resolved"}, timeout=TIMEOUT)
        assert patch_resp_unauth.status_code in (401, 403), f"Expected 401/403 on PATCH without auth, got {patch_resp_unauth.status_code}"
    except requests.RequestException as e:
        assert False, f"PATCH admin contact-message without auth failed: {str(e)}"

test_get_and_patch_admin_contact_messages_management()
