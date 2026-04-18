import { BookingStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getJourneyDurationDays, getJourneyState } from "@/lib/journey-care";
import {
    attachUserToKnownBookings,
    getJourneyCarePromptsForBookings,
    processDueJourneyFollowUpEmails,
    seedJourneyFollowUpsForBookings,
} from "@/lib/journey-care-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
    userId?: string | null;
    email?: string | null;
    phone?: string | null;
};

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

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
                journeyCarePrompts: [],
            });
        }

        await attachUserToKnownBookings({
            userId: user.id,
            email: user.email,
            phone: user.phone ?? body.phone ?? null,
        });

        const bookingOrFilters: Prisma.BookingWhereInput[] = [{ userId: user.id }, { contactEmail: user.email }];
        if (user.phone) {
            bookingOrFilters.push({ contactPhone: user.phone });
        }

        const bookings = await prisma.booking.findMany({
            where: { OR: bookingOrFilters },
            orderBy: { date: "desc" },
            include: {
                tour: {
                    select: {
                        id: true,
                        titleVi: true,
                        titleEn: true,
                        images: true,
                        durationDays: true,
                    },
                },
                schedule: { select: { id: true, startDate: true } },
            },
        });

        await seedJourneyFollowUpsForBookings(
            bookings.map((booking) => ({
                bookingId: booking.id,
                startDate: booking.schedule.startDate,
                durationDays: booking.tour.durationDays,
            }))
        );

        if (bookings.length) {
            await processDueJourneyFollowUpEmails({
                bookingIds: bookings.map((booking) => booking.id),
            });
        }

        const tours = bookings.map((booking) => ({
            id: booking.tour.id,
            title: { vi: booking.tour.titleVi, en: booking.tour.titleEn },
            images: booking.tour.images,
        }));

        const bookingIds = bookings.map((booking) => booking.id);
        const reviews = await prisma.review.findMany({
            where: { bookingId: { in: bookingIds } },
            orderBy: { date: "desc" },
        });

        const journeyCarePrompts = await getJourneyCarePromptsForBookings(
            bookings.map((booking) => ({
                id: booking.id,
                userId: booking.userId,
                tourId: booking.tourId,
                status: booking.status,
                contactName: booking.contactName,
                contactEmail: booking.contactEmail,
                tour: {
                    id: booking.tour.id,
                    titleVi: booking.tour.titleVi,
                    titleEn: booking.tour.titleEn,
                    durationDays: booking.tour.durationDays,
                },
                schedule: {
                    startDate: booking.schedule.startDate,
                },
            }))
        );

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                active: user.active,
            },
            bookings: bookings.map((booking) => ({
                id: booking.id,
                userId: booking.userId,
                tourId: booking.tourId,
                scheduleId: booking.scheduleId,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                currency: booking.currency,
                status: booking.status as BookingStatus,
                date: toDateOnly(booking.date),
                departureDate: toDateOnly(booking.schedule.startDate),
                durationDays: getJourneyDurationDays(booking.tour.durationDays),
                journeyState: getJourneyState({
                    bookingStatus: booking.status,
                    startDate: booking.schedule.startDate,
                    rawDurationDays: booking.tour.durationDays,
                }),
            })),
            tours,
            reviews: reviews.map((review) => ({
                id: review.id,
                tourId: review.tourId,
                bookingId: review.bookingId,
                user: review.user,
                rating: review.rating,
                comment: review.comment,
                date: toDateOnly(review.date),
            })),
            journeyCarePrompts,
        });
    } catch (error) {
        console.error("POST /api/me/profile error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, hint: "Use POST with {userId/email/phone}" });
}
