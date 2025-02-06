/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        roboto: ["var(--font-roboto)", ...defaultTheme.fontFamily.sans],
        alkatra: ["var(--font-alkatra)", ...defaultTheme.fontFamily.sans],
        raleway: ["var(--font-raleway)", ...defaultTheme.fontFamily.sans],
        ubuntu: ["var(--font-ubuntu)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("daisyui")],
};
