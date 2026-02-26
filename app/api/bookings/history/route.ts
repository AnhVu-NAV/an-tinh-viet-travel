import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Query: ?userId=... OR ?email=...
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
        return NextResponse.json({ message: "Missing userId/email" }, { status: 400 });
    }

    const bookings = await prisma.booking.findMany({
        where: userId ? { userId } : { contactEmail: email! },
        orderBy: { date: "desc" },
        include: {
            tour: { select: { id: true, titleVi: true, titleEn: true, images: true } },
            schedule: { select: { id: true, startDate: true } },
        },
    });

    return NextResponse.json({
        bookings: bookings.map((b) => ({
            id: b.id,
            tourId: b.tourId,
            scheduleId: b.scheduleId,
            guests: b.guests,
            totalPrice: b.totalPrice,
            currency: b.currency,
            status: b.status,
            date: b.date.toISOString(),
            discountCode: b.discountCode,
            tour: {
                id: b.tour.id,
                title: { vi: b.tour.titleVi, en: b.tour.titleEn },
                image: b.tour.images?.[0] ?? null,
            },
            schedule: { id: b.schedule.id, startDate: b.schedule.startDate.toISOString().slice(0, 10) },
        })),
    });
}