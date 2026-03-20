/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0d0d12', 2: '#13131a', 3: '#1a1a24', 4: '#1f1f2e' },
        card: '#16161f',
        accent: { DEFAULT: '#7c6af7', 2: '#a594ff', glow: 'rgba(124,106,247,0.2)' },
        success: '#3dd68c',
        warning: '#f5a623',
        danger: '#ff5f5f',
        info: '#4a9eff',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceDot: { '0%,60%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-5px)' } },
      },
    },
  },
  plugins: [],
};
