/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ajuste os caminhos se necessário para onde estão seus arquivos
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0", // slate-200
        input: "#e2e8f0",
        ring: "#16a34a", // green-600
        background: "#f8fafc", // slate-50 (fundo da tela)
        foreground: "#0f172a", // slate-900 (texto principal)

        primary: {
          DEFAULT: "#16a34a", // green-600 (Cor principal do app)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444", // red-500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#64748b", // slate-500
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: "0.75rem", // 12px (padrão shadcn)
        xl: "1rem",    // 16px
        "2xl": "1.5rem", // 24px
      },
    },
  },
  plugins: [],
};