/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        army: {
          darkest: '#061006',
          dark: '#0a1f0a',
          sidebar: '#0d2610',
          DEFAULT: '#14532d',
          medium: '#16a34a',
          light: '#22c55e',
        },
        gold: {
          DEFAULT: '#d4a017',
          light: '#f0c040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
