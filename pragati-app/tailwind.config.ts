import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── COLOUR SYSTEM ───────────────────────────────────────────────
      colors: {
        // Base surfaces
        bg: "#FCF8F8",
        surface: "#FFFDFD",
        "surface-2": "#FAF5F5",

        // Brand blush tones (accent, NOT decorative)
        blush: "#FCEFEF",
        rose: "#F8DCDC",
        coral: "#F4B8B8",

        // PRIMARY BRAND — deep muted burgundy/wine
        burgundy: {
          50:  "#FDF2F2",
          100: "#FAE0E0",
          200: "#F4B8B8",
          300: "#E88A8A",
          400: "#D45C5C",
          500: "#B03030",
          600: "#8C2020",
          700: "#7C2D2D",
          800: "#5C1E1E",
          900: "#3D1010",
          DEFAULT: "#7C2D2D",
        },

        // Text
        ink: {
          primary: "#1A1210",
          secondary: "#6B5B5B",
          tertiary: "#9B8B8B",
          inverse: "#FFFDFD",
        },

        // Borders
        border: {
          DEFAULT: "rgba(124, 45, 45, 0.09)",
          strong: "rgba(124, 45, 45, 0.18)",
          subtle: "rgba(124, 45, 45, 0.05)",
        },

        // ── SEMANTIC COLOURS ─────────────────────────────────────────────
        // GREEN = Available / Confirmed / Healthy
        available: {
          50:  "#F0FAF4",
          100: "#D5F0E0",
          500: "#2D7A4F",
          600: "#1F5C3A",
          DEFAULT: "#2D7A4F",
        },

        // AMBER = Limited / Waiting / Low stock
        limited: {
          50:  "#FEF9EC",
          100: "#FDF0C8",
          500: "#B07A2D",
          600: "#8A5F1E",
          DEFAULT: "#B07A2D",
        },

        // RED = Emergency / Critical / Unavailable
        critical: {
          50:  "#FFF0F0",
          100: "#FFD5D5",
          500: "#8B1F1F",
          600: "#6D1515",
          DEFAULT: "#8B1F1F",
        },
      },

      // ─── TYPOGRAPHY ──────────────────────────────────────────────────
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["Inter", "monospace"],
        data: ["Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        "display-xl": ["58px", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.10", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-md": ["38px", { lineHeight: "1.14", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["30px", { lineHeight: "1.18", letterSpacing: "-0.015em", fontWeight: "600" }],
        "heading-xl": ["24px", { lineHeight: "1.28", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-lg": ["20px", { lineHeight: "1.35", letterSpacing: "-0.008em", fontWeight: "600" }],
        "heading-md": ["17px", { lineHeight: "1.45", letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg":    ["17px", { lineHeight: "1.65" }],
        "body-md":    ["15px", { lineHeight: "1.65" }],
        "body-sm":    ["13px", { lineHeight: "1.55" }],
        "label-lg":   ["13px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-md":   ["11px", { lineHeight: "1.4", letterSpacing: "0.06em", fontWeight: "600" }],
        "label-sm":   ["10px", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" }],
        "data-lg":    ["28px", { lineHeight: "1.1", fontWeight: "700", fontFamily: "Inter" }],
        "data-md":    ["20px", { lineHeight: "1.1", fontWeight: "700", fontFamily: "Inter" }],
        "data-sm":    ["15px", { lineHeight: "1.1", fontWeight: "600", fontFamily: "Inter" }],
      },

      // ─── SPACING (8px base unit) ─────────────────────────────────────
      spacing: {
        "0.5": "4px",
        "1":   "8px",
        "1.5": "12px",
        "2":   "16px",
        "2.5": "20px",
        "3":   "24px",
        "3.5": "28px",
        "4":   "32px",
        "5":   "40px",
        "6":   "48px",
        "7":   "56px",
        "8":   "64px",
        "9":   "72px",
        "10":  "80px",
        "12":  "96px",
        "14":  "112px",
        "16":  "128px",
        "18":  "144px",
        "20":  "160px",
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────
      borderRadius: {
        "xs": "6px",
        "sm": "8px",
        "md": "10px",   // inputs, buttons
        "lg": "14px",   // cards
        "xl": "18px",   // large cards
        "2xl": "24px",
      },

      // ─── SHADOWS ─────────────────────────────────────────────────────
      boxShadow: {
        "xs": "0 1px 2px rgba(26, 18, 16, 0.04)",
        "sm": "0 1px 4px rgba(26, 18, 16, 0.06), 0 1px 2px rgba(26, 18, 16, 0.04)",
        "md": "0 2px 8px rgba(26, 18, 16, 0.06), 0 1px 3px rgba(26, 18, 16, 0.04)",
        "lg": "0 4px 16px rgba(26, 18, 16, 0.07), 0 1px 4px rgba(26, 18, 16, 0.04)",
        "card": "0 0 0 1px rgba(124, 45, 45, 0.07), 0 2px 6px rgba(26, 18, 16, 0.05)",
        "card-hover": "0 0 0 1px rgba(124, 45, 45, 0.12), 0 4px 12px rgba(26, 18, 16, 0.08)",
        "none": "none",
      },

      // ─── MAX WIDTH ───────────────────────────────────────────────────
      maxWidth: {
        "content": "1320px",
        "app": "1440px",
      },

      // ─── ANIMATION ───────────────────────────────────────────────────
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
      },
      transitionTimingFunction: {
        "ease-product": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      // ─── GRID ────────────────────────────────────────────────────────
      gridTemplateColumns: {
        "12": "repeat(12, minmax(0, 1fr))",
        "facility": "45fr 55fr",
        "split": "55fr 45fr",
      },
    },
  },
  plugins: [],
};

export default config;
