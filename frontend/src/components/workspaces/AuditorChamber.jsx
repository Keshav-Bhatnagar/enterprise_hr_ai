import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  BarChart3,
  Clock,
  Key,
  Sliders
} from 'lucide-react';
import { downloadJsonl } from '../../utils/exportHelpers';

export default function AuditorChamber({ theme = 'slate' }) {
  const [activeSubView, setActiveSubView] = useState('logs'); // logs, bias, retention
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditExported, setAuditExported] = useState(false);

  // Interactive EEOC Impact Slider
  const [selectionThreshold, setSelectionThreshold] = useState(80);

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

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || log.status === filterAction;
    return matchesSearch && matchesFilter;
  });

  const handleExportLedger = () => {
    downloadJsonl(
      `DPDP_Statutory_Audit_Ledger_${new Date().toISOString().split('T')[0]}.jsonl`,
      filteredLogs
    );
    setAuditExported(true);
    setTimeout(() => setAuditExported(false), 3000);
  };

  return (
    <div className="space-y-8 font-body text-text-primary">
      {/* STATS LEDGER */}
      <div className="bg-card border border-border-subtle rounded-xl py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle shadow-md">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-emerald-500 leading-tight">
            100% <span className="text-sm font-mono text-emerald-400">Shielded</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            DPDP §8(1) Compliance
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-sky-500 leading-tight">
            0.88 <span className="text-xs font-mono text-sky-400">EEOC Ratio</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Algorithmic Fairness
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-text-primary leading-tight">
            1,420 <span className="text-sm font-mono text-text-secondary">AES-256</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Pseudonymized Records
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[22px] font-mono font-bold text-amber-500 leading-tight truncate">
            SHA-256
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Ledger Digest
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3 flex-wrap">
        {[
          { id: 'logs', label: 'Statutory DPDP Audit Stream', icon: ShieldCheck },
          { id: 'bias', label: 'Algorithmic Fairness & Bias Review', icon: BarChart3 },
          { id: 'retention', label: 'Data Retention & Section 12 Erasure', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                active
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-card-hover'
              }`}
            >
              <Icon className={`size-3.5 ${active ? 'text-slate-950' : 'text-text-secondary'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: STATUTORY DPDP AUDIT STREAM */}
      {activeSubView === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">Immutable Access & Audit Stream</h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                Every authorization event signed with SHA-256 and recorded in append-only storage
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search audit ID, operator, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-card-subtle border border-border-subtle rounded-lg text-xs font-mono text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-sky-500 min-h-[44px]"
              />

              <button
                type="button"
                onClick={handleExportLedger}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 rounded-lg text-xs font-mono font-bold transition min-h-[44px]"
              >
                <Download className="size-3.5" />
                <span>{auditExported ? 'Ledger Exported (.JSONL)' : 'Export Ledger (.JSONL)'}</span>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border-subtle rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-card-subtle text-text-secondary uppercase text-[10px] tracking-wider border-b border-border-subtle">
                  <tr>
                    <th className="p-3.5">Audit ID</th>
                    <th className="p-3.5">Timestamp (UTC)</th>
                    <th className="p-3.5">Operator & Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Resource</th>
                    <th className="p-3.5">Outcome</th>
                    <th className="p-3.5">SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-card-hover transition">
                      <td className="p-3.5 font-bold text-text-primary">{log.id}</td>
                      <td className="p-3.5 text-text-muted">{log.timestamp}</td>
                      <td className="p-3.5">
                        <div className="text-text-primary font-semibold">{log.operator}</div>
                        <div className="text-[10px] text-text-muted">{log.role} • {log.ip}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-text-primary">{log.action}</td>
                      <td className="p-3.5 text-sky-500">{log.resource}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'PERMITTED'
                              ? 'border border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border border-rose-500/40 text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[10px] text-text-muted font-mono truncate max-w-[120px]">
                        {log.sha256}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALGORITHMIC FAIRNESS & BIAS REVIEW */}
      {activeSubView === 'bias' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
              <h3 className="font-display text-lg font-bold text-text-primary">EEOC Four-Fifths (80%) Fairness Audit</h3>
              <p className="text-xs text-text-secondary font-mono">
                Mandatory bias auditing for machine learning models (XGBoost Retention & ATS Resume Scoring)
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { metric: 'Gender Disparate Impact Ratio', score: 0.91, benchmark: '0.80', status: 'PASS', desc: 'Selection rate of females vs males in ATS hiring' },
                  { metric: 'Age Demographic Parity (>40 vs <40)', score: 0.86, benchmark: '0.80', status: 'PASS', desc: 'Retention intervention proposal distribution' },
                  { metric: 'Department Compensation Equity Index', score: 0.88, benchmark: '0.80', status: 'PASS', desc: 'Internal salary band variance across equal tiers' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-text-primary">{item.metric}</span>
                      <span className="text-emerald-500 font-bold border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                        {item.status} ({item.score} / {item.benchmark})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-border-subtle">
                      <div className="h-full bg-emerald-500" style={{ width: `${item.score * 100}%` }}></div>
                    </div>
                    <div className="text-[11px] text-text-secondary font-body">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 shadow-md">
              <h4 className="font-display font-bold text-text-primary text-base">Model Governance Certificate</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Retention model ROC-AUC 1.0 calibrated against historical enterprise dataset without protected class features.
              </p>
              <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Model ID:</span>
                  <span className="text-text-primary font-bold">XGB-V2-STABLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Protected Features:</span>
                  <span className="text-emerald-500 font-bold">ZERO (Strictly Excluded)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Audited By:</span>
                  <span className="text-text-primary font-semibold">Adv. Rajiv Nair (DPO)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DATA RETENTION & ANONYMIZATION */}
      {activeSubView === 'retention' && (
        <div className="space-y-6">
          <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
            <h3 className="font-display text-lg font-bold text-text-primary">Right to be Forgotten & Retention Schedule</h3>
            <p className="text-xs text-text-secondary font-mono">
              Statutory compliance under DPDP Section 12 (Erasure of Personal Data)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-2">
                <div className="text-[10.5px] font-mono text-text-muted uppercase">Pending Erasure Requests</div>
                <div className="text-2xl font-display font-bold text-text-primary">0 <span className="text-xs font-mono text-emerald-500">Clean Queue</span></div>
                <p className="text-[11px] text-text-secondary">Zero outstanding employee data deletion requests.</p>
              </div>

              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-2">
                <div className="text-[10.5px] font-mono text-text-muted uppercase">Retention Lifecycle Policy</div>
                <div className="text-2xl font-display font-bold text-text-primary">7 Years</div>
                <p className="text-[11px] text-text-secondary">Tax and payroll logs archived; candidate resumes purged at 180 days.</p>
              </div>

              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-2">
                <div className="text-[10.5px] font-mono text-text-muted uppercase">Pseudonymization Key</div>
                <div className="text-2xl font-display font-bold text-text-primary">HSM Rotated</div>
                <p className="text-[11px] text-text-secondary">Hardware security module keys rotated every 90 days.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
