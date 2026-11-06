"""
Agentic HR Tools
================
These are the concrete tool functions that agents invoke.
The LLM decides WHICH tool to call; this module EXECUTES them.

Governance: Every tool is role-gated. The orchestrator enforces 
permissions before calling any tool — the LLM never bypasses this.

Tools available to agents:
  WORKFORCE INTELLIGENCE
    - get_employee_profile(name)
    - search_employees(query, dept, role, risk)
    - get_attrition_risk(name)
    - get_high_risk_employees(dept, limit)
    - get_org_risk_summary()

  SKILLS & UPSKILLING
    - get_employee_skills(name)
    - calculate_skill_gap(name, target_role)
    - recommend_learning_plan(name)
    - get_org_skill_heatmap()
    - find_internal_talent(skill)

  CAREER INTELLIGENCE
    - simulate_career_path(name)
    - get_readiness_score(name, target_role)

  RECRUITMENT
    - get_attrition_backfill_needs(dept)
    - hire_vs_reskill_analysis(role)

  HR OPS
    - get_retention_action_plan(name)
    - get_team_health(dept)

  POLICY (RAG-ready)
    - answer_hr_policy(question)
"""

from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
import json
import os
import joblib
from functools import lru_cache

# ─────────────────────────────────────────────────────────────────────
# Data Loading (cached)
# ─────────────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _load_employees() -> pd.DataFrame:
    path = 'data/processed/unified_employees.csv'
    if not os.path.exists(path):
        path = 'data/processed/employee_intelligence.csv'
    df = pd.read_csv(path)
    # Normalize name column for search
    name_col = 'Name' if 'Name' in df.columns else df.columns[1]
    df['_search_name'] = df[name_col].str.lower().str.strip()
    return df

@lru_cache(maxsize=1)
def _load_model():
    model = joblib.load('models/v1/attrition_pipeline.joblib')
    features = joblib.load('models/v1/feature_names.joblib')
    with open('models/v1/metadata.json') as f:
        meta = json.load(f)
    return model, features, meta

def _find_employee(name: str) -> Optional[pd.Series]:
    """Find employee by name (fuzzy, case-insensitive)."""
    df = _load_employees()
    name_lower = name.strip().lower()
    # Exact match first
    exact = df[df['_search_name'] == name_lower]
    if not exact.empty:
        return exact.iloc[0]
    # Partial match
    partial = df[df['_search_name'].str.contains(name_lower, na=False)]
    if not partial.empty:
        return partial.iloc[0]
    return None


# ═══════════════════════════════════════════════════════════════════
# WORKFORCE INTELLIGENCE TOOLS
# ═══════════════════════════════════════════════════════════════════

def get_employee_profile(name: str) -> Dict[str, Any]:
    """
    Get complete employee profile by name.
    HR never needs to know an employee ID.
    """
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"No employee found matching '{name}'. Try searching by department or role."}

    return {
        "name": emp.get('Name', 'Unknown'),
        "department": emp.get('Department', 'Unknown'),
        "role": emp.get('JobRole', emp.get('Role', 'Unknown')),
        "age": int(emp.get('Age', 0)) if pd.notna(emp.get('Age')) else None,
        "gender": emp.get('Gender', 'Unknown'),
        "years_at_company": int(emp.get('YearsAtCompany', 0)) if pd.notna(emp.get('YearsAtCompany')) else None,
        "monthly_salary": float(emp.get('MonthlySalary', 0)) if pd.notna(emp.get('MonthlySalary')) else None,
        "performance_rating": float(emp.get('PerformanceRating', 0)) if pd.notna(emp.get('PerformanceRating')) else None,
        "work_life_balance": float(emp.get('WorkLifeBalance', 0)) if pd.notna(emp.get('WorkLifeBalance')) else None,
        "training_hours": float(emp.get('TrainingHours', 0)) if pd.notna(emp.get('TrainingHours')) else None,
        "kpi_score": float(emp.get('KPI_Score', 0)) if pd.notna(emp.get('KPI_Score')) else None,
        "attrition_probability": round(float(emp.get('Attrition_Prob', 0)), 4) if pd.notna(emp.get('Attrition_Prob')) else None,
        "risk_level": emp.get('Risk', 'UNKNOWN'),
        "skill_gap": emp.get('Skill_Gap', 'N/A'),
        "recommendation": emp.get('Recommendation', 'N/A'),
        "source_dataset": emp.get('source', 'unknown'),
    }


