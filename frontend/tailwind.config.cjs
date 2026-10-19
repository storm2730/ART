/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "0 0% 0%",
        card: "14 12% 6%",
        cardBorder: "25 20% 20%",
        primary: "220 80% 55%",
        primaryHover: "220 80% 60%",
        secondary: "14 100% 60%",
        success: "140 70% 50%",
        warning: "40 95% 55%",
        danger: "0 70% 60%",
        "glass-border": "25 20% 20% / 0.5",
        "glass-bg": "25 20% 25% / 0.3",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
