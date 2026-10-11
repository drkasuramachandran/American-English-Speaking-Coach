/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 2px 6px rgba(37, 99, 235, 0.08), 0 16px 40px rgba(37, 99, 235, 0.12)',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.45)' },
          '70%': { boxShadow: '0 0 0 16px rgba(37, 99, 235, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)' },
        },
      },
      animation: {
        wave: 'wave 1s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
