from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import EmployeeIntelligence, DataAccessAuditLog
from app.services.compliance_service import anonymize_employee_profile, record_data_access
from app.services.bias_audit import generate_algorithmic_bias_audit

router = APIRouter(prefix="/api/v1/compliance", tags=["DPDP & Algorithmic Compliance"])

@router.get("/bias-audit")
def get_algorithmic_bias_audit_report(db: Session = Depends(get_db)):
    """
    Generate independent Algorithmic Bias & Fairness Audit report.
    Validates Disparate Impact Ratio (DIR) across Gender and Age under Indian DPDP Act 2023.
    """
    return generate_algorithmic_bias_audit(db)


@router.get("/employee/{global_id}")
def get_compliant_employee_profile(
    global_id: int,
    viewer_role: str = Query("AUDITOR", description="Caller role: HR_ADMIN, MANAGER, AUDITOR"),
    viewer_username: str = Query("auditor_system", description="Caller identity"),
    db: Session = Depends(get_db)
):
    """
    Fetch an employee profile protected with DPDP Act 2023 Dynamic Data Masking.
    Masks PII, financial details, and salary bands based on viewer authorization,
    and logs an immutable access audit entry.
    """
    emp = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.GlobalID == global_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    raw_data = {
        "GlobalID": emp.GlobalID,
        "Name": emp.Name,
        "Age": emp.Age,
        "Gender": emp.Gender,
        "Department": emp.Department,
        "JobRole": emp.JobRole,
        "YearsAtCompany": emp.YearsAtCompany,
        "MonthlySalary": emp.MonthlySalary,
        "BankName": emp.BankName,
        "AccountNumber": emp.AccountNumber,
        "RoutingNumber": emp.RoutingNumber,
        "Attrition_Prob": emp.Attrition_Prob,
        "Risk": emp.Risk,
        "WorkLifeBalance": emp.WorkLifeBalance,
        "PerformanceRating": emp.PerformanceRating
    }

    masked_data = anonymize_employee_profile(raw_data, role=viewer_role)

    # Record DPDP audit trail
    record_data_access(
        db=db,
        accessor_user=viewer_username,
        accessor_role=viewer_role,
        target_employee_id=global_id,
        access_type="READ_PROFILE",
        fields_exposed=masked_data.get("_dpdp_mask_status", "MASKED")
    )

    return masked_data


@router.get("/access-logs")
def get_dpdp_access_logs(
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve access audit trail required by DPDP Data Protection Officer (DPO).
    """
    logs = db.query(DataAccessAuditLog).order_by(DataAccessAuditLog.timestamp.desc()).limit(limit).all()
    return {
        "total": len(logs),
        "audit_logs": [
            {
                "id": log.id,
                "accessor_user": log.accessor_user,
                "accessor_role": log.accessor_role,
                "target_employee_id": log.target_employee_id,
                "access_type": log.access_type,
                "fields_exposed": log.fields_exposed,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            }
            for log in logs
        ]
    }

