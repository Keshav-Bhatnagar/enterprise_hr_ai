import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, SessionLocal
from app.db.models import EmployeeIntelligence, WebhookEventLog, Notification

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_test_employee():
    """Ensure a test employee exists in the database for webhook testing."""
    db = SessionLocal()
    emp = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.GlobalID == 99999).first()
    if not emp:
        emp = EmployeeIntelligence(
            GlobalID=99999,
            Name="Test Engineering Lead",
            Age=32,
            Gender="Female",
            YearsAtCompany=4,
            Department="Engineering",
            JobRole="Software Engineer",
            MonthlySalary=85000.0,
            OvertimeHoursPerMonth=5.0,
            PerformanceRating=4,
            WorkLifeBalance=3.5,
            Attrition_Prob=0.18,
            Risk="LOW"
        )
        db.add(emp)
        db.commit()
    db.close()
    yield 99999
    # Clean up test records
    db = SessionLocal()
    db.query(WebhookEventLog).filter(WebhookEventLog.employee_id == 99999).delete()
    db.query(EmployeeIntelligence).filter(EmployeeIntelligence.GlobalID == 99999).delete()
    db.commit()
    db.close()

def test_webhook_health():
    response = client.get("/api/v1/webhooks/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "darwinbox" in data["supported_providers"]

def test_darwinbox_webhook_ingestion(setup_test_employee):
    emp_id = setup_test_employee
    payload = {
        "event": "employee.overtime_logged",
        "employee_id": emp_id,
        "payload": {
            "overtime_hours": 42.0,
            "work_life_balance": 1.5
        }
    }
    response = client.post("/api/v1/webhooks/darwinbox", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert data["employee_id"] == emp_id
    assert data["provider"] == "darwinbox"
    assert data["event_type"] == "OVERTIME_UPDATE"
    assert "new_probability" in data
    assert data["new_probability"] is not None

def test_webhook_idempotency(setup_test_employee):
    emp_id = setup_test_employee
    payload = {
        "event_id": "test_idem_evt_001",
        "provider": "generic",
        "event_type": "COMPENSATION_CHANGE",
        "employee_id": emp_id,
        "data": {
            "MonthlySalary": 95000.0
        }
    }
    # First submission -> PROCESSED
    r1 = client.post("/api/v1/webhooks/generic", json=payload)
    assert r1.status_code == 200
    assert r1.json()["status"] == "PROCESSED"

    # Second submission with SAME event_id -> DUPLICATE (Idempotent)
    r2 = client.post("/api/v1/webhooks/generic", json=payload)
    assert r2.status_code == 200
    assert r2.json()["status"] == "DUPLICATE"

def test_workday_webhook_ingestion(setup_test_employee):
    emp_id = setup_test_employee
    payload = {
        "topic": "worker/compensation",
        "worker_id": emp_id,
        "details": {
            "monthly_base_pay": 92000.0,
            "target_bonus_pct": 15.0
        }
    }
    response = client.post("/api/v1/webhooks/workday", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert data["provider"] == "workday"

def test_simulation_sandbox(setup_test_employee):
    emp_id = setup_test_employee
    response = client.post(
        f"/api/v1/webhooks/simulate?employee_id={emp_id}&event_type=OVERTIME_UPDATE&overtime_hours=55.0&work_life_balance=1.0"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert data["provider"] == "simulator"
    assert data["new_probability"] is not None

def test_webhook_history():
    response = client.get("/api/v1/webhooks/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "events" in data
    assert data["count"] > 0

def test_non_existent_employee_returns_404():
    payload = {
        "provider": "generic",
        "event_type": "COMPENSATION_CHANGE",
        "employee_id": 99999999,
        "data": {
            "MonthlySalary": 100000.0
        }
    }
    response = client.post("/api/v1/webhooks/generic", json=payload)
    assert response.status_code == 404

