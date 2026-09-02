from sqlalchemy import Column, Integer, BigInteger, String, Float, Boolean, DateTime
from app.db.database import Base

class EmployeeIntelligence(Base):
    __tablename__ = "employee_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    GlobalID = Column(BigInteger, unique=True, index=True)
    Name = Column(String, index=True)
    Age = Column(Integer)
    Gender = Column(String)
    YearsAtCompany = Column(Integer)
    Department = Column(String, index=True)
    JobRole = Column(String, index=True)

    # ML Prediction Output
    Attrition_Prob = Column(Float)
    Risk = Column(String, index=True)   # HIGH / MEDIUM / LOW

    # Engagement & Satisfaction
    EngagementScore = Column(Float, nullable=True)
    SatisfactionScore = Column(Float, nullable=True)

    # Skills
    Skill_Gap = Column(String, nullable=True)
    Recommendation = Column(String, nullable=True)

    # Raw HR fields
    EducationLevel = Column(Integer, nullable=True)
    MonthlySalary = Column(Float, nullable=True)
    OvertimeHoursPerMonth = Column(Float, nullable=True)
    ProjectsHandled = Column(Integer, nullable=True)
    TrainingHours = Column(Float, nullable=True)
    WorkLifeBalance = Column(Float, nullable=True)
    PerformanceRating = Column(Integer, nullable=True)

    # Payroll & Bank Info
    BankName = Column(String, nullable=True)
    AccountNumber = Column(String, nullable=True)
    RoutingNumber = Column(String, nullable=True)
    TaxStatus = Column(String, nullable=True)
    BonusPct = Column(Float, nullable=True)

    # Aggregated KPI benchmarks
    KPI_Score = Column(Float, nullable=True)
    Peer_Rating = Column(Float, nullable=True)
    Attendance_pct = Column(Float, nullable=True)
    source = Column(String, nullable=True)


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role_applied = Column(String, index=True)
    department = Column(String)
    stage = Column(String)  # Sourced, Interview, Offered, Hired, Rejected
    application_date = Column(String)
    time_to_hire_days = Column(Integer, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)


class PerformanceReview(Base):
    __tablename__ = "performance_reviews"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(BigInteger, index=True)
    performance_score = Column(Integer)
    potential_score = Column(Integer, nullable=True)
    kpi_completion_pct = Column(Float, nullable=True)
    review_date = Column(String, nullable=True)
    performance_trend = Column(String, nullable=True)  # Improving, Stable, Declining

    # From Employee_Performance_Dataset aggregation
    kpi_score = Column(Float, nullable=True)
    attendance_pct = Column(Float, nullable=True)
    peer_rating = Column(Float, nullable=True)
    task_completion_pct = Column(Float, nullable=True)
    work_hours_logged = Column(Integer, nullable=True)
    manager_feedback = Column(Float, nullable=True)
    promotion_eligibility = Column(String, nullable=True)


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(BigInteger, index=True)
    leave_type = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    days = Column(Integer)
    status = Column(String)  # Pending, Approved, Rejected


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    type = Column(String)  # alert, info, success
    timestamp = Column(String)
    is_read = Column(Integer, default=0)

class SuccessionPlan(Base):
    __tablename__ = 'succession_plans'
    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String, index=True)
    department = Column(String, index=True)
    ready_employee_id = Column(BigInteger, index=True)
    readiness_score = Column(Float)
    estimated_time_to_ready_months = Column(Integer)
    key_skill_gap = Column(String, nullable=True)
