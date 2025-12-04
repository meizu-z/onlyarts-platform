/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#1a1a1a',
          dark: '#121212',
          text: '#f2e9dd',
          purple: '#8c52ff',
          pink: '#cb6ce6',
          accent: '#e8a880'
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        'bubble-1': 'bubble1 1.2s ease-out forwards',
        'bubble-2': 'bubble2 1.3s ease-out 0.1s forwards',
        'bubble-3': 'bubble3 1.4s ease-out 0.2s forwards',
        'bubble-4': 'bubble4 1.2s ease-out 0.15s forwards',
        'bubble-5': 'bubble5 1.3s ease-out 0.25s forwards',
        'bubble-6': 'bubble6 1.4s ease-out 0.35s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bubble1: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(-15px, -25px) scale(1.2)' },
        },
        bubble2: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(-25px, -15px) scale(1)' },
        },
        bubble3: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(-10px, -30px) scale(0.8)' },
        },
        bubble4: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(15px, 25px) scale(1.2)' },
        },
        bubble5: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(25px, 15px) scale(1)' },
        },
        bubble6: {
          '0%': { opacity: 0, transform: 'translate(0, 0) scale(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translate(10px, 30px) scale(0.8)' },
        },
      }
    },
  },
  plugins: [],
}