// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { sendMessageToGeminiServer } from "@/services/geminiService";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { history = [], message = "", language = "vi" } = body;

        // lấy list tour từ DB để làm catalog ngắn
        const tours = await prisma.tour.findMany({
            select: { id: true, titleEn: true, titleVi: true, descriptionEn: true, level: true },
            orderBy: { id: "asc" },
        });

        const toursBrief = tours
            .map((t) => `- ${t.titleEn} (${t.titleVi}): ${t.descriptionEn}. Level: ${t.level}. ID: ${t.id}`)
            .join("\n");

        const text = await sendMessageToGeminiServer({
            history,
            newMessage: message,
            language,
            toursBrief,
        });

        return NextResponse.json({ text });
    } catch (e: any) {
        return NextResponse.json(
            { text: "Xin lỗi, An đang tịnh tâm (lỗi kết nối). Vui lòng thử lại sau.", error: e?.message },
            { status: 500 }
        );
    }
}