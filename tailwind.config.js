/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',  // Changed from 'media' to 'class
  theme: {
    extend: {},
  },
  plugins: [],
}