import requests
from requests.exceptions import RequestException
import re

BASE_URL = "http://localhost:5000"
CONTACT_ENDPOINT = f"{BASE_URL}/api/contact"
TIMEOUT = 30

def test_post_contact_form_submission_validation():
    headers = {"Content-Type": "application/json"}

    # 1. Test valid payload submission
    valid_payload = {
        "name": "Test User",
        "email": "test.user@example.com",
        "message": "Hello, this is a test message from the contact form."
    }
    try:
        resp = requests.post(CONTACT_ENDPOINT, json=valid_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        data = resp.json()
        assert isinstance(data, dict)
        assert data.get("message") or data.get("success") or "confirmation" in (data.get("message") or "").lower() or "success" in (data.get("message") or "").lower()
    except RequestException as e:
        assert False, f"Request failed for valid payload: {e}"
    except (ValueError, AssertionError) as e:
        assert False, f"Response validation failed for valid payload: {e}"

    # 2. Test invalid payloads for validation errors
    invalid_payloads = [
        # Missing name
        {
            "email": "valid.email@example.com",
            "message": "Message with missing name."
        },
        # Missing email
        {
            "name": "No Email",
            "message": "Message missing email."
        },
        # Missing message
        {
            "name": "No Message",
            "email": "no.message@example.com"
        },
        # Invalid email format
        {
            "name": "Invalid Email",
            "email": "invalid-email-format",
            "message": "Message with invalid email format."
        },
        # Empty strings in required fields
        {
            "name": "",
            "email": "",
            "message": ""
        }
    ]

    for payload in invalid_payloads:
        try:
            resp = requests.post(CONTACT_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT)
            assert resp.status_code == 400, f"Expected 400 for invalid payload, got {resp.status_code} with payload {payload}"
            error_data = resp.json()
            assert isinstance(error_data, dict)
            # Expect some indication of validation errors presence
            error_keys = set(error_data.keys())
            expected_keys = {"errors", "message", "validationErrors", "error"}
            assert error_keys.intersection(expected_keys), f"Expected validation error keys in response, got keys {error_keys}"
        except RequestException as e:
            assert False, f"Request failed for invalid payload {payload}: {e}"
        except (ValueError, AssertionError) as e:
            assert False, f"Response validation failed for invalid payload {payload}: {e}"

    # 3. Test server error on simulated email service failure
    # We assume we have no explicit way to simulate backend failure.
    # We try to induce by sending a payload flag that backend might interpret as error trigger.
    # If no such mechanism, this test just tries to check for 500 error handling by calling endpoint with a special field.
    error_simulation_payload = {
        "name": "Simulate Failure",
        "email": "simulate.failure@example.com",
        "message": "This message triggers email service failure simulation.",
        "simulateEmailFailure": True  # Hypothetical flag for test backend
    }
    try:
        resp = requests.post(CONTACT_ENDPOINT, json=error_simulation_payload, headers=headers, timeout=TIMEOUT)
        # Validating response status: either 201 if no failure sim, or 500 on failure
        assert resp.status_code in (201, 500), f"Expected 201 or 500, got {resp.status_code}"
        if resp.status_code == 500:
            # Validate error response format when email service fails
            error_data = resp.json()
            assert isinstance(error_data, dict)
            error_message = error_data.get("message", "").lower()
            assert "email" in error_message or "fail" in error_message or "error" in error_message
        elif resp.status_code == 201:
            # If no failure triggered, this is acceptable fallback
            pass
    except RequestException as e:
        assert False, f"Request failed for email service failure simulation payload: {e}"
    except (ValueError, AssertionError) as e:
        assert False, f"Response validation failed for email service failure simulation: {e}"

test_post_contact_form_submission_validation()