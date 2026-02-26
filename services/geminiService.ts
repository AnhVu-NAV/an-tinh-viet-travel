// src/services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: number;
};

// system prompt (gọn, không phụ thuộc TOURS ở client)
export function buildSystemInstruction(toursBrief: string, language: "vi" | "en") {
    return `
You are "An", a compassionate and wise spiritual travel guide for "An Tinh Viet".
Goal: recommend suitable tours based on user's mood.

Here are the available tours:
${toursBrief}

Rules:
1. Polite, calm, empathetic.
2. Ask user's mood if not provided.
3. Recommend up to 3 tours from the list above. Explain why.
4. Do not invent tours outside the list.
5. Keep responses concise but warm.
6. When recommending, include links: [Xem chi tiết](/tours/ID) and/or [Đặt ngay](/booking/ID).
7. Respond in ${language === "vi" ? "Vietnamese" : "English"}.
`.trim();
}

export async function sendMessageToGeminiServer(params: {
    history: ChatMessage[];
    newMessage: string;
    language: "vi" | "en";
    toursBrief: string;
}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    const systemInstruction = buildSystemInstruction(params.toursBrief, params.language);

    const chat = ai.chats.create({
        model,
        config: { systemInstruction },
        history: params.history.map((h) => ({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }],
        })),
    });

    const result = await chat.sendMessage({ message: params.newMessage });
    return result.text || (params.language === "vi" ? "An đang suy ngẫm..." : "An is thinking...");
}