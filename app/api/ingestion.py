from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.db.database import get_db
from app.db.models import WebhookEventLog, EmployeeIntelligence
from app.validation.webhook_schema import (
    HRMSEventPayload,
    DarwinboxWebhookPayload,
    WorkdayWebhookPayload,
    WebhookProcessingResult
)
from app.services.ingestion_service import (
    process_hrms_event,
    adapt_darwinbox_event,
    adapt_workday_event
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks", tags=["HRMS Ingestion & Webhooks"])

@router.post("/darwinbox", response_model=WebhookProcessingResult)
def ingest_darwinbox_webhook(
    payload: DarwinboxWebhookPayload,
    db: Session = Depends(get_db),
    x_darwinbox_signature: Optional[str] = Header(None)
):
    """
    Ingest real-time webhook events from Darwinbox HRMS.
    Automatically adapts payload, updates employee state, recalculates ML attrition risk,
    and creates high-risk alerts if needed.
    """
    standard_event = adapt_darwinbox_event(payload)
    return process_hrms_event(standard_event, db, secret_key=x_darwinbox_signature)


@router.post("/workday", response_model=WebhookProcessingResult)
def ingest_workday_webhook(
    payload: WorkdayWebhookPayload,
    db: Session = Depends(get_db),
    x_workday_signature: Optional[str] = Header(None)
):
    """
    Ingest real-time worker change events from Workday Cloud.
    Supported topics: worker/compensation, worker/performance, worker/absence.
    """
    standard_event = adapt_workday_event(payload)
    return process_hrms_event(standard_event, db, secret_key=x_workday_signature)


@router.post("/generic", response_model=WebhookProcessingResult)
def ingest_generic_hrms_webhook(
    payload: HRMSEventPayload,
    db: Session = Depends(get_db),
    x_webhook_secret: Optional[str] = Header(None)
):
    """
    Generic enterprise HRMS webhook endpoint (supports BambooHR, Keka, Rippling, GreytHR).
    """
    return process_hrms_event(payload, db, secret_key=x_webhook_secret)


@router.post("/simulate", response_model=WebhookProcessingResult)
def simulate_hrms_event(
    employee_id: int,
    event_type: str = Query(..., description="COMPENSATION_CHANGE, OVERTIME_UPDATE, PERFORMANCE_REVIEW"),
    monthly_salary: Optional[float] = Query(None, description="New monthly salary"),
    overtime_hours: Optional[float] = Query(None, description="New overtime hours per month"),
    performance_rating: Optional[int] = Query(None, ge=1, le=5, description="Performance review score (1-5)"),
    work_life_balance: Optional[float] = Query(None, ge=1.0, le=5.0, description="WLB score (1.0-5.0)"),
    db: Session = Depends(get_db)
):
    """
    Interactive Simulation Sandbox for HR Admins and Demos:
    Simulates what happens to an employee's attrition risk when a real-time event triggers.
    """
    data = {}
    if monthly_salary is not None:
        data["MonthlySalary"] = monthly_salary
    if overtime_hours is not None:
        data["OvertimeHoursPerMonth"] = overtime_hours
    if performance_rating is not None:
        data["PerformanceRating"] = performance_rating
    if work_life_balance is not None:
        data["WorkLifeBalance"] = work_life_balance

    sim_event = HRMSEventPayload(
        provider="simulator",
        event_type=event_type,
        employee_id=employee_id,
        data=data
    )
    return process_hrms_event(sim_event, db)


@router.get("/history")
def get_webhook_history(
    limit: int = Query(20, ge=1, le=100),
    provider: Optional[str] = Query(None, description="Filter by provider: darwinbox, workday, simulator, generic"),
    status: Optional[str] = Query(None, description="Filter by status: PROCESSED, FAILED, DUPLICATE"),
    db: Session = Depends(get_db)
):
    """
    Immutable audit log of all ingested webhooks, before/after risk transitions, and alert statuses.
    """
    query = db.query(WebhookEventLog)
    if provider:
        query = query.filter(WebhookEventLog.provider == provider)
    if status:
        query = query.filter(WebhookEventLog.status == status)

    logs = query.order_by(WebhookEventLog.created_at.desc()).limit(limit).all()

    return {
        "count": len(logs),
        "events": [
            {
                "id": log.id,
                "event_id": log.event_id,
                "provider": log.provider,
                "event_type": log.event_type,
                "employee_id": log.employee_id,
                "status": log.status,
                "old_risk": log.old_risk,
                "new_risk": log.new_risk,
                "old_probability": log.old_probability,
                "new_probability": log.new_probability,
                "alert_triggered": log.alert_triggered,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "error_message": log.error_message
            }
            for log in logs
        ]
    }


@router.get("/health")
def get_ingestion_health():
    """Healthcheck endpoint for HRMS Webhook Gateway."""
    return {
        "status": "healthy",
        "supported_providers": ["darwinbox", "workday", "bamboohr", "keka", "generic"],
        "rescore_pipeline": "real-time (XGBoost v2.0)",
        "idempotency_enabled": True
    }

