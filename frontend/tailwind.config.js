/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b12",
        panel: "#111722",
        coral: "#ff5a47",
        cream: "#f4efe7",
        mist: "#9ba5b5",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Georgia", "serif"],
      },
      boxShadow: { glow: "0 20px 60px rgba(255,90,71,.18)" },
    },
  },
  plugins: [],
};
