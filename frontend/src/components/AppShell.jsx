import React, { useState } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AppShell({
  children,
  currentUser,
  role = 'HR_ADMIN',
  breadcrumbs = [],
  actionButton,
  onLogout,
  onSwitchPersona,
  demoPersonas = []
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Normalize role string
  const normalizedRole = (role || 'HR_ADMIN').toUpperCase().replace('ROLE_', '');

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0C0E] text-[#EDE7DC] font-body antialiased">
      {/* CONTEXTUAL TOPBAR - DECISIONLENS STYLE */}
      <header className="sticky top-0 z-40 bg-[#0A0C0E]/95 backdrop-blur-md border-b border-[rgba(237,231,220,0.13)] px-4 sm:px-6 h-14 flex items-center justify-between transition-colors">
        {/* LEFT: BREADCRUMBS & MOBILE TOGGLE */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[#9EA5A8] hover:text-[#EDE7DC]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs font-mono text-[#6C7378] overflow-hidden truncate">
            <span className="text-[#9EA5A8] font-bold">Enterprise HR AI</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="size-3 text-[#6C7378] shrink-0" />
                <span className={idx === breadcrumbs.length - 1 ? 'text-[#EDE7DC] font-semibold' : 'text-[#9EA5A8]'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* RIGHT: LIVE TELEMETRY, ACTION BUTTON, AND USER PILL */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Security / DPDP Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[10.5px] font-mono text-[#2E6B72]">
            <span className="size-1.5 rounded-full bg-[#2E6B72] animate-pulse"></span>
            <span>DPDP Act §8(1) Shielded</span>
          </div>

          {/* Contextual Action Button if passed */}
          {actionButton}

          {/* User Persona Pill with Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaModal(!showPersonaModal)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm bg-[#101317] border border-[rgba(237,231,220,0.13)] hover:border-[#E8913C] transition text-left"
            >
              <div className="size-6 rounded-full bg-[#EDE7DC] text-[#0A0C0E] font-display font-bold text-[10.5px] flex items-center justify-center">
                {currentUser?.avatar || currentUser?.name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left font-mono leading-none">
                <div className="text-xs font-bold text-[#EDE7DC] truncate max-w-[120px]">
                  {currentUser?.name || 'Authorized User'}
                </div>
                <div className="text-[9.5px] text-[#E8913C] uppercase tracking-wider mt-0.5">
                  {normalizedRole}
                </div>
              </div>
              <ChevronDown className="size-3 text-[#6C7378]" />
            </button>

            {/* PERSONA SWITCHER POPUP MODAL */}
            {showPersonaModal && (
              <div className="absolute right-0 mt-2 w-72 bg-[#101317] border border-[rgba(237,231,220,0.2)] rounded-sm p-3 shadow-2xl z-50 font-mono space-y-3">
                <div className="border-b border-[rgba(237,231,220,0.1)] pb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#6C7378] font-bold">
                    Switch Active Persona
                  </span>
                  <span className="text-[10px] text-[#2E6B72]">Fast Switch</span>
                </div>

                <div className="space-y-1">
                  {demoPersonas.map((p) => {
                    const isCurrent = (p.role || '').toUpperCase() === normalizedRole;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setShowPersonaModal(false);
                          if (onSwitchPersona) onSwitchPersona(p);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-sm text-left text-xs transition ${
                          isCurrent
                            ? 'bg-[#0A0C0E] border border-[#E8913C] text-[#EDE7DC]'
                            : 'hover:bg-[#0A0C0E] text-[#9EA5A8] hover:text-[#EDE7DC]'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold text-[#EDE7DC]">{p.name}</div>
                          <div className="text-[10px] text-[#6C7378] uppercase">{p.role}</div>
                        </div>
                        {isCurrent && (
                          <span className="size-2 rounded-full bg-[#E8913C]"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[rgba(237,231,220,0.1)]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPersonaModal(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full py-1.5 px-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] hover:border-red-500/50 hover:text-red-400 text-xs font-mono text-[#9EA5A8] rounded-sm transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out to Deck</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* FOOTER - MINIMALIST STATUTORY STRIP */}
      <footer className="border-t border-[rgba(237,231,220,0.1)] py-4 px-6 text-center text-[11px] font-mono text-[#6C7378] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Enterprise HR AI • Built for Strategic Workforce Retention & DPDP Act 2023 Compliance
        </div>
        <div className="flex items-center gap-4 text-[#9EA5A8]">
          <span>Role Isolation: Active</span>
          <span>•</span>
          <span>Zero Nav Overload</span>
        </div>
      </footer>
    </div>
  );
}
