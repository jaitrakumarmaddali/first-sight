/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090E",
        surface: {
          DEFAULT: "#0F111A",
          elevated: "#161825",
          panel: "#1C1F32",
          border: "#262A43",
          borderLight: "#353A5D",
        },
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#60A5FA",
          dim: "rgba(59, 130, 246, 0.15)",
        },
        accent: {
          violet: "#8B5CF6",
          violetLight: "#A78BFA",
          violetDim: "rgba(139, 92, 246, 0.15)",
          cyan: "#06B6D4",
        },
        status: {
          success: "#10B981",
          successDim: "rgba(16, 185, 129, 0.15)",
          warning: "#F59E0B",
          warningDim: "rgba(245, 158, 11, 0.15)",
          error: "#EF4444",
          errorDim: "rgba(239, 68, 68, 0.15)",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "scanline": "scanline 8s linear infinite",
        "ripple": "ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
      },
      boxShadow: {
        "neon-blue": "0 0 15px -3px rgba(59, 130, 246, 0.35)",
        "neon-violet": "0 0 15px -3px rgba(139, 92, 246, 0.35)",
        "neon-amber": "0 0 15px -3px rgba(245, 158, 11, 0.35)",
        "neon-emerald": "0 0 15px -3px rgba(16, 185, 129, 0.35)",
      },
    },
  },
  plugins: [],
};
