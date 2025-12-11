/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}", // CRITICAL: Must include all source file types
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}