import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.models import DataAccessAuditLog

def mask_name(name: Optional[str]) -> str:
    """Mask employee full name for non-admin viewers (e.g. 'Rahul Sharma' -> 'R*** S***')."""
    if not name:
        return "Anonymous Employee"
    parts = name.strip().split()
    masked_parts = [f"{p[0]}***" if len(p) > 1 else p for p in parts]
    return " ".join(masked_parts)

def mask_bank_account(account_num: Optional[str]) -> str:
    """Redact bank account details displaying only trailing 4 digits."""
    if not account_num:
        return "•••• •••• ••••"
    clean = str(account_num).strip()
    if len(clean) <= 4:
        return "•••• " + clean
    return f"•••• •••• {clean[-4:]}"

def mask_salary_to_range(salary: Optional[float]) -> str:
    """Convert exact compensation into confidential standard salary bands."""
    if salary is None or salary <= 0:
        return "Confidential Band"
    # Create 25,000 INR bandwidths
    lower = int((salary // 25000) * 25000)
    upper = lower + 25000
    return f"₹{lower:,} - ₹{upper:,} / month"

def anonymize_employee_profile(emp_data: Dict[str, Any], role: str = "AUDITOR") -> Dict[str, Any]:
    """
    Apply DPDP Act 2023 role-based masking rules to employee profile records.
    Roles:
      - HR_ADMIN / SUPERADMIN: Full raw access (unmasked)
      - MANAGER: Partial masking (names visible, financials masked)
      - AUDITOR / ANALYST / GUEST: Full pseudonymization and redaction
    """
    clean = dict(emp_data)
    normalized_role = role.upper() if role else "AUDITOR"

    if normalized_role in ["HR_ADMIN", "ADMIN", "SUPERADMIN"]:
        clean["_dpdp_mask_status"] = "UNMASKED"
        return clean

    if normalized_role in ["MANAGER", "LEAD"]:
        clean["AccountNumber"] = mask_bank_account(clean.get("AccountNumber"))
        clean["RoutingNumber"] = "••••••••"
        clean["MonthlySalary"] = mask_salary_to_range(clean.get("MonthlySalary"))
        clean["_dpdp_mask_status"] = "PARTIALLY_MASKED_FINANCIALS"
        return clean

    # Full pseudonymization for AUDITOR / PUBLIC / EXTERNAL
    salt = "enterprise_dpdp_salt_2026"
    raw_id = str(clean.get("GlobalID", clean.get("id", "")))
    pseudo_hash = hashlib.sha256((raw_id + salt).encode()).hexdigest()[:8].upper()

    clean["GlobalID"] = f"EMP_{pseudo_hash}"
    clean["Name"] = mask_name(clean.get("Name"))
    clean["AccountNumber"] = "•••• •••• ••••"
    clean["RoutingNumber"] = "••••••••"
    clean["BankName"] = "REDACTED"
    clean["MonthlySalary"] = mask_salary_to_range(clean.get("MonthlySalary"))
    clean["TaxStatus"] = "REDACTED"
    clean["_dpdp_mask_status"] = "FULLY_ANONYMIZED"
    return clean

def record_data_access(
    db: Session,
    accessor_user: str,
    accessor_role: str,
    target_employee_id: int,
    access_type: str = "READ_PROFILE",
    fields_exposed: str = "MASKED",
    ip_address: Optional[str] = None
):
    """Log access to employee PII/flight-risk for DPDP Act compliance audit."""
    log = DataAccessAuditLog(
        accessor_user=accessor_user,
        accessor_role=accessor_role,
        target_employee_id=target_employee_id,
        access_type=access_type,
        fields_exposed=fields_exposed,
        ip_address=ip_address,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()

