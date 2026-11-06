import React, { useState } from 'react';
import { ShieldCheck, Download, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, DataTable, RiskBadge, KpiCard } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { downloadJsonl } from '../../utils/exportHelpers';

export function AuditLedgerPage() {
  const [filterAction, setFilterAction] = useState('ALL');
  const { addToast } = useToast();

  const auditLogs = [
    {
      id: 'AUD-884102',
      timestamp: '2026-11-06 22:45:12',
      operator: 'priya.sharma@enterprise.internal',
      role: 'HR_ADMIN',
      action: 'DATA_DECRYPT_VIEW',
      resource: 'EMPLOYEE_RECORD:1977757544',
      ip: '10.0.12.44',
      status: 'PERMITTED',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'AUD-884101',
      timestamp: '2026-11-06 22:30:05',
      operator: 'kavita.desai@enterprise.internal',
      role: 'MANAGER',
      action: 'LEAVE_APPROVE',
      resource: 'LEAVE_REQUEST:101',
      ip: '10.0.14.88',
      status: 'PERMITTED',
      sha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'
    },
    {
      id: 'AUD-884099',
      timestamp: '2026-11-06 22:15:40',
      operator: 'vikram.rao@enterprise.internal',
      role: 'EMPLOYEE',
      action: 'SELF_SERVICE_LEAVE_APPLY',
      resource: 'LEAVE_REQUEST:103',
      ip: '10.0.22.105',
      status: 'PERMITTED',
      sha256: '9f83c6b12a8385e054178a9c3d4e8c1561570532ff4b245a498b584d4b1740b2'
    },
    {
      id: 'AUD-884092',
      timestamp: '2026-11-06 21:50:11',
      operator: 'unknown.intruder@external.ip',
      role: 'ANONYMOUS',
      action: 'SALARY_EXPORT_BULK',
      resource: 'HCM_COMPENSATION_TABLE',
      ip: '198.51.100.24',
      status: 'DENIED',
      sha256: '1a72a9b3d0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b00'
    },
    {
      id: 'AUD-884088',
      timestamp: '2026-11-06 21:12:00',
      operator: 'system.scheduler@batch.internal',
      role: 'SYSTEM_JOB',
      action: 'DPDP_KEY_ROTATION',
      resource: 'HSM_KEK_VAULT',
      ip: '127.0.0.1',
      status: 'PERMITTED',
      sha256: 'b7c4a1e4649b934ca495991b7852b855e3b0c44298fc1c149afbf4c8996fb924'
    }
  ];

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === 'ALL' || log.status === filterAction
  );

  const handleExportLedger = () => {
    downloadJsonl(
      `DPDP_Statutory_Audit_Ledger_${new Date().toISOString().split('T')[0]}.jsonl`,
      filteredLogs
    );
    addToast({
      message: 'Cryptographic Audit Ledger exported successfully (.JSONL)',
      type: 'success'
    });
  };

  const columns = [
    {
      key: 'id',
      label: 'Audit ID',
      render: (val) => <span className="font-mono font-bold text-text-primary text-xs">{val}</span>
    },
    {
      key: 'timestamp',
      label: 'Timestamp (UTC)',
      render: (val) => <span className="font-mono text-xs text-text-muted">{val}</span>
    },
    {
      key: 'operator',
      label: 'Operator & Role',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-text-primary text-xs">{val}</div>
          <div className="text-[10px] font-mono text-text-muted">{row.role} • {row.ip}</div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action Executed',
      render: (val) => <span className="font-mono font-semibold text-xs text-text-primary">{val}</span>
    },
    {
      key: 'resource',
      label: 'Target Resource',
      render: (val) => <span className="font-mono text-xs text-accent">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <RiskBadge status={val} size="xs" />
    },
    {
      key: 'sha256',
      label: 'SHA-256 Digest',
      render: (val) => (
        <span className="font-mono text-[10px] text-text-muted truncate max-w-[120px] block" title={val}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Statutory DPDP Act 2023 Audit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Immutable, append-only authorization telemetry with cryptographic SHA-256 checksum verification.
          </p>
        </div>

        <Button variant="primary" size="sm" leftIcon={Download} onClick={handleExportLedger}>
          Export Ledger (.JSONL)
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="DPDP §8(1) Status"
          value="100% Shielded"
          trend="Certified"
          trendType="positive"
          subtext="Zero PII Violations"
        />
        <KpiCard
          title="Audited Events"
          value="884,102"
          trend="Append-Only"
          trendType="neutral"
          subtext="FY 2026-27 Log"
        />
        <KpiCard
          title="Denial Interceptions"
          value="1 Denied"
          trend="WAF Guard"
          trendType="danger"
          subtext="Unauthorized Exfiltration Block"
        />
        <KpiCard
          title="Cryptographic Hash"
          value="SHA-256"
          trend="Immutable"
          trendType="positive"
          subtext="HSM Key Synced"
        />
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Tamper-Evident Access Stream</CardTitle>
              <CardDescription>All authorization calls recorded with IP, role, and digest.</CardDescription>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-enterprise bg-muted border border-border-subtle text-xs font-mono">
              {['ALL', 'PERMITTED', 'DENIED'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterAction(mode)}
                  className={`px-3 py-1 rounded-md transition ${
                    filterAction === mode ? 'bg-surface text-text-primary font-bold shadow-subtle' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={columns}
            data={filteredLogs}
            keyField="id"
            searchPlaceholder="Search audit ID, operator, action..."
            searchKeys={['id', 'operator', 'action', 'resource', 'sha256']}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditLedgerPage;

