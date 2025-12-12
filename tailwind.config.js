/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Vazirmatn'", "sans-serif"],
        body: ["'Inter'", "'Vazirmatn'", "system-ui"],
      },
      colors: {
        midnight: "#0B1221",
        ink: "#0F172A",
        teal: {
          500: "#2DD4BF",
          600: "#14B8A6",
        },
        royal: {
          500: "#4F46E5",
          600: "#4338CA",
        },
      },
      boxShadow: {
        glass: "0 10px 60px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
