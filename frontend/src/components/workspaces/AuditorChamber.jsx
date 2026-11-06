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
  Key
} from 'lucide-react';

export default function AuditorChamber() {
  const [activeSubView, setActiveSubView] = useState('logs'); // logs, bias, retention
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      id: 'AUD-884095',
      timestamp: '2026-11-06 21:55:01',
      operator: 'unknown.service@external.gateway',
      role: 'ANONYMOUS',
      action: 'UNAUTHORIZED_COMPENSATION_PROBE',
      resource: 'PAYROLL_REGISTER',
      ip: '198.51.100.22',
      status: 'BLOCKED_403',
      sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    },
    {
      id: 'AUD-884088',
      timestamp: '2026-11-06 21:30:19',
      operator: 'rajiv.nair@enterprise.internal',
      role: 'AUDITOR',
      action: 'EEOC_BIAS_TELEMETRY_EXPORT',
      resource: 'MODEL_XGBOOST_V2',
      ip: '10.0.8.12',
      status: 'PERMITTED',
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    }
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchFilter = filterAction === 'ALL' || log.action.includes(filterAction);
    const matchSearch =
      !searchQuery ||
      log.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-8 font-body text-[#EDE7DC]">
      {/* EDITORIAL STATS ROW - DECISIONLENS LEDGER STYLE */}
      <div className="bg-[#101317] border border-l-4 border-[rgba(237,231,220,0.13)] border-l-[#EDE7DC] rounded-sm py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(237,231,220,0.13)] shadow-xs">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            100% <span className="text-sm font-mono text-[#2E6B72]">Certified</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            DPDP Act 2023 Sec 8(1)
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#2E6B72] leading-tight flex items-center gap-2">
            0.88 <span className="text-xs font-mono text-[#2E6B72] font-semibold">&gt; 0.80</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            EEOC Four-Fifths Fairness
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            1,420 <span className="text-sm font-mono text-[#9EA5A8]">AES-256</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Pseudonymized Records
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[22px] font-mono font-bold text-[#E8913C] leading-tight truncate">
            SHA-256
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Immutable Audit Ledger Hash
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR */}
      <div className="flex items-center gap-2 border-b border-[rgba(237,231,220,0.13)] pb-3">
        {[
          { id: 'logs', label: 'Statutory DPDP Audit Stream', icon: ShieldCheck },
          { id: 'bias', label: 'Algorithmic Fairness & Bias Review', icon: BarChart3 },
          { id: 'retention', label: 'Data Retention & Right to be Forgotten', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-mono transition ${
                active
                  ? 'bg-[#101317] border border-[#EDE7DC] text-[#EDE7DC] font-bold'
                  : 'text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#101317]/60'
              }`}
            >
              <Icon className={`size-3.5 ${active ? 'text-[#EDE7DC]' : 'text-[#6C7378]'}`} />
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
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Immutable Access & Audit Stream</h3>
              <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                Every authorization event cryptographically signed and stored in append-only storage
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search audit ID, operator, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs font-mono text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#EDE7DC]"
              />

              <button
                type="button"
                onClick={() => alert("Exporting certified immutable audit ledger: dpdp_audit_log_20261106.jsonl")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2E6B72] text-[#2E6B72] hover:text-[#EDE7DC] hover:border-[#EDE7DC] rounded-sm text-xs font-mono font-bold transition"
              >
                <Download className="size-3.5" />
                <span>Export Ledger (.JSONL)</span>
              </button>
            </div>
          </div>

          <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0C0E] text-[#6C7378] uppercase text-[10px] tracking-wider border-b border-[rgba(237,231,220,0.13)]">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Timestamp (UTC)</th>
                    <th className="p-3">Operator & Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Resource</th>
                    <th className="p-3">Outcome</th>
                    <th className="p-3">SHA-256 Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(237,231,220,0.06)] text-[#9EA5A8]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#0A0C0E]/50 transition">
                      <td className="p-3 font-bold text-[#EDE7DC]">{log.id}</td>
                      <td className="p-3 text-[#6C7378]">{log.timestamp}</td>
                      <td className="p-3">
                        <div className="text-[#EDE7DC]">{log.operator}</div>
                        <div className="text-[10px] text-[#6C7378]">{log.role} • {log.ip}</div>
                      </td>
                      <td className="p-3 font-semibold text-[#EDE7DC]">{log.action}</td>
                      <td className="p-3 text-[#2E6B72]">{log.resource}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'PERMITTED'
                              ? 'border border-[#2E6B72] text-[#2E6B72]'
                              : 'border border-red-500 text-red-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-[#6C7378] font-mono truncate max-w-[120px]">
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
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">EEOC Four-Fifths (80%) Fairness Audit</h3>
              <p className="text-xs text-[#9EA5A8] font-mono">
                Mandatory bias auditing for machine learning models (XGBoost Retention & ATS Resume Scoring)
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { metric: 'Gender Disparate Impact Ratio', score: 0.91, benchmark: '0.80', status: 'PASS', desc: 'Selection rate of females vs males in ATS hiring' },
                  { metric: 'Age Demographic Parity (&gt;40 vs &lt;40)', score: 0.86, benchmark: '0.80', status: 'PASS', desc: 'Retention intervention proposal distribution' },
                  { metric: 'Department Compensation Equity Index', score: 0.88, benchmark: '0.80', status: 'PASS', desc: 'Internal salary band variance across equal tiers' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-[#EDE7DC]">{item.metric}</span>
                      <span className="text-[#2E6B72] font-bold border border-[#2E6B72] px-2 py-0.5 rounded text-[10px]">
                        {item.status} ({item.score} / {item.benchmark})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#101317] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E6B72]" style={{ width: `${item.score * 100}%` }}></div>
                    </div>
                    <div className="text-[11px] text-[#6C7378] font-body">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-4">
              <h4 className="font-display font-bold text-[#EDE7DC] text-base">Model Governance Certificate</h4>
              <p className="text-xs text-[#9EA5A8] leading-relaxed">
                Retention model ROC-AUC 1.0 calibrated against historical enterprise dataset without protected class features.
              </p>
              <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Model ID:</span>
                  <span className="text-[#EDE7DC]">XGB-V2-STABLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Protected Features:</span>
                  <span className="text-[#2E6B72]">ZERO (Strictly Excluded)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Audited By:</span>
                  <span className="text-[#EDE7DC]">Adv. Rajiv Nair (DPO)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DATA RETENTION & ANONYMIZATION */}
      {activeSubView === 'retention' && (
        <div className="space-y-6">
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Right to be Forgotten & Retention Schedule</h3>
            <p className="text-xs text-[#9EA5A8] font-mono">
              Statutory compliance under DPDP Section 12 (Erasure of Personal Data)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2">
                <div className="text-[10.5px] font-mono text-[#9EA5A8] uppercase">Pending Erasure Requests</div>
                <div className="text-2xl font-display font-bold text-[#EDE7DC]">0 <span className="text-xs font-mono text-[#2E6B72]">Clean Queue</span></div>
                <p className="text-[11px] text-[#6C7378]">Zero outstanding employee data deletion requests.</p>
              </div>

              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2">
                <div className="text-[10.5px] font-mono text-[#9EA5A8] uppercase">Retention Lifecycle Policy</div>
                <div className="text-2xl font-display font-bold text-[#EDE7DC]">7 Years</div>
                <p className="text-[11px] text-[#6C7378]">Tax and payroll logs archived; candidate resumes purged at 180 days.</p>
              </div>

              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2">
                <div className="text-[10.5px] font-mono text-[#9EA5A8] uppercase">Pseudonymization Key</div>
                <div className="text-2xl font-display font-bold text-[#EDE7DC]">HSM Rotated</div>
                <p className="text-[11px] text-[#6C7378]">Hardware security module keys rotated every 90 days.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
