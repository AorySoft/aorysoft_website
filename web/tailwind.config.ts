import type { Config } from "tailwindcss";

// Intentionally stock: the reference app (frontend/) uses bare Tailwind 3.4
// defaults, so ported utility classes render identically. Design-system
// extensions (typography scale, colors, motion) are added in Phase 8 only
// with explicit approval.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
