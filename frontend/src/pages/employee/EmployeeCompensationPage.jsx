import React from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, KpiCard } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { downloadPayslipReceipt } from '../../utils/exportHelpers';

export function EmployeeCompensationPage({ currentUser }) {
  const { addToast } = useToast();

  const handleDownloadPayslip = () => {
    downloadPayslipReceipt(currentUser || { name: 'Vikramaditya Rao' });
    addToast({
      message: 'October 2026 Payslip Receipt downloaded (.TXT)',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Compensation & Monthly Pay Slips
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Pay Period: October 2026 • Disbursed via Corporate ICICI Host-to-Host Gateway.
          </p>
        </div>

        <Button variant="primary" size="sm" leftIcon={Download} onClick={handleDownloadPayslip}>
          Download Payslip (.TXT)
        </Button>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Net Monthly Disbursement"
          value="₹1,42,850"
          trend="Settled"
          trendType="positive"
          subtext="ICICI UTR #98412891"
        />
        <KpiCard
          title="Gross Monthly CTC"
          value="₹1,55,000"
          trend="Band L7"
          trendType="neutral"
          subtext="Annualized ₹18,60,000"
        />
        <KpiCard
          title="Tax Regime Applied"
          value="Sec 115BAC"
          trend="New Regime"
          trendType="positive"
          subtext="Standard Deduction ₹75,000"
        />
      </div>

      {/* Pay Slip Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Itemized Monthly Earnings & Deductions</CardTitle>
              <CardDescription>Form 16 statutory breakdown under Indian Income Tax Act 1961.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-status-success pb-1 border-b border-border-subtle">
                    Gross Earnings
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Basic Salary:</span>
                      <span className="text-text-primary font-bold">₹85,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">House Rent Allowance (HRA):</span>
                      <span className="text-text-primary font-bold">₹35,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Special Research Allowance:</span>
                      <span className="text-text-primary font-bold">₹25,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Flexible Benefit Plan (FBP):</span>
                      <span className="text-text-primary font-bold">₹10,000</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                      <span>Total Gross:</span>
                      <span className="text-status-success">₹1,55,000</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-status-warning pb-1 border-b border-border-subtle">
                    Statutory Deductions
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Provident Fund (EPF Employee):</span>
                      <span className="text-text-primary font-bold">₹4,200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Professional Tax (PT Karnataka):</span>
                      <span className="text-text-primary font-bold">₹200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Income Tax (TDS New Regime):</span>
                      <span className="text-text-primary font-bold">₹7,750</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                      <span>Total Deductions:</span>
                      <span className="text-status-warning">₹12,150</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Banner */}
              <div className="p-4 rounded-enterprise bg-muted border border-border-subtle flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Net Take-Home Disbursed
                  </div>
                  <div className="text-2xl font-mono font-bold text-text-primary mt-0.5">
                    ₹1,42,850
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-status-success font-semibold">
                  UTR #ICICI98412891 • Disbursed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Identifiers */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax & PF Identifiers</CardTitle>
              <CardDescription>Verified corporate payroll identity metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">EPFO UAN:</span>
                  <span className="text-text-primary font-bold">101994821092</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PAN (Masked):</span>
                  <span className="text-text-primary font-semibold">ABC*****9F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax Regime:</span>
                  <span className="text-status-success font-semibold">Section 115BAC (New)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Form 16 Part A/B:</span>
                  <span className="text-accent font-semibold">Digitally Signed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCompensationPage;
