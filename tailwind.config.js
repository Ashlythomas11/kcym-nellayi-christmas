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
        christmas: {
          darkGreen: '#0D1C20',
          emerald: '#0A3D3A',
          lightGreen: '#15524D',
          burgundy: '#6A161C',
          red: '#6A161C',
          brightRed: '#84252B',
          gold: '#C8AA69',
          lightGold: '#FAECD8',
          champagne: '#FAECD8',
          ivory: '#FAECD8',
          parchment: '#F4E5CE',
          wood: '#303B35',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        malayalam: ['"Plus Jakarta Sans"', '"Chilanka"', '"Noto Sans Malayalam"', '"Manjari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(200, 170, 105, 0.22)',
        'red-glow': '0 0 20px rgba(106, 22, 28, 0.28)',
        'emerald-glow': '0 0 24px rgba(10, 61, 58, 0.35)',
        'card': '0 10px 30px -5px rgba(13, 28, 32, 0.18), 0 4px 6px -2px rgba(13, 28, 32, 0.08)',
        'card-hover': '0 20px 40px -10px rgba(13, 28, 32, 0.28), 0 8px 12px -3px rgba(200, 170, 105, 0.14)',
      },
      animation: {
        'snow-slow': 'snowfall 10s linear infinite',
        'fairy-glow': 'fairy-glow 4s ease-in-out infinite',
        'count-tick': 'count-tick 0.35s ease-out',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10px) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(100vh) translateX(20px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fairy-glow': {
          '0%, 100%': { opacity: '0.45', boxShadow: '0 0 5px rgba(232, 199, 130, 0.35)' },
          '50%': { opacity: '1', boxShadow: '0 0 12px rgba(232, 199, 130, 0.8)' },
        },
        'count-tick': {
          '0%': { transform: 'translateY(5px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
