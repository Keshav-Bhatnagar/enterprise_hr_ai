import joblib
import pandas as pd
import numpy as np
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class AttritionPredictor:
    def __init__(self, model_dir='models/v1'):
        if not os.path.isabs(model_dir):
            model_dir = os.path.join(BASE_DIR, model_dir)
        self.model = joblib.load(f'{model_dir}/attrition_pipeline.joblib')
        self.feature_names = joblib.load(f'{model_dir}/feature_names.joblib')

        with open(f'{model_dir}/metadata.json', 'r') as f:
            self.metadata = json.load(f)

        # Use native feature_importances_ — avoids SHAP/XGBoost 2.0 incompatibility
        self._importances = None
        if hasattr(self.model, 'feature_importances_'):
            self._importances = pd.Series(
                self.model.feature_importances_,
                index=self.feature_names
            ).sort_values(ascending=False)

    def prepare_features(self, employee_data: dict) -> pd.DataFrame:
        df = pd.DataFrame([employee_data])

        # Feature Engineering — must match notebook 05 exactly
        salary_col = 'MonthlySalary' if 'MonthlySalary' in df.columns else 'MonthlyIncome'
        if salary_col in df.columns and 'YearsAtCompany' in df.columns:
            df['IncomePerYear'] = df[salary_col] / (df['YearsAtCompany'].clip(lower=0) + 1)

        if 'WorkLifeBalance' in df.columns and 'avg_EngagementScore' in df.columns:
            df['OverallSatisfaction'] = (df['WorkLifeBalance'] + df['avg_EngagementScore']) / 2.0
        elif 'WorkLifeBalance' in df.columns:
            df['OverallSatisfaction'] = df['WorkLifeBalance']

        if 'YearsAtCompany' in df.columns and 'Age' in df.columns:
            df['ExperienceRatio'] = df['YearsAtCompany'] / (df['Age'] - 18 + 1).clip(lower=1)

        if 'LastPromotionYear' in df.columns:
            df['YearsSincePromotion'] = 2026 - pd.to_numeric(df['LastPromotionYear'], errors='coerce').fillna(2026)

        if 'TrainingHours' in df.columns and 'YearsAtCompany' in df.columns:
            df['TrainingIndex'] = df['TrainingHours'] / (df['YearsAtCompany'].clip(lower=0) + 1)

        # One-hot encode Department and JobRole to match training
        cat_cols = ['Department', 'JobRole']
        for col in cat_cols:
            if col in df.columns:
                dummies = pd.get_dummies(df[[col]], prefix=col, drop_first=True)
                df = pd.concat([df.drop(columns=[col]), dummies], axis=1)

        # Build the aligned feature vector
        X = pd.DataFrame(index=df.index, columns=self.feature_names, dtype=float).fillna(0.0)
        for col in self.feature_names:
            if col in df.columns:
                X[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

        return X.astype(float)

    def predict(self, employee_data: dict) -> dict:
        X = self.prepare_features(employee_data)

        prob = float(self.model.predict_proba(X)[0][1])

        if prob > 0.7:
            risk = 'HIGH'
        elif prob > 0.4:
            risk = 'MEDIUM'
        else:
            risk = 'LOW'

        # Top 3 factors from native feature importances (instead of SHAP)
        top_factors = []
        if self._importances is not None:
            top3 = self._importances.head(3)
            hr_friendly = {
                'PerformanceRating': 'Low performance rating increases risk',
                'OvertimeHoursPerMonth': 'High overtime hours increases risk',
                'WorkLifeBalance': 'Poor work-life balance increases risk',
                'YearsAtCompany': 'Tenure pattern indicates flight risk',
                'IncomePerYear': 'Below-market compensation increases risk',
                'MonthlySalary': 'Salary level is a retention factor',
                'ExperienceRatio': 'Career growth rate signals intent',
                'YearsSincePromotion': 'Lack of recent promotion increases risk',
                'TrainingIndex': 'Training investment affects engagement',
            }
            for feat in top3.index:
                label = hr_friendly.get(feat, f'{feat} is a contributing factor')
                top_factors.append(label)

        return {
            "Probability": round(prob, 4),
            "RiskLevel": risk,
            "TopFactors": top_factors,
            "ModelVersion": self.metadata.get("version", "v2.0"),
            "Algorithm": self.metadata.get("algorithm", "XGBoost")
        }

    def get_model_info(self) -> dict:
        return {
            "version": self.metadata.get("version"),
            "algorithm": self.metadata.get("algorithm"),
            "roc_auc": self.metadata.get("roc_auc"),
            "f1_score": self.metadata.get("f1_score"),
            "recall": self.metadata.get("recall"),
            "training_date": self.metadata.get("training_date"),
            "n_features": len(self.feature_names),
            "top_features": self._importances.head(5).to_dict() if self._importances is not None else {}
        }

_global_predictor = None

def get_predictor():
    global _global_predictor
    if _global_predictor is None:
        _global_predictor = AttritionPredictor()
    return _global_predictor
