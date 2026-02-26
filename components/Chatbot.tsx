"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

import { useApp } from "@/providers/AppContext";
import type { ChatMessage } from "@/lib/types"; // hoặc "@/types" tùy dự án bạn

export default function Chatbot() {
    const { language, user, bookings, reviews, tours } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const hasAskedForReview = useRef(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            sender: "ai",
            text:
                language === "vi"
                    ? "Chào bạn, tôi là An. Tâm trạng hôm nay của bạn thế nào? (Căng thẳng, buồn phiền, hay muốn tìm sự bình yên?)"
                    : "Hello, I am An. How is your mood today? (Stressed, sad, or seeking peace?)",
            timestamp: Date.now(),
        },
    ]);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    // hỏi review khi user có booking completed mà chưa review
    useEffect(() => {
        if (user && isOpen && !hasAskedForReview.current) {
            const unreviewedBooking = bookings.find(
                (b) =>
                    b.userId === user.id &&
                    b.status === "COMPLETED" &&
                    !reviews.some((r) => r.bookingId === b.id)
            );

            if (unreviewedBooking) {
                const tour = tours.find((t) => t.id === unreviewedBooking.tourId);
                if (tour) {
                    const tourName = (tour as any).title?.[language] ?? (tour as any).titleVi ?? "Tour";
                    const messageText =
                        language === "vi"
                            ? `Chào ${user.name}, chúc mừng bạn đã hoàn thành chuyến đi **${tourName}**. Bạn cảm thấy thế nào? Hãy chia sẻ cảm nhận của mình nhé! [Viết đánh giá](/profile)`
                            : `Hi ${user.name}, congratulations on completing **${tourName}**. How was your journey? Please share your thoughts! [Write a review](/profile)`;

                    setMessages((prev) => [
                        ...prev,
                        { id: "ai-review-" + Date.now(), sender: "ai", text: messageText, timestamp: Date.now() },
                    ]);
                    hasAskedForReview.current = true;
                }
            }
        }
    }, [user, isOpen, bookings, reviews, tours, language]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: inputValue,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: messages.concat(userMsg),
                    message: userMsg.text,
                    language,
                }),
            });
            const data = await res.json();
            const responseText = data.text;

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: responseText,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, aiMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 bg-teal-800 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 ${
                    isOpen ? "hidden" : "flex"
                }`}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl transition-all duration-300 transform border border-stone-200 flex flex-col ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
                }`}
                style={{ height: "500px" }}
            >
                {/* Header */}
                <div className="bg-teal-900 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="bg-amber-400 p-1 rounded-full text-teal-900">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">An - Spiritual Guide</h3>
                            <p className="text-xs text-teal-200">Always here to listen</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-teal-200 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.sender === "user"
                                        ? "bg-teal-800 text-white rounded-br-none"
                                        : "bg-white text-stone-800 border border-stone-100 rounded-bl-none"
                                }`}
                            >
                                {msg.sender === "user" ? (
                                    msg.text
                                ) : (
                                    <div className="markdown-body">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ href, children, ...props }) => {
                                                    if (href?.startsWith("/")) {
                                                        return (
                                                            <Link href={href} className="text-teal-600 hover:text-teal-800 underline font-semibold">
                                                                {children}
                                                            </Link>
                                                        );
                                                    }
                                                    return (
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-teal-600 hover:text-teal-800 underline font-semibold"
                                                            href={href}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </a>
                                                    );
                                                },
                                                p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: (props) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                                ol: (props) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                                li: (props) => <li className="mb-1" {...props} />,
                                                strong: (props) => <strong className="font-bold text-teal-900" {...props} />,
                                                h1: (props) => <h1 className="text-lg font-bold mb-2 text-teal-900" {...props} />,
                                                h2: (props) => <h2 className="text-base font-bold mb-2 text-teal-900" {...props} />,
                                                h3: (props) => <h3 className="text-sm font-bold mb-1 text-teal-900" {...props} />,
                                                blockquote: (props) => (
                                                    <blockquote className="border-l-4 border-teal-200 pl-3 italic text-stone-600 my-2" {...props} />
                                                ),
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-stone-100">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white rounded-b-2xl border-t border-stone-100 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={language === "vi" ? "Chia sẻ cảm xúc của bạn..." : "Share your feelings..."}
                            className="flex-1 bg-stone-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputValue}
                            className="bg-teal-800 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}