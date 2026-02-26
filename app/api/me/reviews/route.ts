import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

type Body = {
    bookingId: string;
    tourId: string;
    userName: string;
    rating: number;
    comment: string;
};

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Partial<Body>;

    if (!body.bookingId || !body.tourId || !body.userName || !body.rating || !body.comment) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const rating = Math.max(1, Math.min(5, Number(body.rating)));

    try {
        const created = await prisma.review.create({
            data: {
                id: `rv_${randomUUID()}`,
                bookingId: body.bookingId,
                tourId: body.tourId,
                user: body.userName,
                rating,
                comment: body.comment,
                date: new Date(),
            },
        });

        return NextResponse.json({
            id: created.id,
            tourId: created.tourId,
            bookingId: created.bookingId,
            user: created.user,
            rating: created.rating,
            comment: created.comment,
            date: created.date.toISOString().slice(0, 10),
        });
    } catch (e: any) {
        // bookingId unique -> đã review rồi
        return NextResponse.json({ message: "Already reviewed" }, { status: 409 });
    }
}