/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="slate-dark"]', '[data-theme="obsidian-gold"]'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        card: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
        },
        input: 'var(--bg-input)',
        muted: 'var(--bg-muted)',
        popover: 'var(--bg-popover)',
        sidebar: {
          DEFAULT: 'var(--bg-sidebar)',
          hover: 'var(--bg-sidebar-hover)',
          active: 'var(--bg-sidebar-active)',
          text: 'var(--text-sidebar)',
          muted: 'var(--text-sidebar-muted)',
        },
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-focus': 'var(--border-focus)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          fg: 'var(--accent-fg)',
        },
        status: {
          danger: 'var(--status-danger)',
          'danger-bg': 'var(--status-danger-bg)',
          'danger-border': 'var(--status-danger-border)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          'warning-border': 'var(--status-warning-border)',
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          'success-border': 'var(--status-success-border)',
          info: 'var(--status-info)',
          'info-bg': 'var(--status-info-bg)',
          'info-border': 'var(--status-info-border)',
        }
      },
      borderRadius: {
        enterprise: 'var(--radius, 10px)',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        drawer: 'var(--shadow-drawer)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
