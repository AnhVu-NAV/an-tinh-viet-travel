import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    const responses = await prisma.journeyCareResponse.findMany({
        where: bookingId ? { bookingId } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            followUp: {
                select: {
                    kind: true,
                    dayNumber: true,
                },
            },
        },
    });

    return NextResponse.json({
        responses: responses.map((response) => ({
            id: response.id,
            bookingId: response.bookingId,
            followUpId: response.followUpId,
            userId: response.userId,
            authorName: response.authorName,
            message: response.message,
            createdAt: response.createdAt.toISOString(),
            followUp: response.followUp,
        })),
    });
}
