import "./globals.css";
import { Inter, Merriweather } from "next/font/google";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    variable: "--font-inter",
});

const merriweather = Merriweather({
    subsets: ["latin", "vietnamese"],
    weight: ["300", "400", "700"],
    style: ["normal", "italic"],
    variable: "--font-merriweather",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
        <body>
        <Providers>{children}</Providers>
        <Analytics />
        </body>
        </html>
    );
}