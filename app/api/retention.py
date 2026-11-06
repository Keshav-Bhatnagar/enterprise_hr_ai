from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.database import get_db
from app.db.models import EmployeeIntelligence
from app.services.simulator_service import simulate_retention_intervention

router = APIRouter(prefix="/api/v1/retention", tags=["Retention ROI & Decision Cockpit"])

@router.post("/simulate-roi")
def run_retention_roi_simulation(
    global_id: int = Query(..., description="Target Employee GlobalID"),
    salary_hike_pct: float = Query(10.0, ge=0.0, le=100.0, description="Proposed salary increment percentage"),
    overtime_reduction_hours: float = Query(10.0, ge=0.0, description="Monthly overtime hours to reduce"),
    wlb_improvement: float = Query(0.5, ge=0.0, le=4.0, description="Expected WLB score improvement (0.0 - 4.0)"),
    lumpsum_bonus: float = Query(0.0, ge=0.0, description="One-time retention bonus (INR/USD)"),
    db: Session = Depends(get_db)
):
    """
    Run the Tijori Enterprise Retention ROI Simulator:
    Simulates employee risk drop and computes net financial return (Turnover savings vs package cost).
    """
    result = simulate_retention_intervention(
        db=db,
        global_id=global_id,
        proposed_salary_hike_pct=salary_hike_pct,
        overtime_reduction_hours=overtime_reduction_hours,
        wlb_improvement_score=wlb_improvement,
        lumpsum_retention_bonus=lumpsum_bonus
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/high-risk-queue")
def get_high_risk_intervention_queue(
    department: Optional[str] = Query(None, description="Filter by department"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Priority intervention queue of high flight-risk employees requiring HRBP action.
    """
    query = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.Risk == "HIGH")
    if department:
        query = query.filter(EmployeeIntelligence.Department == department)

    high_risk_emps = query.order_by(EmployeeIntelligence.Attrition_Prob.desc()).limit(limit).all()

    return {
        "count": len(high_risk_emps),
        "queue": [
            {
                "global_id": emp.GlobalID,
                "name": emp.Name,
                "department": emp.Department,
                "job_role": emp.JobRole,
                "monthly_salary": emp.MonthlySalary,
                "attrition_probability": emp.Attrition_Prob,
                "risk_tier": emp.Risk,
                "years_at_company": emp.YearsAtCompany,
                "overtime_hours": emp.OvertimeHoursPerMonth
            }
            for emp in high_risk_emps
        ]
    }

