from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.validation.employee_schema import EmployeeInput, AttritionPrediction
from app.ml.predictor import AttritionPredictor
import logging
from datetime import datetime
import json
import os
import pandas as pd
from app.api.auth import get_current_user

router = APIRouter(prefix="/predict", tags=["attrition"], dependencies=[Depends(get_current_user)])
logger = logging.getLogger(__name__)

predictor = None

def get_attrition_predictor():
    global predictor
    if predictor is None:
        try:
            from app.ml.predictor import get_predictor
            predictor = get_predictor()
        except Exception as e:
            logger.error(f"Failed to load Attrition Predictor: {e}")
    return predictor

@router.on_event("startup")
def load_model():
    get_attrition_predictor()

@router.post("/attrition", response_model=AttritionPrediction)
def predict_attrition(employee: EmployeeInput):
    pred = get_attrition_predictor()
    if pred is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        emp_dict = employee.dict()
        result = pred.predict(emp_dict)
        
        # Log prediction
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "EmployeeID": emp_dict["EmployeeID"],
            "model_version": predictor.metadata["version"],
            "Probability": result["Probability"],
            "RiskLevel": result["RiskLevel"]
        }
        with open("data/predictions/predictions.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
            
        return AttritionPrediction(
            EmployeeID=emp_dict["EmployeeID"],
            Probability=result["Probability"],
            RiskLevel=result["RiskLevel"],
            TopFactors=result["TopFactors"]
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class SimulationRequest(BaseModel):
    employee_id: int
    salary_increase_pct: float = 0.0
    work_life_balance_boost: int = 0
    job_satisfaction_boost: int = 0

@router.post("/simulate")
def simulate_attrition(req: SimulationRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        # Load unified data to get full feature set
        unified_df = pd.read_csv("data/processed/unified_employees.csv")
        emp_row = unified_df[unified_df['GlobalID'] == req.employee_id]
        
        if emp_row.empty:
            raise HTTPException(status_code=404, detail="Employee not found in dataset")
            
        emp_dict = emp_row.iloc[0].to_dict()
        
        # Base Prediction (Before simulation)
        base_result = predictor.predict(emp_dict)
        
        # Apply Simulation Modifiers
        if req.salary_increase_pct > 0:
            if "MonthlySalary" in emp_dict:
                emp_dict["MonthlySalary"] = int(emp_dict["MonthlySalary"] * (1 + (req.salary_increase_pct / 100.0)))
            
        if req.work_life_balance_boost > 0:
            if "WorkLifeBalance" in emp_dict:
                emp_dict["WorkLifeBalance"] = min(5, emp_dict["WorkLifeBalance"] + req.work_life_balance_boost)
            
        if req.job_satisfaction_boost > 0:
            if "SatisfactionScore" in emp_dict:
                emp_dict["SatisfactionScore"] = min(5, emp_dict["SatisfactionScore"] + req.job_satisfaction_boost)
            
        # Simulated Prediction (After simulation)
        simulated_result = predictor.predict(emp_dict)
        
        return {
            "EmployeeID": req.employee_id,
            "BaseProbability": base_result["Probability"],
            "SimulatedProbability": simulated_result["Probability"],
            "RiskDelta": simulated_result["Probability"] - base_result["Probability"],
            "NewRiskLevel": simulated_result["RiskLevel"],
            "NewTopFactors": simulated_result["TopFactors"]
        }
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
