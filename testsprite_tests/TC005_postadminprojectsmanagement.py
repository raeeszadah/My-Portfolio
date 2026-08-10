import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Use valid admin credentials here; replace with actual valid credentials
ADMIN_CREDENTIALS = {
    "email": "admin@example.com",
    "password": "StrongPassword123!"
}

def test_postadminprojectsmanagement():
    # Authenticate and get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_resp = requests.post(login_url, json=ADMIN_CREDENTIALS, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 1: Create a new project via POST /api/admin/projects
    create_url = f"{BASE_URL}/api/admin/projects"
    new_project_data = {
        "title": "Test Project API",
        "description": "Project created for API test case TC005.",
        "url": "https://example.com/test-project",
        "repository": "https://github.com/test/test-project",
        "tags": ["api", "test"]
    }
    create_resp = requests.post(create_url, json=new_project_data, headers=headers, timeout=TIMEOUT)
    assert create_resp.status_code == 201, f"Project creation failed: {create_resp.text}"
    created_project = create_resp.json()
    project_id = created_project.get("id")
    assert project_id, "Created project id not returned"

    try:
        # Validate project appears in public GET /api/projects
        public_projects_url = f"{BASE_URL}/api/projects"
        public_resp = requests.get(public_projects_url, timeout=TIMEOUT)
        assert public_resp.status_code == 200, f"Public projects retrieval failed: {public_resp.text}"
        projects_list = public_resp.json()
        assert any(p.get("id") == project_id for p in projects_list), "Created project not found in public projects"

        # Step 2: Update the project via PUT /api/admin/projects/:id
        update_url = f"{BASE_URL}/api/admin/projects/{project_id}"
        updated_data = {
            "title": "Test Project API Updated",
            "description": "Updated description via API test case TC005.",
            "url": "https://example.com/test-project-updated",
            "repository": "https://github.com/test/test-project-updated",
            "tags": ["api", "test", "updated"]
        }
        update_resp = requests.put(update_url, json=updated_data, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Project update failed: {update_resp.text}"
        updated_project = update_resp.json()
        assert updated_project.get("title") == updated_data["title"], "Project title not updated"
        assert updated_project.get("description") == updated_data["description"], "Project description not updated"
        assert updated_project.get("url") == updated_data["url"], "Project url not updated"
        assert updated_project.get("repository") == updated_data["repository"], "Project repository not updated"
        assert set(updated_project.get("tags", [])) == set(updated_data["tags"]), "Project tags not updated"

        # Confirm updated project appears in public GET /api/projects
        public_resp_after_update = requests.get(public_projects_url, timeout=TIMEOUT)
        assert public_resp_after_update.status_code == 200, f"Public projects retrieval failed after update: {public_resp_after_update.text}"
        projects_list_after_update = public_resp_after_update.json()
        found_updated = next((p for p in projects_list_after_update if p.get("id") == project_id), None)
        assert found_updated, "Updated project not found in public projects"
        assert found_updated.get("title") == updated_data["title"], "Updated project title mismatch on public endpoint"

    finally:
        # Step 3: Delete the project via DELETE /api/admin/projects/:id
        delete_url = f"{BASE_URL}/api/admin/projects/{project_id}"
        delete_resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 204, f"Project deletion failed: {delete_resp.text}"

        # Confirm project removed from public GET /api/projects
        public_resp_after_delete = requests.get(public_projects_url, timeout=TIMEOUT)
        assert public_resp_after_delete.status_code == 200, f"Public projects retrieval failed after deletion: {public_resp_after_delete.text}"
        projects_list_after_delete = public_resp_after_delete.json()
        assert not any(p.get("id") == project_id for p in projects_list_after_delete), "Deleted project still found in public projects"

test_postadminprojectsmanagement()