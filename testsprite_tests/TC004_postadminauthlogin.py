import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_post_admin_auth_login():
    # Valid admin credentials (replace with actual valid credentials if known)
    valid_credentials = {
        "email": "admin@example.com",
        "password": "correct_password"
    }

    # Invalid admin credentials
    invalid_credentials = {
        "email": "admin@example.com",
        "password": "wrong_password"
    }

    # Test valid login
    try:
        valid_response = requests.post(
            LOGIN_ENDPOINT,
            json=valid_credentials,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Valid login request failed: {e}"

    assert valid_response.status_code == 200, f"Expected 200 OK for valid login, got {valid_response.status_code}"
    try:
        valid_json = valid_response.json()
    except ValueError:
        assert False, "Response to valid login is not valid JSON"

    # Validate JWT token presence as a non-empty string in response (commonly a 'token' or 'jwt' field)
    token = valid_json.get("token") or valid_json.get("jwt") or valid_json.get("accessToken")
    assert token and isinstance(token, str) and len(token) > 10, "Valid login did not return a valid JWT token"

    # Test invalid login
    try:
        invalid_response = requests.post(
            LOGIN_ENDPOINT,
            json=invalid_credentials,
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Invalid login request failed: {e}"

    assert invalid_response.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {invalid_response.status_code}"

    try:
        invalid_json = invalid_response.json()
    except ValueError:
        # Some APIs may return empty body on 401
        invalid_json = {}

    # Optionally check for an error message or authentication error key presence
    error_message = invalid_json.get("message") or invalid_json.get("error")
    assert error_message or invalid_response.text, "Invalid login response missing error message or content"


test_post_admin_auth_login()