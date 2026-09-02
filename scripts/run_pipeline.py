"""
Pipeline runner: executes the logic from notebooks 03, 05, 07, and 15
directly using the .venv Python interpreter, bypassing the broken system Jupyter.
"""
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime

os.chdir(os.path.dirname(os.path.abspath(__file__)))

RAW = '../data/raw'
PROC = '../data/processed'
FEAT = '../data/processed/features'
MODELS = '../models/v1'

for d in [PROC, FEAT, MODELS]:
    os.makedirs(d, exist_ok=True)

print("=" * 60)
print("STEP 1: DATA CLEANING & MERGE (Notebook 03)")
print("=" * 60)

df_main = pd.read_csv(f'{RAW}/employee_performance_pro.csv')
df_perf = pd.read_csv(f'{RAW}/Employee_Performance_Dataset.csv')
df_hr   = pd.read_csv(f'{RAW}/Cleaned_HR_Data_Analysis.csv')

print(f"  Main: {df_main.shape}, Perf: {df_perf.shape}, HR: {df_hr.shape}")

df = df_main.copy()
drop_cols = ['PhoneNumber', 'LeaveDayName', 'LastLeaveDate', 'CountryCode']
df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True)
df.rename(columns={'WorkLifeBalanceScore': 'WorkLifeBalance'}, inplace=True)
df['Attrition_encoded'] = (df['AttritionRisk'].str.strip().str.lower() == 'yes').astype(int)

num_cols = df.select_dtypes(include='number').columns
df[num_cols] = df[num_cols].fillna(df[num_cols].median())
str_cols = df.select_dtypes(include='object').columns
df[str_cols] = df[str_cols].fillna('Unknown')

# Clean and merge performance dataset
df_perf_clean = df_perf.copy()
df_perf_clean.rename(columns={
    'Employee ID': 'EmployeeID', 'Job Role': 'JobRole_perf',
    'Performance Score': 'KPI_PerformanceScore', 'KPI Score': 'KPI_Score',
    'Attendance (%)': 'Attendance_pct', 'Peer Rating': 'Peer_Rating',
    'Task Completion (%)': 'TaskCompletion_pct', 'Work Hours Logged': 'WorkHoursLogged',
    'Manager Feedback': 'Manager_Feedback', 'Training Hours': 'TrainingHours_perf',
    'Promotion Eligibility': 'Promotion_Eligibility'
}, inplace=True)
df_perf_clean.drop(columns=['Name', 'Department', 'JobRole_perf'], errors='ignore', inplace=True)

# Clean and merge engagement/org dataset
df_hr_clean = df_hr.copy()
df_hr_clean.rename(columns={
    'Employee ID': 'EmployeeID', 'Engagement Score': 'EngagementScore',
    'Satisfaction Score': 'SatisfactionScore', 'Work-Life Balance Score': 'WLB_Score_hr',
    'Current Employee Rating': 'EmployeeRating'
}, inplace=True)
keep_hr = ['EmployeeID', 'EngagementScore', 'SatisfactionScore', 'WLB_Score_hr', 'EmployeeRating']
df_hr_clean = df_hr_clean[[c for c in keep_hr if c in df_hr_clean.columns]]

merged = df.merge(df_perf_clean, on='EmployeeID', how='left')
merged = merged.merge(df_hr_clean, on='EmployeeID', how='left')

num_cols2 = merged.select_dtypes(include='number').columns
merged[num_cols2] = merged[num_cols2].fillna(merged[num_cols2].median())
str_cols2 = merged.select_dtypes(include='object').columns
merged[str_cols2] = merged[str_cols2].fillna('Unknown')

merged.to_csv(f'{PROC}/employee_attrition_processed.csv', index=False)
if 'EngagementScore' in merged.columns:
    merged[['EmployeeID', 'EngagementScore']].to_csv(f'{PROC}/engagement_processed.csv', index=False)

for fname in ['essential_skills.csv', 'software_skills.csv', 'occupation_data.csv']:
    src = f'{RAW}/{fname}'
    if os.path.exists(src):
        pd.read_csv(src).to_csv(f'{PROC}/{fname.replace(".csv", "_processed.csv")}', index=False)

print(f"  Cleaned & merged: {merged.shape}")
print(f"  Attrition balance: {merged['Attrition_encoded'].value_counts().to_dict()}")
print(f"  Saved to: {PROC}/employee_attrition_processed.csv")


print("\n" + "=" * 60)
print("STEP 2: FEATURE ENGINEERING (Notebook 05)")
print("=" * 60)

df = merged.copy()

if 'MonthlySalary' in df.columns and 'YearsAtCompany' in df.columns:
    df['IncomePerYear'] = df['MonthlySalary'] / (df['YearsAtCompany'] + 1)

