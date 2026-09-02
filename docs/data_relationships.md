# Data Relationships

- **employee_attrition_processed.csv** <-> **engagement_processed.csv**: 
  - Join Key: `EmployeeID`
  - Type: 1:1 relationship
  - Reasoning: Both describe a single employee entity.
- **employee_attrition_processed.csv** <-> **occupation_master.csv**: 
  - Join Key: `JobRole` and `Department` (together form the link to `RoleID`)
  - Type: Many:1 relationship (Many employees can have the same Role)
  - Reasoning: Employees map to standard roles.
- **occupation_master.csv** <-> **essential_skills_processed.csv**: 
  - Join Key: `RoleID`
  - Type: 1:Many relationship
  - Reasoning: A role has multiple required skills.
- **occupation_master.csv** <-> **software_skills_processed.csv**: 
  - Join Key: `RoleID`
  - Type: 1:Many relationship
  - Reasoning: A role requires multiple software tools.

```
EMPLOYEE
   +-- EmployeeID --- Engagement Data
   +-- JobRole ------ Occupation Data (RoleID)
                            +-- Essential Skills
                            +-- Software Skills
```
