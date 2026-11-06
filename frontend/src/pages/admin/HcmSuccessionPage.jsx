import React from 'react';
import { Layers, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KpiCard } from '../../components/primitives';

export function HcmSuccessionPage() {
  const benchPipelines = [
    {
      target: 'VP of AI Research',
      current: 'Open Executive Search',
      successor: 'Vikramaditya Rao',
      readiness: 92,
      readinessLabel: '92% Ready',
      time: 'Immediate (0 mos)',
      skillsCovered: ['Transformer Architectures', 'Compute Allocation', 'Patent Strategy'],
      gapArea: 'Executive Boardroom Presenting'
    },
    {
      target: 'Director of Engineering',
      current: 'Kavita Desai',
      successor: 'Christopher Benson',
      readiness: 84,
      readinessLabel: '84% Ready',
      time: '6 months',
      skillsCovered: ['Platform Architecture', 'Incident Command', 'Cross-Squad Delivery'],
      gapArea: 'Budget Disbursal & Vendor Contracts'
    },
    {
      target: 'Lead Solutions Architect',
      current: 'Ananya Deshmukh',
      successor: 'Dr. Siddharth Sen (Candidate Pipeline)',
      readiness: 78,
      readinessLabel: '78% Ready',
      time: '12 months',
      skillsCovered: ['Enterprise Presales', 'Distributed Storage', 'Client Delivery'],
      gapArea: 'Indian BFSI Compliance Standards'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Succession Bench & Critical Leadership Coverage
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Bench readiness pipelines for mission-critical Director, Architect, and Research seats.
        </p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Critical Seats Covered"
          value="88%"
          trend="+12% YoY"
          trendType="positive"
          subtext="Key Person Risk Shield"
        />
        <KpiCard
          title="Avg Succession Readiness"
          value="84.6%"
          trend="Strong Bench"
          trendType="positive"
          subtext="Ready within 6-12 mos"
        />
        <KpiCard
          title="Identified Ready Talents"
          value="6"
          trend="Tier 1 Pipeline"
          trendType="positive"
          subtext="Internal Mobilities"
        />
      </div>

      {/* Pipelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {benchPipelines.map((bench, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{bench.target}</CardTitle>
                  <CardDescription>Incumbent: {bench.current}</CardDescription>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-status-success-border bg-status-success-bg text-status-success">
                  {bench.readinessLabel}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>Bench Readiness</span>
                  <span className="font-semibold text-text-primary">{bench.readiness}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-status-success" style={{ width: `${bench.readiness}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Designated Successor:</span>
                  <span className="text-text-primary font-bold">{bench.successor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time to Transition:</span>
                  <span className="text-accent font-semibold">{bench.time}</span>
                </div>
                <div className="pt-1 border-t border-border-subtle">
                  <span className="text-text-muted">Development Priority:</span>
                  <div className="text-text-secondary mt-0.5 italic">{bench.gapArea}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HcmSuccessionPage;

