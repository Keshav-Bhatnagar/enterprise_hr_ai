from pydantic import BaseModel, Field
from typing import Optional, List

class EmployeeInput(BaseModel):
    EmployeeID: int = Field(..., description="Unique ID of the employee")
    Age: int = Field(..., ge=18, le=100, description="Age of the employee")
    Department: str = Field(..., description="Department name")
    JobRole: str = Field(..., description="Job role")
    OverTime: str = Field(..., pattern="^(Yes|No)$", description="Whether employee works overtime")
    JobSatisfaction: int = Field(..., ge=1, le=5, description="Job satisfaction rating")
    MonthlyIncome: int = Field(..., ge=1000, description="Monthly income in USD")
    YearsAtCompany: int = Field(..., ge=0, description="Years at the company")
    WorkLifeBalance: int = Field(..., ge=1, le=5, description="Work life balance rating")

class AttritionPrediction(BaseModel):
    EmployeeID: int
    Probability: float
    RiskLevel: str
    TopFactors: List[str]
