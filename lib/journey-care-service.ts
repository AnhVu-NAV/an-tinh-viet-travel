import { JourneyFollowUpKind, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
    buildJourneyCarePrompt,
    buildJourneyFollowUpSchedule,
    getJourneyDurationDays,
    getJourneyState,
    type JourneyCarePrompt,
} from "@/lib/journey-care";
import { sendJourneyFollowUpEmail } from "@/lib/mailer";

type BookingSeedInput = {
    bookingId: string;
    startDate: Date;
    durationDays: number;
};

type BookingPromptContext = {
    id: string;
    userId: string | null;
    tourId: string;
    status: string;
    contactName: string | null;
    contactEmail: string | null;
    tour: {
        id: string;
        titleVi: string;
        titleEn: string;
        durationDays: number;
    };
    schedule: {
        startDate: Date;
    };
};

export async function seedJourneyFollowUpsTx(tx: Prisma.TransactionClient, input: BookingSeedInput) {
    const data = buildJourneyFollowUpSchedule(input.startDate, input.durationDays).map((item) => ({
        bookingId: input.bookingId,
        kind: item.kind,
        dayNumber: item.dayNumber,
        dueAt: item.dueAt,
    }));

    if (!data.length) return;

    await tx.journeyFollowUp.createMany({
        data,
        skipDuplicates: true,
    });
}

export async function seedJourneyFollowUpsForBookings(bookings: BookingSeedInput[]) {
    if (!bookings.length) return;

    const data = bookings.flatMap((booking) =>
        buildJourneyFollowUpSchedule(booking.startDate, booking.durationDays).map((item) => ({
            bookingId: booking.bookingId,
            kind: item.kind,
            dayNumber: item.dayNumber,
            dueAt: item.dueAt,
        }))
    );

    if (!data.length) return;

    await prisma.journeyFollowUp.createMany({
        data,
        skipDuplicates: true,
    });
}

