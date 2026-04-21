import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B10302",
          hover: "#B40304",
          pressed: "#A80302",
          deep: "#870807",
          soft: "#8E3635",
        },
        surface: {
          DEFAULT: "#0A0A0A",
          alt: "#141414",
        },
        border: { DEFAULT: "#2A2A2A" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        arabic: ["'IBM Plex Sans Arabic'", "Cairo", "ui-sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "18px" },
    },
  },
  plugins: [],
} satisfies Config;
