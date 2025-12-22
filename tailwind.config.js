/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the coin flip dApp
        'coin-gold': '#FFD700',
        'coin-silver': '#C0C0C0',
      }
    },
  },
  plugins: [],
}
