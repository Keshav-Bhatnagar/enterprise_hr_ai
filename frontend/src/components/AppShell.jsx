import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Sparkles,
  Users
} from 'lucide-react';

export default function AppShell({
  children,
  currentUser,
  role = 'HR_ADMIN',
  breadcrumbs = [],
  actionButton,
  onSwitchPersona,
  demoPersonas = [],
  theme = 'slate',
  onSelectTheme
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeRef = useRef(null);

  // Normalize role string
  const normalizedRole = (role || 'HR_ADMIN').toUpperCase().replace('ROLE_', '');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    }
    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeMenu]);

  // Dynamic Theme Styling Tokens
  const themeStyles = {
    slate: {
      root: 'bg-[#0B0F19] text-[#F8FAFC]',
      header: 'bg-[#0B0F19]/95 border-slate-800',
      pillActive: 'bg-sky-500 text-slate-950 font-bold',
      pillInactive: 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700',
      statusPip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      footer: 'border-slate-800/80 text-slate-400'
    },
    light: {
      root: 'bg-[#F8FAFC] text-[#0F172A]',
      header: 'bg-white/95 border-slate-200 shadow-xs',
      pillActive: 'bg-indigo-600 text-white font-bold',
      pillInactive: 'bg-white border-slate-200 text-slate-600 hover:text-slate-950 hover:border-slate-300',
      statusPip: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      footer: 'border-slate-200 text-slate-500 bg-white'
    },
    obsidian: {
      root: 'bg-[#0A0C0E] text-[#EDE7DC]',
      header: 'bg-[#0A0C0E]/95 border-[rgba(237,231,220,0.13)]',
      pillActive: 'bg-[#EDE7DC] text-[#0A0C0E] font-bold',
      pillInactive: 'bg-[#101317] border-[rgba(237,231,220,0.13)] text-[#9EA5A8] hover:text-[#EDE7DC]',
      statusPip: 'bg-[#101317] border-[rgba(237,231,220,0.13)] text-[#2E6B72]',
      footer: 'border-[rgba(237,231,220,0.1)] text-[#6C7378]'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.slate;

  return (
    <div className={`min-h-screen flex flex-col font-body antialiased transition-colors duration-200 ${currentTheme.root}`}>
      {/* CONTEXTUAL TOPBAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 h-16 flex items-center justify-between transition-colors ${currentTheme.header}`}>
        {/* LEFT: WORDMARK, BREADCRUMBS & DIRECT ROLE SWITCHER */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display font-extrabold text-base tracking-tight text-current">
              ENTERPRISE HR<span className="text-sky-400">.</span>
            </span>
          </div>

          {/* Quick 1-Click Role Switcher Pills (Zero Login Wall) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl border border-current/10">
            {demoPersonas.map((p) => {
              const isCurrent = (p.role || '').toUpperCase() === normalizedRole;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSwitchPersona && onSwitchPersona(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                    isCurrent ? currentTheme.pillActive : currentTheme.pillInactive
                  }`}
                >
                  <span>{p.badge.split(' ')[0]}</span>
                  <span className="font-semibold">{p.name.split(' ')[0]}</span>
                  <span className="opacity-70 text-[10px]">({p.role})</span>
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg border border-current/10 text-current min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle role switch menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {/* RIGHT: THEME PICKER, DPDP SHIELD PIP, AND ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          {/* THEME SELECTOR PILL */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/15 text-xs font-mono transition hover:border-current/30 min-h-[40px]"
              aria-label="Select color palette theme"
            >
              <Palette className="size-3.5 text-sky-400" />
              <span className="capitalize font-semibold">{theme} Mode</span>
              <ChevronDown className="size-3 opacity-60" />
            </button>

            {/* THEME MENU DROPDOWN */}
            {showThemeMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl z-50 text-xs font-mono space-y-1 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800'
                  : theme === 'obsidian'
                  ? 'bg-[#101317] border-[rgba(237,231,220,0.2)] text-[#EDE7DC]'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}>
                <div className="px-2 py-1 text-[10px] uppercase font-bold opacity-60">
                  Select Visual Palette
                </div>
                {[
                  { id: 'slate', name: 'Slate Dark (Electric Cyan)', icon: Moon, dot: 'bg-sky-400' },
                  { id: 'light', name: 'Executive Light (Workday)', icon: Sun, dot: 'bg-indigo-600' },
                  { id: 'obsidian', name: 'Obsidian (Dark Gold)', icon: Sparkles, dot: 'bg-amber-400' }
                ].map((th) => {
                  const Icon = th.icon;
                  const isActive = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        onSelectTheme && onSelectTheme(th.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                        isActive
                          ? theme === 'light'
                            ? 'bg-indigo-600 text-white font-bold'
                            : theme === 'obsidian'
                            ? 'bg-[#EDE7DC] text-[#0A0C0E] font-bold'
                            : 'bg-sky-500 text-slate-950 font-bold'
                          : theme === 'light'
                          ? 'text-slate-700 hover:bg-slate-100'
                          : theme === 'obsidian'
                          ? 'text-[#9EA5A8] hover:bg-[#161A1F] hover:text-[#EDE7DC]'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5 shrink-0" />
                        <span>{th.name}</span>
                      </div>
                      <span className={`size-2 rounded-full ${th.dot}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live DPDP Status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-mono ${currentTheme.statusPip}`}>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DPDP Act §8(1) Shield</span>
          </div>

          {/* Contextual Action Button */}
          {actionButton}
        </div>
      </header>

      {/* MOBILE ROLE SWITCH DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden border-b p-4 space-y-3 font-mono z-30 bg-current/5 border-current/10">
          <div className="text-xs font-bold opacity-70 uppercase tracking-wider">
            Switch Active Role Workspace:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoPersonas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onSwitchPersona && onSwitchPersona(p);
                }}
                className={`p-2.5 rounded-lg text-left text-xs border transition ${
                  p.role.toUpperCase() === normalizedRole
                    ? 'border-sky-500 font-bold bg-sky-500/10 text-sky-400'
                    : 'border-current/10 hover:border-current/30'
                }`}
              >
                <div>{p.badge.split(' ')[0]} {p.name}</div>
                <div className="text-[10px] opacity-70">{p.role}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* FOOTER */}
      <footer className={`border-t py-4 px-6 text-center text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 ${currentTheme.footer}`}>
        <div>
          Enterprise HR AI Platform • Role-Isolated Spatial Intelligence
        </div>
        <div className="flex items-center gap-3">
          <span>Active Persona: <strong className="text-current font-bold">{currentUser?.name} ({normalizedRole})</strong></span>
          <span>•</span>
          <span>DPDP Act 2023 Certified</span>
        </div>
      </footer>
    </div>
  );
}
