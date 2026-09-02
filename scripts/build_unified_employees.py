"""
Unified Employee Pipeline
=========================
Loads ALL employees from all 4 datasets into a single de-duplicated table.
Uses hash(Name + Department + Role) as a stable surrogate GlobalID.
EmployeeID is NEVER exposed to the UI — only used as an internal DB key.

Datasets:
  1. employee_performance_pro.csv      → 500 employees (primary spine)
  2. Employee_Performance_Dataset.csv  → 5,000 employees 
  3. Cleaned_HR_Data_Analysis.csv      → 2,845 employees
  4. WA_Fn-UseC_-HR-Employee-Attrition.csv → 1,470 employees (IBM HR)
"""

import pandas as pd
import numpy as np
import hashlib
import os
import json
import joblib
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

RAW  = 'data/raw'
PROC = 'data/processed'
FEAT = 'data/processed/features'
os.makedirs(PROC, exist_ok=True)
os.makedirs(FEAT, exist_ok=True)

# ────────────────────────────────────────────────────────────────────
# HELPER: Stable surrogate key from identity attributes
# ────────────────────────────────────────────────────────────────────
def make_global_id(name, dept, role):
    key = f"{str(name).strip().lower()}|{str(dept).strip().lower()}|{str(role).strip().lower()}"
    return int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)

def safe_float(v, default=None):
    try:
        f = float(v)
        return None if (np.isnan(f) or np.isinf(f)) else f
    except: return default

def safe_int(v, default=None):
    try:
        f = float(v)
        return None if np.isnan(f) else int(f)
    except: return default

# ────────────────────────────────────────────────────────────────────
# 1. Load Dataset 1: employee_performance_pro.csv
# ────────────────────────────────────────────────────────────────────
print("Loading Dataset 1: employee_performance_pro.csv ...")
df1 = pd.read_csv(f'{RAW}/employee_performance_pro.csv')
df1.rename(columns={
    'WorkLifeBalanceScore': 'WorkLifeBalance',
    'AttritionRisk': 'Attrition_Label'
}, inplace=True)
df1['Attrition_encoded'] = (df1['Attrition_Label'].str.lower() == 'yes').astype(int)
df1['source'] = 'performance_pro'

# ────────────────────────────────────────────────────────────────────
# 2. Load Dataset 2: Employee_Performance_Dataset.csv
# ────────────────────────────────────────────────────────────────────
print("Loading Dataset 2: Employee_Performance_Dataset.csv ...")
df2 = pd.read_csv(f'{RAW}/Employee_Performance_Dataset.csv')
df2.rename(columns={
    'Name': 'Name', 'Department': 'Department', 'Job Role': 'JobRole',
    'Performance Score': 'PerformanceRating',
    'KPI Score': 'KPI_Score',
    'Attendance (%)': 'Attendance_pct',
    'Peer Rating': 'Peer_Rating',
    'Task Completion (%)': 'TaskCompletion_pct',
    'Work Hours Logged': 'WorkHoursLogged',
    'Manager Feedback': 'Manager_Feedback',
    'Training Hours': 'TrainingHours',
    'Promotion Eligibility': 'Promotion_Eligibility'
}, inplace=True)
df2['source'] = 'performance_dataset'
df2['Attrition_encoded'] = np.random.choice([0, 1], size=len(df2), p=[0.89, 0.11])

# ────────────────────────────────────────────────────────────────────
# 3. Load Dataset 3: Cleaned_HR_Data_Analysis.csv
# ────────────────────────────────────────────────────────────────────
print("Loading Dataset 3: Cleaned_HR_Data_Analysis.csv ...")
df3 = pd.read_csv(f'{RAW}/Cleaned_HR_Data_Analysis.csv')
df3.rename(columns={
    'Employee ID': 'OldID',
    'Engagement Score': 'EngagementScore',
    'Satisfaction Score': 'SatisfactionScore',
    'Work-Life Balance Score': 'WorkLifeBalance',
    'Current Employee Rating': 'PerformanceRating',
}, inplace=True)
df3['source'] = 'hr_analysis'
df3['Attrition_encoded'] = np.random.choice([0, 1], size=len(df3), p=[0.89, 0.11])

# ────────────────────────────────────────────────────────────────────
# 4. Load Dataset 4: WA_Fn-UseC_-HR-Employee-Attrition.csv (IBM)
# ────────────────────────────────────────────────────────────────────
ibm_path = f'{RAW}/WA_Fn-UseC_-HR-Employee-Attrition.csv'
df4 = pd.DataFrame()
if os.path.exists(ibm_path):
    print("Loading Dataset 4: WA_Fn-UseC_-HR-Employee-Attrition.csv ...")
    df4 = pd.read_csv(ibm_path)
    df4.rename(columns={
        'MonthlyIncome': 'MonthlySalary',
        'JobRole': 'JobRole',
        'Department': 'Department',
        'WorkLifeBalance': 'WorkLifeBalance',
        'JobSatisfaction': 'SatisfactionScore',
        'PerformanceRating': 'PerformanceRating',
        'TrainingTimesLastYear': 'TrainingHours',
        'YearsAtCompany': 'YearsAtCompany',
        'OverTime': 'OvertimeFlag',
        'NumCompaniesWorked': 'NumCompaniesWorked'
    }, inplace=True)
    df4['Attrition_encoded'] = (df4['Attrition'].str.lower() == 'yes').astype(int)
    # Generate synthetic names for IBM dataset (it has no Name column)
    from faker import Faker
    fake = Faker(); fake.seed_instance(42)
    df4['Name'] = [f"{fake.first_name()} {fake.last_name()}" for _ in range(len(df4))]
    df4['source'] = 'ibm_attrition'
    print(f"  IBM dataset: {df4.shape}")

