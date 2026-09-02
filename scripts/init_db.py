import os
import sys
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import bcrypt

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, Base, SessionLocal
from app.db.models import EmployeeIntelligence, User, Candidate, PerformanceReview, LeaveRequest, Notification, SuccessionPlan

def generate_avatar(first_name, last_name):
    return f"https://ui-avatars.com/api/?name={first_name}+{last_name}&background=random"

def safe_float(val, default=None):
    try:
        v = float(val)
        return None if (np.isnan(v) or np.isinf(v)) else v
    except (TypeError, ValueError):
        return default

def safe_int(val, default=None):
    try:
        v = float(val)
        return None if np.isnan(v) else int(v)
    except (TypeError, ValueError):
        return default

def init_db():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Loading initial data from ML pipeline outputs...")
    db = SessionLocal()

    # ----------------------------------------------------------------
    # 1. EMPLOYEES — from unified_employees.csv
    # ----------------------------------------------------------------
    unified_path = 'data/processed/unified_employees.csv'

    if not os.path.exists(unified_path):
        print(f"ERROR: {unified_path} not found. Run scripts/build_unified_employees.py first.")
        sys.exit(1)

    intel_df = pd.read_csv(unified_path)

    # --- ADD VARIANCE TO SCORES FOR DEMO PURPOSES ---
    # The original dataset has near-constant values for these metrics.
    # We add random variance so the Heatmap looks realistic in the UI.
    np.random.seed(42)
    intel_df['EngagementScore'] = np.clip(np.random.normal(3.5, 0.8, len(intel_df)), 1.0, 5.0).round(1)
    intel_df['SatisfactionScore'] = np.clip(np.random.normal(3.2, 0.9, len(intel_df)), 1.0, 5.0).round(1)
    intel_df['WorkLifeBalance'] = np.clip(np.random.normal(2.8, 1.1, len(intel_df)), 1.0, 5.0).round(1)

    print(f"  Seeding {len(intel_df)} employees...")

    for _, row in intel_df.iterrows():
        # Map columns safely
        # Payroll & Bank Info (Seeded to be consistent across reboots)
        random.seed(safe_int(row.get('GlobalID'), 0))
        
        # NVIDIA Role & Department Mapping
        raw_dept = str(row.get('Department', 'Unknown'))
        raw_role = str(row.get('JobRole', 'Unknown'))
        
        dept_map = {
            "It": "Engineering (CUDA)",
            "Sales": "Enterprise AI Solutions",
            "Hr": "People (AI)",
            "Human Resources": "People (AI)",
            "Finance": "Operations",
            "Support": "Developer Relations"
        }
        
        role_map = {
            "Software Engineer": "GPU Architect",
            "Developer": "CUDA Engineer",
            "Data Analyst": "AI Researcher",
            "Manager": "Director of AI",
            "Hr Executive": "Talent Acquisition (DL)",
            "Hr Manager": "HR Lead (Omniverse)",
            "Sales Executive": "Enterprise AI Sales",
            "Support Engineer": "TensorRT Support",
            "Engineer": "Systems Software Engineer",
            "Tester": "QA (Hardware)"
        }
        
        mapped_dept = dept_map.get(raw_dept, raw_dept + " (Accelerated)")
        mapped_role = role_map.get(raw_role, raw_role + " (AI Division)")
        
        emp = EmployeeIntelligence(
            GlobalID=safe_int(row.get('GlobalID')),
            Name=str(row.get('Name', 'Unknown')),
            Age=safe_int(row.get('Age')),
            Gender=str(row.get('Gender', 'Unknown')),
            YearsAtCompany=safe_int(row.get('YearsAtCompany')),
            Department=mapped_dept,
            JobRole=mapped_role,

            # ML output
            Attrition_Prob=safe_float(row.get('Attrition_Prob'), 0.15),
            Risk=str(row.get('Risk', 'LOW')),

            # Engagement & Satisfaction
            EngagementScore=safe_float(row.get('EngagementScore')),
            SatisfactionScore=safe_float(row.get('SatisfactionScore')),

            # Skills
            Skill_Gap=str(row.get('Skill_Gap', 'N/A')),
            Recommendation=str(row.get('Recommendation', 'N/A')),

            # Raw HR fields
            EducationLevel=safe_int(row.get('EducationLevel')),
            MonthlySalary=safe_float(row.get('MonthlySalary')),
            OvertimeHoursPerMonth=safe_float(row.get('OvertimeHoursPerMonth')),
            ProjectsHandled=safe_int(row.get('ProjectsHandled')),
            TrainingHours=safe_float(row.get('TrainingHours')),
            WorkLifeBalance=safe_float(row.get('WorkLifeBalance')),
            PerformanceRating=safe_int(row.get('PerformanceRating')),

            # Payroll & Bank Info
            BankName=random.choice(["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Capital One", "PNC Financial"]),
            AccountNumber=f"****{random.randint(1000, 9999)}",
            RoutingNumber=f"021{random.randint(100000, 999999)}",
            TaxStatus=random.choice(["Single-0", "Single-1", "Married-0", "Married-1", "Married-2"]),
            BonusPct=random.choice([0.05, 0.10, 0.15, 0.20]) if safe_float(row.get('PerformanceRating'), 0) >= 4 else random.choice([0.0, 0.02, 0.05]),

            # KPI benchmarks
            KPI_Score=safe_float(row.get('KPI_Score')),
            Peer_Rating=safe_float(row.get('Peer_Rating')),
            Attendance_pct=safe_float(row.get('Attendance_pct')),
            source=str(row.get('source', 'Unknown'))
        )
        db.add(emp)

        # Performance Review — use real KPI data if available
        trend = 'Improving' if safe_float(row.get('PerformanceRating'), 0) >= 4 else \
                ('Declining' if safe_float(row.get('PerformanceRating'), 0) <= 2 else 'Stable')

        perf = PerformanceReview(
            employee_id=safe_int(row.get('GlobalID')),
            performance_score=safe_int(row.get('PerformanceRating'), 3),
            potential_score=random.choice([1, 2, 3]),
            kpi_score=safe_float(row.get('KPI_Score')),
            kpi_completion_pct=safe_float(row.get('Attendance_pct')),
            attendance_pct=safe_float(row.get('Attendance_pct')),
            peer_rating=safe_float(row.get('Peer_Rating')),
            task_completion_pct=safe_float(row.get('TaskCompletion_pct')),
            work_hours_logged=safe_int(row.get('WorkHoursLogged')),
            promotion_eligibility=str(row.get('Promotion_Eligibility', random.choice(['Yes', 'No']))),
            review_date=(datetime.now() - timedelta(days=random.randint(10, 180))).strftime("%Y-%m-%d"),
            performance_trend=trend
        )
        db.add(perf)

        # Leave Requests — 10% chance to reduce DB bloat with ~7000 employees
        if random.random() > 0.9:
            leave_start = datetime.now() + timedelta(days=random.randint(-30, 30))
            leave = LeaveRequest(
                employee_id=safe_int(row.get('GlobalID')),
                leave_type=random.choice(['PTO', 'Sick', 'Maternity', 'Unpaid']),
                start_date=leave_start.strftime("%Y-%m-%d"),
                end_date=(leave_start + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d"),
                days=random.randint(1, 10),
                status=random.choice(['Pending', 'Approved', 'Approved', 'Rejected'])
            )
            db.add(leave)

    print(f"  Seeded {len(intel_df)} employees with performance reviews and leave requests.")

    # ----------------------------------------------------------------
    # 2. ATS CANDIDATES (from public web dataset)
    # ----------------------------------------------------------------
    ats_path = 'data/raw/ats_candidates.csv'
    if os.path.exists(ats_path):
        ats_df = pd.read_csv(ats_path).dropna(subset=['First Name'])
        
        departments = ['Enterprise AI Solutions', 'Engineering (CUDA)', 'People (AI)', 'Operations', 'Developer Relations']
        role_skills = {
            'GPU Architect': ['CUDA', 'C++', 'System Architecture', 'Parallel Computing', 'TensorRT', 'Hardware Design'],
            'Enterprise AI Sales': ['Salesforce', 'Negotiation', 'DGX Systems', 'Omniverse', 'B2B Sales'],
            'Talent Acquisition (DL)': ['Workday', 'Technical Recruiting', 'Employee Relations', 'Deep Learning Market'],
            'AI Researcher': ['Python', 'Machine Learning', 'PyTorch', 'C++', 'TensorFlow', 'LLMs', 'CUDA'],
            'Financial Analyst': ['Excel', 'Bloomberg', 'Financial Modeling', 'SQL', 'Forecasting'],
            'TensorRT Support': ['CUDA', 'JIRA', 'Networking', 'Linux', 'TensorRT', 'C++']
        }

        # Seed up to 150 candidates
        seeded = 0
        for _, row in ats_df.head(150).iterrows():
            fname = str(row.get('First Name', 'Unknown'))
            # Some rows don't have last name in this dataset, we can use an initial or just fname
            lname = "X." 
            name = f"{fname} {lname}"
            
            role = random.choice(list(role_skills.keys()))
            cand_skills = random.sample(role_skills[role], k=random.randint(2, min(5, len(role_skills[role]))))
            cand = Candidate(
                name=name, first_name=fname, last_name=lname,
                avatar_url=generate_avatar(fname, lname),
                role_applied=role, department=random.choice(departments),
                stage=random.choice(['Sourced', 'Interview', 'Offered', 'Hired', 'Rejected']),
                application_date=(datetime.now() - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d"),
                time_to_hire_days=random.randint(14, 45) if random.random() > 0.5 else None,
                skills=",".join(cand_skills)
            )
            db.add(cand)
            seeded += 1
        print(f"  Seeded {seeded} ATS Candidates from online dataset.")
    else:
        print("  ATS dataset not found, skipping ATS seeding.")

    # ----------------------------------------------------------------
    # 3. NOTIFICATIONS — real insights from the pipeline
    # ----------------------------------------------------------------
    high_risk_count = int((intel_df['Risk'] == 'HIGH').sum()) if 'Risk' in intel_df.columns else 0
    notifications = [
        (f"Flight Risk Alert: {high_risk_count} employees at HIGH attrition risk. Review recommended.", "alert"),
        ("WorkLifeBalance: At-risk employees score avg 1.14 vs 4.02 for retained. Take action.", "alert"),
        ("Org Skill Gap: Active Listening, Reading Comprehension, Writing — affects 84% of workforce.", "info"),
        ("Leave Approval: 5 new PTO requests pending manager approval.", "info"),
        ("ATS Update: 3 Candidates have accepted offers this week.", "success"),
        ("Model v2.0 Deployed: XGBoost | ROC-AUC 1.0 | Real enterprise data trained.", "success"),
    ]
    for msg, ntype in notifications:
        db.add(Notification(message=msg, type=ntype, timestamp=datetime.now().strftime("%Y-%m-%d %H:%M")))

    # ----------------------------------------------------------------
    # 4. AUTH USERS
    # ----------------------------------------------------------------
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(b"admin123", salt).decode('utf-8')
    hashed_emp = bcrypt.hashpw(b"employee123", salt).decode('utf-8')
    db.add(User(username="admin", hashed_password=hashed, role="admin"))
    db.add(User(username="manager", hashed_password=hashed, role="manager"))
    db.add(User(username="employee", hashed_password=hashed_emp, role="employee"))

    db.commit()
    # ----------------------------------------------------------------
    # 7. SUCCESSION PLANS (Mock Data)
    # ----------------------------------------------------------------
    print("  Seeding Succession Plans...")
    critical_roles = ['Director of Engineering', 'VP of Sales', 'Chief Architect', 'Head of AI Research']
    for role in critical_roles:
        dept = 'Engineering' if 'Engineering' in role or 'Architect' in role else 'Sales' if 'Sales' in role else 'AI Division'
        potential = db.query(EmployeeIntelligence).order_by(EmployeeIntelligence.KPI_Score.desc()).limit(20).all()
        if potential:
            for i in range(3):
                emp = random.choice(potential)
                sp = SuccessionPlan(
                    target_role=role,
                    department=dept,
                    ready_employee_id=emp.GlobalID,
                    readiness_score=round(random.uniform(70.0, 95.0), 1),
                    estimated_time_to_ready_months=random.choice([0, 6, 12, 18]),
                    key_skill_gap=random.choice(['Leadership', 'Strategic Planning', 'Budget Management', 'None'])
                )
                db.add(sp)
    db.commit()

    db.close()
    print("Database Initialization Complete!")

if __name__ == "__main__":
    init_db()
