import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_postadminauthlogin():
    valid_credentials = {
        "email": "admin@example.com",
        "password": "correct_password"
    }
    invalid_credentials = {
        "email": "admin@example.com",
        "password": "wrong_password"
    }

    # Test valid login
    try:
        response_valid = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=valid_credentials,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed on valid login: {e}"
    
    assert response_valid.status_code == 200, f"Expected 200 OK for valid login, got {response_valid.status_code}"
    json_valid = response_valid.json()
    assert "token" in json_valid, "JWT token missing in response for valid login"
    assert isinstance(json_valid["token"], str) and len(json_valid["token"]) > 0, "JWT token is empty or not a string"

    # Test invalid login
    try:
        response_invalid = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_credentials,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed on invalid login: {e}"

    assert response_invalid.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {response_invalid.status_code}"
    json_invalid = response_invalid.json()
    # Usually an error message is expected on 401, check that it exists and is string
    assert "message" in json_invalid or "error" in json_invalid, "Error message missing in response for invalid login"

test_postadminauthlogin()