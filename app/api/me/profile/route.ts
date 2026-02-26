import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Body = {
    userId?: string;
    email?: string;
    phone?: string | null;
};

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Body;
    const userId = body.userId;
    const email = body.email;
    const phone = body.phone ?? undefined;

    if (!userId && !email && !phone) {
        return NextResponse.json({ message: "Missing user identity" }, { status: 400 });
    }

    // 1) load user (ưu tiên userId)
    const user = await prisma.user.findFirst({
        where: userId
            ? { id: userId }
            : email
                ? { email }
                : { phone: phone ?? "" },
        select: { id: true, name: true, email: true, phone: true, role: true, active: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 2) load bookings: userId OR contactEmail OR contactPhone
    const rawBookings = await prisma.booking.findMany({
        where: {
            OR: [
                { userId: user.id },
                user.email ? { contactEmail: user.email } : undefined,
                user.phone ? { contactPhone: user.phone } : undefined,
            ].filter(Boolean) as any,
        },
        orderBy: { date: "desc" },
        include: {
            tour: {
                select: { id: true, titleVi: true, titleEn: true, images: true },
            },
        },
    });

    const bookings = rawBookings.map((b) => ({
        id: b.id,
        userId: b.userId,
        tourId: b.tourId,
        scheduleId: b.scheduleId,
        guests: b.guests,
        totalPrice: b.totalPrice,
        currency: b.currency,
        status: b.status,
        date: b.date.toISOString().slice(0, 10),
    }));

    // 3) tours unique (để UI giống bạn đang dùng tours.find)
    const toursMap = new Map<string, any>();
    for (const b of rawBookings) {
        if (b.tour && !toursMap.has(b.tour.id)) {
            toursMap.set(b.tour.id, {
                id: b.tour.id,
                title: { vi: b.tour.titleVi, en: b.tour.titleEn },
                images: b.tour.images ?? [],
            });
        }
    }
    const tours = Array.from(toursMap.values());

    // 4) reviews theo bookingId
    const bookingIds = rawBookings.map((b) => b.id);
    const rawReviews = bookingIds.length
        ? await prisma.review.findMany({
            where: { bookingId: { in: bookingIds } },
            orderBy: { date: "desc" },
        })
        : [];

    const reviews = rawReviews.map((r) => ({
        id: r.id,
        tourId: r.tourId,
        bookingId: r.bookingId,
        user: r.user,
        rating: r.rating,
        comment: r.comment,
        date: r.date.toISOString().slice(0, 10),
    }));

    return NextResponse.json({ user, bookings, tours, reviews });
}