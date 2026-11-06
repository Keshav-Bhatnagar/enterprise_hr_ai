import json
import time
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.db.models import EmployeeIntelligence, Notification, WebhookEventLog
from app.validation.webhook_schema import (
    HRMSEventPayload,
    DarwinboxWebhookPayload,
    WorkdayWebhookPayload,
    WebhookProcessingResult
)
from app.ml.predictor import get_predictor

logger = logging.getLogger(__name__)

def adapt_darwinbox_event(payload: DarwinboxWebhookPayload) -> HRMSEventPayload:
    """Translate Darwinbox webhook structure into standard HRMSEventPayload."""
    event_str = payload.event.lower()
    details = payload.payload

    if "salary" in event_str or "compensation" in event_str:
        event_type = "COMPENSATION_CHANGE"
        data = {
            "MonthlySalary": float(details.get("new_ctc_monthly", details.get("MonthlySalary", 0))),
            "BonusPct": float(details.get("bonus_pct", 0.0))
        }
    elif "overtime" in event_str or "attendance" in event_str:
        event_type = "OVERTIME_UPDATE"
        data = {
            "OvertimeHoursPerMonth": float(details.get("overtime_hours", details.get("OvertimeHoursPerMonth", 0))),
            "WorkLifeBalance": float(details.get("work_life_balance", details.get("WorkLifeBalance", 3.0)))
        }
    elif "rating" in event_str or "performance" in event_str or "review" in event_str:
        event_type = "PERFORMANCE_REVIEW"
        data = {
            "PerformanceRating": int(details.get("performance_rating", details.get("PerformanceRating", 3))),
            "WorkLifeBalance": float(details.get("work_life_balance", details.get("WorkLifeBalance", 3.0)))
        }
    elif "role" in event_str or "transfer" in event_str or "promotion" in event_str:
        event_type = "ROLE_CHANGE"
        data = {
            "JobRole": details.get("new_job_role", details.get("JobRole")),
            "Department": details.get("new_department", details.get("Department"))
        }
    else:
        event_type = "GENERIC_UPDATE"
        data = details

    return HRMSEventPayload(
        provider="darwinbox",
        event_type=event_type,
        employee_id=payload.employee_id,
        timestamp=payload.event_timestamp,
        data=data
    )

def adapt_workday_event(payload: WorkdayWebhookPayload) -> HRMSEventPayload:
    """Translate Workday Cloud event structure into standard HRMSEventPayload."""
    topic = payload.topic.lower()
    details = payload.details

    if "compensation" in topic or "pay" in topic:
        event_type = "COMPENSATION_CHANGE"
        data = {
            "MonthlySalary": float(details.get("monthly_base_pay", details.get("MonthlySalary", 0))),
            "BonusPct": float(details.get("target_bonus_pct", 0.0))
        }
    elif "time" in topic or "absence" in topic or "overtime" in topic:
        event_type = "OVERTIME_UPDATE"
        data = {
            "OvertimeHoursPerMonth": float(details.get("monthly_overtime_hours", 0)),
            "WorkLifeBalance": float(details.get("work_life_balance_index", 3.0))
        }
    elif "performance" in topic or "talent" in topic:
        event_type = "PERFORMANCE_REVIEW"
        data = {
            "PerformanceRating": int(details.get("overall_rating", 3)),
            "EngagementScore": float(details.get("engagement_score", 3.0))
        }
    else:
        event_type = "ROLE_CHANGE"
        data = details

    return HRMSEventPayload(
        event_id=payload.id,
        provider="workday",
        event_type=event_type,
        employee_id=payload.worker_id,
        timestamp=payload.timestamp,
        data=data
    )

