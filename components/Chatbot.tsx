"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

import type { ActiveJourneyPromptContext, ChatMessage } from "@/lib/types";
import { useApp } from "@/providers/AppContext";

function buildWelcomeMessage(language: "vi" | "en"): ChatMessage {
    return {
        id: "welcome",
        sender: "ai",
        text:
            language === "vi"
                ? "Chào bạn, tôi là An. Tôi có thể đồng hành với bạn trước, trong và sau chuyến đi. Hôm nay bạn đang thấy thế nào?"
                : "Hello, I am An. I can stay with you before, during, and after the journey. How are you feeling today?",
        timestamp: Date.now(),
    };
}

export default function Chatbot() {
    const { journeyCarePrompts, language, refresh, sessionReady, user } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage(language)]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeJourneyPrompt, setActiveJourneyPrompt] = useState<ActiveJourneyPromptContext | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const displayedPromptIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!sessionReady || !user || !journeyCarePrompts.length) return;

        const pendingPrompts = journeyCarePrompts.filter((prompt) => !displayedPromptIds.current.has(prompt.followUpId));
        if (!pendingPrompts.length) return;

        setMessages((prev) => [
            ...prev,
            ...pendingPrompts.map((prompt, index) => ({
                id: `${prompt.followUpId}-${index}`,
                sender: "ai" as const,
                text: `${prompt.message[language]}\n\n[${prompt.ctaLabel[language]}](${prompt.ctaHref})`,
                timestamp: Date.now() + index,
            })),
        ]);

        pendingPrompts.forEach((prompt) => displayedPromptIds.current.add(prompt.followUpId));
        const latestPrompt = pendingPrompts.at(-1);
        if (latestPrompt) {
            setActiveJourneyPrompt({
                followUpId: latestPrompt.followUpId,
                bookingId: latestPrompt.bookingId,
                userId: user.id,
                authorName: user.name,
            });
        }

        if (pendingPrompts.some((prompt) => prompt.autoOpen)) {
            setIsOpen(true);
        }
    }, [journeyCarePrompts, language, sessionReady, user]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: inputValue,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const promptContext = activeJourneyPrompt;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: messages.concat(userMessage),
                    message: userMessage.text,
                    language,
                    activeJourneyPrompt: promptContext,
                }),
            });
            const data = await response.json();

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: data.text,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMessage]);
            if (promptContext) {
                setActiveJourneyPrompt(null);
                await refresh().catch(() => undefined);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const activePrompt = activeJourneyPrompt
        ? journeyCarePrompts.find((prompt) => prompt.followUpId === activeJourneyPrompt.followUpId)
        : null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 rounded-full bg-teal-800 p-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-teal-700 ${
                    isOpen ? "hidden" : "flex"
                }`}
            >
                <MessageCircle className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                </span>
            </button>

            <div
                className={`fixed bottom-6 right-6 z-50 flex h-[500px] w-full max-w-sm flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 ${
                    isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-12 opacity-0"
                }`}
            >
                <div className="flex flex-shrink-0 items-center justify-between rounded-t-2xl bg-teal-900 p-4 text-white">
                    <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-amber-400 p-1 text-teal-900">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">An - Spiritual Guide</h3>
                            <p className="text-xs text-teal-200">Always here to listen</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-teal-200 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                                    message.sender === "user"
                                        ? "rounded-br-none bg-teal-800 text-white"
                                        : "rounded-bl-none border border-stone-100 bg-white text-stone-800"
                                }`}
                            >
                                {message.sender === "user" ? (
                                    message.text
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ href, children, ...props }) =>
                                                href?.startsWith("/") ? (
                                                    <Link href={href} className="font-semibold text-teal-600 underline hover:text-teal-800">
                                                        {children}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-teal-600 underline hover:text-teal-800"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                            p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: (props) => <ul className="mb-2 ml-4 list-disc space-y-1" {...props} />,
                                            ol: (props) => <ol className="mb-2 ml-4 list-decimal space-y-1" {...props} />,
                                            li: (props) => <li className="mb-1" {...props} />,
                                            strong: (props) => <strong className="font-bold text-teal-900" {...props} />,
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-none border border-stone-100 bg-white p-3 shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:100ms]" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:200ms]" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 rounded-b-2xl border-t border-stone-100 bg-white p-3">
                    {activePrompt && (
                        <div className="mb-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            {activePrompt.kind === "DAILY_CHECKIN"
                                ? language === "vi"
                                    ? `Phản hồi này sẽ được lưu cho cảm nhận ngày ${activePrompt.dayNumber} của chuyến đi.`
                                    : `This reply will be saved for day ${activePrompt.dayNumber} of your journey.`
                                : language === "vi"
                                  ? "Phản hồi này sẽ được lưu cho cảm nhận sau chuyến đi."
                                  : "This reply will be saved as your post-trip feedback."}
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    void handleSend();
                                }
                            }}
                            placeholder={language === "vi" ? "Chia sẻ cảm xúc của bạn..." : "Share your feelings..."}
                            className="flex-1 rounded-full border-0 bg-stone-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={() => void handleSend()}
                            disabled={isLoading || !inputValue.trim()}
                            className="rounded-full bg-teal-800 p-2 text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
