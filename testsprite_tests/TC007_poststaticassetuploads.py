import requests
from io import BytesIO

BASE_URL = "http://localhost:5000"
UPLOAD_ENDPOINT = f"{BASE_URL}/api/uploads"
TIMEOUT = 30

# Replace this with a valid JWT token for authentication
VALID_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validpayload.signature"
INVALID_JWT = "invalid.jwt.token"

def test_poststaticassetuploads():
    headers_auth = {
        "Authorization": f"Bearer {VALID_JWT}"
    }
    headers_no_auth = {}

    # Prepare a small valid image file (PNG)
    valid_file_content = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
        b"\x00\x00\x00\nIDATx\xdacd\xf8\x0f\x00\x01\x01\x01\x00"
        b"\x18\xdd\x03\x18\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    # Unsupported file type content (e.g., .exe like signature)
    unsupported_file_content = b"MZP\x00\x02\x00\x00\x00"

    # Oversized file: about 6MB data (more than typical 5MB limit)
    oversized_file_content = b"a" * (6 * 1024 * 1024)  # 6MB of 'a'

    # --- Test 1: Successful upload with valid JWT and valid file ---
    files = {
        "file": ("test_image.png", BytesIO(valid_file_content), "image/png"),
    }
    try:
        resp = requests.post(UPLOAD_ENDPOINT, headers=headers_auth, files=files, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        json_resp = resp.json()
        assert "url" in json_resp, "Response JSON missing 'url' field"
        # The URL should be a non-empty string
        assert isinstance(json_resp["url"], str) and json_resp["url"].startswith("http"), "Invalid URL returned"
    except Exception as e:
        raise AssertionError(f"Valid file upload failed: {e}")

    # --- Test 2: Upload rejected for unsupported file type ---
    files = {
        "file": ("malware.exe", BytesIO(unsupported_file_content), "application/x-msdownload"),
    }
    try:
        resp = requests.post(UPLOAD_ENDPOINT, headers=headers_auth, files=files, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for unsupported file type, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Unsupported file type test failed: {e}")

    # --- Test 3: Upload rejected for oversized file ---
    files = {
        "file": ("oversized.txt", BytesIO(oversized_file_content), "text/plain"),
    }
    try:
        resp = requests.post(UPLOAD_ENDPOINT, headers=headers_auth, files=files, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 for oversized file, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Oversized file upload test failed: {e}")

    # --- Test 4: Upload rejected without authentication ---
    files = {
        "file": ("test_image.png", BytesIO(valid_file_content), "image/png"),
    }
    try:
        resp = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers_no_auth, timeout=TIMEOUT)
        assert resp.status_code == 401, f"Expected 401 unauthorized without token, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Unauthorized upload test failed: {e}")

    # --- Test 5: Upload rejected with invalid JWT ---
    files = {
        "file": ("test_image.png", BytesIO(valid_file_content), "image/png"),
    }
    headers_invalid_auth = {
        "Authorization": f"Bearer {INVALID_JWT}"
    }
    try:
        resp = requests.post(UPLOAD_ENDPOINT, headers=headers_invalid_auth, files=files, timeout=TIMEOUT)
        assert resp.status_code == 401 or resp.status_code == 403, f"Expected 401 or 403 for invalid JWT, got {resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Invalid JWT upload test failed: {e}")

test_poststaticassetuploads()