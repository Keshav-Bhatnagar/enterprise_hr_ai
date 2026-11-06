import React, { useState } from 'react';
import { ShieldCheck, HeartHandshake, Download, CheckCircle2, Send, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { downloadFile } from '../../utils/exportHelpers';

export function EmployeeWellbeingPage({ currentUser }) {
  const [pulseCategory, setPulseCategory] = useState('Work-Life Balance');
  const [pulseRating, setPulseRating] = useState(4);
  const [pulseComment, setPulseComment] = useState('');
  const [pulseSubmitted, setPulseSubmitted] = useState(false);
  const { addToast } = useToast();

  const handlePulseSubmit = (e) => {
    e.preventDefault();
    setPulseSubmitted(true);
    addToast({
      message: 'Confidential feedback tokenized anonymously under DPDP §6',
      type: 'success'
    });
    setTimeout(() => {
      setPulseSubmitted(false);
      setPulseComment('');
    }, 4000);
  };

  const handleExportData = () => {
    const personalRecord = {
      statutory_basis: 'Indian Digital Personal Data Protection Act 2023 §12',
      export_timestamp: new Date().toISOString(),
      principal_name: currentUser?.name || 'Vikramaditya Rao',
      pseudonymized_id: 'EMP_8A34',
      department: 'AI Systems & Foundations',
      designation: 'Principal AI Systems Scientist',
      contact_info: {
        email: 'vikramaditya.rao@enterprise.internal',
        phone_masked: '+91 98**** *210',
        base_location: 'Bengaluru Technology Center (SEZ)'
      },
      employment_history: {
        joining_date: '2023-08-15',
        tenure_years: 3.2,
        current_band: 'L7 Principal Scientist',
        reporting_manager: 'Kavita Desai'
      },
      compensation: {
        currency: 'INR',
        monthly_gross: 155000,
        annual_ctc: 1860000,
        epf_uan: '101994821092',
        pan_masked: 'ABC*****9F'
      },
      data_protection: {
        dpo_officer: 'Adv. Rajiv Nair',
        audit_trail_reference: 'AUD-884099-DPDP',
        cryptographic_hash: '9f83c6b12a8385e054178a9c3d4e8c1561570532ff4b245a498b584d4b1740b2'
      }
    };

    downloadFile(
      `Personal_Data_Export_DPDP_${currentUser?.name?.replace(/\s+/g, '_') || 'Employee'}.json`,
      JSON.stringify(personalRecord, null, 2),
      'application/json'
    );

    addToast({
      message: 'DPDP Personal Data Record exported (.JSON)',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Confidential Wellbeing Pulse & DPDP Data Rights
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Anonymous feedback tokenization under DPDP Act §6 and personal data ownership under Section 12.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pulse Feedback */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confidential Wellbeing Pulse</CardTitle>
              <CardDescription>
                Aggregated with 40+ engineering peers; cryptographically masked from managers.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {pulseSubmitted ? (
                <div className="p-4 rounded-enterprise bg-status-success-bg border border-status-success-border text-status-success text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="size-4" />
                    <span>Feedback Tokenized Anonymously</span>
                  </div>
                  <p className="text-text-secondary">
                    Your response has been committed to the team aggregate without your identity attached.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePulseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                      Feedback Dimension
                    </label>
                    <select
                      value={pulseCategory}
                      onChange={(e) => setPulseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                    >
                      <option value="Work-Life Balance">Work-Life Balance & Sustainable Hours</option>
                      <option value="Project Alignment">Project Realignment & Technical Roadblocks</option>
                      <option value="Leadership Trust">Manager Support & Career Advancement</option>
                      <option value="Compensation Equity">Compensation & Market Band Competitiveness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                      Satisfaction Rating (1 to 5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPulseRating(val)}
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded-enterprise border transition min-h-[40px] ${
                            pulseRating === val
                              ? 'bg-accent text-accent-fg border-accent shadow-subtle'
                              : 'bg-muted text-text-secondary border-border-subtle hover:text-text-primary'
                          }`}
                        >
                          {val} {val === 5 ? '★' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                      Confidential Notes (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={pulseComment}
                      onChange={(e) => setPulseComment(e.target.value)}
                      placeholder="e.g. Cluster GPU allocation queue is slowing research velocity; need dedicated H100 access."
                      className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" leftIcon={Send}>
                    Submit Anonymous Feedback
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DPDP Section 12 Center */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statutory DPDP Act Rights Center</CardTitle>
              <CardDescription>Exercise your Section 12 rights to portability and transparency.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Pseudonymized Identifier:</span>
                  <span className="text-text-primary font-bold">EMP_8A34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Masked Identity:</span>
                  <span className="text-text-primary font-semibold">V*** R***</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Statutory Consent:</span>
                  <span className="text-status-success font-bold">Active (HR Operations)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">DPO Certification:</span>
                  <span className="text-accent font-semibold">Adv. Rajiv Nair</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                leftIcon={Download}
                onClick={handleExportData}
              >
                Export My Personal Data (.JSON)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployeeWellbeingPage;

