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
        dhanekula: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0f172a',
          navy: '#1e3a8a',
          royal: '#1d4ed8',
          gold: '#d97706',
        },
        groupA: {
          light: '#ecfdf5',
          DEFAULT: '#059669',
          dark: '#047857',
          accent: '#10b981',
        },
        groupB: {
          light: '#fff7ed',
          DEFAULT: '#ea580c',
          dark: '#c2410c',
          accent: '#f97316',
        }
      },
      boxShadow: {
        'college-card': '0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 4px 12px -4px rgba(15, 23, 42, 0.04)',
        'college-hover': '0 20px 40px -15px rgba(30, 58, 138, 0.15), 0 8px 16px -6px rgba(30, 58, 138, 0.08)',
        'soft-glow': '0 0 20px 0 rgba(2, 132, 199, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
