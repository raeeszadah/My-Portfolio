import requests

BASE_URL = "http://localhost:5000"
CONTACT_ENDPOINT = f"{BASE_URL}/api/contact"
TIMEOUT = 30

def test_post_contact_form_submission_validation():
    headers = {'Content-Type': 'application/json'}

    # Valid payload (expected to succeed)
    valid_payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "message": "This is a test message from API test."
    }
    try:
        response = requests.post(CONTACT_ENDPOINT, json=valid_payload, headers=headers, timeout=TIMEOUT)
        # Expecting 201 Created
        assert response.status_code == 201, f"Expected 201 for valid payload, got {response.status_code}"
        json_data = response.json()
        assert "message" in json_data and "success" in json_data.get("message", "").lower()
    except requests.RequestException as e:
        assert False, f"Request failed for valid payload: {e}"

    # Invalid payloads - missing required fields and invalid email format
    invalid_payloads = [
        {},  # empty payload
        {"name": "", "email": "", "message": ""},  # all blank
        {"name": "Test User", "email": "invalid-email", "message": "Hello"},  # invalid email format
        {"name": "Test User", "message": "Hello"},  # missing email
        {"email": "test.user@example.com", "message": "Hello"},  # missing name
        {"name": "Test User", "email": "test.user@example.com"}  # missing message
    ]
    for payload in invalid_payloads:
        try:
            resp = requests.post(CONTACT_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT)
            # Expecting 400 Bad Request for invalid payloads
            assert resp.status_code == 400, f"Expected 400 for invalid payload {payload}, got {resp.status_code}"
            resp_json = resp.json()
            # Validate the response has validation errors details
            # Accept 'errors', 'error' or 'message' with non-empty content
            has_errors = ('errors' in resp_json and resp_json['errors']) or ('error' in resp_json and resp_json['error']) or ('message' in resp_json and resp_json['message'])
            assert has_errors, "Expected non-empty 'errors', 'error' or 'message' in error response"
        except requests.RequestException as e:
            assert False, f"Request failed for invalid payload {payload}: {e}"

    # Simulate email service failure (Assuming a special payload triggers this in test environment)
    error_payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "message": "Trigger email failure"
    }
    try:
        resp = requests.post(CONTACT_ENDPOINT, json=error_payload, headers=headers, timeout=TIMEOUT)
        # Expecting 500 Internal Server Error due to email service failure
        assert resp.status_code == 500, f"Expected 500 for email service failure simulation, got {resp.status_code}"
        resp_json = resp.json()
        assert "error" in resp_json or "message" in resp_json, "Expected error message in response for email failure"
    except requests.RequestException as e:
        assert False, f"Request failed for email failure simulation payload: {e}"


test_post_contact_form_submission_validation()
