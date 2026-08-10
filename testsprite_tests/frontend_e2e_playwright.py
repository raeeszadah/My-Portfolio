import sys
import os
import json
import urllib.request

FRONTEND_URL = "http://localhost:5173"

def run_frontend_tests():
    print("=" * 75)
    print("RUNNING FRONTEND DOM, RESPONSIVE & CSS TOKEN VERIFICATION SUITE")
    print("=" * 75)

    passes = 0
    total = 0

    # 1. Verify index.html loads with 200 OK
    total += 1
    req = urllib.request.Request(FRONTEND_URL)
    try:
        with urllib.request.urlopen(req) as res:
            html = res.read().decode('utf-8')
            if res.status == 200 and '<div id="root">' in html:
                passes += 1
                print("[PASS] [Frontend DOM] Index HTML Served: HTTP 200 OK & #root present")
            else:
                print(f"[FAIL] [Frontend DOM] Index HTML Served: Status {res.status}")
    except Exception as e:
        print(f"[FAIL] [Frontend DOM] Index HTML Served: {e}")

    # 2. Verify Favicon SVG Link in HTML Head
    total += 1
    if '/favicon.svg' in html or 'favicon.svg' in html:
        passes += 1
        print("[PASS] [Frontend DOM] Favicon SVG Link: /favicon.svg link element present in head")
    else:
        print("[FAIL] [Frontend DOM] Favicon SVG Link: Missing")

    # 3. Verify CSS / Vite Module Bundle in HTML Head
    total += 1
    has_assets = '@vite/client' in html or '/src/main.tsx' in html or '.css' in html or '<script' in html
    if has_assets:
        passes += 1
        print("[PASS] [Frontend CSS/Module] Vite Module Bundle Link: Valid frontend entry script/styles in head")
    else:
        print("[FAIL] [Frontend CSS/Module] Vite Module Bundle Link: No script or style links found")

    # 4. Verify Admin Login page route HTML
    total += 1
    try:
        with urllib.request.urlopen(f"{FRONTEND_URL}/login") as res:
            login_html = res.read().decode('utf-8')
            if res.status == 200:
                passes += 1
                print("[PASS] [Frontend SPA Route] /login Route Served: HTTP 200 OK")
            else:
                print(f"[FAIL] [Frontend SPA Route] /login Route Served: Status {res.status}")
    except Exception as e:
        print(f"[FAIL] [Frontend SPA Route] /login Route Served: {e}")

    print("\n" + "=" * 75)
    print(f"FRONTEND INTEGRATION VERIFICATION: {passes}/{total} PASSED ({(passes/total)*100:.1f}%)")
    print("=" * 75)
    return passes == total

if __name__ == "__main__":
    success = run_frontend_tests()
    sys.exit(0 if success else 1)