export async function processDueJourneyFollowUpEmails(params?: { bookingIds?: string[] }) {
    if (params?.bookingIds && params.bookingIds.length === 0) {
        return {
            dueCount: 0,
            emailed: 0,
            resolved: 0,
        };
    }

    const now = new Date();

    const followUps = await prisma.journeyFollowUp.findMany({
        where: {
            dueAt: { lte: now },
            emailSentAt: null,
            booking: {
                status: { not: "CANCELLED" },
                ...(params?.bookingIds?.length ? { id: { in: params.bookingIds } } : {}),
            },
        },
        include: {
            booking: {
                include: {
                    schedule: {
                        select: {
                            startDate: true,
                        },
                    },
                    tour: {
                        select: {
                            id: true,
                            titleVi: true,
                            titleEn: true,
                            durationDays: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
    });

    let emailed = 0;
    let resolved = 0;

    for (const followUp of followUps) {
        const journeyState = getJourneyState({
            bookingStatus: followUp.booking.status,
            startDate: followUp.booking.schedule.startDate,
            rawDurationDays: followUp.booking.tour.durationDays,
            now,
        });

        if (followUp.kind === JourneyFollowUpKind.DAILY_CHECKIN && journeyState !== "IN_PROGRESS") {
            await prisma.journeyFollowUp.update({
                where: { id: followUp.id },
                data: { resolvedAt: now, emailSentAt: now },
            });
            resolved += 1;
            continue;
        }

        if (followUp.kind === JourneyFollowUpKind.POST_TRIP_REVIEW) {
            const review = await prisma.review.findFirst({
                where: { bookingId: followUp.bookingId },
                select: { id: true },
            });

            if (review) {
                await prisma.journeyFollowUp.update({
                    where: { id: followUp.id },
                    data: { resolvedAt: now, emailSentAt: now },
                });
                resolved += 1;
                continue;
            }
        }

        const email = followUp.booking.contactEmail?.trim();
        if (!email) continue;

        await sendJourneyFollowUpEmail({
            language: "vi",
            toCustomer: email,
            customerName: followUp.booking.contactName,
            tourTitle: `${followUp.booking.tour.titleVi} / ${followUp.booking.tour.titleEn}`,
            kind: followUp.kind,
            dayNumber: followUp.dayNumber,
            durationDays: getJourneyDurationDays(followUp.booking.tour.durationDays),
            reviewUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/profile` : "/profile",
        });

        await prisma.journeyFollowUp.update({
            where: { id: followUp.id },
            data: { emailSentAt: now },
        });

        emailed += 1;
    }

    return {
        dueCount: followUps.length,
        emailed,
        resolved,
    };
}

export async function attachUserToKnownBookings(params: {
    userId: string;
    email: string;
    phone?: string | null;
}) {
    const orFilters: Prisma.BookingWhereInput[] = [{ contactEmail: params.email }];

    if (params.phone) {
        orFilters.push({ contactPhone: params.phone });
    }

    await prisma.booking.updateMany({
        where: {
            userId: null,
            OR: orFilters,
        },
        data: { userId: params.userId },
    });
}

export async function getJourneyCarePromptsForBookings(bookings: BookingPromptContext[]) {
    if (!bookings.length) return [] as JourneyCarePrompt[];

    const now = new Date();
    const bookingIds = bookings.map((booking) => booking.id);
    const reviewByBookingId = new Set(
        (
            await prisma.review.findMany({
                where: { bookingId: { in: bookingIds } },
                select: { bookingId: true },
            })
        )
            .map((review) => review.bookingId)
            .filter((value): value is string => Boolean(value))
    );

    const followUps = await prisma.journeyFollowUp.findMany({
        where: {
            bookingId: { in: bookingIds },
            dueAt: { lte: now },
            OR: [
                {
                    kind: JourneyFollowUpKind.DAILY_CHECKIN,
                    chatPromptedAt: null,
                },
                {
                    kind: JourneyFollowUpKind.POST_TRIP_REVIEW,
                    resolvedAt: null,
                },
            ],
        },
        orderBy: [{ dueAt: "asc" }, { dayNumber: "asc" }],
    });

    const dailyPromptIds: string[] = [];
    const resolvedPromptIds: string[] = [];
    const prompts = followUps.flatMap((followUp) => {
        const booking = bookings.find((item) => item.id === followUp.bookingId);
        if (!booking) return [];
        if (booking.status === "CANCELLED") return [];

        if (followUp.kind === JourneyFollowUpKind.POST_TRIP_REVIEW && reviewByBookingId.has(followUp.bookingId)) {
            resolvedPromptIds.push(followUp.id);
            return [];
        }

        const journeyState = getJourneyState({
            bookingStatus: booking.status,
            startDate: booking.schedule.startDate,
            rawDurationDays: booking.tour.durationDays,
            now,
        });

        if (followUp.kind === JourneyFollowUpKind.DAILY_CHECKIN && journeyState !== "IN_PROGRESS") {
            return [];
        }

        if (followUp.kind === JourneyFollowUpKind.DAILY_CHECKIN) {
            dailyPromptIds.push(followUp.id);
        }

        return [
            buildJourneyCarePrompt({
                kind: followUp.kind,
                dayNumber: followUp.dayNumber,
                durationDays: getJourneyDurationDays(booking.tour.durationDays),
                customerName: booking.contactName,
                tourTitle: booking.tour.titleVi,
                followUpId: followUp.id,
                bookingId: booking.id,
                tourId: booking.tourId,
                dueAt: followUp.dueAt,
            }),
        ];
    });

    if (dailyPromptIds.length) {
        await prisma.journeyFollowUp.updateMany({
            where: { id: { in: dailyPromptIds } },
            data: { chatPromptedAt: now },
        });
    }

    if (resolvedPromptIds.length) {
        await prisma.journeyFollowUp.updateMany({
            where: { id: { in: resolvedPromptIds } },
            data: { resolvedAt: now },
        });
    }

    return prompts;
}

export async function resolveJourneyCareAfterReview(bookingId: string) {
    const now = new Date();

    await prisma.journeyFollowUp.updateMany({
        where: {
            bookingId,
            kind: JourneyFollowUpKind.POST_TRIP_REVIEW,
            resolvedAt: null,
        },
        data: { resolvedAt: now },
    });

    await prisma.booking.updateMany({
        where: {
            id: bookingId,
            status: { not: "CANCELLED" },
        },
        data: { status: "COMPLETED" },
    });
}
