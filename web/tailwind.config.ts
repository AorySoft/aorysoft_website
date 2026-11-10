import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--color-line) / <alpha-value>)",
          strong: "rgb(var(--color-line-strong) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-ink-subtle) / <alpha-value>)",
        },
        signal: {
          DEFAULT: "rgb(var(--color-signal) / <alpha-value>)",
          deep: "rgb(var(--color-signal-deep) / <alpha-value>)",
          soft: "rgb(var(--color-signal) / 0.14)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        atelier: "6px",
        "atelier-lg": "10px",
      },
      maxWidth: {
        measure: "42rem",
      },
      boxShadow: {
        signal: "0 12px 40px -16px rgba(6, 182, 212, 0.35)",
        soft: "0 18px 50px -28px rgba(0, 0, 0, 0.75)",
      },
      backgroundImage: {
        "signal-field":
          "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(37, 99, 235, 0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(6, 182, 212, 0.14), transparent 50%)",
        "signal-mark":
          "linear-gradient(135deg, rgb(var(--color-signal-deep)) 0%, rgb(var(--color-signal)) 100%)",
      },
      keyframes: {
        "field-drift": {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      animation: {
        "field-drift": "field-drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
