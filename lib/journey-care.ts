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

const VIETNAM_OFFSET_HOURS = 7;
const VIETNAM_OFFSET_MS = VIETNAM_OFFSET_HOURS * 60 * 60 * 1000;

export function getJourneyDurationDays(rawDurationDays: number) {
    if (!Number.isFinite(rawDurationDays) || rawDurationDays <= 0) return 1;
    return Math.max(1, Math.ceil(rawDurationDays));
}

function getVietnamDateKey(date: Date) {
    const shifted = new Date(date.getTime() + VIETNAM_OFFSET_MS);
    return shifted.toISOString().slice(0, 10);
}

function dateKeyToUtcDate(dateKey: string, hourInVietnam = 0) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, hourInVietnam - VIETNAM_OFFSET_HOURS, 0, 0, 0));
}

function addDaysToDateKey(dateKey: string, days: number) {
    const base = dateKeyToUtcDate(dateKey);
    base.setUTCDate(base.getUTCDate() + days);
    return getVietnamDateKey(base);
}

export function getJourneyEndDate(startDate: Date, rawDurationDays: number) {
    const startKey = getVietnamDateKey(startDate);
    const endKey = addDaysToDateKey(startKey, getJourneyDurationDays(rawDurationDays));
    return dateKeyToUtcDate(endKey);
}

export function getJourneyState(params: {
    bookingStatus?: string;
    startDate: Date;
    rawDurationDays: number;
    now?: Date;
}): JourneyState {
    if (params.bookingStatus === "CANCELLED") return "CANCELLED";

    const todayKey = getVietnamDateKey(params.now ?? new Date());
    const startKey = getVietnamDateKey(params.startDate);
    const endKey = addDaysToDateKey(startKey, getJourneyDurationDays(params.rawDurationDays));

    if (todayKey < startKey) return "UPCOMING";
    if (todayKey >= endKey) return "FINISHED";
    return "IN_PROGRESS";
}

export function buildJourneyFollowUpSchedule(startDate: Date, rawDurationDays: number) {
    const durationDays = getJourneyDurationDays(rawDurationDays);
    const startKey = getVietnamDateKey(startDate);

    const dailyCheckIns = Array.from({ length: durationDays }, (_, index) => {
        const dayNumber = index + 1;
        const dueAt = dateKeyToUtcDate(addDaysToDateKey(startKey, index), 20);
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
            dueAt: dateKeyToUtcDate(addDaysToDateKey(startKey, durationDays), 9),
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
                vi: `${greeting}, An đang hỏi thăm cảm nhận của bạn sau ngày ${params.dayNumber} trong hành trình **${params.tourTitle}**. Ngày đi vừa rồi của bạn thế nào, có cần hỗ trợ gì thêm không?`,
                en: `${greetingEn}, An is checking in after day ${params.dayNumber} of **${params.tourTitle}**. How did that day feel, and do you need any support?`,
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
