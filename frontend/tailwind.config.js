/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        card: 'var(--bg-card)',
        'card-subtle': 'var(--bg-card-subtle)',
        'card-hover': 'var(--bg-card-hover)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        // Semantic aliases mapped to active theme
        ground: 'var(--bg-page)',
        'ground-secondary': 'var(--bg-card)',
        ink: 'var(--text-primary)',
        'ink-secondary': 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        amber: 'var(--accent-warning)',
        teal: 'var(--accent-secondary)',
        hairline: 'var(--border-subtle)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
