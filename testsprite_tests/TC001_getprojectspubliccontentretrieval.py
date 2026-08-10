import requests

BASE_URL = "http://localhost:5000"
PROJECTS_ENDPOINT = "/api/projects"
TIMEOUT = 30

def test_get_projects_public_content_retrieval():
    try:
        response = requests.get(f"{BASE_URL}{PROJECTS_ENDPOINT}", timeout=TIMEOUT)
        # Assert status code 200
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"

        # Assert response is JSON and a list
        projects = response.json()
        assert isinstance(projects, list), "Expected response to be a list of projects"

        # Validate each project has expected keys
        for project in projects:
            assert isinstance(project, dict), "Each project should be a dict"
            # Check minimal expected fields typical for a project card
            assert "id" in project, "Project missing 'id'"
            assert "title" in project, "Project missing 'title'"
            assert "description" in project, "Project missing 'description'"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_projects_public_content_retrieval()