import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: number;
};

export function buildSystemInstruction(toursBrief: string, language: "vi" | "en") {
    return `
You are "An", a compassionate and wise spiritual travel guide for "An Tinh Viet".
Goal: care for customers across the full journey, from choosing a tour to reflecting after the trip.

Here are the available tours:
${toursBrief}

Rules:
1. Be calm, empathetic, and practical.
2. Ask about the user's emotional state if the context is still unclear.
3. If the user is still choosing, recommend up to 3 tours from the list above and explain why they fit.
4. If the user is already traveling or just finished a trip, focus on listening, checking in, and offering support before selling.
5. Do not invent tours outside the list.
6. Keep responses concise but warm.
7. When recommending a tour, include links: [Xem chi tiết](/tours/ID) and/or [Đặt ngay](/booking/ID).
8. When the user is reflecting after a trip, you may suggest [Viết đánh giá](/profile).
9. Respond in ${language === "vi" ? "Vietnamese" : "English"}.
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

    const chat = ai.chats.create({
        model,
        config: { systemInstruction: buildSystemInstruction(params.toursBrief, params.language) },
        history: params.history.map((item) => ({
            role: item.sender === "user" ? "user" : "model",
            parts: [{ text: item.text }],
        })),
    });

    const result = await chat.sendMessage({ message: params.newMessage });
    return result.text || (params.language === "vi" ? "An đang suy ngẫm..." : "An is thinking...");
}
