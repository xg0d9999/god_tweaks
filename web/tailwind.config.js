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
        background: '#07090b',
        'background-card': '#0d1115',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        brand: {
          gold: '#FFE500',
          cyan: '#38BDF8',
          green: '#10B981',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 35px -5px rgba(255, 229, 0, 0.25)',
        'glow-cyan': '0 0 35px -5px rgba(56, 189, 248, 0.25)',
        'glow-card': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
