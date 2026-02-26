"use client";

import React from "react";
import { X } from "lucide-react";

export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  children,
                              }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up border border-white/50">
                <div className="px-8 py-5 border-b border-sand-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                    <h3 className="text-xl font-serif font-bold text-earth-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-sand-100 rounded-full text-stone-400 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8">{children}</div>
            </div>
        </div>
    );
}