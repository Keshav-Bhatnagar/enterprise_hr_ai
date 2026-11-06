import React, { useState } from 'react';
import { Box, Grid, Sliders, Users, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, KpiCard, DataTable, RiskBadge } from '../../components/primitives';
import TalentPrism3D from '../../components/TalentPrism3D';

export function TeamCalibrationPage({ employees = [], onSelectEmployee }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'

  const columns = [
    {
      key: 'name',
      label: 'Engineer & Role',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-text-primary text-sm">{row.name}</div>
          <div className="text-[11px] font-mono text-text-muted">{row.job_role} • {row.department}</div>
        </div>
      )
    },
    {
      key: 'perf',
      label: 'Performance (X)',
      render: (val) => <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">{val || 4.2} / 5.0</span>
    },
    {
      key: 'pot',
      label: 'Potential (Y)',
      render: (val) => <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">{val || 4.5} / 5.0</span>
    },
    {
      key: 'attrition_probability',
      label: 'Flight Risk (Z)',
      render: (val) => {
        const pct = (val * 100).toFixed(1);
        const status = val >= 0.75 ? 'HIGH' : val >= 0.4 ? 'MEDIUM' : 'LOW';
        return <RiskBadge status={status} label={`${pct}% (${status})`} size="sm" />;
      }
    },
    {
      key: 'overtime_hours',
      label: 'Overtime',
      render: (val) => <span className="font-mono text-xs text-text-secondary">{val}h/mo</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Team Talent Calibration & Spatial Review
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Volumetric 9-Box spatial calibration for Engineering & Platform squads.
          </p>
        </div>

        {/* 3D / 2D Toggle */}
        <div className="inline-flex p-1 rounded-enterprise bg-muted border border-border-subtle text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              viewMode === '3d' ? 'bg-surface text-text-primary font-bold shadow-subtle' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Box className="size-3.5" />
            <span>3D Spatial</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              viewMode === '2d' ? 'bg-surface text-text-primary font-bold shadow-subtle' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Grid className="size-3.5" />
            <span>Classic 2D Grid</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Direct Reports"
          value="8 Engineers"
          trend="Engineering"
          trendType="neutral"
          subtext="Platform Core Team"
        />
        <KpiCard
          title="Flight Danger Flag"
          value="1 Talent"
          trend="99.5% Critical"
          trendType="danger"
          subtext="Christopher Benson"
        />
        <KpiCard
          title="Avg Team Performance"
          value="4.6 / 5.0"
          trend="Exceeds Bar"
          trendType="positive"
          subtext="Top Quartile Delivery"
        />
      </div>

      {/* Spatial 3D / Accessible 2D */}
      {viewMode === '3d' ? (
        <div className="space-y-4">
          <TalentPrism3D
            employees={employees}
            onSelectEmployee={onSelectEmployee}
          />

          <Card>
            <CardHeader>
              <CardTitle>Squad Talent Ledger</CardTitle>
              <CardDescription>Click any engineer row to open retention counter-offer modeling.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={employees}
                keyField="global_id"
                onRowClick={onSelectEmployee}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Accessible 2D 9-Box Grid */
        <Card>
          <CardHeader>
            <CardTitle>Classic 2D 9-Box Grid</CardTitle>
            <CardDescription>High-contrast, accessible talent quadrant matrix.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {['High Potential', 'Medium Potential', 'Foundational Potential'].map((tier, row) => (
                <React.Fragment key={tier}>
                  {['Underperforming', 'Core Performer', 'Top Performer'].map((col, cIdx) => (
                    <div
                      key={`${row}-${cIdx}`}
                      className="p-4 rounded-enterprise bg-muted border border-border-subtle min-h-[110px] text-left flex flex-col justify-between"
                    >
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">{tier} • {col}</div>
                      <div className="space-y-1.5 mt-2">
                        {employees
                          .filter((emp) => {
                            const p = emp.perf || 4.2;
                            const pot = emp.pot || 4.5;
                            const pMatch = cIdx === 2 ? p >= 4.5 : cIdx === 1 ? p >= 3.5 : p < 3.5;
                            const potMatch = row === 0 ? pot >= 4.5 : row === 1 ? pot >= 3.5 : pot < 3.5;
                            return pMatch && potMatch;
                          })
                          .map((emp) => (
                            <button
                              key={emp.global_id}
                              type="button"
                              onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                              className="w-full text-left p-2 rounded-md bg-surface border border-border-subtle hover:border-accent text-xs font-semibold text-text-primary flex items-center justify-between transition"
                            >
                              <span>{emp.name}</span>
                              <RiskBadge
                                status={emp.attrition_probability >= 0.75 ? 'HIGH' : 'LOW'}
                                label={`${(emp.attrition_probability * 100).toFixed(0)}%`}
                                size="xs"
                              />
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamCalibrationPage;
