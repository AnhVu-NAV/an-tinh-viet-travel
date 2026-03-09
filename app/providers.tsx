"use client";

import React from "react";
import { AppProvider } from "@/providers/AppContext";
import {Header} from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <div className="flex min-h-screen flex-col font-sans text-earth-900 bg-sand-50 selection:bg-primary-light selection:text-white">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Chatbot />
            </div>
        </AppProvider>
    );
}