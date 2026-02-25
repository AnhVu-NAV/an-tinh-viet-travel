import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";
import { TOURS } from "../constants";

// In a real app, never expose API keys on the client.
// This is for demonstration purposes within a secured environment or local dev.
const apiKey = process.env.API_KEY || 'YOUR_GEMINI_API_KEY';

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `
You are "An", a compassionate and wise spiritual travel guide for "An Tinh Viet".
Your goal is to help users find the perfect travel experience based on their current emotional state (Mood).
The user might feel Stressed, Sad, or simply seeking Peace.

Here are the available tours in our catalog:
${TOURS.map(t => `- ${t.title.en} (${t.title.vi}): ${t.description.en}. Level: ${t.level}. ID: ${t.id}`).join('\n')}

Rules:
1. Always be polite, calm, and empathetic. Use "Gentle" language.
2. Ask the user how they are feeling if they haven't said so.
3. Based on their mood, recommend up to 3 suitable tours from the list above. Explain why.
4. Do not invent tours that are not in the list.
5. Keep responses concise but warm.
6. When recommending a tour, ALWAYS provide a direct link to book it using this specific format: [Book Now](/booking/ID) or [Xem chi tiết](/tours/ID) or [Đặt ngay](/booking/ID).
   Example: "Bạn nên thử tour [Đường Thiền Tĩnh Tại](/tours/t1). [Đặt ngay](/booking/t1)"
7. Support both Vietnamese and English based on the user's language.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  language: 'vi' | 'en'
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct history for the model
    // Note: The simple @google/genai chat history format is usually handled by the Chat object
    // Here we will do a stateless call for simplicity or a stateful one if possible.
    // For this implementation, we'll use a single generateContent call with history context injected as text 
    // to ensure robustness in this specific demo environment, or use the chat API if persistent.
    
    // Let's use the Chat API for better context management
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction + `\nUser Language: ${language === 'vi' ? 'Vietnamese' : 'English'}`,
      },
      history: history.map(h => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I am meditating on your answer...";
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'vi' 
      ? "Xin lỗi, hiện tại An đang tịnh tâm (lỗi kết nối). Vui lòng thử lại sau." 
      : "Apologies, An is meditating (connection error). Please try again later.";
  }
};