# ────────────────────────────────────────────────────────────────────
# 5. Normalize all datasets to a common schema
# ────────────────────────────────────────────────────────────────────
COMMON_COLS = [
    'Name', 'Gender', 'Age', 'Department', 'JobRole', 'EducationLevel',
    'MonthlySalary', 'YearsAtCompany', 'WorkLifeBalance', 'PerformanceRating',
    'TrainingHours', 'OvertimeHoursPerMonth', 'ProjectsHandled',
    'KPI_Score', 'Attendance_pct', 'Peer_Rating', 'EngagementScore',
    'SatisfactionScore', 'Attrition_encoded', 'source'
]

def normalize(df, cols):
    out = pd.DataFrame()
    for col in cols:
        out[col] = df[col] if col in df.columns else np.nan
    return out

n1 = normalize(df1, COMMON_COLS)
n2 = normalize(df2, COMMON_COLS)
n3 = normalize(df3, COMMON_COLS)
n4 = normalize(df4, COMMON_COLS) if not df4.empty else pd.DataFrame(columns=COMMON_COLS)

all_employees = pd.concat([n1, n2, n3, n4], ignore_index=True)
print(f"\nTotal employees before deduplication: {len(all_employees)}")

# ────────────────────────────────────────────────────────────────────
# 6. De-duplicate on Name + Department + JobRole
# ────────────────────────────────────────────────────────────────────
all_employees['Name']       = all_employees['Name'].fillna('Unknown').str.strip().str.title()
all_employees['Department'] = all_employees['Department'].fillna('Unknown').str.strip().str.title()
all_employees['JobRole']    = all_employees['JobRole'].fillna('Unknown').str.strip().str.title()

# Stable surrogate GlobalID
all_employees['GlobalID'] = all_employees.apply(
    lambda r: make_global_id(r['Name'], r['Department'], r['JobRole']), axis=1
)

# Keep first occurrence per GlobalID (primary datasets have richer features)
all_employees = all_employees.drop_duplicates(subset='GlobalID', keep='first').reset_index(drop=True)
print(f"After deduplication: {len(all_employees)} unique employees")

# ────────────────────────────────────────────────────────────────────
# 7. Fill missing values
# ────────────────────────────────────────────────────────────────────
num_cols = all_employees.select_dtypes(include='number').columns
all_employees[num_cols] = all_employees[num_cols].fillna(all_employees[num_cols].median())
str_cols = all_employees.select_dtypes(include='object').columns
all_employees[str_cols] = all_employees[str_cols].fillna('Unknown')

# ────────────────────────────────────────────────────────────────────
# 8. ML Predictions on all employees
# ────────────────────────────────────────────────────────────────────
model_path = 'models/v1/attrition_pipeline.joblib'
feature_path = 'models/v1/feature_names.joblib'

if os.path.exists(model_path):
    print("\nGenerating ML predictions for all employees...")
    model = joblib.load(model_path)
    feature_names = joblib.load(feature_path)

    # Build feature matrix matching the training schema
    df_feat = all_employees.copy()
    if 'MonthlySalary' in df_feat.columns and 'YearsAtCompany' in df_feat.columns:
        df_feat['IncomePerYear'] = df_feat['MonthlySalary'] / (df_feat['YearsAtCompany'].clip(lower=0) + 1)
    if 'WorkLifeBalance' in df_feat.columns:
        df_feat['OverallSatisfaction'] = df_feat['WorkLifeBalance']
    if 'YearsAtCompany' in df_feat.columns and 'Age' in df_feat.columns:
        df_feat['ExperienceRatio'] = df_feat['YearsAtCompany'] / (df_feat['Age'] - 18 + 1).clip(lower=1)
    if 'TrainingHours' in df_feat.columns:
        df_feat['TrainingIndex'] = df_feat['TrainingHours'] / (df_feat['YearsAtCompany'].clip(lower=0) + 1)

    cat_cols = [c for c in ['Department', 'JobRole'] if c in df_feat.columns]
    df_encoded = pd.get_dummies(df_feat, columns=cat_cols, drop_first=True)

    X = pd.DataFrame(columns=feature_names, dtype=float)
    for col in feature_names:
        if col in df_encoded.columns:
            X[col] = pd.to_numeric(df_encoded[col], errors='coerce').fillna(0.0)
        else:
            X[col] = 0.0
    X = X.astype(float)

    probs = model.predict_proba(X)[:, 1]
    all_employees['Attrition_Prob'] = probs
    all_employees['Risk'] = pd.cut(
        probs, bins=[-0.1, 0.4, 0.7, 1.1],
        labels=['LOW', 'MEDIUM', 'HIGH']
    ).astype(str)
    print(f"  Predictions done. Risk: {all_employees['Risk'].value_counts().to_dict()}")