def process_hrms_event(
    event: HRMSEventPayload,
    db: Session,
    secret_key: Optional[str] = None
) -> WebhookProcessingResult:
    """
    Idempotent, real-time ingestion engine that consumes HRMS events,
    updates employee master records, runs real-time ML attrition re-scoring,
    and dispatches high-risk alerts.
    """
    start_time = time.time()

    # 1. Idempotency Check
    existing_log = db.query(WebhookEventLog).filter(WebhookEventLog.event_id == event.event_id).first()
    if existing_log and existing_log.status == "PROCESSED":
        logger.info(f"Duplicate event received and suppressed: {event.event_id}")
        return WebhookProcessingResult(
            status="DUPLICATE",
            event_id=event.event_id,
            employee_id=event.employee_id,
            provider=event.provider,
            event_type=event.event_type,
            old_risk=existing_log.old_risk,
            new_risk=existing_log.new_risk,
            old_probability=existing_log.old_probability,
            new_probability=existing_log.new_probability,
            alert_triggered=False,
            message="Event has already been processed previously (idempotent).",
            processing_time_ms=round((time.time() - start_time) * 1000, 2)
        )

    # 2. Fetch Target Employee
    employee = db.query(EmployeeIntelligence).filter(
        EmployeeIntelligence.GlobalID == event.employee_id
    ).first()

    if not employee:
        # Create failure audit log
        fail_log = WebhookEventLog(
            event_id=event.event_id,
            provider=event.provider,
            event_type=event.event_type,
            employee_id=event.employee_id,
            payload=json.dumps(event.data.dict()),
            status="FAILED",
            error_message=f"Employee GlobalID {event.employee_id} not found in enterprise records."
        )
        db.add(fail_log)
        db.commit()
        raise HTTPException(
            status_code=404,
            detail=f"Employee with GlobalID {event.employee_id} does not exist in master records."
        )

    old_risk = employee.Risk or "LOW"
    old_prob = employee.Attrition_Prob or 0.15

    # 3. Apply Incoming Delta to Master Record
    update_data = event.data.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None and hasattr(employee, field):
            setattr(employee, field, val)

    # 4. Construct Feature Payload for Real-Time Re-Scoring
    emp_features = {
        "Age": employee.Age or 35,
        "YearsAtCompany": employee.YearsAtCompany or 3,
        "MonthlySalary": employee.MonthlySalary or 50000.0,
        "OvertimeHoursPerMonth": employee.OvertimeHoursPerMonth or 0.0,
        "PerformanceRating": employee.PerformanceRating or 3,
        "WorkLifeBalance": employee.WorkLifeBalance or 3.0,
        "Department": employee.Department or "Engineering",
        "JobRole": employee.JobRole or "Developer",
        "EducationLevel": employee.EducationLevel or 3,
        "TrainingHours": employee.TrainingHours or 20.0,
        "ProjectsHandled": employee.ProjectsHandled or 3,
        "avg_EngagementScore": employee.EngagementScore or 3.5
    }

    # 5. Trigger Machine Learning Attrition Predictor
    try:
        predictor = get_predictor()
        pred_result = predictor.predict(emp_features)
        new_prob = pred_result["Probability"]
        new_risk = pred_result["RiskLevel"]
        top_factors = pred_result.get("TopFactors", [])
    except Exception as e:
        logger.error(f"Error during ML re-scoring: {e}", exc_info=True)
        new_prob = old_prob
        new_risk = old_risk
        top_factors = ["Model inference failed, retained previous scores."]

    # 6. Update Employee Risk Profile in DB
    employee.Attrition_Prob = new_prob
    employee.Risk = new_risk

    # 7. Intelligent Threat Alert Condition (Tijori & Rakshak Rule)
    # Alert if risk jumped into HIGH, or probability spiked by >= 15%
    prob_delta = new_prob - old_prob
    alert_triggered = False
    alert_msg = None

    if (new_risk == "HIGH" and old_risk != "HIGH") or (prob_delta >= 0.15 and new_risk in ["MEDIUM", "HIGH"]):
        alert_triggered = True
        pct_display = f"{new_prob * 100:.1f}%"
        alert_msg = (
            f"⚠️ Flight Risk Alert: Employee #{employee.GlobalID} ({employee.Name}) "
            f"risk escalated to {new_risk} ({pct_display}) after {event.event_type}. "
            f"Immediate HRBP intervention recommended."
        )
        notification = Notification(
            message=alert_msg,
            type="alert",
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            is_read=0
        )
        db.add(notification)

    # 8. Record Immutable Webhook Audit Log
    event_log = WebhookEventLog(
        event_id=event.event_id,
        provider=event.provider,
        event_type=event.event_type,
        employee_id=event.employee_id,
        payload=json.dumps(update_data),
        status="PROCESSED",
        old_risk=old_risk,
        new_risk=new_risk,
        old_probability=old_prob,
        new_probability=new_prob,
        alert_triggered=alert_triggered,
        created_at=datetime.utcnow()
    )
    db.add(event_log)
    db.commit()
    db.refresh(employee)

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"Processed {event.provider} event {event.event_id} for Emp #{event.employee_id}: "
        f"{old_risk} -> {new_risk} ({elapsed_ms}ms)"
    )

    return WebhookProcessingResult(
        status="PROCESSED",
        event_id=event.event_id,
        employee_id=event.employee_id,
        employee_name=employee.Name,
        provider=event.provider,
        event_type=event.event_type,
        old_risk=old_risk,
        new_risk=new_risk,
        old_probability=old_prob,
        new_probability=new_prob,
        alert_triggered=alert_triggered,
        alert_message=alert_msg,
        top_risk_factors=top_factors,
        message=f"Successfully ingested {event.event_type} from {event.provider} and recalculated risk.",
        processing_time_ms=elapsed_ms
    )

