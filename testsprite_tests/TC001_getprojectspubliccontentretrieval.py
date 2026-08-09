import requests

def test_get_projects_public_content_retrieval():
    base_url = "http://localhost:5000"
    endpoint = "/api/projects"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json"
    }
    timeout = 30

    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), f"Expected response data to be a list, got {type(data)}"

    # Validate that each project has expected keys
    for project in data:
        assert isinstance(project, dict), f"Each project item should be a dict, got {type(project)}"
        required_keys = ["id", "title", "description"]
        for key in required_keys:
            assert key in project, f"Project missing required key: {key}"


test_get_projects_public_content_retrieval()
