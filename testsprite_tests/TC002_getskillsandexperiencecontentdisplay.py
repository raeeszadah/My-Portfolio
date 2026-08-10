import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_get_skills_and_experience_content_display():
    skills_url = f"{BASE_URL}/api/skills"
    experience_url = f"{BASE_URL}/api/experience"

    # Test GET /api/skills without authentication
    try:
        skills_response = requests.get(skills_url, timeout=TIMEOUT)
        skills_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {skills_url} failed: {e}"

    assert skills_response.status_code == 200, f"Expected status 200 from {skills_url}, got {skills_response.status_code}"
    try:
        skills_data = skills_response.json()
    except ValueError:
        assert False, "Response from /api/skills is not valid JSON"

    # Validate that skills data contains categorized skills
    # Assuming skills data is a list or dict with skill groups
    assert skills_data, "Skills data is empty"
    # Check if skills_data has at least one category/group or skill item
    # Acceptable structures can be list of dicts or dict with keys
    if isinstance(skills_data, dict):
        # Look for keys hinting categories or skill groups
        assert any(isinstance(v, (list, dict)) for v in skills_data.values()), "Skills data does not have categorized groups"
    elif isinstance(skills_data, list):
        assert all(isinstance(item, dict) for item in skills_data), "Skills items should be dicts"
    else:
        assert False, "Unexpected skills data structure"

    # Test GET /api/experience without authentication
    try:
        experience_response = requests.get(experience_url, timeout=TIMEOUT)
        experience_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {experience_url} failed: {e}"

    assert experience_response.status_code == 200, f"Expected status 200 from {experience_url}, got {experience_response.status_code}"
    try:
        experience_data = experience_response.json()
    except ValueError:
        assert False, "Response from /api/experience is not valid JSON"

    # Validate that experience data contains timeline entries
    assert experience_data, "Experience data is empty"
    # Assuming experience data is a list of timeline items (dicts)
    assert isinstance(experience_data, list), "Experience data should be a list"
    assert all(isinstance(item, dict) for item in experience_data), "Each timeline entry should be an object"

    # Optional checks for expected keys in experience items
    required_keys = {"title", "startDate", "endDate"}
    for item in experience_data:
        assert required_keys.intersection(item.keys()), f"Experience item missing expected keys {required_keys}"

test_get_skills_and_experience_content_display()