from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import EmployeeIntelligence
from app.ml.predictor import get_predictor

def simulate_retention_intervention(
    db: Session,
    global_id: int,
    proposed_salary_hike_pct: float = 10.0,
    overtime_reduction_hours: float = 10.0,
    wlb_improvement_score: float = 0.5,
    lumpsum_retention_bonus: float = 0.0
) -> Dict[str, Any]:
    """
    Tijori Enterprise Retention Calculator:
    Calculates exact financial ROI, turnover replacement cost avoidance,
    and new ML attrition probabilities for proposed HR retention offers.
    """
    emp = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.GlobalID == global_id).first()
    if not emp:
        return {"error": f"Employee {global_id} not found"}

    base_salary = emp.MonthlySalary or 60000.0
    base_overtime = emp.OvertimeHoursPerMonth or 15.0
    base_wlb = emp.WorkLifeBalance or 2.5
    base_prob = emp.Attrition_Prob or 0.50
    base_risk = emp.Risk or "MEDIUM"

    # Standard Enterprise Rule of Thumb: Replacing an employee costs 8-12 months of CTC
    replacement_multiplier = 9.0  # 9 months salary
    attrition_replacement_cost = round(base_salary * replacement_multiplier, 2)
    expected_turnover_loss_baseline = round(base_prob * attrition_replacement_cost, 2)

    # Calculate post-intervention simulated features
    new_salary = round(base_salary * (1.0 + (proposed_salary_hike_pct / 100.0)), 2)
    new_overtime = max(0.0, base_overtime - overtime_reduction_hours)
    new_wlb = min(5.0, base_wlb + wlb_improvement_score)

    sim_features = {
        "Age": emp.Age or 32,
        "YearsAtCompany": emp.YearsAtCompany or 3,
        "MonthlySalary": new_salary,
        "OvertimeHoursPerMonth": new_overtime,
        "PerformanceRating": emp.PerformanceRating or 3,
        "WorkLifeBalance": new_wlb,
        "Department": emp.Department or "Engineering",
        "JobRole": emp.JobRole or "Developer",
        "EducationLevel": emp.EducationLevel or 3,
        "TrainingHours": emp.TrainingHours or 20.0,
        "ProjectsHandled": emp.ProjectsHandled or 3,
        "avg_EngagementScore": min(5.0, (emp.EngagementScore or 3.0) + 0.4)
    }

    predictor = get_predictor()
    pred_result = predictor.predict(sim_features)
    new_prob = pred_result["Probability"]
    new_risk = pred_result["RiskLevel"]

    # Financial Arithmetic
    expected_turnover_loss_simulated = round(new_prob * (new_salary * replacement_multiplier), 2)
    turnover_cost_avoidance = max(0.0, round(expected_turnover_loss_baseline - expected_turnover_loss_simulated, 2))

    annual_salary_increase_cost = round((new_salary - base_salary) * 12, 2)
    total_intervention_cost = round(annual_salary_increase_cost + lumpsum_retention_bonus, 2)

    net_financial_gain = round(turnover_cost_avoidance - total_intervention_cost, 2)
    roi_multiple = round(turnover_cost_avoidance / total_intervention_cost, 2) if total_intervention_cost > 0 else 0.0

    # Executive Verdict
    if roi_multiple >= 1.5:
        recommendation = "HIGHLY RECOMMENDED — Strong positive financial return on talent retention."
    elif roi_multiple >= 1.0:
        recommendation = "MODERATELY RECOMMENDED — Break-even retention package."
    else:
        recommendation = "CONSIDER ALTERNATIVES — Financial cost exceeds statistical turnover avoidance."

    return {
        "employee_id": emp.GlobalID,
        "employee_name": emp.Name,
        "job_role": emp.JobRole,
        "department": emp.Department,
        "baseline_state": {
            "monthly_salary": base_salary,
            "overtime_hours": base_overtime,
            "work_life_balance": base_wlb,
            "attrition_probability": base_prob,
            "risk_tier": base_risk,
            "attrition_replacement_cost": attrition_replacement_cost,
            "expected_turnover_loss": expected_turnover_loss_baseline
        },
        "simulated_state": {
            "monthly_salary": new_salary,
            "overtime_hours": new_overtime,
            "work_life_balance": new_wlb,
            "new_attrition_probability": new_prob,
            "new_risk_tier": new_risk,
            "probability_reduction_pct": round((base_prob - new_prob) * 100, 1),
            "expected_turnover_loss": expected_turnover_loss_simulated
        },
        "financial_roi": {
            "annual_intervention_cost": total_intervention_cost,
            "turnover_cost_avoidance": turnover_cost_avoidance,
            "net_financial_gain": net_financial_gain,
            "roi_multiple": f"{roi_multiple}x",
            "executive_recommendation": recommendation
        }
    }