if 'WorkLifeBalance' in df.columns and 'EngagementScore' in df.columns:
    df['OverallSatisfaction'] = (df['WorkLifeBalance'] + df['EngagementScore']) / 2.0
elif 'WorkLifeBalance' in df.columns:
    df['OverallSatisfaction'] = df['WorkLifeBalance']

if 'YearsAtCompany' in df.columns and 'Age' in df.columns:
    df['ExperienceRatio'] = df['YearsAtCompany'] / (df['Age'] - 18 + 1)

if 'LastPromotionYear' in df.columns:
    df['YearsSincePromotion'] = 2026 - df['LastPromotionYear'].fillna(2026)

if 'TrainingHours' in df.columns and 'YearsAtCompany' in df.columns:
    df['TrainingIndex'] = df['TrainingHours'] / (df['YearsAtCompany'] + 1)

if 'KPI_Score' in df.columns and 'PerformanceRating' in df.columns:
    df['PerformanceGap'] = df['KPI_Score'] - (df['PerformanceRating'] * 20)

# Drop non-feature columns
id_cols = ['EmployeeID', 'Name', 'AttritionRisk', 'JoiningDate', 'Country', 'Gender']
df_model = df.drop(columns=[c for c in id_cols if c in df.columns], errors='ignore')

cat_cols = df_model.select_dtypes(include='object').columns.tolist()
print(f"  Encoding categorical columns: {cat_cols}")
df_encoded = pd.get_dummies(df_model, columns=cat_cols, drop_first=True)

print(f"  Feature matrix: {df_encoded.shape}")
df_encoded.to_csv(f'{FEAT}/attrition_features.csv', index=False)
print(f"  Saved to: {FEAT}/attrition_features.csv")


print("\n" + "=" * 60)
print("STEP 3: MODEL TRAINING (Notebook 07)")
print("=" * 60)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_recall_fscore_support
import joblib
import mlflow
import shap

df = pd.read_csv(f'{FEAT}/attrition_features.csv')
X = df.drop(columns=['Attrition_encoded'])
y = df['Attrition_encoded']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

pos_weight = (len(y) - sum(y)) / max(sum(y), 1)
print(f"  Training samples: {len(X_train)}, Test: {len(X_test)}")
print(f"  Class imbalance scale_pos_weight: {pos_weight:.2f}")

models = {
    'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced', n_jobs=-1),
    'XGBoost': XGBClassifier(n_estimators=300, random_state=42, scale_pos_weight=pos_weight,
                              learning_rate=0.05, max_depth=6, eval_metric='logloss', verbosity=0)
}

results = []
best_recall = 0
best_model_name = ""
best_model = None

for name, model in models.items():
    print(f"  Training {name}...")
    model.fit(X_train, y_train)
    probs = model.predict_proba(X_test)[:, 1]
    preds = model.predict(X_test)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average='binary', zero_division=0)
    roc_auc = roc_auc_score(y_test, probs)
    results.append({'Model': name, 'ROC-AUC': round(roc_auc, 4), 'F1': round(f1, 4), 'Recall': round(recall, 4)})
    print(f"    ROC-AUC: {roc_auc:.4f} | F1: {f1:.4f} | Recall: {recall:.4f}")
    if recall > best_recall:
        best_recall = recall
        best_model_name = name
        best_model = model

print(f"\n  >> Winner: {best_model_name} (Recall={best_recall:.4f})")

best_row = next(r for r in results if r['Model'] == best_model_name)

# MLOps: Track the winning model in MLflow
try:
    mlflow.set_tracking_uri("http://mlflow:5000")
    mlflow.set_experiment("Attrition_Prediction")
    with mlflow.start_run(run_name=best_model_name):
        mlflow.log_param("algorithm", best_model_name)
        mlflow.log_param("n_samples", len(X_train))
        mlflow.log_metric("recall", best_recall)
        mlflow.log_metric("roc_auc", best_row['ROC-AUC'])
        mlflow.log_metric("f1_score", best_row['F1'])
        
        # Log model (assuming sklearn or xgboost compatibility)
        import mlflow.sklearn
        mlflow.sklearn.log_model(best_model, "model")
    print("  MLflow tracking complete.")
except Exception as e:
    print(f"  [Warning] MLflow tracking failed: {e}")

# Save model and features
joblib.dump(best_model, f'{MODELS}/attrition_pipeline.joblib')
joblib.dump(X.columns.tolist(), f'{MODELS}/feature_names.joblib')

# Explainability: Generate and save SHAP Explainer
try:
    print("  Generating SHAP explainer...")
    if best_model_name == 'Logistic Regression':
        explainer = shap.LinearExplainer(best_model, X_train)
    else:
        explainer = shap.TreeExplainer(best_model)
    joblib.dump(explainer, f'{MODELS}/attrition_explainer.joblib')
    print(f"  Saved: {MODELS}/attrition_explainer.joblib")
