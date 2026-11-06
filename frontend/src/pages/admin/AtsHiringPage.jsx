import React, { useState } from 'react';
import { Users, CheckCircle2, XCircle, Search, Award, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, RiskBadge, KpiCard } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';

export function AtsHiringPage({ candidates: initialCandidates = [] }) {
  const [candidates, setCandidates] = useState(
    initialCandidates.length > 0
      ? initialCandidates
      : [
          {
            id: 1,
            name: 'Dr. Siddharth Sen',
            role: 'Staff ML Infrastructure Engineer',
            stage: 'Technical Interview',
            score: 94,
            experience: '8 yrs',
            expected_salary: '₹45,00,000',
            education: 'Ph.D. Computer Science, IISc',
            skills: ['Kubernetes', 'CUDA', 'PyTorch', 'Distributed Training']
          },
          {
            id: 2,
            name: 'Meera Nambiar',
            role: 'Senior Product Designer',
            stage: 'Offered',
            score: 89,
            experience: '6 yrs',
            expected_salary: '₹32,00,000',
            education: 'M.Des, National Institute of Design',
            skills: ['Design Systems', 'Figma', 'User Research', 'Enterprise UX']
          },
          {
            id: 3,
            name: 'Tanmay Joshi',
            role: 'DevOps / Kubernetes Architect',
            stage: 'Screening',
            score: 82,
            experience: '5 yrs',
            expected_salary: '₹28,00,000',
            education: 'B.Tech IT, BITS Pilani',
            skills: ['Terraform', 'GCP', 'ArgoCD', 'Prometheus']
          }
        ]
  );

  const { addToast } = useToast();

  const handleHire = (candidate) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    addToast({
      message: `Offer approved & onboarding initiated for ${candidate.name}`,
      type: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        setCandidates((prev) => [candidate, ...prev]);
        addToast({ message: `Hiring decision undone for ${candidate.name}`, type: 'info' });
      }
    });
  };

  const handleReject = (candidate) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
    addToast({
      message: `Candidate application archived: ${candidate.name}`,
      type: 'warning',
      actionLabel: 'Undo',
      onAction: () => {
        setCandidates((prev) => [candidate, ...prev]);
        addToast({ message: `Application restored for ${candidate.name}`, type: 'info' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Talent Acquisition & Hiring Pipeline (ATS)
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Automated resume screening, candidate fit scoring, and leadership offer authorization.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Active Candidates"
          value={String(candidates.length)}
          trend="In Pipeline"
          trendType="neutral"
          subtext="Director & Staff Engineers"
        />
        <KpiCard
          title="Avg Technical Fit"
          value="88.3%"
          trend="EEOC Certified"
          trendType="positive"
          subtext="Four-Fifths Rule Compliant"
        />
        <KpiCard
          title="Time to Hire"
          value="24 Days"
          trend="-6d vs target"
          trendType="positive"
          subtext="Engineering Velocity"
        />
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {candidates.map((cand) => (
          <Card key={cand.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{cand.name}</CardTitle>
                  <CardDescription>{cand.role}</CardDescription>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-accent/40 bg-accent/10 text-accent">
                  {cand.score}% Fit
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="p-3 rounded-enterprise bg-muted border border-border-subtle space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Interview Stage:</span>
                  <span className="text-text-primary font-semibold">{cand.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Experience:</span>
                  <span className="text-text-primary font-semibold">{cand.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expected CTC:</span>
                  <span className="text-status-success font-bold">{cand.expected_salary}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>

            <div className="p-4 border-t border-border-subtle bg-muted/30 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-status-danger hover:border-status-danger"
                onClick={() => handleReject(cand)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => handleHire(cand)}
              >
                Hire Candidate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AtsHiringPage;
