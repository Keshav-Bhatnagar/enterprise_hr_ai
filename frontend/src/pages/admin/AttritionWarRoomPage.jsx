import React, { useState } from 'react';
import { Box, Table, Download, ShieldAlert, Sparkles, UserCheck, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KpiCard, DataTable, RiskBadge, Button } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { downloadFile } from '../../utils/exportHelpers';
import Talent3DCube from '../../components/Talent3DCube';

export function AttritionWarRoomPage({ employees = [], onSelectEmployee }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' (default) | '3d'
  const { addToast } = useToast();

  const handleExportBoardMemo = () => {
    const memo = `================================================================================
CONFIDENTIAL BOARDROOM BRIEFING MEMORANDUM
TO: BOARD OF DIRECTORS & CHIEF FINANCIAL OFFICER
FROM: PRIYA SHARMA (CHIEF HUMAN RESOURCES OFFICER)
DATE: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
SUBJECT: WORKFORCE TALENT PRESERVATION & ATTRITION RISK MITIGATION
================================================================================

1. EXECUTIVE SUMMARY & WORKFORCE TELEMETRY
--------------------------------------------------------------------------------
Total Enterprise Headcount  : 1,420 Active Employees
Critical Flight Danger      : 14 High-Impact Talents (>75% probability)
Gross Monthly Payroll Outflow: ₹14,82,40,000 (November 2026 Run)
Statutory EPF & ESI Synced  : ₹1,77,88,800
Annual Attrition Risk Value : ₹9,80,00,000

2. PREDICTIVE RETENTION ROI & CAPITAL SAVINGS
--------------------------------------------------------------------------------
Identified High-Risk Talents: 14 Principal Engineers & Product Architects
Calculated Cost of Departure: ₹2,46,00,000 (Recruitment + Lost Ship Velocity)
Targeted Intervention Cost  : ₹62,00,000 (Market parity + Overtime caps)
NET PROJECTED CAPITAL SAVINGS: ₹1,84,00,000 (1.84 Crores Rupee Preservation)
PAYBACK PERIOD ON HR AI     : 38 Days post-deployment

3. STATUTORY COMPLIANCE & LEGAL CERTIFICATION
--------------------------------------------------------------------------------
DPDP Act 2023 Sec 8(1)      : 100% Certified & Shielded
EEOC Algorithmic Bias Score : 0.88 (Compliant with US/Indian Four-Fifths Rules)
Data Protection Officer     : Adv. Rajiv Nair (Formal Certification Signed)

================================================================================
End of Boardroom Briefing • Enterprise HR AI Platform • Confidential
================================================================================`;

    downloadFile(`Boardroom_Executive_Briefing_Memo_${new Date().toISOString().split('T')[0]}.txt`, memo, 'text/plain');
    addToast({
      message: 'Boardroom Executive Memo exported successfully (.TXT)',
      type: 'success'
    });
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'Employee Name & Role',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-text-primary text-sm">{row.name}</div>
          <div className="text-[11px] font-mono text-text-muted">{row.job_role} • {row.department}</div>
        </div>
      )
    },
    {
      key: 'salary_band',
      label: 'Compensation Band',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{val}</span>
    },
    {
      key: 'overtime_hours',
      label: 'Overtime (hrs)',
      render: (val) => (
        <span className={`font-mono text-xs font-semibold ${val >= 35 ? 'text-status-danger' : 'text-text-secondary'}`}>
          {val}h/mo
        </span>
      )
    },
    {
      key: 'attrition_probability',
      label: 'Flight Risk Score',
      render: (val, row) => {
        const pct = (val * 100).toFixed(1);
        const status = val >= 0.75 ? 'HIGH' : val >= 0.4 ? 'MEDIUM' : 'LOW';
        return (
          <div className="flex items-center gap-2">
            <RiskBadge status={status} label={`${pct}% (${status})`} size="sm" />
          </div>
        );
      }
    },
    {
      key: 'reason',
      label: 'Primary Predictive Driver',
      render: (val) => <span className="text-xs text-text-muted italic">{val}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Attrition War Room & Risk Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Predictive talent flight mitigation engine powered by calibrated XGBoost intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table | 3D Toggle (Table is default!) */}
          <div className="inline-flex p-1 rounded-enterprise bg-muted border border-border-subtle text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                viewMode === 'table' ? 'bg-surface text-text-primary font-bold shadow-subtle' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Table className="size-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                viewMode === '3d' ? 'bg-surface text-text-primary font-bold shadow-subtle' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Box className="size-3.5" />
              <span>3D Prism</span>
            </button>
          </div>

          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExportBoardMemo}>
            Export Memo (.TXT)
          </Button>
        </div>
      </div>

      {/* KPI Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Headcount"
          value="1,420"
          trend="+4.2%"
          trendType="positive"
          subtext="Active Enterprise Roster"
        />
        <KpiCard
          title="Critical Flight Risk"
          value="14"
          trend="Action Req"
          trendType="danger"
          subtext="Probability > 75%"
        />
        <KpiCard
          title="Projected Net Savings"
          value="₹1.84 Cr"
          trend="38d Payback"
          trendType="positive"
          subtext="Retention Intervention ROI"
        />
        <KpiCard
          title="Monthly Payroll Outflow"
          value="₹14.8 Cr"
          subtext="November 2026 Run"
        />
      </div>

      {/* Main View: Table (Default) or 3D Prism */}
      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>High-Risk Flight Roster</CardTitle>
                <CardDescription>Click any talent row to inspect flight drivers and generate counter-offers.</CardDescription>
              </div>
              <span className="text-xs font-mono text-status-danger bg-status-danger-bg border border-status-danger-border px-2.5 py-1 rounded-md font-semibold">
                Danger Threshold: &gt; 75%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={employees}
              keyField="global_id"
              searchPlaceholder="Filter high-risk talent..."
              searchKeys={['name', 'department', 'job_role', 'reason']}
              onRowClick={onSelectEmployee}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Volumetric 3D Coordinate Prism: Performance (X), Potential (Y), Flight Risk (Z)
            </h3>
            <span className="text-xs font-mono text-status-danger">Danger Plane at Z &gt; 75%</span>
          </div>

          <Talent3DCube
            employees={employees}
            onSelectEmployee={onSelectEmployee}
          />
        </div>
      )}
    </div>
  );
}

export default AttritionWarRoomPage;
