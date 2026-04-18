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

type JourneyCareReplyInput = {
    followUpId: string;
    bookingId: string;
    userId?: string | null;
    authorName?: string | null;
    message: string;
};

export async function seedJourneyFollowUpsTx(tx: Prisma.TransactionClient, input: BookingSeedInput) {
    const schedule = buildJourneyFollowUpSchedule(input.startDate, input.durationDays);

    for (const item of schedule) {
        await tx.journeyFollowUp.upsert({
            where: {
                bookingId_kind_dayNumber: {
                    bookingId: input.bookingId,
                    kind: item.kind,
                    dayNumber: item.dayNumber,
                },
            },
            create: {
                bookingId: input.bookingId,
                kind: item.kind,
                dayNumber: item.dayNumber,
                dueAt: item.dueAt,
            },
            update: {
                dueAt: item.dueAt,
            },
        });
    }
}

export async function seedJourneyFollowUpsForBookings(bookings: BookingSeedInput[]) {
    if (!bookings.length) return;

    for (const booking of bookings) {
        const schedule = buildJourneyFollowUpSchedule(booking.startDate, booking.durationDays);

        for (const item of schedule) {
            await prisma.journeyFollowUp.upsert({
                where: {
                    bookingId_kind_dayNumber: {
                        bookingId: booking.bookingId,
                        kind: item.kind,
                        dayNumber: item.dayNumber,
                    },
                },
                create: {
                    bookingId: booking.bookingId,
                    kind: item.kind,
                    dayNumber: item.dayNumber,
                    dueAt: item.dueAt,
                },
                update: {
                    dueAt: item.dueAt,
                },
            });
        }
    }
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
            responses: { none: {} },
            OR: [
                {
                    kind: JourneyFollowUpKind.DAILY_CHECKIN,
                    resolvedAt: null,
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

export async function saveJourneyCareReply(input: JourneyCareReplyInput) {
    const message = input.message.trim();
    if (!message) return null;

    const followUp = await prisma.journeyFollowUp.findUnique({
        where: { id: input.followUpId },
        select: {
            id: true,
            bookingId: true,
            resolvedAt: true,
            booking: {
                select: {
                    status: true,
                },
            },
        },
    });

    if (!followUp) {
        throw new Error("FOLLOW_UP_NOT_FOUND");
    }

    if (followUp.bookingId !== input.bookingId) {
        throw new Error("FOLLOW_UP_BOOKING_MISMATCH");
    }

    if (followUp.booking.status === "CANCELLED") {
        throw new Error("FOLLOW_UP_CANCELLED");
    }

    const now = new Date();

    const response = await prisma.journeyCareResponse.create({
        data: {
            followUpId: input.followUpId,
            bookingId: input.bookingId,
            userId: input.userId ?? null,
            authorName: input.authorName ?? null,
            message,
        },
    });

    await prisma.journeyFollowUp.update({
        where: { id: input.followUpId },
        data: {
            resolvedAt: followUp.resolvedAt ?? now,
            chatPromptedAt: now,
        },
    });

    return response;
}
