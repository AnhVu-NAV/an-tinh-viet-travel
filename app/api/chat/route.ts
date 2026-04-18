import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendMessageToGeminiServer } from "@/services/geminiService";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { history = [], language = "vi", message = "" } = body;

        const tours = await prisma.tour.findMany({
            select: { id: true, titleEn: true, titleVi: true, descriptionEn: true, level: true },
            orderBy: { id: "asc" },
        });

        const toursBrief = tours
            .map((tour) => `- ${tour.titleEn} (${tour.titleVi}): ${tour.descriptionEn}. Level: ${tour.level}. ID: ${tour.id}`)
            .join("\n");

        const text = await sendMessageToGeminiServer({
            history,
            newMessage: message,
            language,
            toursBrief,
        });

        return NextResponse.json({ text });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                text: "Xin lỗi, An đang tĩnh tâm một chút. Vui lòng thử lại sau.",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
