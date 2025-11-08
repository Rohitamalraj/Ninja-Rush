/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ninja-dark': '#1a1a2e',
        'ninja-red': '#e94560',
        'ninja-gold': '#f4a261',
      },
    },
  },
  plugins: [],
}
