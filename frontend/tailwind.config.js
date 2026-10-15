/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: "#F04D4A",
        brandYellow: "#FFD700",
        bgPink: "#F8E9EB",
      },
    },
  },
  plugins: [],
};