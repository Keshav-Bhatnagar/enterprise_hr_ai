import React, { useState } from 'react';
import { Sliders, Download, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { downloadRetentionMemo } from '../../utils/exportHelpers';

export function RetentionSimulatorPage({ employees = [] }) {
  const [selectedEmp, setSelectedEmp] = useState(employees[0] || null);
  const [salaryBump, setSalaryBump] = useState(15);
  const [otCut, setOtCut] = useState(30);
  const { addToast } = useToast();

  const currentRisk = selectedEmp?.attrition_probability || 0.85;
  const simulatedRisk = Math.max(0.08, currentRisk - salaryBump * 0.015 - otCut * 0.008);
  const baseSalary = (selectedEmp?.monthly_salary || 120000) * 12;
  const replacementCost = baseSalary * 1.5;
  const interventionCost = baseSalary * (salaryBump / 100) + 60000;
  const netSavings = Math.max(0, replacementCost * (currentRisk - simulatedRisk) - interventionCost);

  const handleExportMemo = () => {
    if (!selectedEmp) return;
    downloadRetentionMemo({
      employee: selectedEmp,
      salaryBump,
      otCut,
      currentRisk,
      simulatedRisk,
      replacementCost,
      interventionCost,
      netSavings
    });
    addToast({
      message: `Retention offer memorandum generated for ${selectedEmp.name} (.TXT)`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Retention Counter-Offer & ROI Simulator
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Simulate targeted compensation adjustments and overtime caps to pull key engineers out of danger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intervention Parameters</CardTitle>
              <CardDescription>Select target engineer and configure retention package levers.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">
                  Target Team Member
                </label>
                <select
                  value={selectedEmp?.global_id}
                  onChange={(e) => {
                    const emp = employees.find((x) => String(x.global_id) === e.target.value);
                    if (emp) setSelectedEmp(emp);
                  }}
                  className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                >
                  {employees.map((emp) => (
                    <option key={emp.global_id} value={emp.global_id}>
                      {emp.name} — {emp.job_role} ({(emp.attrition_probability * 100).toFixed(1)}% Risk)
                    </option>
                  ))}
                </select>
              </div>

              {/* Slider 1: Salary bump */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary uppercase">Market Compensation Correction:</span>
                  <span className="text-accent font-bold">+{salaryBump}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={salaryBump}
                  onChange={(e) => setSalaryBump(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              {/* Slider 2: Overtime relief */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary uppercase">Overtime Workload Relief:</span>
                  <span className="text-status-success font-bold">-{otCut}% hours</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="10"
                  value={otCut}
                  onChange={(e) => setOtCut(Number(e.target.value))}
                  className="w-full accent-status-success cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  leftIcon={Download}
                  onClick={handleExportMemo}
                >
                  Generate Retention Memo (.TXT)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projected Impact Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projected Financial & Flight Impact</CardTitle>
              <CardDescription>Net rupee preservation after accounting for intervention expenses.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Progress bars */}
              <div className="p-4 rounded-enterprise bg-muted border border-border-subtle space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-text-muted">
                    <span>Baseline Flight Risk:</span>
                    <span className="text-status-danger font-bold">
                      {(currentRisk * 100).toFixed(1)}% (Critical)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden mt-1 border border-border-subtle">
                    <div className="h-full bg-status-danger" style={{ width: `${currentRisk * 100}%` }} />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-text-muted">
                    <span>Projected Post-Intervention:</span>
                    <span className="text-status-success font-bold">
                      {(simulatedRisk * 100).toFixed(1)}% (Stabilized)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden mt-1 border border-border-subtle">
                    <div className="h-full bg-status-success" style={{ width: `${simulatedRisk * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-muted">Cost of Departure (1.5x CTC):</span>
                  <span className="text-text-primary font-bold">
                    ₹{(replacementCost / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-muted">Intervention Cost:</span>
                  <span className="text-status-warning font-bold">
                    ₹{(interventionCost / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                  <span>Net Rupee Savings:</span>
                  <span className="text-status-success">
                    ₹{(netSavings / 100000).toFixed(2)} Lakhs Preserved
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RetentionSimulatorPage;
