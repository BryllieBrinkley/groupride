import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1F3A",
        copy: "#374151",
        copyMuted: "#6B7280",
        canvas: "#FFFFFF",
        panel: "#FFFFFF",
        surface: "#F6F8FA",
        line: "#E5E7EB",
        accent: "#3B82F6",
        accentSoft: "#E8F1FE",
        success: "#16A34A",
        successSoft: "#DCFCE7",
        danger: "#DC2626",
        warning: "#CA8A04",
        warningSoft: "#FEF3C7"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(11, 31, 58, 0.06)",
        card: "0 4px 20px rgba(11, 31, 58, 0.04)",
        button: "0 6px 16px rgba(11, 31, 58, 0.12)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
