from fastapi import APIRouter, Depends
import pandas as pd
from app.api.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])

from functools import lru_cache

@lru_cache(maxsize=1)
def load_data():
    try:
        from app.db.database import SessionLocal
        from app.db.models import EmployeeIntelligence
        
        db = SessionLocal()
        try:
            data = db.query(EmployeeIntelligence).all()
            if not data:
                return pd.DataFrame(), pd.DataFrame()
                
            records = [{c.name: getattr(item, c.name) for c in item.__table__.columns} for item in data]
            emp = pd.DataFrame(records)
            
            # Since org_skill_gaps wasn't migrated, we'll just mock an empty DF for it
            return emp, pd.DataFrame()
        finally:
            db.close()
    except Exception as e:
        print(f"Error loading from DB: {e}")
        return pd.DataFrame(), pd.DataFrame()

@router.get("/summary")
@lru_cache(maxsize=1)
def get_summary():
    emp, _ = load_data()
    if emp.empty: return {}
    
    eng_col = 'EngagementScore' if 'EngagementScore' in emp.columns else ('Engagement' if 'Engagement' in emp.columns else None)
    avg_eng = round(emp[eng_col].mean(), 1) if eng_col and not emp[eng_col].isna().all() else 3.5

    return {
        "total_employees": len(emp),
        "high_risk_employees": len(emp[emp['Risk'] == 'HIGH']) if 'Risk' in emp.columns else 0,
        "average_engagement": avg_eng
    }

@router.get("/attrition-by-department")
@lru_cache(maxsize=1)
def get_attrition_by_dept():
    emp, _ = load_data()
    if emp.empty: return []
    grouped = emp.groupby('Department')['Attrition_Prob'].mean().reset_index()
    return grouped.to_dict(orient="records")

@router.get("/skill-gaps")
@lru_cache(maxsize=1)
def get_skill_gaps():
    _, org_gaps = load_data()
    if org_gaps.empty: return []
    return org_gaps.to_dict(orient="records")

@router.get("/recommendations")
@lru_cache(maxsize=1)
def get_recommendations():
    emp, _ = load_data()
    if emp.empty: return []
    return emp[['EmployeeID', 'Recommendation', 'Skill_Gap']].to_dict(orient="records")

@router.get("/employees/{employee_id}")
def get_employee_record(employee_id: int):
    emp, _ = load_data()
    if emp.empty: return {}
    record = emp[emp['EmployeeID'] == employee_id]
    if record.empty: return {}
    return record.iloc[0].to_dict()

@router.get("/employees")
@lru_cache(maxsize=1)
def get_all_employees():
    emp, _ = load_data()
    if emp.empty: return []
    return [{"label": f"{row.EmployeeID} - {row.Role} ({row.Department})", "value": row.EmployeeID} for _, row in emp.iterrows()]

@router.get("/intelligence")
@lru_cache(maxsize=1)
def get_full_intelligence():
    emp, _ = load_data()
    if emp.empty: return []
    return emp.to_dict(orient="records")

@router.get("/employees/{employee_id}/factors")
@lru_cache(maxsize=32)
def get_employee_factors(employee_id: int):
    try:
        from app.ml.predictor import get_predictor
        predictor = get_predictor()
        
        # Load raw data to get features
        raw = pd.read_csv('data/raw/employee_attrition.csv')
        emp_raw = raw[raw['EmployeeID'] == employee_id]
        if emp_raw.empty: return {"factors": []}
        
        result = predictor.predict(emp_raw.iloc[0].to_dict())
        return {"factors": result.get("TopFactors", [])}
    except Exception as e:
        return {"factors": [f"Error: {e}"]}