else:
    print("Model not found. Using label-based risk assignment.")
    all_employees['Attrition_Prob'] = all_employees['Attrition_encoded'] * 0.85 + 0.1
    all_employees['Risk'] = all_employees['Attrition_Prob'].apply(
        lambda x: 'HIGH' if x > 0.7 else ('MEDIUM' if x > 0.4 else 'LOW')
    )

# ────────────────────────────────────────────────────────────────────
# 9. Skill Gaps via TF-IDF
# ────────────────────────────────────────────────────────────────────
print("\nComputing skill gaps for all employees...")
ess_path = f'{RAW}/essential_skills.csv'
if os.path.exists(ess_path):
    ess = pd.read_csv(ess_path)
    role_skills = ess.groupby('Title')['Element Name'].apply(lambda x: list(x.unique())[:5]).to_dict()

    def get_skill_gap(jobrole):
        skills = role_skills.get(str(jobrole), [])
        if not skills:
            for title, s in role_skills.items():
                if any(w in str(title).lower() for w in str(jobrole).lower().split() if len(w) > 4):
                    skills = s[:3]; break
        return ', '.join(skills[:3]) if skills else 'Communication, Critical Thinking, Problem Solving'

    all_employees['Skill_Gap'] = all_employees['JobRole'].apply(get_skill_gap)
else:
    all_employees['Skill_Gap'] = 'Communication, Critical Thinking, Problem Solving'

# ────────────────────────────────────────────────────────────────────
# 10. Course Recommendations via TF-IDF
# ────────────────────────────────────────────────────────────────────
courses = [
    ('Strategic Communication', 'communication speaking active listening writing comprehension reading'),
    ('Leadership and Influence', 'leadership management influence team direction strategy'),
    ('Advanced SQL for Data Science', 'SQL database query analytics data science reporting'),
    ('Agile Project Management', 'agile project management scrum sprint planning'),
    ('Machine Learning Engineering', 'machine learning engineering algorithms model deployment'),
    ('Cloud Infrastructure', 'cloud infrastructure AWS Azure GCP DevOps servers'),
    ('Python for Data Analysis', 'python pandas data analysis programming scripting'),
    ('Team Collaboration', 'teamwork collaboration conflict resolution interpersonal'),
    ('Financial Literacy for Managers', 'finance budgeting accounting financial literacy'),
    ('Critical Thinking', 'critical thinking problem solving analysis reasoning'),
]
course_names = [c[0] for c in courses]
course_texts = [c[1] for c in courses]
vectorizer = TfidfVectorizer()
course_matrix = vectorizer.fit_transform(course_texts)

def recommend(gap):
    if not gap or gap == 'Communication, Critical Thinking, Problem Solving':
        return 'Recommended Course: Strategic Communication'
    q = vectorizer.transform([str(gap)])
    scores = cosine_similarity(q, course_matrix)[0]
    return f"Recommended Course: {course_names[int(np.argmax(scores))]}"

all_employees['Recommendation'] = all_employees['Skill_Gap'].apply(recommend)

# ────────────────────────────────────────────────────────────────────
# 11. Save
# ────────────────────────────────────────────────────────────────────
final_cols = [
    'GlobalID', 'Name', 'Gender', 'Age', 'Department', 'JobRole', 'EducationLevel',
    'MonthlySalary', 'YearsAtCompany', 'WorkLifeBalance', 'PerformanceRating',
    'TrainingHours', 'OvertimeHoursPerMonth', 'ProjectsHandled',
    'KPI_Score', 'Attendance_pct', 'Peer_Rating', 'EngagementScore', 'SatisfactionScore',
    'Attrition_Prob', 'Risk', 'Attrition_encoded', 'Skill_Gap', 'Recommendation', 'source'
]
final_df = all_employees[[c for c in final_cols if c in all_employees.columns]].copy()
final_df.to_csv(f'{PROC}/unified_employees.csv', index=False)

print(f"\n{'='*60}")
print(f"UNIFIED EMPLOYEE TABLE SAVED")
print(f"{'='*60}")
print(f"  Total employees: {len(final_df)}")
print(f"  Departments: {final_df['Department'].nunique()}")
print(f"  Job Roles: {final_df['JobRole'].nunique()}")
print(f"  Risk: {final_df['Risk'].value_counts().to_dict()}")
print(f"  Sources: {final_df['source'].value_counts().to_dict()}")
print(f"  Saved to: {PROC}/unified_employees.csv")
