/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        god: {
          darkest: "#08090A",
          dark: "#0E1013",
          card: "rgba(18, 21, 26, 0.65)",
          cardHover: "rgba(25, 30, 38, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
          textPrimary: "#EDEDED",
          textSecondary: "#717680",
          textMuted: "#4B505A",
          accent: "#FFFFFF",
          neonCyan: "#00F0FF",
          neonPurple: "#8A2BE2",
          neonEmerald: "#10B981",
          neonRose: "#F43F5E",
          trafficRed: "#FF5F56",
          trafficYellow: "#FFBD2E",
          trafficGreen: "#27C93F",
        },
      },
      fontFamily: {
        sans: [
          "Geist",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0, 0, 0, 0.6)",
        glassHover: "0 25px 60px rgba(0, 0, 0, 0.8)",
        subtleGlow: "0 0 25px rgba(255, 255, 255, 0.05)",
        neonGlow: "0 0 30px rgba(0, 240, 255, 0.25)",
      },
      backdropBlur: {
        acrylic: "24px",
      },
    },
  },
  plugins: [],
};
