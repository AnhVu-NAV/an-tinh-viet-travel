export type JourneyState = "UPCOMING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export type JourneyFollowUpKindValue = "DAILY_CHECKIN" | "POST_TRIP_REVIEW";

export type JourneyCarePrompt = {
    followUpId: string;
    bookingId: string;
    tourId: string;
    kind: JourneyFollowUpKindValue;
    dayNumber: number;
    dueAt: string;
    autoOpen: boolean;
    ctaHref: string;
    ctaLabel: { vi: string; en: string };
    message: { vi: string; en: string };
};

export function getJourneyDurationDays(rawDurationDays: number) {
    if (!Number.isFinite(rawDurationDays) || rawDurationDays <= 0) return 1;
    return Math.max(1, Math.ceil(rawDurationDays));
}

function utcDateOnly(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
    const value = utcDateOnly(date);
    value.setUTCDate(value.getUTCDate() + days);
    return value;
}

function withUtcHour(date: Date, hour: number) {
    const value = utcDateOnly(date);
    value.setUTCHours(hour, 0, 0, 0);
    return value;
}

export function getJourneyEndDate(startDate: Date, rawDurationDays: number) {
    return addUtcDays(startDate, getJourneyDurationDays(rawDurationDays));
}

export function getJourneyState(params: {
    bookingStatus?: string;
    startDate: Date;
    rawDurationDays: number;
    now?: Date;
}): JourneyState {
    if (params.bookingStatus === "CANCELLED") return "CANCELLED";

    const today = utcDateOnly(params.now ?? new Date());
    const start = utcDateOnly(params.startDate);
    const end = getJourneyEndDate(params.startDate, params.rawDurationDays);

    if (today < start) return "UPCOMING";
    if (today >= end) return "FINISHED";
    return "IN_PROGRESS";
}

export function buildJourneyFollowUpSchedule(startDate: Date, rawDurationDays: number) {
    const durationDays = getJourneyDurationDays(rawDurationDays);

    const dailyCheckIns = Array.from({ length: durationDays }, (_, index) => {
        const dayNumber = index + 1;
        const dueAt = withUtcHour(addUtcDays(startDate, index), 12);
        return {
            kind: "DAILY_CHECKIN" as const,
            dayNumber,
            dueAt,
        };
    });

    return [
        ...dailyCheckIns,
        {
            kind: "POST_TRIP_REVIEW" as const,
            dayNumber: 0,
            dueAt: withUtcHour(getJourneyEndDate(startDate, rawDurationDays), 2),
        },
    ];
}

export function buildJourneyCarePrompt(params: {
    kind: JourneyFollowUpKindValue;
    dayNumber: number;
    durationDays: number;
    customerName?: string | null;
    tourTitle: string;
    followUpId: string;
    bookingId: string;
    tourId: string;
    dueAt: Date;
}): JourneyCarePrompt {
    const firstName = params.customerName?.trim()?.split(/\s+/)?.at(-1) ?? "bạn";
    const greeting = `Chào ${firstName}`;
    const greetingEn = `Hi ${firstName}`;

    if (params.kind === "DAILY_CHECKIN") {
        return {
            followUpId: params.followUpId,
            bookingId: params.bookingId,
            tourId: params.tourId,
            kind: params.kind,
            dayNumber: params.dayNumber,
            dueAt: params.dueAt.toISOString(),
            autoOpen: true,
            ctaHref: "/profile",
            ctaLabel: {
                vi: "Xem hành trình",
                en: "View journey",
            },
            message: {
                vi: `${greeting}, hôm nay là ngày ${params.dayNumber}/${params.durationDays} của hành trình **${params.tourTitle}**. Bạn thấy ngày đi vừa rồi thế nào? Nếu cần hỗ trợ gì thêm, cứ nhắn cho An ngay tại đây nhé.`,
                en: `${greetingEn}, this is day ${params.dayNumber}/${params.durationDays} of **${params.tourTitle}**. How has the journey felt so far? If you need anything, just reply here and An will stay with you.`,
            },
        };
    }

    return {
        followUpId: params.followUpId,
        bookingId: params.bookingId,
        tourId: params.tourId,
        kind: params.kind,
        dayNumber: params.dayNumber,
        dueAt: params.dueAt.toISOString(),
        autoOpen: true,
        ctaHref: "/profile",
        ctaLabel: {
            vi: "Viết đánh giá",
            en: "Write review",
        },
        message: {
            vi: `${greeting}, chuyến đi **${params.tourTitle}** của bạn đã khép lại. Bạn thấy toàn bộ hành trình thế nào? Bạn có thể chia sẻ ngay trong khung chat này hoặc [viết đánh giá](/profile) để An Tịnh Việt chăm sóc bạn tốt hơn.`,
            en: `${greetingEn}, your **${params.tourTitle}** journey has wrapped up. How did the full experience feel for you? You can share it here in chat or [write a review](/profile) so An Tinh Viet can care for you better next time.`,
        },
    };
}
