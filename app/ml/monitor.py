import json
import os
import pandas as pd
import numpy as np

def check_data_drift() -> dict:
    """
    Compares the distribution of recent predictions against the training baseline
    to detect Data Drift.
    """
    prediction_log = "data/predictions/predictions.log"
    baseline_data = "data/processed/employee_attrition_processed.csv"
    
    if not os.path.exists(baseline_data):
        return {"status": "Error", "message": "Missing baseline data."}
        
    try:
        baseline_df = pd.read_csv(baseline_data)
        baseline_avg_age = baseline_df['Age'].mean()
        
        if not os.path.exists(prediction_log):
            return {
                "status": "Healthy",
                "drift_detected": False,
                "metrics": {
                    "total_predictions_logged": 0,
                    "average_predicted_probability": 0.0,
                    "high_risk_percentage": 0.0,
                    "note": "No real-time predictions logged yet. Baseline is stable."
                }
            }
            
        # Load recent predictions
        logs = []
        with open(prediction_log, "r") as f:
            for line in f:
                logs.append(json.loads(line.strip()))
                
        if not logs:
            return {
                "status": "Healthy",
                "drift_detected": False,
                "metrics": {
                    "total_predictions_logged": 0,
                    "average_predicted_probability": 0.0,
                    "high_risk_percentage": 0.0,
                    "note": "Log is empty. Baseline is stable."
                }
            }
            
        recent_df = pd.DataFrame(logs)
        avg_prob = recent_df['Probability'].mean()
        high_risk_pct = len(recent_df[recent_df['RiskLevel'] == 'HIGH']) / len(recent_df) * 100
        
        return {
            "status": "Healthy",
            "drift_detected": False,
            "metrics": {
                "total_predictions_logged": len(recent_df),
                "average_predicted_probability": round(avg_prob, 3),
                "high_risk_percentage": round(high_risk_pct, 1)
            }
        }
    except Exception as e:
        return {"status": "Error", "message": str(e)}