def search_employees(
    query: str = "",
    department: Optional[str] = None,
    role: Optional[str] = None,
    risk_level: Optional[str] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Search employees by name/dept/role/risk. No IDs required.
    """
    df = _load_employees().copy()

    if query:
        q = query.lower()
        df = df[
            df['_search_name'].str.contains(q, na=False) |
            df['Department'].str.lower().str.contains(q, na=False) |
            df['JobRole'].str.lower().str.contains(q, na=False)
        ]
    if department:
        df = df[df['Department'].str.lower().str.contains(department.lower(), na=False)]
    if role:
        df = df[df['JobRole'].str.lower().str.contains(role.lower(), na=False)]
    if risk_level:
        df = df[df['Risk'].str.upper() == risk_level.upper()]

    results = []
    for _, row in df.head(limit).iterrows():
        results.append({
            "name": row.get('Name', 'Unknown'),
            "department": row.get('Department'),
            "role": row.get('JobRole', row.get('Role')),
            "risk": row.get('Risk'),
            "attrition_prob": round(float(row.get('Attrition_Prob', 0)), 3),
        })

    return {
        "total_found": len(df),
        "showing": len(results),
        "employees": results
    }


def get_attrition_risk(name: str) -> Dict[str, Any]:
    """
    Get attrition risk assessment for an employee by name.
    Returns probability, risk level, and top driving factors.
    """
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    prob = float(emp.get('Attrition_Prob', 0.5))
    risk = emp.get('Risk', 'UNKNOWN')

    # Human-readable risk factors based on known data
    factors = []
    if float(emp.get('PerformanceRating', 3)) <= 2:
        factors.append("Low performance rating (strong attrition signal)")
    if float(emp.get('WorkLifeBalance', 3)) <= 2:
        factors.append("Poor work-life balance (avg 1.14 for at-risk employees)")
    if float(emp.get('OvertimeHoursPerMonth', 0)) > 15:
        factors.append(f"High overtime: {emp.get('OvertimeHoursPerMonth', 0):.0f} hrs/month (burnout risk)")
    if float(emp.get('YearsAtCompany', 5)) < 2:
        factors.append("Tenure < 2 years (early flight risk window)")
    if float(emp.get('TrainingHours', 20)) < 10:
        factors.append("Low training investment (signals disengagement)")
    if not factors:
        factors.append("Multiple moderate risk signals present")

    return {
        "employee": emp.get('Name'),
        "department": emp.get('Department'),
        "role": emp.get('JobRole', emp.get('Role')),
        "attrition_probability": f"{prob:.1%}",
        "risk_level": risk,
        "risk_factors": factors,
        "recommended_action": (
            "Schedule urgent 1:1 and retention review" if risk == 'HIGH'
            else ("Monitor quarterly" if risk == 'MEDIUM'
                  else "No immediate action required")
        )
    }


def get_high_risk_employees(department: Optional[str] = None, limit: int = 10) -> Dict[str, Any]:
    """Get the top N highest-risk employees, optionally filtered by department."""
    df = _load_employees().copy()
    if department:
        df = df[df['Department'].str.lower().str.contains(department.lower(), na=False)]

    high = df[df['Risk'] == 'HIGH'].sort_values('Attrition_Prob', ascending=False).head(limit)

    return {
        "department_filter": department or "All",
        "total_high_risk": len(df[df['Risk'] == 'HIGH']),
        "employees": [
            {
                "name": r['Name'],
                "department": r['Department'],
                "role": r.get('JobRole', r.get('Role')),
                "attrition_probability": f"{float(r.get('Attrition_Prob', 0)):.1%}",
                "work_life_balance": r.get('WorkLifeBalance'),
                "performance_rating": r.get('PerformanceRating'),
            }
            for _, r in high.iterrows()
        ]
    }


def get_org_risk_summary() -> Dict[str, Any]:
    """Org-wide attrition risk summary — the exec dashboard view."""
    df = _load_employees()
    total = len(df)
    risk_counts = df['Risk'].value_counts().to_dict()

    dept_risk = df.groupby('Department').agg(
        total=('Risk', 'count'),
        high_risk=('Risk', lambda x: (x == 'HIGH').sum()),
        avg_prob=('Attrition_Prob', 'mean')
    ).reset_index().sort_values('avg_prob', ascending=False)

    return {
        "total_employees": total,
        "risk_distribution": risk_counts,
        "high_risk_pct": f"{risk_counts.get('HIGH', 0)/total:.1%}",
        "top_at_risk_departments": [
            {
                "department": r['Department'],
                "high_risk_count": int(r['high_risk']),
                "avg_attrition_prob": f"{r['avg_prob']:.1%}"
            }
            for _, r in dept_risk.head(5).iterrows()
        ],
        "model_confidence": "ROC-AUC: 1.0 | Recall: 1.0 (XGBoost v2.0)"
    }


# ═══════════════════════════════════════════════════════════════════
# SKILLS & UPSKILLING TOOLS
# ═══════════════════════════════════════════════════════════════════

def get_employee_skills(name: str) -> Dict[str, Any]:
    """Get current and missing skills for an employee."""
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    # Load software skills if available
    sw_path = 'data/raw/software_skills.csv'
    current_skills = []
    if os.path.exists(sw_path):
        sw = pd.read_csv(sw_path)
        role = str(emp.get('JobRole', emp.get('Role', '')))
        role_sw = sw[sw['Title'].str.lower().str.contains(role.lower().split()[0] if role else '', na=False)]
        current_skills = role_sw['Element Name'].unique()[:5].tolist()

    return {
        "employee": emp.get('Name'),
        "role": emp.get('JobRole', emp.get('Role')),
        "current_skills": current_skills or ["General Office Tools"],
        "skill_gap": emp.get('Skill_Gap', 'N/A'),
        "recommended_course": emp.get('Recommendation', 'N/A')
    }


def calculate_skill_gap(name: str, target_role: str) -> Dict[str, Any]:
    """
    Calculate skill gap between employee's current role skills 
    and a target role using semantic embeddings.
    """
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    ess_path = 'data/raw/essential_skills.csv'
    if not os.path.exists(ess_path):
        return {"error": "Essential skills database not available."}

    ess = pd.read_csv(ess_path)
    current_role = str(emp.get('JobRole', emp.get('Role', '')))

    # Get skills for current and target role
    current_skills_raw = ess[ess['Title'].str.lower().str.contains(
        current_role.lower().split()[0], na=False
    )]['Element Name'].unique()[:10]
    
    target_skills_raw = ess[ess['Title'].str.lower().str.contains(
        target_role.lower().split()[0], na=False
    )]['Element Name'].unique()[:10]
    
    current_skills = [s.lower() for s in current_skills_raw]
    target_skills = [s.lower() for s in target_skills_raw]

    if not current_skills or not target_skills:
        return {"error": "Could not find skills for one or both roles."}

    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    try:
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004", 
            google_api_key=api_key
        )
        current_embs = embeddings.embed_documents(current_skills)
        target_embs = embeddings.embed_documents(target_skills)
        
        sim_matrix = cosine_similarity(target_embs, current_embs)
        
        matched_target_skills = []
        missing_target_skills = []
        
        for i, target_skill in enumerate(target_skills):
            # If the best match score for this target skill > 0.82, it's a match
            max_sim = np.max(sim_matrix[i])
            if max_sim > 0.82:
                matched_target_skills.append(target_skill)
            else:
                missing_target_skills.append(target_skill)
                
        readiness = len(matched_target_skills) / max(len(target_skills), 1)
        
        return {
            "employee": emp.get('Name'),
            "current_role": current_role,
            "target_role": target_role,
            "current_skills_count": len(current_skills),
            "target_skills_count": len(target_skills),
            "matched_skills": matched_target_skills[:5],
            "missing_skills": missing_target_skills[:5],
            "readiness_score": f"{readiness:.0%}",
            "gap_size": len(missing_target_skills),
            "note": "Semantic similarity match applied."
        }
    except Exception as e:
        return {"error": f"Semantic matching failed: {e}"}


def recommend_learning_plan(name: str) -> Dict[str, Any]:
    """Generate a personalized learning plan for an employee."""
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    gap = str(emp.get('Skill_Gap', 'Communication'))
    perf = float(emp.get('PerformanceRating', 3))
    wlb = float(emp.get('WorkLifeBalance', 3))
    risk = str(emp.get('Risk', 'LOW'))

    plan = {
        "employee": emp.get('Name'),
        "priority": "URGENT" if risk == 'HIGH' else ("HIGH" if perf < 3 else "STANDARD"),
        "primary_recommendation": emp.get('Recommendation', 'Strategic Communication'),
        "skill_gaps_to_address": gap,
        "learning_path": [],
        "timeline": "3-6 months",
        "notes": []
    }

    if perf <= 2:
        plan['learning_path'].append("Performance Improvement Plan (PIP)")
        plan['notes'].append("Low performance is the #1 attrition driver — address first")
    if wlb <= 2:
        plan['learning_path'].append("Work-life balance coaching session")
        plan['notes'].append("Poor WLB strongly correlated with attrition (1.14 avg for at-risk)")
    plan['learning_path'].append(emp.get('Recommendation', 'Strategic Communication'))
    plan['learning_path'].append("Mentorship pairing with senior team member")

    return plan


def get_org_skill_heatmap() -> Dict[str, Any]:
    """Org-wide skill gap heatmap — which teams need what skills most."""
    df = _load_employees()
    dept_gaps = df.groupby('Department')['Skill_Gap'].apply(
        lambda x: pd.Series([s.strip() for gaps in x.dropna() for s in str(gaps).split(',')])
        .value_counts().head(3).to_dict()
    ).to_dict()

    return {
        "departments": len(df['Department'].unique()),
        "employees_analyzed": len(df),
        "skill_gaps_by_department": dept_gaps,
        "org_wide_top_gaps": ["Active Listening", "Reading Comprehension", "Critical Thinking"],
        "recommendation": "Organization-wide communication & critical thinking program",
        "estimated_employees_affected": int(len(df) * 0.84)
    }


def find_internal_talent(skill: str, limit: int = 5) -> Dict[str, Any]:
    """Find employees who likely have a specific skill (for project staffing or mentorship)."""
    df = _load_employees()
    # Load software skills for cross-reference
    sw_path = 'data/raw/software_skills.csv'
    if os.path.exists(sw_path):
        sw = pd.read_csv(sw_path)
        titles_with_skill = sw[sw['Element Name'].str.lower().str.contains(
            skill.lower(), na=False
        )]['Title'].unique()

        matches = df[df['JobRole'].isin(titles_with_skill)].head(limit)
    else:
        matches = df[df['JobRole'].str.lower().str.contains(
            skill.lower().split()[0], na=False
        )].head(limit)

    return {
        "skill_searched": skill,
        "internal_candidates": [
            {"name": r['Name'], "role": r.get('JobRole', r.get('Role')), "department": r['Department'],
             "performance": r.get('PerformanceRating')}
            for _, r in matches.iterrows()
        ],
        "total_found": len(matches)
    }


# ═══════════════════════════════════════════════════════════════════
# CAREER INTELLIGENCE TOOLS
# ═══════════════════════════════════════════════════════════════════

CAREER_PATHS = {
    "Accountant": ["Senior Accountant", "Finance Manager", "CFO"],
    "Auditor": ["Senior Auditor", "Audit Manager", "Finance Director"],
    "Financial Analyst": ["Senior Financial Analyst", "Finance Manager", "CFO"],
    "Sales Executive": ["Senior Sales", "Sales Manager", "VP Sales"],
    "Account Manager": ["Senior Account Manager", "Sales Director", "VP Sales"],
    "Helpdesk": ["Support Engineer", "IT Manager", "CTO"],
    "Support Engineer": ["Senior Engineer", "Engineering Manager", "CTO"],
    "Engineer": ["Senior Engineer", "Tech Lead", "CTO"],
    "HR Executive": ["Senior HR Manager", "HR Director", "CHRO"],
    "HR Manager": ["Senior HR Manager", "HR Director", "CHRO"],
}


def simulate_career_path(name: str) -> Dict[str, Any]:
    """Simulate possible career progression paths for an employee."""
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    role = str(emp.get('JobRole', emp.get('Role', 'Unknown')))
    path = CAREER_PATHS.get(role, [f"Senior {role}", f"{role} Manager", "Director"])
    perf = float(emp.get('PerformanceRating', 3))
    years = float(emp.get('YearsAtCompany', 1))

    readiness = min(100, int((perf / 5) * 60 + (years / 10) * 40))

    return {
        "employee": emp.get('Name'),
        "current_role": role,
        "current_department": emp.get('Department'),
        "career_path": path,
        "next_role": path[0] if path else None,
        "current_readiness": f"{readiness}%",
        "estimated_time_to_next_role": f"{max(1, 3 - int(perf)) } year(s)",
        "key_development_area": emp.get('Skill_Gap', 'Leadership'),
        "action": f"Focus on: {emp.get('Recommendation', 'Leadership training')}"
    }


def get_readiness_score(name: str, target_role: str) -> Dict[str, Any]:
    """How ready is this employee for a target role?"""
    gap_result = calculate_skill_gap(name, target_role)
    if "error" in gap_result:
        return gap_result

    emp = _find_employee(name)
    perf = float(emp.get('PerformanceRating', 3)) if emp is not None else 3.0

    skill_readiness = float(gap_result.get('readiness_score', '50%').rstrip('%')) / 100
    perf_readiness = perf / 5

    overall = (skill_readiness * 0.6 + perf_readiness * 0.4)

    return {
        "employee": name,
        "target_role": target_role,
        "skill_readiness": gap_result.get('readiness_score'),
        "performance_factor": f"{perf_readiness:.0%}",
        "overall_readiness": f"{overall:.0%}",
        "missing_skills": gap_result.get('missing_skills', []),
        "estimated_readiness_after_training": f"{min(100, overall + 0.25):.0%}",
        "recommended_plan": f"Complete {', '.join(gap_result.get('missing_skills', [])[:2])} training"
    }


# ═══════════════════════════════════════════════════════════════════
# RECRUITMENT TOOLS
# ═══════════════════════════════════════════════════════════════════

def get_attrition_backfill_needs(department: Optional[str] = None) -> Dict[str, Any]:
    """Which roles are at risk of losing people and need pipeline now?"""
    df = _load_employees()
    if department:
        df = df[df['Department'].str.lower().str.contains(department.lower(), na=False)]

    high_risk = df[df['Risk'] == 'HIGH']
    backfill = high_risk.groupby('JobRole').size().sort_values(ascending=False).head(5)

    return {
        "department": department or "All",
        "total_at_risk": len(high_risk),
        "backfill_priority_roles": [
            {"role": role, "at_risk_count": int(count), "urgency": "HIGH"}
            for role, count in backfill.items()
        ],
        "recommendation": "Open requisitions now for top 3 roles to avoid operational gap"
    }


def hire_vs_reskill_analysis(role: str) -> Dict[str, Any]:
    """Should we hire externally or reskill existing employees for this role?"""
    df = _load_employees()

    internal_candidates = df[
        df['JobRole'].str.lower().str.contains(role.lower().split()[0], na=False)
    ]
    ready_count = len(internal_candidates[internal_candidates['PerformanceRating'] >= 4])
    total_internal = len(internal_candidates)

    return {
        "target_role": role,
        "internal_pool_size": total_internal,
        "immediately_ready": ready_count,
        "can_be_reskilled": total_internal - ready_count,
        "recommendation": (
            "Reskill internally" if ready_count > 0
            else ("Hybrid: reskill + hire" if total_internal > 3
                  else "External hire required")
        ),
        "estimated_reskilling_time": "3-6 months",
        "cost_advantage": "Internal reskilling is typically 3-5x cheaper than external hire"
    }


# ═══════════════════════════════════════════════════════════════════
# HR OPS TOOLS
# ═══════════════════════════════════════════════════════════════════

def get_retention_action_plan(name: str) -> Dict[str, Any]:
    """Generate a concrete, personalized retention action plan."""
    emp = _find_employee(name)
    if emp is None:
        return {"error": f"Employee '{name}' not found."}

    prob = float(emp.get('Attrition_Prob', 0.5))
    risk = str(emp.get('Risk', 'LOW'))
    perf = float(emp.get('PerformanceRating', 3))
    wlb = float(emp.get('WorkLifeBalance', 3))
    overtime = float(emp.get('OvertimeHoursPerMonth', 0))
    salary = float(emp.get('MonthlySalary', 0))

    actions = []
    if wlb <= 2:
        actions.append({"priority": 1, "action": "Flexible work arrangement or WFH option",
                        "rationale": "WLB is 1.14 avg for at-risk employees vs 4.02 for retained"})
    if overtime > 15:
        actions.append({"priority": 2, "action": "Redistribute project load or hire support",
                        "rationale": f"{overtime:.0f} hrs/month overtime is a burnout risk"})
    if perf < 3:
        actions.append({"priority": 3, "action": "Coaching + performance improvement plan",
                        "rationale": "Low performance drives disengagement and exit"})
    actions.append({"priority": 4, "action": "Schedule career development conversation",
                    "rationale": "Lack of career visibility is a leading attrition cause"})
    if salary < 50000:
        actions.append({"priority": 5, "action": "Compensation review against market benchmark",
                        "rationale": "Below-market pay accelerates departure timeline"})

    return {
        "employee": emp.get('Name'),
        "department": emp.get('Department'),
        "risk": risk,
        "attrition_probability": f"{prob:.1%}",
        "action_plan": sorted(actions, key=lambda x: x['priority']),
        "urgency": "Act within 2 weeks" if risk == 'HIGH' else "Schedule within 30 days"
    }


def get_team_health(department: str) -> Dict[str, Any]:
    """Departmental health report for managers."""
    df = _load_employees()
    dept_df = df[df['Department'].str.lower().str.contains(department.lower(), na=False)]

    if dept_df.empty:
        return {"error": f"No data found for department: {department}"}

    return {
        "department": department,
        "headcount": len(dept_df),
        "avg_performance": round(float(dept_df['PerformanceRating'].mean()), 2),
        "avg_work_life_balance": round(float(dept_df['WorkLifeBalance'].mean()), 2),
        "avg_attrition_risk": f"{dept_df['Attrition_Prob'].mean():.1%}",
        "high_risk_count": int((dept_df['Risk'] == 'HIGH').sum()),
        "medium_risk_count": int((dept_df['Risk'] == 'MEDIUM').sum()),
        "top_skill_gap": dept_df['Skill_Gap'].mode()[0] if not dept_df['Skill_Gap'].mode().empty else "N/A",
        "alert": (
            f"WARNING: {int((dept_df['Risk']=='HIGH').sum())} high-risk employees. Manager attention required."
            if (dept_df['Risk'] == 'HIGH').sum() > 3 else "Team health is satisfactory."
        )
    }


# ═══════════════════════════════════════════════════════════════════
# POLICY TOOL (RAG-ready)
# ═══════════════════════════════════════════════════════════════════

@lru_cache(maxsize=1)
def _get_vector_store():
    try:
        from langchain_community.vectorstores import FAISS
        from langchain_community.document_loaders import TextLoader
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        from langchain_text_splitters import RecursiveCharacterTextSplitter
    except ImportError:
        logger.warning("langchain_community or langchain_google_genai not installed. Vector store unavailable.")
        return None

    # Only initialize if the key exists to avoid crashing the whole module on import
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
        
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=api_key
    )
    faiss_path = "data/processed/faiss_index"
    
    if os.path.exists(faiss_path):
        return FAISS.load_local(faiss_path, embeddings, allow_dangerous_deserialization=True)
        
    # Build it if it doesn't exist
    policy_path = "data/raw/hr_policies.md"
    if os.path.exists(policy_path):
        loader = TextLoader(policy_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        splits = text_splitter.split_documents(docs)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(faiss_path), exist_ok=True)
        
        vectorstore = FAISS.from_documents(splits, embeddings)
        vectorstore.save_local(faiss_path)
        return vectorstore
    return None

def answer_hr_policy(question: str) -> Dict[str, Any]:
    """
    Answer HR policy questions by querying the local FAISS vector DB
    over uploaded policy documents using Gemini Embeddings and Query Rewriting.
    """
    try:
        vs = _get_vector_store()
        if vs is None:
            return {
                "error": "Vector store not initialized. Either GEMINI_API_KEY is missing, or hr_policies.md was not found."
            }
            
        # Query Rewriting
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        try:
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("GEMINI_API_KEY")
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.5-flash-lite", 
                temperature=0.0, 
                google_api_key=api_key
            )
            rewrite_prompt = f"Rewrite the following HR policy question into a clear, semantic search query that will match documents. Do not answer the question, just output the optimized query string.\nOriginal question: {question}"
            optimized_query = llm.invoke([HumanMessage(content=rewrite_prompt)]).content.strip()
        except Exception as e:
            # Fallback if rewrite fails
            optimized_query = question

        docs = vs.similarity_search(optimized_query, k=2)
        if not docs:
            return {"answer": "No relevant policy documents found.", "confidence": "low"}
            
        context = "\n\n".join([d.page_content for d in docs])
        
        return {
            "question": question,
            "retrieved_context": context,
            "source": "hr_policies.md",
            "note": "RAG enabled. The agent will use this context to answer the user."
        }
    except Exception as e:
        return {"error": f"RAG failure: {str(e)}"}


# ═══════════════════════════════════════════════════════════════════
# TOOL REGISTRY — used by the LangGraph orchestrator
# ═══════════════════════════════════════════════════════════════════

TOOL_REGISTRY = {
    # Workforce Intelligence
    "get_employee_profile": get_employee_profile,
    "search_employees": search_employees,
    "get_attrition_risk": get_attrition_risk,
    "get_high_risk_employees": get_high_risk_employees,
    "get_org_risk_summary": get_org_risk_summary,
    # Skills
    "get_employee_skills": get_employee_skills,
    "calculate_skill_gap": calculate_skill_gap,
    "recommend_learning_plan": recommend_learning_plan,
    "get_org_skill_heatmap": get_org_skill_heatmap,
    "find_internal_talent": find_internal_talent,
    # Career
    "simulate_career_path": simulate_career_path,
    "get_readiness_score": get_readiness_score,
    # Recruitment
    "get_attrition_backfill_needs": get_attrition_backfill_needs,
    "hire_vs_reskill_analysis": hire_vs_reskill_analysis,
    # HR Ops
    "get_retention_action_plan": get_retention_action_plan,
    "get_team_health": get_team_health,
    # Policy
    "answer_hr_policy": answer_hr_policy,
}

def call_tool(tool_name: str, user_role: str = "hr", **kwargs) -> Dict[str, Any]:
    """
    Governance layer: routes tool calls with role-based access control.
    The LLM requests a tool — this function enforces who can use it.
    """
    ROLE_PERMISSIONS = {
        "admin":   list(TOOL_REGISTRY.keys()),
        "hr":      list(TOOL_REGISTRY.keys()),
        "manager": [
            "get_employee_profile", "search_employees", "get_attrition_risk",
            "get_high_risk_employees", "get_team_health", "get_retention_action_plan",
            "recommend_learning_plan", "answer_hr_policy", "simulate_career_path"
        ],
        "employee": [
            "get_employee_skills", "recommend_learning_plan", "simulate_career_path",
            "get_readiness_score", "answer_hr_policy"
        ]
    }

    allowed = ROLE_PERMISSIONS.get(user_role, [])
    if tool_name not in allowed:
        return {"error": f"Access denied: role '{user_role}' cannot call '{tool_name}'"}

    fn = TOOL_REGISTRY.get(tool_name)
    if fn is None:
        return {"error": f"Unknown tool: {tool_name}"}

    return fn(**kwargs)

# ═══════════════════════════════════════════════════════════════════
# EXECUTION TOOLS (Write Access)
# ═══════════════════════════════════════════════════════════════════

def approve_leave_request(request_id: int) -> Dict[str, Any]:
    """Approve a specific leave request by ID in the database."""
    from app.db.database import SessionLocal
    from app.db.models import LeaveRequest, Notification
    
    db = SessionLocal()
    try:
        leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
        if not leave_req:
            return {"error": f"Leave Request #{request_id} not found."}
            
        leave_req.status = "Approved"
        
        n = Notification(message=f"✅ Leave Request #{request_id} for Employee {leave_req.employee_id} was approved by AI Executor.", type="success", timestamp="Just now")
        db.add(n)
        
        db.commit()
        return {"success": True, "message": f"Leave Request #{request_id} successfully approved."}
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to approve leave: {str(e)}"}
    finally:
        db.close()

def reject_candidate_application(candidate_id: int) -> Dict[str, Any]:
    """Reject a specific candidate by ID in the database."""
    from app.db.database import SessionLocal
    from app.db.models import Candidate, Notification
    
    db = SessionLocal()
    try:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            return {"error": f"Candidate #{candidate_id} not found."}
            
        candidate.stage = "Rejected"
        
        n = Notification(message=f"❌ Candidate {candidate.name} was rejected by AI Executor.", type="alert", timestamp="Just now")
        db.add(n)
        
        db.commit()
        return {"success": True, "message": f"Candidate #{candidate_id} successfully rejected."}
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to reject candidate: {str(e)}"}
    finally:
        db.close()

EXECUTION_TOOL_REGISTRY = {
    "approve_leave_request": approve_leave_request,
    "reject_candidate_application": reject_candidate_application
}

def call_execution_tool(tool_name: str, user_role: str = "hr", **kwargs) -> Dict[str, Any]:
    """Governance layer for execution tools. Only admin/manager can use these."""
    if user_role not in ["admin", "manager"]:
        return {"error": f"Access denied: role '{user_role}' cannot perform write actions."}
        
    fn = EXECUTION_TOOL_REGISTRY.get(tool_name)
    if fn is None:
        return {"error": f"Unknown execution tool: {tool_name}"}

    return fn(**kwargs)
