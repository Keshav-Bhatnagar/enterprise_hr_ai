from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class WebhookEventData(BaseModel):
    MonthlySalary: Optional[float] = Field(None, description="Updated monthly salary in INR/USD")
    OvertimeHoursPerMonth: Optional[float] = Field(None, ge=0, description="Monthly overtime hours")
    PerformanceRating: Optional[int] = Field(None, ge=1, le=5, description="Performance review score (1-5)")
    WorkLifeBalance: Optional[float] = Field(None, ge=1.0, le=5.0, description="Work-life balance rating (1.0-5.0)")
    JobRole: Optional[str] = Field(None, description="Updated job role or title")
    Department: Optional[str] = Field(None, description="Department name")
    TrainingHours: Optional[float] = Field(None, ge=0, description="Training hours logged")
    ProjectsHandled: Optional[int] = Field(None, ge=0, description="Active projects handled")
    BonusPct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Bonus percentage")
    EngagementScore: Optional[float] = Field(None, ge=1.0, le=5.0, description="Employee engagement score")

    class Config:
        extra = "allow"

class HRMSEventPayload(BaseModel):
    event_id: Optional[str] = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    provider: str = Field(default="generic", description="Provider: darwinbox, workday, bamboohr, generic")
    event_type: str = Field(..., description="Event Type: COMPENSATION_CHANGE, OVERTIME_UPDATE, PERFORMANCE_REVIEW, ROLE_CHANGE")
    employee_id: int = Field(..., description="Target employee GlobalID")
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    data: WebhookEventData

class DarwinboxWebhookPayload(BaseModel):
    event: str = Field(..., description="Darwinbox event e.g. employee.salary_revised, employee.overtime_logged")
    employee_id: int = Field(..., description="Darwinbox Employee ID")
    event_timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    payload: Dict[str, Any]

class WorkdayWebhookPayload(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: f"wday_{uuid.uuid4().hex[:10]}")
    topic: str = Field(..., description="Workday topic e.g. worker/compensation, worker/performance")
    worker_id: int = Field(..., description="Workday Worker ID")
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    details: Dict[str, Any]

class WebhookProcessingResult(BaseModel):
    status: str
    event_id: str
    employee_id: int
    employee_name: Optional[str] = None
    provider: str
    event_type: str
    old_risk: Optional[str] = None
    new_risk: Optional[str] = None
    old_probability: Optional[float] = None
    new_probability: Optional[float] = None
    alert_triggered: bool = False
    alert_message: Optional[str] = None
    top_risk_factors: List[str] = []
    message: str
    processing_time_ms: float

