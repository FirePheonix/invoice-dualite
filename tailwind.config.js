/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      fontSize: {
        'xxs': '8.2px',
      },
      colors: {
        'invoice-blue': '#1155CC',
      }
    },
  },
  plugins: [],
}
