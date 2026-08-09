import requests
from requests.exceptions import RequestException
import io

BASE_URL = "http://localhost:5000"
UPLOAD_ENDPOINT = "/api/uploads"
TIMEOUT = 30

# Replace this with a valid JWT token for authentication in tests
VALID_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validtokenplaceholder"
INVALID_JWT = "Bearer invalid.jwt.token"

# In-memory file-like objects for testing
SUPPORTED_FILE_CONTENT = io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 1024)  # PNG header + padding
UNSUPPORTED_FILE_CONTENT = io.BytesIO(b"MZ" + b"\x00" * 1024)  # EXE header signature + padding
OVERSIZED_FILE_CONTENT = io.BytesIO(b"\xff\xd8\xff" + b"\x00" * (6 * 1024 * 1024))  # JPEG header + 6MB padding


def test_post_static_asset_uploads():
    headers = {"Authorization": VALID_JWT}
    url = BASE_URL + UPLOAD_ENDPOINT

    # 1. Test successful upload with valid JWT and supported file type
    try:
        SUPPORTED_FILE_CONTENT.seek(0)
        files = {"file": ("test_image.png", SUPPORTED_FILE_CONTENT, "image/png")}
        resp = requests.post(url, headers=headers, files=files, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        data = resp.json()
        assert "url" in data and isinstance(data["url"], str), \
            "Response JSON must contain 'url' string"
    except (RequestException, AssertionError) as e:
        raise AssertionError(f"Successful upload test failed: {e}")

    # 2. Test rejection of unsupported file type with valid JWT
    try:
        UNSUPPORTED_FILE_CONTENT.seek(0)
        files = {"file": ("test_file.exe", UNSUPPORTED_FILE_CONTENT, "application/x-msdownload")}
        resp = requests.post(url, headers=headers, files=files, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 Bad Request for unsupported file type, got {resp.status_code}"
        data = resp.json()
        assert "error" in data or "message" in data, "Error message expected in response JSON"
    except (RequestException, AssertionError) as e:
        raise AssertionError(f"Unsupported file type upload test failed: {e}")

    # 3. Test rejection of oversized file with valid JWT
    try:
        OVERSIZED_FILE_CONTENT.seek(0)
        files = {"file": ("large_file.jpg", OVERSIZED_FILE_CONTENT, "image/jpeg")}
        resp = requests.post(url, headers=headers, files=files, timeout=TIMEOUT)
        assert resp.status_code == 400, f"Expected 400 Bad Request for oversized file, got {resp.status_code}"
        data = resp.json()
        assert "error" in data or "message" in data, "Error message expected in response JSON"
    except (RequestException, AssertionError) as e:
        raise AssertionError(f"Oversized file upload test failed: {e}")

    # 4. Test unauthorized upload without JWT
    try:
        SUPPORTED_FILE_CONTENT.seek(0)
        files = {"file": ("test_image.png", SUPPORTED_FILE_CONTENT, "image/png")}
        resp = requests.post(url, files=files, timeout=TIMEOUT)  # no Authorization header
        assert resp.status_code == 401, f"Expected 401 Unauthorized without JWT, got {resp.status_code}"
    except (RequestException, AssertionError) as e:
        raise AssertionError(f"Unauthorized upload test failed: {e}")


test_post_static_asset_uploads()
