/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff4f0",
          100: "#ffe4d6",
          200: "#ffc9b0",
          300: "#ffa07a",
          400: "#ff7043",
          500: "#ff5722",
          600: "#fc4c02",
          700: "#d43a00",
          800: "#a82e00",
          900: "#7a2200",
        },
      },
    },
  },
  plugins: [],
};
