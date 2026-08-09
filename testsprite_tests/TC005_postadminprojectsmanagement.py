import requests
import json

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Use valid admin credentials to obtain JWT token
admin_credentials = {
    "email": "admin@example.com",
    "password": "adminpassword"
}

def test_post_admin_projects_management():
    # Login to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    try:
        login_resp = requests.post(login_url, json=admin_credentials, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.text}"
        token = login_resp.json().get("token")
        assert token and isinstance(token, str), "JWT token missing or invalid from login response"
    except Exception as e:
        assert False, f"Exception during login: {e}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    project_payload_create = {
        "title": "Test Project",
        "description": "A project created for testing purposes.",
        "url": "https://example.com/test-project",
        "repository": "https://github.com/example/test-project",
        "tags": ["test", "api"],
        "featured": False
    }

    project_id = None

    try:
        # POST /api/admin/projects to create a new project
        post_url = f"{BASE_URL}/api/admin/projects"
        post_resp = requests.post(post_url, headers=headers, json=project_payload_create, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Project creation failed: {post_resp.status_code} {post_resp.text}"
        created_project = post_resp.json()
        project_id = created_project.get("id")
        assert project_id, "Created project ID missing"

        # Verify new project appears in public GET /api/projects
        get_public_projects_url = f"{BASE_URL}/api/projects"
        get_public_resp = requests.get(get_public_projects_url, timeout=TIMEOUT)
        assert get_public_resp.status_code == 200, f"Public projects GET failed: {get_public_resp.status_code} {get_public_resp.text}"
        public_projects = get_public_resp.json()
        assert any(p.get("id") == project_id for p in public_projects), "Created project not found in public projects list"

        # PUT /api/admin/projects/:id to update the project
        update_payload = {
            "title": "Updated Test Project",
            "description": "Updated description for the test project.",
            "featured": True
        }
        put_url = f"{BASE_URL}/api/admin/projects/{project_id}"
        put_resp = requests.put(put_url, headers=headers, json=update_payload, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"Project update failed: {put_resp.status_code} {put_resp.text}"
        updated_project = put_resp.json()
        assert updated_project.get("title") == update_payload["title"], "Project title not updated"
        assert updated_project.get("description") == update_payload["description"], "Project description not updated"
        assert updated_project.get("featured") == update_payload["featured"], "Project featured flag not updated"

        # Verify update reflects in public GET /api/projects
        get_public_resp_after_update = requests.get(get_public_projects_url, timeout=TIMEOUT)
        assert get_public_resp_after_update.status_code == 200, f"Public projects GET failed after update: {get_public_resp_after_update.status_code} {get_public_resp_after_update.text}"
        public_projects_after_update = get_public_resp_after_update.json()
        matching_project = next((p for p in public_projects_after_update if p.get("id") == project_id), None)
        assert matching_project, "Updated project not found in public projects list after update"
        assert matching_project.get("title") == update_payload["title"], "Public project title does not reflect update"
        assert matching_project.get("featured") == update_payload["featured"], "Public project featured flag does not reflect update"

        # DELETE /api/admin/projects/:id to delete the project
        delete_url = f"{BASE_URL}/api/admin/projects/{project_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 204, f"Project deletion failed: {delete_resp.status_code} {delete_resp.text}"

        # Verify project is removed from public GET /api/projects
        get_public_resp_after_delete = requests.get(get_public_projects_url, timeout=TIMEOUT)
        assert get_public_resp_after_delete.status_code == 200, f"Public projects GET failed after deletion: {get_public_resp_after_delete.status_code} {get_public_resp_after_delete.text}"
        public_projects_after_delete = get_public_resp_after_delete.json()
        assert all(p.get("id") != project_id for p in public_projects_after_delete), "Deleted project still found in public projects list"

        # After successful delete, set project_id to None to avoid try-finally delete
        project_id = None

    finally:
        # Cleanup if project still exists (in case delete failed)
        if project_id:
            try:
                cleanup_delete_url = f"{BASE_URL}/api/admin/projects/{project_id}"
                requests.delete(cleanup_delete_url, headers=headers, timeout=TIMEOUT)
            except Exception:
                pass

test_post_admin_projects_management()