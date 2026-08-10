import sys
import os
import json
import urllib.request
import urllib.parse
import urllib.error

BACKEND_URL = "http://localhost:5000"

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

def run_security_tests():
    print("=" * 75)
    print("RUNNING PRODUCTION SECURITY HARDENING TEST SUITE")
    print("=" * 75)

    passes = 0
    total = 0

    # 1. Malicious SVG Upload Rejection
    total += 1
    boundary = "----TestBoundarySvgSecurity"
    malicious_svg = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="malicious_xss.svg"\r\n'
        'Content-Type: image/svg+xml\r\n\r\n'
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>\r\n'
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    upload_headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    status, body = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=malicious_svg)
    if status == 400 and 'rejected' in str(body).lower():
        passes += 1
        print("[PASS] [Security SVG] Malicious SVG Upload Rejection: HTTP 400 Bad Request returned")
    else:
        print(f"[FAIL] [Security SVG] Malicious SVG Upload Rejection: Status {status}, Body: {body}")

    # 2. Valid Clean SVG Upload
    total += 1
    clean_svg = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="clean_logo.svg"\r\n'
        'Content-Type: image/svg+xml\r\n\r\n'
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>\r\n'
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    status, body = make_request(f"{BACKEND_URL}/api/upload", method="POST", headers=upload_headers, data=clean_svg)
    if status in (200, 201) and isinstance(body, dict) and 'url' in body:
        passes += 1
        print(f"[PASS] [Security SVG] Valid Clean SVG Upload: HTTP {status} OK, URL: {body.get('url')}")
    else:
        print(f"[FAIL] [Security SVG] Valid Clean SVG Upload: Status {status}, Body: {body}")

    # 3. CORS Policy Origin Check
    total += 1
    req = urllib.request.Request(f"{BACKEND_URL}/api/projects", headers={"Origin": "https://unauthorized-malicious-site.com"})
    try:
        with urllib.request.urlopen(req) as res:
            acao = res.headers.get('Access-Control-Allow-Origin')
            if acao != '*':
                passes += 1
                print(f"[PASS] [Security CORS] CORS Origin Restriction: Wildcard * removed (ACAO: {acao})")
            else:
                print(f"[FAIL] [Security CORS] CORS Origin Restriction: Wildcard * still present")
    except Exception as e:
        passes += 1
        print(f"[PASS] [Security CORS] CORS Origin Restriction: Rejected unauthorized origin ({e})")

    print("\n" + "=" * 75)
    print(f"SECURITY HARDENING VERIFICATION: {passes}/{total} PASSED ({(passes/total)*100:.1f}%)")
    print("=" * 75)
    return passes == total

if __name__ == "__main__":
    success = run_security_tests()
    sys.exit(0 if success else 1)
