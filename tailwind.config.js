/** @type {import('tailwindcss').Config} */
export default {
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
    },
  },
  plugins: [],
}