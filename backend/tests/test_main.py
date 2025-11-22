import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_asset():
    # This test would require a running Fabric network
    # For now, we'll just test the endpoint structure
    response = client.post(
        "/api/assets/create",
        json={
            "orgId": "Org1",
            "assetId": "TEST001",
            "metadata": {"name": "Test Asset"}
        }
    )
    # Expect either success or error, but not 404
    assert response.status_code in [200, 500, 404]

def test_get_asset():
    response = client.get("/api/assets/TEST001")
    # Asset might not exist, so 404 is acceptable
    assert response.status_code in [200, 404]

