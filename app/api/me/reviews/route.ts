import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getJourneyState } from "@/lib/journey-care";
import { resolveJourneyCareAfterReview } from "@/lib/journey-care-service";
import { prisma } from "@/lib/prisma";

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
        const booking = await prisma.booking.findUnique({
            where: { id: body.bookingId },
            include: {
                schedule: { select: { startDate: true } },
                tour: { select: { id: true, durationDays: true } },
            },
        });

        if (!booking || booking.tourId !== body.tourId) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (booking.status === "CANCELLED") {
            return NextResponse.json({ message: "Cancelled booking cannot be reviewed" }, { status: 400 });
        }

        const journeyState = getJourneyState({
            bookingStatus: booking.status,
            startDate: booking.schedule.startDate,
            rawDurationDays: booking.tour.durationDays,
        });

        if (journeyState !== "FINISHED") {
            return NextResponse.json({ message: "Trip is not finished yet" }, { status: 400 });
        }

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

        await resolveJourneyCareAfterReview(created.bookingId ?? body.bookingId);

        return NextResponse.json({
            id: created.id,
            tourId: created.tourId,
            bookingId: created.bookingId,
            user: created.user,
            rating: created.rating,
            comment: created.comment,
            date: created.date.toISOString().slice(0, 10),
        });
    } catch (error: unknown) {
        console.error("POST /api/me/reviews error:", error);
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
            return NextResponse.json({ message: "Already reviewed" }, { status: 409 });
        }
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
