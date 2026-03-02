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

export const metadata = {
    title: {
        default: "An Tinh Viet - Spiritual Travel",
        template: "%s | An Tinh Viet",
    },
    description: "Hành trình an tịnh - chữa lành - khám phá Việt Nam",
    icons: {
        icon: "/logo.png",
    },
    openGraph: {
        title: "An Tinh Viet",
        description: "Spiritual Travel & Healing Journey in Vietnam",
        type: "website",
    },
};

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