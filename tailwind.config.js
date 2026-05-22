/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: '#090214',
        brandCard: '#130922',
        brandNeon: '#E614BE',
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          100: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        lexend: ['"Lexend"', 'sans-serif'],
      },
      animation: {
        'mesh-shift-1': 'meshShift1 22s ease infinite',
        'mesh-shift-2': 'meshShift2 18s ease infinite',
        'mesh-shift-3': 'meshShift3 25s ease infinite',
      },
      keyframes: {
        meshShift1: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.95)' },
        },
        meshShift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-50px, 50px) scale(1.2)' },
        },
        meshShift3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '40%': { transform: 'translate(60px, -30px) scale(0.9)' },
          '80%': { transform: 'translate(-40px, -40px) scale(1.1)' },
        },
      }
    },
  },
  plugins: [],
};
