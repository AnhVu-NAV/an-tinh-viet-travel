import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./providers/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: "#588157", dark: "#3a5a40", light: "#a3b18a" },
                sand: { 50: "#fdfbf7", 100: "#f5f2ea", 200: "#e3d5ca", 300: "#d5bdaf" },
                earth: { 800: "#344e41", 900: "#2f3e46" },
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
            },
            animation: {
                "fade-in": "fadeIn 1s ease-out forwards",
                "slide-up": "slideUp 0.8s ease-out forwards",
                float: "float 6s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
                float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
            },
        },
    },
    plugins: [],
};

export default config;