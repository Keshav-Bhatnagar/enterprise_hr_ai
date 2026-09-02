import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine, SessionLocal
from app.db.models import User
import bcrypt

# Setup Test DB
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    db = SessionLocal()
    # Create test admin
    password = b"admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt).decode('utf-8')
    admin_user = User(username="testadmin", hashed_password=hashed, role="admin")
    db.add(admin_user)
    db.commit()
    yield
    # Teardown
    db.query(User).filter(User.username == "testadmin").delete()
    db.commit()
    db.close()

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Enterprise HR AI API"}

def test_login(setup_db):
    response = client.post("/token", data={"username": "testadmin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"

def test_protected_hcm_route(setup_db):
    # First get token
    token_resp = client.post("/token", data={"username": "testadmin", "password": "admin123"})
    token = token_resp.json()["access_token"]
    
    # Try accessing protected route
    response = client.get("/hcm/demographics", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
