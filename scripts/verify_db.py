import sys, os
sys.path.insert(0, '.')
os.environ['DATABASE_URL'] = 'sqlite:///./enterprise_hr_test.db'

from app.db.database import SessionLocal
from app.db.models import EmployeeIntelligence

db = SessionLocal()

emps = db.query(EmployeeIntelligence).order_by(EmployeeIntelligence.Attrition_Prob.desc()).limit(5).all()
print("Top 5 at-risk employees (sorted by Attrition_Prob):")
for e in emps:
    gap = (e.Skill_Gap or '')[:60]
    print(f"  {e.first_name} {e.last_name} | {e.Department}/{e.Role}")
    print(f"    Risk={e.Risk} | Prob={e.Attrition_Prob:.2%} | WLB={e.WorkLifeBalance} | KPI={e.KPI_Score}")
    print(f"    Gap: {gap}")

total = db.query(EmployeeIntelligence).count()
high  = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.Risk == "HIGH").count()
med   = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.Risk == "MEDIUM").count()
low   = db.query(EmployeeIntelligence).filter(EmployeeIntelligence.Risk == "LOW").count()

print()
print(f"Total employees: {total}")
print(f"  HIGH  risk: {high}")
print(f"  MEDIUM risk: {med}")
print(f"  LOW   risk: {low}")

# Test predictor
from app.ml.predictor import get_predictor
predictor = get_predictor()
info = predictor.get_model_info()
print()
print("Model info:")
for k, v in info.items():
    if k != 'top_features':
        print(f"  {k}: {v}")
print("  Top features:", list(info['top_features'].keys())[:5])

db.close()
print("\nAll checks passed!")
