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
        ground: '#0A0C0E',
        'ground-secondary': '#101317',
        ink: '#EDE7DC',
        'ink-secondary': '#9EA5A8',
        muted: '#6C7378',
        amber: '#E8913C',
        teal: '#2E6B72',
        hairline: 'rgba(237, 231, 220, 0.13)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