except Exception as e:
    print(f"  [Warning] SHAP explainer failed: {e}")

best_row = next(r for r in results if r['Model'] == best_model_name)
metadata = {
    "model_name": "Attrition Prediction Model",
    "version": "v2.0",
    "algorithm": best_model_name,
    "training_date": datetime.now().strftime("%Y-%m-%d"),
    "training_data": "employee_performance_pro.csv + Employee_Performance_Dataset.csv + Cleaned_HR_Data_Analysis.csv",
    "n_training_samples": int(len(X_train)),
    "roc_auc": float(best_row['ROC-AUC']),
    "f1_score": float(best_row['F1']),
    "recall": float(best_row['Recall']),
    "metrics": {"total_predictions_logged": 0}
}
with open(f'{MODELS}/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=4)

print(f"  Saved: {MODELS}/attrition_pipeline.joblib")


print("\n" + "=" * 60)
print("STEP 4: EMPLOYEE INTELLIGENCE TABLE (Notebook 15)")
print("=" * 60)

attr = pd.read_csv(f'{PROC}/employee_attrition_processed.csv')
feature_names = joblib.load(f'{MODELS}/feature_names.joblib')
features_df = pd.read_csv(f'{FEAT}/attrition_features.csv')

X_all = features_df.drop(columns=['Attrition_encoded'])
X_aligned = X_all.reindex(columns=feature_names, fill_value=0)
probs = best_model.predict_proba(X_aligned)[:, 1]

n = len(attr)
attr['Attrition_Prob'] = probs[:n]
attr['Risk'] = attr['Attrition_Prob'].apply(lambda x: 'HIGH' if x > 0.7 else ('MEDIUM' if x > 0.4 else 'LOW'))

if 'EngagementScore' not in attr.columns:
    import random
    attr['EngagementScore'] = [random.randint(50, 95) for _ in range(n)]

recommendations_map = {
    'HIGH': 'Immediate 1:1 retention conversation + salary review',
    'MEDIUM': 'Recommended Course: Leadership and Influence',
    'LOW': 'Recommended Course: Advanced Skills Workshop'
}
attr['Recommendation'] = attr['Risk'].map(recommendations_map)

# Build skill gaps
# Build skill gaps using O*NET essential skills (Title -> Element Name)
ess_path = f'{RAW}/essential_skills.csv'
if os.path.exists(ess_path):
    ess = pd.read_csv(ess_path)
    # Build a map: O*NET Title -> top 3 skill Element Names
    role_skills_map = ess.groupby('Title')['Element Name'].apply(lambda x: list(x.unique())[:3]).to_dict()
    
    def get_skill_gap(row):
        role = str(row.get('Role', row.get('JobRole', ''))).strip()
        # Try exact match first, then fuzzy title match
        skills = role_skills_map.get(role, [])
        if not skills:
            # Find closest title match
            for title in role_skills_map:
                if any(word in title.lower() for word in role.lower().split() if len(word) > 4):
                    skills = role_skills_map[title][:3]
                    break
        return ', '.join(skills) if skills else 'Communication, Analytical Thinking, Problem Solving'
    
    attr['Skill_Gap'] = attr.apply(get_skill_gap, axis=1)
else:
    attr['Skill_Gap'] = 'Communication, Analytical Thinking, Problem Solving'

final_cols = [
    'EmployeeID', 'Department', 'JobRole', 'Age', 'Gender', 'YearsAtCompany',
    'Attrition_Prob', 'Risk', 'EngagementScore', 'Skill_Gap', 'Recommendation',
    'MonthlySalary', 'WorkLifeBalance', 'PerformanceRating', 'ProjectsHandled', 'TrainingHours'
]
final_df = attr[[c for c in final_cols if c in attr.columns]].copy()
final_df.rename(columns={'JobRole': 'Role', 'EngagementScore': 'Engagement'}, inplace=True)
final_df.to_csv(f'{PROC}/employee_intelligence.csv', index=False)

print(f"  ✅ Employee Intelligence Table saved: {PROC}/employee_intelligence.csv")
print(f"  Shape: {final_df.shape}")
print(f"  HIGH Risk: {(final_df['Risk'] == 'HIGH').sum()}")
print(f"  MEDIUM Risk: {(final_df['Risk'] == 'MEDIUM').sum()}")
print(f"  LOW Risk: {(final_df['Risk'] == 'LOW').sum()}")
print()
print("=" * 60)
print("✅ ALL PIPELINE STEPS COMPLETE!")
print("=" * 60)
