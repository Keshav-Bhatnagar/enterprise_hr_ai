import React from 'react';
import { BarChart3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KpiCard } from '../../components/primitives';

export function AlgorithmicBiasPage() {
  const biasMetrics = [
    {
      metric: 'Gender Disparate Impact Ratio',
      score: 0.91,
      benchmark: '0.80',
      status: 'PASS',
      desc: 'Selection rate of females vs males in ATS resume scoring & shortlisting.'
    },
    {
      metric: 'Age Demographic Parity (>40 vs <40)',
      score: 0.86,
      benchmark: '0.80',
      status: 'PASS',
      desc: 'Retention counter-offer recommendation parity across age brackets.'
    },
    {
      metric: 'Department Compensation Equity Index',
      score: 0.88,
      benchmark: '0.80',
      status: 'PASS',
      desc: 'Internal salary band variance across equivalent engineering levels.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          EEOC Four-Fifths (80%) Algorithmic Fairness Audit
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Statutory auditing of predictive machine learning models (XGBoost Retention & ATS Resume Scoring).
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Overall Fairness Ratio"
          value="0.88"
          trend="PASS"
          trendType="positive"
          subtext="Exceeds 80% Rule Benchmark"
        />
        <KpiCard
          title="Protected Features Excluded"
          value="100%"
          trend="Air-Gapped"
          trendType="positive"
          subtext="Zero PII / Caste / Gender Ingestion"
        />
        <KpiCard
          title="Model ROC-AUC Score"
          value="1.00"
          trend="Calibrated"
          trendType="positive"
          subtext="Enterprise Dataset Validation"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fairness Benchmarks */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EEOC Benchmark Evaluations</CardTitle>
              <CardDescription>
                Audited against US Equal Employment Opportunity Commission & Indian Constitutional Non-Discrimination standards.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {biasMetrics.map((item, idx) => (
                <div key={idx} className="p-4 rounded-enterprise bg-muted border border-border-subtle space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-text-primary">{item.metric}</span>
                    <span className="text-status-success font-bold border border-status-success-border bg-status-success-bg px-2 py-0.5 rounded text-[11px]">
                      {item.status} ({item.score} / {item.benchmark})
                    </span>
                  </div>

                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                    <div className="h-full bg-status-success" style={{ width: `${item.score * 100}%` }} />
                  </div>

                  <div className="text-xs text-text-secondary">{item.desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Model Governance Certificate */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Governance Certificate</CardTitle>
              <CardDescription>Formal certification signed by Data Protection Officer.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Model ID:</span>
                  <span className="text-text-primary font-bold">XGB-V2-STABLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Protected Features:</span>
                  <span className="text-status-success font-bold">ZERO (Strictly Excluded)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Audited By:</span>
                  <span className="text-text-primary font-semibold">Adv. Rajiv Nair (DPO)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Certification Date:</span>
                  <span className="text-accent font-semibold">06 November 2026</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AlgorithmicBiasPage;
