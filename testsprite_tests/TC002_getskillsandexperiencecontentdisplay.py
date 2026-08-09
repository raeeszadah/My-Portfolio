import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_getskillsandexperiencecontentdisplay():
    try:
        # Test GET /api/skills endpoint without authentication
        skills_response = requests.get(f"{BASE_URL}/api/skills", timeout=TIMEOUT)
        assert skills_response.status_code == 200, f"/api/skills responded with status {skills_response.status_code}"
        skills_data = skills_response.json()
        # Validate skills_data structure includes categorized skills
        assert isinstance(skills_data, (dict, list)), "Skills response is not a dictionary or list"
        if isinstance(skills_data, dict):
            assert "categories" in skills_data or "skills" in skills_data, "Expected keys for categorized skills missing"
            # Basic check on skills categories or skills list presence and type
            if "categories" in skills_data:
                assert isinstance(skills_data["categories"], list), "'categories' should be a list"
                # Each category should have skill items array
                for category in skills_data["categories"]:
                    assert "name" in category and isinstance(category["name"], str), "Category missing 'name' string"
                    assert "skills" in category and isinstance(category["skills"], list), "Category missing 'skills' list"
            elif "skills" in skills_data:
                # Flat skills list fallback
                assert isinstance(skills_data["skills"], list), "'skills' should be a list"
        else:
            # If list directly, check elements type
            for skill in skills_data:
                assert isinstance(skill, dict), "Each skill should be a dictionary if skills is a list"

        # Test GET /api/experience endpoint without authentication
        experience_response = requests.get(f"{BASE_URL}/api/experience", timeout=TIMEOUT)
        assert experience_response.status_code == 200, f"/api/experience responded with status {experience_response.status_code}"
        experience_data = experience_response.json()
        # Validate experience_data structure includes timeline entries
        assert isinstance(experience_data, list) or isinstance(experience_data, dict), "Experience response should be list or dict"
        if isinstance(experience_data, dict):
            # Expect keys like 'timeline' or 'entries'
            assert "timeline" in experience_data or "entries" in experience_data, "Expected keys for timeline entries missing"
            timeline_entries = experience_data.get("timeline", experience_data.get("entries"))
            assert isinstance(timeline_entries, list), "Timeline entries should be a list"
            for entry in timeline_entries:
                # Accept either 'title' or 'name' as valid string fields for timeline entry
                assert (("title" in entry and isinstance(entry["title"], str)) or
                        ("name" in entry and isinstance(entry["name"], str))), "Timeline entry missing 'title' or 'name' string"
                assert "date" in entry and (isinstance(entry["date"], str) or entry["date"] is None), "Timeline entry missing 'date' string or None"
        else:
            # If list, check at least one entry with required fields
            if len(experience_data) > 0:
                entry = experience_data[0]
                assert (("title" in entry and isinstance(entry["title"], str)) or
                        ("name" in entry and isinstance(entry["name"], str))), "Timeline entry missing 'title' or 'name' string"
                assert "date" in entry and (isinstance(entry["date"], str) or entry["date"] is None), "Timeline entry missing 'date' string or None"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError as e:
        assert False, f"Failed to parse JSON response: {e}"

test_getskillsandexperiencecontentdisplay()
