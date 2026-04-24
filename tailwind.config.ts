import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-yellow": "#FACC15",
        "primary-blue": "#2563EB",
        "primary-crimson": "#DC2626",
        "neo-black": "#000000",
      },
      fontFamily: {
        h1: ["var(--font-plus-jakarta)", "sans-serif"],
        h2: ["var(--font-plus-jakarta)", "sans-serif"],
        h3: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-lato)", "sans-serif"],
      },
      boxShadow: {
        neo: "8px 8px 0px 0px rgba(0,0,0,1)",
        "neo-sm": "4px 4px 0px 0px rgba(0,0,0,1)",
      },
    },
  },
  plugins: [],
};
export default config;
