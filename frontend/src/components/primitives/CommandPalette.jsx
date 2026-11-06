import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  ArrowRight,
  Shield,
  Users,
  Activity,
  DollarSign,
  Palette,
  Sun,
  Moon,
  Sparkles,
  UserCheck
} from 'lucide-react';

export function CommandPalette({
  isOpen,
  onClose,
  navItems = [],
  currentRole = 'HR_ADMIN',
  onSelectTheme,
  onSwitchPersona,
  demoPersonas = []
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list based on role & features
  const allCommands = [
    // 1. Navigation items permitted for current role
    ...navItems
      .filter((item) => !item.roles || item.roles.includes(currentRole))
      .map((item) => ({
        id: `nav-${item.path}`,
        category: 'Navigation',
        label: `Go to ${item.label}`,
        icon: item.icon || ArrowRight,
        action: () => {
          navigate(item.path);
          onClose();
        }
      })),

    // 2. Visual Palette Actions
    {
      id: 'theme-light',
      category: 'Appearance',
      label: 'Switch to Executive Light Theme',
      icon: Sun,
      action: () => {
        onSelectTheme && onSelectTheme('executive-light');
        onClose();
      }
    },
    {
      id: 'theme-slate',
      category: 'Appearance',
      label: 'Switch to Slate Dark Theme',
      icon: Moon,
      action: () => {
        onSelectTheme && onSelectTheme('slate-dark');
        onClose();
      }
    },
    {
      id: 'theme-obsidian',
      category: 'Appearance',
      label: 'Switch to Obsidian Gold Theme',
      icon: Sparkles,
      action: () => {
        onSelectTheme && onSelectTheme('obsidian-gold');
        onClose();
      }
    },

    // 3. Demo Persona Switches (Only in demo mode)
    ...demoPersonas.map((p) => ({
      id: `persona-${p.id}`,
      category: 'Demo Personas',
      label: `View as ${p.name} (${p.badge.split(' ')[0]} ${p.role})`,
      icon: UserCheck,
      action: () => {
        onSwitchPersona && onSwitchPersona(p);
        onClose();
      }
    }))
  ];

  // Filter commands by query
  const filtered = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((idx) => (idx + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((idx) => (idx - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative z-10 w-full max-w-xl bg-card border border-border-strong rounded-enterprise shadow-2xl overflow-hidden flex flex-col font-mono text-xs enterprise-popover"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Search Input */}
        <div className="p-3.5 border-b border-border-subtle flex items-center gap-3 bg-muted">
          <Search className="size-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-mono"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border-subtle text-[10px] text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-text-muted">No commands found.</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition select-none ${
                    isSelected
                      ? 'bg-accent text-accent-fg font-semibold shadow-subtle'
                      : 'text-text-primary hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <span className="truncate">{cmd.label}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold shrink-0 px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-black/20 text-accent-fg' : 'text-text-muted bg-muted'
                    }`}
                  >
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 border-t border-border-subtle bg-muted flex items-center justify-between text-[10.5px] text-text-muted">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>↵</kbd></span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

