import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Download, AlertCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, KpiCard } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';

export function PayrollPage({ onRunPayroll }) {
  const [payrollProcessed, setPayrollProcessed] = useState(false);
  const { addToast } = useToast();

  const handleRunPayroll = () => {
    setPayrollProcessed(true);
    if (onRunPayroll) onRunPayroll();
    addToast({
      message: 'November 2026 Payroll Batch disbursed to Corporate ICICI Portal',
      type: 'success',
      actionLabel: 'Undo Batch',
      onAction: () => {
        setPayrollProcessed(false);
        addToast({ message: 'Payroll disbursal batch reversed to draft stage.', type: 'info' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Corporate Payroll Register
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Monthly Disbursal Cycle • FY 2026-27 • Indian Section 192 TDS & EPF/ESI Compliant.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={DollarSign}
          disabled={payrollProcessed}
          onClick={handleRunPayroll}
        >
          {payrollProcessed ? 'Disbursal Batch Completed' : 'Run November Payroll'}
        </Button>
      </div>

      {/* Disbursal Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Gross Outflow"
          value="₹14,82,40,000"
          subtext="1,420 Active Employees"
        />
        <KpiCard
          title="Statutory EPF & ESI"
          value="₹1,77,88,800"
          trend="EPFO Synced"
          trendType="positive"
          subtext="Statutory Portal Direct Transfer"
        />
        <KpiCard
          title="Withheld Income Tax (TDS)"
          value="₹2,96,48,000"
          trend="Challan 281"
          trendType="neutral"
          subtext="New Regime Section 115BAC"
        />
      </div>

      {/* Register Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Cycle Telemetry & Banking Integration</CardTitle>
          <CardDescription>
            Real-time direct bank transfers executed via automated Corporate Host-to-Host protocols.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-enterprise bg-muted border border-border-subtle space-y-2 text-xs font-mono">
              <div className="font-semibold text-text-primary uppercase text-[11px] pb-1 border-b border-border-subtle">
                Statutory Regulatory Filing Deadlines
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Section 192 TDS Challan 281:</span>
                <span className="text-text-primary font-bold">7th December 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">EPFO ECR Monthly Return:</span>
                <span className="text-text-primary font-bold">15th December 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">ESIC Monthly Contribution:</span>
                <span className="text-text-primary font-bold">15th December 2026</span>
              </div>
            </div>

            <div className="p-4 rounded-enterprise bg-muted border border-border-subtle space-y-2 text-xs font-mono">
              <div className="font-semibold text-text-primary uppercase text-[11px] pb-1 border-b border-border-subtle">
                Host-to-Host Bank Gateway Status
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Primary Banking Partner:</span>
                <span className="text-text-primary font-bold">ICICI Corporate Banking</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Disbursal Pipeline:</span>
                <span className="text-status-success font-bold">NEFT / RTGS Auto-Routing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-status-success font-bold">{payrollProcessed ? 'Batch Disbursed' : 'Ready to Run'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollPage;
