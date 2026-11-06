from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import EmployeeIntelligence, DataAccessAuditLog

client = TestClient(app)

def test_dpdp_role_based_masking():
    db = SessionLocal()
    # Ensure test target
    emp = db.query(EmployeeIntelligence).first()
    if not emp:
        emp = EmployeeIntelligence(
            GlobalID=88881,
            Name="Priya Sundaram",
            Age=29,
            Gender="Female",
            Department="Product",
            JobRole="Product Manager",
            MonthlySalary=120000.0,
            BankName="HDFC Bank",
            AccountNumber="987654321098",
            RoutingNumber="HDFC0001234",
            Attrition_Prob=0.45,
            Risk="MEDIUM"
        )
        db.add(emp)
        db.commit()
    target_id = emp.GlobalID
    db.close()

    # 1. Auditor view -> Fully anonymized
    r_auditor = client.get(f"/api/v1/compliance/employee/{target_id}?viewer_role=AUDITOR")
    assert r_auditor.status_code == 200
    auditor_data = r_auditor.json()
    assert auditor_data["_dpdp_mask_status"] == "FULLY_ANONYMIZED"
    assert auditor_data["AccountNumber"] == "•••• •••• ••••"
    assert "₹" in auditor_data["MonthlySalary"]  # Salary band string, not raw float
    assert auditor_data["BankName"] == "REDACTED"

    # 2. Manager view -> Names visible, financials masked
    r_mgr = client.get(f"/api/v1/compliance/employee/{target_id}?viewer_role=MANAGER")
    assert r_mgr.status_code == 200
    mgr_data = r_mgr.json()
    assert mgr_data["_dpdp_mask_status"] == "PARTIALLY_MASKED_FINANCIALS"
    assert "•••• ••••" in mgr_data["AccountNumber"]

    # 3. Admin view -> Unmasked
    r_admin = client.get(f"/api/v1/compliance/employee/{target_id}?viewer_role=HR_ADMIN")
    assert r_admin.status_code == 200
    admin_data = r_admin.json()
    assert admin_data["_dpdp_mask_status"] == "UNMASKED"


def test_dpdp_access_logs():
    response = client.get("/api/v1/compliance/access-logs?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "audit_logs" in data
    assert data["total"] > 0


def test_algorithmic_bias_audit():
    response = client.get("/api/v1/compliance/bias-audit")
    assert response.status_code == 200
    data = response.json()
    assert "gender_equity" in data
    assert "disparate_impact_ratio" in data["gender_equity"]
    assert "four_fifths_rule_status" in data["gender_equity"]
    assert "age_equity" in data


def test_retention_roi_simulation():
    db = SessionLocal()
    emp = db.query(EmployeeIntelligence).first()
    assert emp is not None
    target_id = emp.GlobalID
    db.close()

    response = client.post(
        f"/api/v1/retention/simulate-roi?global_id={target_id}&salary_hike_pct=15&overtime_reduction_hours=12&wlb_improvement=1.0"
    )
    assert response.status_code == 200
    data = response.json()
    assert "baseline_state" in data
    assert "simulated_state" in data
    assert "financial_roi" in data
    assert "turnover_cost_avoidance" in data["financial_roi"]
    assert "net_financial_gain" in data["financial_roi"]
    assert "roi_multiple" in data["financial_roi"]
    assert "executive_recommendation" in data["financial_roi"]


def test_high_risk_queue():
    response = client.get("/api/v1/retention/high-risk-queue?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "queue" in data

