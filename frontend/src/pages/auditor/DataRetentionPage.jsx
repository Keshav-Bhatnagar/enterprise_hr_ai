import React from 'react';
import { Lock, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KpiCard } from '../../components/primitives';

export function DataRetentionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Data Retention Lifecycle & Section 12 Erasure
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Statutory compliance under DPDP Section 12 (Right to Erasure of Personal Data) & HSM Key Lifecycles.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Pending Erasure Requests"
          value="0 Pending"
          trend="Clean Queue"
          trendType="positive"
          subtext="Zero Outstanding Grievances"
        />
        <KpiCard
          title="Payroll Retention Schedule"
          value="7 Years"
          trend="Statutory"
          trendType="neutral"
          subtext="Income Tax Act Requirement"
        />
        <KpiCard
          title="HSM Key Rotation"
          value="Every 90d"
          trend="Automated"
          trendType="positive"
          subtext="Hardware Security Module"
        />
      </div>

      {/* Detailed Lifecycle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Resume Purge</CardTitle>
            <CardDescription>Unsuccessful candidate PII data purging policy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-enterprise bg-muted border border-border-subtle space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted">Retention Window:</span>
                <span className="text-text-primary font-bold">180 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Purge Mechanism:</span>
                <span className="text-status-success font-semibold">DoD 5220.22-M Wipe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-status-success font-bold">Active Automated Cron</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax & Payroll Ledger</CardTitle>
            <CardDescription>Section 192 TDS and EPFO audit logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-enterprise bg-muted border border-border-subtle space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted">Statutory Window:</span>
                <span className="text-text-primary font-bold">7 Fiscal Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Storage Tier:</span>
                <span className="text-text-primary font-semibold">WORM Immutable Vault</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Encryption:</span>
                <span className="text-status-success font-bold">AES-256 GCM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HSM Key Vault Health</CardTitle>
            <CardDescription>Key Encryption Key (KEK) management.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-enterprise bg-muted border border-border-subtle space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted">Last Rotation:</span>
                <span className="text-text-primary font-bold">Today (00:00 UTC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Next Scheduled:</span>
                <span className="text-accent font-semibold">05 February 2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">FIPS 140-2 Level:</span>
                <span className="text-status-success font-bold">Level 3 Compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DataRetentionPage;
