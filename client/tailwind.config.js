/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#525252",
        accent: "#171717",
        background: "#fafafa",
        surface: "#ffffff",
        border: "#e5e5e5",
        muted: "#737373",
      },
    },
  },
  plugins: [],
}
