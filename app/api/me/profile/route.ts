import { NextResponse } from "next/server";
// import { PrismaClient, BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {BookingStatus} from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// const prisma = new PrismaClient();

type Body = {
    userId?: string | null;
    email?: string | null;
    phone?: string | null;
};

const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as Body;

        const user =
            body.userId
                ? await prisma.user.findUnique({ where: { id: body.userId } })
                : body.email
                    ? await prisma.user.findUnique({ where: { email: body.email } })
                    : body.phone
                        ? await prisma.user.findUnique({ where: { phone: body.phone } })
                        : null;

        if (!user) {
            return NextResponse.json({
                user: {
                    id: body.userId ?? "unknown",
                    name: "Unknown",
                    email: body.email ?? "",
                    phone: body.phone ?? null,
                    role: "USER",
                    active: true,
                },
                bookings: [],
                tours: [],
                reviews: [],
            });
        }

        // bookings của user
        const bookings = await prisma.booking.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            include: {
                tour: { select: { id: true, titleVi: true, titleEn: true, images: true } },
                schedule: { select: { id: true, startDate: true } },
            },
        });

        // tours lite lấy từ bookings (để map ảnh/title ở UI)
        const tours = bookings.map((b) => ({
            id: b.tour.id,
            title: { vi: b.tour.titleVi, en: b.tour.titleEn },
            images: b.tour.images,
        }));

        // reviews: nếu bạn muốn show tất cả review của user theo bookingId (unique) thì cần lọc bằng bookingIds
        const bookingIds = bookings.map((b) => b.id);
        const reviews = await prisma.review.findMany({
            where: { bookingId: { in: bookingIds } },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                active: user.active,
            },

            bookings: bookings.map((b) => ({
                id: b.id,
                userId: b.userId,
                tourId: b.tourId,
                scheduleId: b.scheduleId,
                guests: b.guests,
                totalPrice: b.totalPrice,
                currency: b.currency,
                status: b.status as BookingStatus,

                date: toDateOnly(b.date),
                departureDate: toDateOnly(b.schedule.startDate),
            })),

            tours,

            reviews: reviews.map((r) => ({
                id: r.id,
                tourId: r.tourId,
                bookingId: r.bookingId,
                user: r.user,
                rating: r.rating,
                comment: r.comment,
                date: toDateOnly(r.date),
            })),
        });
    } catch (e) {
        console.error("POST /api/me/profile error:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// (tuỳ bạn) GET để test nhanh trên browser
export async function GET() {
    return NextResponse.json({ ok: true, hint: "Use POST with {userId/email/phone}" });
}