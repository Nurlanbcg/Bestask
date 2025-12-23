/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',
        border: '#E2E8F0', // Slate 200
        primary: {
          DEFAULT: '#2563EB', // Blue 600
          hover: '#1D4ED8', // Blue 700
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#F1F5F9', // Slate 100
          hover: '#E2E8F0', // Slate 200
          foreground: '#0F172A' // Slate 900
        },
        muted: {
          DEFAULT: '#64748B', // Slate 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
