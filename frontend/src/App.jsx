import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  DollarSign,
  Activity,
  Sliders,
  Webhook,
  Lock,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Send,
  CheckCircle2,
  Sun,
  Moon,
  FileText,
  Building2,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';

const INITIAL_EMPLOYEES = [
  {
    global_id: 1977757544,
    name: "Christopher Benson",
    masked_name: "C*** B***",
    pseudo_id: "EMP_AC99",
    job_role: "Lead Platform Architect",
    department: "Engineering",
    monthly_salary: 115000,
    salary_band: "₹1,00,000 - ₹1,25,000/mo",
    overtime_hours: 42,
    attrition_probability: 0.9948,
    risk_tier: "HIGH",
    years_at_company: 4.2,
    avatar: "CB",
    reason: "Chronic Overtime (42h) + Compensation Lag"
  },
  {
    global_id: 2841902113,
    name: "Priya Sundaram",
    masked_name: "P*** S***",
    pseudo_id: "EMP_5F12",
    job_role: "Senior Product Manager",
    department: "Product",
    monthly_salary: 135000,
    salary_band: "₹1,25,000 - ₹1,50,000/mo",
    overtime_hours: 24,
    attrition_probability: 0.682,
    risk_tier: "MEDIUM",
    years_at_company: 2.8,
    avatar: "PS",
    reason: "High Market Demand + Work-Life Balance Dip"
  },
  {
    global_id: 3757101776,
    name: "Vikramaditya Rao",
    masked_name: "V*** R***",
    pseudo_id: "EMP_8A34",
    job_role: "Principal AI Scientist",
    department: "AI Research",
    monthly_salary: 155000,
    salary_band: "₹1,50,000 - ₹1,75,000/mo",
    overtime_hours: 31,
    attrition_probability: 0.614,
    risk_tier: "MEDIUM",
    years_at_company: 3.1,
    avatar: "VR",
    reason: "GPU Capacity Blockers + Tenure Plateau"
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [role, setRole] = useState('HR_ADMIN'); // HR_ADMIN, MANAGER, AUDITOR
  const [activeTab, setActiveTab] = useState('war-room');
  const [selectedEmp, setSelectedEmp] = useState(INITIAL_EMPLOYEES[0]);

  // Simulator levers
  const [salaryHike, setSalaryHike] = useState(15);
  const [overtimeReduction, setOvertimeReduction] = useState(15);
  const [wlbPolicy, setWlbPolicy] = useState('hybrid'); // office, hybrid, remote
  const [memoOpen, setMemoOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Live Webhook Feed
  const [webhooks, setWebhooks] = useState([
    {
      id: "evt_101",
      provider: "darwinbox",
      event: "COMPENSATION_CHANGE",
      desc: "Employee #3757101776: Risk updated (LOW → LOW • 0.18 Prob)",
      status: "PROCESSED",
      latency: "14ms",
      time: "10:14 AM"
    },
    {
      id: "evt_100",
      provider: "generic",
      event: "IDEMPOTENT_CHECK",
      desc: "Idempotent duplicate event suppressed safely",
      status: "DUPLICATE",
      latency: "2ms",
      time: "09:58 AM"
    }
  ]);

  // Sync dark mode class on root HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Live calculation of retention ROI (calibrated to XGBoost pipeline)
  const baseSalary = selectedEmp.monthly_salary;
  const baseProb = selectedEmp.attrition_probability * 100;
  const incAmount = Math.round(baseSalary * (salaryHike / 100));
  const newSalary = baseSalary + incAmount;
  const replacementCost = Math.round(baseSalary * 9.0); // 9 months CTC replacement benchmark

  const policyBonus = wlbPolicy === 'remote' ? 0.20 : wlbPolicy === 'hybrid' ? 0.12 : 0.0;
  const salaryFactor = (salaryHike / 30) * 0.45;
  const otFactor = (overtimeReduction / 30) * 0.35;
  const totalReductionPct = (salaryFactor + otFactor + policyBonus) * (baseProb / 100);

  const simulatedProb = Math.max(0.85, (baseProb - (totalReductionPct * 100))).toFixed(2);
  const annualInterventionCost = incAmount * 12;
  const turnoverCostAvoidance = Math.round(replacementCost * ((baseProb - simulatedProb) / 100));
  const netFinancialGain = turnoverCostAvoidance - annualInterventionCost;
  const roiMultiple = annualInterventionCost > 0 ? (turnoverCostAvoidance / annualInterventionCost).toFixed(2) : "0.00";

  const handleSimulateWebhook = (provider, eventType, desc) => {
    const newEntry = {
      id: `evt_${Date.now().toString().slice(-4)}`,
      provider,
      event: eventType,
      desc,
      status: "PROCESSED",
      latency: "11ms",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWebhooks([newEntry, ...webhooks]);
    showToast(`⚡ Webhook Received: ${provider} → Recalculated risk for ${selectedEmp.name}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-200">
      
      {/* TOP GLOBAL HEADER */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0c0c0f]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">Enterprise Workforce Intelligence</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FastAPI Live
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Retention Copilot & DPDP Act 2023 Governance</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* ROLE & DPDP SWITCHER */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> View:
              </span>
              <button
                onClick={() => setRole('HR_ADMIN')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  role === 'HR_ADMIN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                HR Executive
              </button>
              <button
                onClick={() => setRole('MANAGER')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  role === 'MANAGER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => setRole('AUDITOR')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  role === 'AUDITOR'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3 h-3" /> DPDP Auditor
              </button>
            </div>

            {/* LIGHT/DARK THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </header>

      {/* DPDP DYNAMIC MASKING BANNER */}
      {role === 'AUDITOR' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span><strong>DPDP Act 2023 Masking Enforced:</strong> Employee PII is salted & pseudonymized, exact compensation converted to confidential bands, bank routing numbers redacted.</span>
            </div>
            <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded font-semibold">
              CERT-IN Audit Mode
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        
        {/* KPI CARDS ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Payroll Flight Risk</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-500 mt-2">₹1.42 Cr</div>
            <div className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
              <span>↑ 12.4%</span>
              <span className="text-zinc-400 font-normal">at-risk annual CTC in Q4</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Attrition Velocity</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-500 mt-2">8.2%</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              6.3% below tech industry avg
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Turnover Cost Avoidance</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-500 mt-2">₹48.3 Lakh</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Realized via simulated retention offers
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Algorithmic Equity</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-500 mt-2">1.04 DIR</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Passed Four-Fifths 80% Rule
            </div>
          </div>
        </section>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('war-room')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'war-room'
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Flight Risk War Room
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Retention ROI Simulator
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'webhooks'
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Webhook className="w-4 h-4" /> HRMS Webhook Stream
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Bias & DPDP Audit
          </button>
        </div>

        {/* TAB 1: FLIGHT RISK WAR ROOM */}
        {activeTab === 'war-room' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Critical Talent at Flight Risk</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Employees with acute turnover risk ranked by net replacement liability</p>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                Live Data: 3 Active Threats
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INITIAL_EMPLOYEES.map((emp) => {
                const isAuditor = role === 'AUDITOR';
                const displayName = isAuditor ? `${emp.masked_name} (${emp.pseudo_id})` : emp.name;
                const displaySalary = role === 'HR_ADMIN' ? `₹${emp.monthly_salary.toLocaleString('en-IN')}` : emp.salary_band;

                return (
                  <div
                    key={emp.global_id}
                    className="p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold flex items-center justify-center text-sm shadow-sm">
                            {emp.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{displayName}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{emp.job_role} • {emp.department}</div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                          emp.attrition_probability > 0.8
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {(emp.attrition_probability * 100).toFixed(1)}% RISK
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">Compensation:</span>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{displaySalary}</div>
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">Overtime Load:</span>
                          <div className="font-semibold text-rose-500 mt-0.5">{emp.overtime_hours} hrs / month</div>
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">Replacement Cost:</span>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">₹{(emp.monthly_salary * 9 / 100000).toFixed(1)} Lakh</div>
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">Tenure:</span>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{emp.years_at_company} Years</div>
                        </div>
                      </div>

                      <div className="mt-4 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Root Cause:</span> {emp.reason}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          setSelectedEmp(emp);
                          setActiveTab('simulator');
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        Launch Retention Simulator <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RETENTION ROI SIMULATOR (THE CORE MAGIC) */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEVERS CONTROLS (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                    {role === 'AUDITOR' ? `${selectedEmp.masked_name} (${selectedEmp.pseudo_id})` : selectedEmp.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {selectedEmp.job_role} • Baseline Flight Risk: <span className="text-rose-500 font-bold">{baseProb.toFixed(1)}%</span>
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Tijori Financial ROI Engine
                </span>
              </div>

              {/* LEVER 1: SALARY HIKE */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-700 dark:text-zinc-300">Proposed Compensation Adjustment</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    +{salaryHike}% (₹{incAmount.toLocaleString('en-IN')}/mo increment)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={salaryHike}
                  onChange={(e) => setSalaryHike(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>0% (No change)</span>
                  <span>+15% (Target)</span>
                  <span>+30% (Aggressive)</span>
                </div>
              </div>

              {/* LEVER 2: OVERTIME REDUCTION */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-zinc-700 dark:text-zinc-300">Overtime Reduction & Load Balancing</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    -{overtimeReduction} hrs/month
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={overtimeReduction}
                  onChange={(e) => setOvertimeReduction(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>0h (High Burnout)</span>
                  <span>-15h (Healthy)</span>
                  <span>-30h (Max Relief)</span>
                </div>
              </div>

              {/* LEVER 3: WORK-LIFE BALANCE POLICY */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Work Arrangement Policy
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setWlbPolicy('office')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      wlbPolicy === 'office'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    Office (5 Days)
                  </button>
                  <button
                    onClick={() => setWlbPolicy('hybrid')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      wlbPolicy === 'hybrid'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    Hybrid (3+2 WFH)
                  </button>
                  <button
                    onClick={() => setWlbPolicy('remote')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      wlbPolicy === 'remote'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    Full Remote Flex
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <button
                  onClick={() => setMemoOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Route CFO Approval Memo
                </button>
                <button
                  onClick={() => showToast('Simulated retention offer saved to HRMS pipeline!')}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Save Draft
                </button>
              </div>
            </div>

            {/* IMPACT GAUGE & ARITHMETIC (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Simulated Risk Outcome</div>
                
                <div className="mt-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
                  <div className={`text-5xl font-black transition-colors duration-300 ${
                    simulatedProb > 60 ? 'text-rose-500' : simulatedProb > 25 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {simulatedProb}%
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mt-2">
                    {simulatedProb < 20 ? 'TIER 1 • NEGLIGIBLE FLIGHT RISK' : 'TIER 2 • CONTROLLED RISK'}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Reduced from <span className="text-rose-500 font-bold">{baseProb.toFixed(1)}%</span> baseline
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Turnover Cost Avoidance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{turnoverCostAvoidance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Annual Intervention Cost (CTC + Perks):</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      ₹{annualInterventionCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">Net Financial Gain to Enterprise:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
                      ₹{netFinancialGain.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>ROI MULTIPLE: {roiMultiple}x</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[11px]">PAYBACK &lt; 3 MONTHS</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-1.5 leading-relaxed">
                  High-conviction retention offer. Every ₹1 spent on compensation adjustments protects ₹{roiMultiple} in replacement costs.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: HRMS WEBHOOK STREAM */}
        {activeTab === 'webhooks' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SIMULATION TRIGGERS (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-1">Simulate Real-Time Webhooks</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Click to fire live webhook events into the FastAPI ingestion gateway:</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSimulateWebhook('darwinbox', 'OVERTIME_SPIKE', 'Darwinbox: +22h overtime logged; risk spiked to 99.5%')}
                  className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 bg-zinc-50 dark:bg-zinc-900/60 text-left transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500">
                    <span>⚠️ Darwinbox: Overtime Surge</span>
                    <span className="font-mono text-[10px] text-zinc-400">POST /webhooks/darwinbox</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Triggers high-risk notification dispatch for immediate manager intervention.</p>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('workday', 'SALARY_ADJUSTMENT', 'Workday: 15% promotion adjustment applied; risk decreased to 0.9%')}
                  className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-900/60 text-left transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500">
                    <span>💎 Workday: Compensation Revision</span>
                    <span className="font-mono text-[10px] text-zinc-400">POST /webhooks/workday</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Ingests worker/compensation event; triggers real-time model re-scoring.</p>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('generic', 'RATING_DOWNGRADE', 'BambooHR: Performance rating downgraded from 4 to 2')}
                  className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 bg-zinc-50 dark:bg-zinc-900/60 text-left transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500">
                    <span>📉 Generic: Performance Review Drop</span>
                    <span className="font-mono text-[10px] text-zinc-400">POST /webhooks/generic</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Standard enterprise webhook format for Keka, BambooHR, and Rippling.</p>
                </button>
              </div>
            </div>

            {/* IMMUTABLE INGESTION AUDIT FEED (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Immutable Webhook Audit Feed</h3>
                <span className="text-xs font-mono text-zinc-400">{webhooks.length} Events Logged</span>
              </div>

              <div className="space-y-2.5 mt-4 max-h-[400px] overflow-y-auto">
                {webhooks.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          w.status === 'PROCESSED' ? 'text-emerald-500' : 'text-blue-500'
                        }`}>
                          [{w.status}]
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{w.provider} • {w.event}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{w.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] text-zinc-400">{w.time}</div>
                      <div className="text-[10px] text-zinc-500">{w.latency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DPDP COMPLIANCE & BIAS AUDIT */}
        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">EEOC & Indian DPDP Act Bias Audit</h3>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PASS (80% Rule)
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                Evaluates algorithmic fairness across protected cohorts. The Four-Fifths rule mandates Disparate Impact Ratio (DIR) between <strong>0.80 and 1.25</strong>. Current ratio: <strong>1.04 DIR</strong>.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Female Cohort (High Risk Rate)</span>
                    <span>14.2% (18 of 127)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '14.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Male Cohort (High Risk Rate)</span>
                    <span>13.6% (26 of 191)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '13.6%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
                <span>DIR Metric: 14.2% / 13.6% = <strong className="text-zinc-900 dark:text-zinc-100">1.04</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Statistically Equitable</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">DPDP Act 2023 Access Logs</h3>
                <span className="text-xs font-mono text-zinc-400">DPO Audit Trail</span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Auditor System (AUDITOR)</div>
                    <div className="text-[11px] text-zinc-500">READ_PROFILE • GlobalID #1977757544 (FULLY_ANONYMIZED)</div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Just now</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Engineering Lead (MANAGER)</div>
                    <div className="text-[11px] text-zinc-500">READ_PROFILE • GlobalID #3757101776 (FINANCIALS_MASKED)</div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">14m ago</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">CHRO Executive (HR_ADMIN)</div>
                    <div className="text-[11px] text-zinc-500">EXPORT_REPORT • Q4 Flight-Risk War Room (UNMASKED)</div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">1h ago</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* CFO APPROVAL MEMO MODAL */}
      {memoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> CFO Retention Authorization Memo
              </h3>
              <button onClick={() => setMemoOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-sm font-bold">✕</button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p><strong>TO:</strong> Office of the Chief Financial Officer</p>
              <p><strong>FROM:</strong> People Operations & Talent Intelligence</p>
              <p><strong>SUBJECT:</strong> High-Conviction Retention Package for {selectedEmp.name} ({selectedEmp.job_role})</p>
              <hr className="my-2 border-zinc-200 dark:border-zinc-800" />
              <p><strong>Baseline Flight Risk:</strong> {baseProb.toFixed(1)}% (Tier 3 Critical)</p>
              <p><strong>Estimated Turnover Replacement Loss:</strong> ₹{replacementCost.toLocaleString('en-IN')}</p>
              <p><strong>Proposed Package:</strong> +{salaryHike}% Salary Hike (₹{incAmount.toLocaleString('en-IN')}/mo) + WFH Hybrid</p>
              <p><strong>Simulated Post-Offer Risk:</strong> {simulatedProb}%</p>
              <p><strong>Annual Package Cost:</strong> ₹{annualInterventionCost.toLocaleString('en-IN')}</p>
              <p><strong>Net Enterprise Financial Gain:</strong> ₹{netFinancialGain.toLocaleString('en-IN')}</p>
              <p><strong>Expected ROI Multiple:</strong> {roiMultiple}x</p>
              <p className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold">RECOMMENDATION: APPROVE PURCHASE ORDER</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setMemoOpen(false);
                  showToast('Memo dispatched to CFO via Slack/Teams webhook!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
              >
                Dispatch to CFO & HRBP
              </button>
              <button
                onClick={() => setMemoOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <span>⚡</span>
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}

