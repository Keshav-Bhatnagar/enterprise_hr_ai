import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Command,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  LogOut,
  Layers,
  Search
} from 'lucide-react';
import { NAV_ITEMS, DEMO_PERSONAS } from '../../config/nav.config';
import CommandPalette from '../primitives/CommandPalette';
import Drawer from '../primitives/Drawer';

export function AppShell({
  children,
  currentUser,
  currentRole = 'HR_ADMIN',
  theme = 'executive-light',
  onSelectTheme,
  onSwitchPersona,
  detailDrawerProps = null // { isOpen, onClose, title, subtitle, content, footer }
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Save sidebar collapse state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter navigation items by active user role
  const normalizedRole = (currentRole || 'HR_ADMIN').toUpperCase().replace('ROLE_', '');
  const permittedNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((r) => r.toUpperCase().replace('ROLE_', '') === normalizedRole)
  );

  // Group nav items by section
  const groupedNav = permittedNavItems.reduce((acc, item) => {
    const grp = item.group || 'Navigation';
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(item);
    return acc;
  }, {});

  // Resolve breadcrumbs from current pathname
  const activeNavItem = NAV_ITEMS.find((item) => item.path === location.pathname);
  const breadcrumbs = [
    { label: 'Platform', path: '/' },
    ...(activeNavItem ? [{ label: activeNavItem.group, path: activeNavItem.path }, { label: activeNavItem.label, path: activeNavItem.path }] : [])
  ];

  const themeIcons = {
    'executive-light': Sun,
    'slate-dark': Moon,
    'obsidian-gold': Sparkles
  };
  const ActiveThemeIcon = themeIcons[theme] || Sun;

  return (
    <div className="min-h-screen bg-page text-text-primary flex flex-col font-sans antialiased">
      {/* ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        navItems={NAV_ITEMS}
        currentRole={normalizedRole}
        onSelectTheme={onSelectTheme}
        onSwitchPersona={onSwitchPersona}
        demoPersonas={DEMO_PERSONAS}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col border-r border-border-subtle bg-sidebar text-sidebar-text transition-all duration-200 select-none z-30 shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Brand Wordmark & Collapse Toggle */}
          <div className="h-16 px-4 border-b border-border-subtle/40 flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-bold text-base tracking-tight text-sidebar-text">
                  ENTERPRISE HR<span className="text-accent">.</span>
                </span>
              </div>
            ) : (
              <div className="mx-auto font-mono font-bold text-lg text-accent">E.</div>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover transition"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {Object.entries(groupedNav).map(([groupTitle, items]) => (
              <div key={groupTitle} className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-sidebar-muted">
                    {groupTitle}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-enterprise text-xs font-medium transition min-h-[40px] ${
                        isActive
                          ? 'bg-accent text-accent-fg font-semibold shadow-subtle'
                          : 'text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                                item.badgeVariant === 'danger'
                                  ? 'bg-status-danger text-white'
                                  : item.badgeVariant === 'warning'
                                  ? 'bg-status-warning text-black'
                                  : 'bg-muted text-text-primary'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile & Role Card in Sidebar Footer */}
          <div className="p-3 border-t border-border-subtle/40 bg-sidebar/50">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between p-2 rounded-enterprise bg-sidebar-hover">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="size-8 rounded-full bg-accent text-accent-fg font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser?.avatar || 'HR'}
                  </div>
                  <div className="truncate text-xs">
                    <div className="font-semibold text-sidebar-text truncate">{currentUser?.name}</div>
                    <div className="text-[10.5px] font-mono text-sidebar-muted truncate">{currentUser?.role}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="size-8 rounded-full bg-accent text-accent-fg font-bold text-xs flex items-center justify-center mx-auto">
                {currentUser?.avatar || 'HR'}
              </div>
            )}
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOPBAR */}
          <header className="sticky top-0 z-30 h-16 border-b border-border-subtle bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </button>

              {/* Breadcrumb Trail */}
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-text-muted">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="opacity-40">/</span>}
                    <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-text-primary' : 'hover:text-text-secondary'}>
                      {crumb.label}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Right: ⌘K, Live Shield, Theme Picker, "View as..." Persona Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* ⌘K Trigger Button */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-enterprise bg-muted border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary hover:border-border-strong transition min-h-[36px]"
                aria-label="Open command palette"
              >
                <Search className="size-3.5" />
                <span className="hidden md:inline">Quick actions</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[10px] text-text-muted">
                  ⌘K
                </kbd>
              </button>

              {/* Live DPDP Status Pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-status-success-border bg-status-success-bg text-status-success text-[11px] font-mono">
                <span className="size-2 rounded-full bg-status-success animate-pulse" />
                <span>DPDP Act §8(1) Shield</span>
              </div>

              {/* Theme Picker Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 rounded-enterprise border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-muted min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                  aria-label="Select theme palette"
                >
                  <ActiveThemeIcon className="size-4" />
                </button>

                {themeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-enterprise bg-surface border border-border-strong p-1.5 shadow-drawer z-50 text-xs font-mono space-y-1">
                    {[
                      { id: 'executive-light', name: 'Executive Light', icon: Sun },
                      { id: 'slate-dark', name: 'Slate Dark', icon: Moon },
                      { id: 'obsidian-gold', name: 'Obsidian Gold', icon: Sparkles }
                    ].map((th) => {
                      const Icon = th.icon;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => {
                            onSelectTheme && onSelectTheme(th.id);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition ${
                            theme === th.id
                              ? 'bg-accent text-accent-fg font-semibold'
                              : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                          }`}
                        >
                          <Icon className="size-3.5" />
                          <span>{th.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* "View As..." Persona Switcher (Demo Mode) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-enterprise border border-border-subtle bg-muted hover:bg-card-hover text-xs font-mono transition min-h-[36px]"
                  aria-label="Switch persona"
                >
                  <UserCheck className="size-3.5 text-accent" />
                  <span className="hidden sm:inline font-semibold text-text-primary">View as:</span>
                  <span className="font-bold text-accent truncate max-w-[100px]">
                    {currentUser?.name?.split(' ')[0] || normalizedRole}
                  </span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-enterprise bg-surface border border-border-strong p-2 shadow-drawer z-50 text-xs font-mono space-y-1">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-text-muted">
                      Demo Personas (Instant Switch)
                    </div>
                    {DEMO_PERSONAS.map((p) => {
                      const isSelected = p.role.toUpperCase() === normalizedRole;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSwitchPersona && onSwitchPersona(p);
                            navigate(p.defaultRoute);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-left transition ${
                            isSelected
                              ? 'bg-accent text-accent-fg font-semibold'
                              : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-semibold">{p.badge} {p.name}</div>
                            <div className="text-[10px] opacity-70 truncate">{p.title}</div>
                          </div>
                          {isSelected && <span className="text-[10px] font-bold">ACTIVE</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-border-subtle py-4 px-6 text-xs font-mono text-text-muted flex flex-col sm:flex-row items-center justify-between gap-2 bg-surface">
            <div>Enterprise HR Intelligence Platform • Indian DPDP Act 2023 §8(1) Shielded</div>
            <div className="flex items-center gap-3">
              <span>Active Role: <strong className="text-text-primary font-semibold">{normalizedRole}</strong></span>
              <span>•</span>
              <span>Audit Digest SHA-256</span>
            </div>
          </footer>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 bg-sidebar text-sidebar-text border-r border-border-subtle p-4 flex flex-col h-full font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="font-bold text-sidebar-text">ENTERPRISE HR.</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-sidebar-muted hover:text-sidebar-text"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-4">
              {Object.entries(groupedNav).map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-1">
                  <div className="text-[10px] font-bold text-sidebar-muted uppercase tracking-wider px-2">
                    {groupTitle}
                  </div>
                  {items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 p-2 rounded-md ${
                          isActive
                            ? 'bg-accent text-accent-fg font-semibold'
                            : 'text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-hover'
                        }`
                      }
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Right-Side Detail Drawer (If open) */}
      {detailDrawerProps && (
        <Drawer
          isOpen={detailDrawerProps.isOpen}
          onClose={detailDrawerProps.onClose}
          title={detailDrawerProps.title}
          subtitle={detailDrawerProps.subtitle}
          footer={detailDrawerProps.footer}
        >
          {detailDrawerProps.content}
        </Drawer>
      )}
    </div>
  );
}

export default AppShell;
