import pandas as pd
import os

PROC = 'data/processed'
RAW  = 'data/raw'

# Step 10: Role Master
attr = pd.read_csv(f'{PROC}/employee_attrition_processed.csv')
role_master = attr[['JobRole', 'Department']].drop_duplicates().reset_index(drop=True)
role_master.to_csv(f'{PROC}/role_master.csv', index=False)
print(f'role_master.csv saved: {role_master.shape}')

# Step 11: Employee Skills from O*NET software_skills.csv
soft_df = pd.read_csv(f'{RAW}/software_skills.csv')
print(f'software_skills columns: {list(soft_df.columns)[:5]}')
if 'Workplace Example' in soft_df.columns:
    role_soft_map = soft_df.groupby('Title')['Workplace Example'].apply(lambda x: list(x.unique())[:4]).to_dict()
elif 'Software' in soft_df.columns:
    role_soft_map = soft_df.groupby('Title')['Software'].apply(lambda x: list(x.unique())[:4]).to_dict()
else:
    role_soft_map = {}

def get_employee_skills(jobrole):
    skills = role_soft_map.get(str(jobrole), [])
    if not skills:
        for title in role_soft_map:
            if any(word in str(title).lower() for word in str(jobrole).lower().split() if len(word) > 4):
                skills = role_soft_map[title][:4]
                break
    return ', '.join(skills) if skills else 'Microsoft Office, Excel, Communication Tools'

attr['current_skills'] = attr['JobRole'].apply(get_employee_skills)
emp_skills = attr[['EmployeeID', 'JobRole', 'current_skills']].copy()
emp_skills.to_csv(f'{PROC}/employee_skills_current.csv', index=False)
print(f'employee_skills_current.csv saved: {emp_skills.shape}')

# Step 12: Skill Gaps
ess = pd.read_csv(f'{RAW}/essential_skills.csv')
role_required_map = ess.groupby('Title')['Element Name'].apply(lambda x: list(x.unique())[:5]).to_dict()

merged = attr[['EmployeeID', 'JobRole']].merge(emp_skills[['EmployeeID', 'current_skills']], on='EmployeeID', how='left')

def compute_gap(row):
    jobrole = str(row['JobRole'])
    current = set(str(row.get('current_skills', '')).split(', '))
    required = set(role_required_map.get(jobrole, []))
    if not required:
        for title in role_required_map:
            if any(word in str(title).lower() for word in jobrole.lower().split() if len(word) > 4):
                required = set(role_required_map[title][:5])
                break
    gap = required - current
    return ', '.join(list(gap)[:3]) if gap else 'No skill gap identified'

merged['MissingSkills'] = merged.apply(compute_gap, axis=1)
merged.to_csv(f'{PROC}/employee_skill_gaps.csv', index=False)
print(f'employee_skill_gaps.csv saved: {merged.shape}')
has_gaps = (merged['MissingSkills'] != 'No skill gap identified').sum()
print(f'  Employees with gaps: {has_gaps}')

# Step 13: Org Skill Gap Summary
exploded = merged.copy()
exploded['Skills_List'] = exploded['MissingSkills'].apply(
    lambda x: [s.strip() for s in str(x).split(',') if s.strip() and s.strip() != 'No skill gap identified']
)
exploded = exploded.explode('Skills_List')
exploded = exploded[exploded['Skills_List'].notna() & (exploded['Skills_List'] != '')]
top_gaps = exploded['Skills_List'].value_counts().head(10)
gap_summary = top_gaps.reset_index()
gap_summary.columns = ['Skill', 'Gap_Count']
gap_summary['Required'] = gap_summary['Gap_Count'] + (gap_summary['Gap_Count'] * 0.5).astype(int)
gap_summary['Available'] = gap_summary['Required'] - gap_summary['Gap_Count']
gap_summary.to_csv(f'{PROC}/org_skill_gap_summary.csv', index=False)
print(f'org_skill_gap_summary.csv saved: {gap_summary.shape}')
print(top_gaps.head(5))
print()
print('ALL EXTENDED STEPS COMPLETE!')
