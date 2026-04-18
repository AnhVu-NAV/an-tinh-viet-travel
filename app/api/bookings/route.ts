import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { sendBookingEmails } from "@/lib/mailer";
import { seedJourneyFollowUpsTx } from "@/lib/journey-care-service";

type CreateBookingBody = {
    tourId: string;
    scheduleId: string;
    guests: number;
    currency?: string;
    discountCode?: string | null;

    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
};

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as CreateBookingBody;

        const tourId = String(body.tourId ?? "").trim();
        const scheduleId = String(body.scheduleId ?? "").trim();
        const guests = Number(body.guests ?? 0);

        if (!tourId || !scheduleId || !Number.isFinite(guests) || guests <= 0) {
            return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
        }

        const currency = (body.currency ?? "VND").trim();
        const discountCode = body.discountCode ? String(body.discountCode).trim().toUpperCase() : null;

        const email =
            (body.contactEmail ?? "").trim().toLowerCase() || null;

        let dbUserId: string | null = null;
        if (email) {
            const dbUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });
            dbUserId = dbUser?.id ?? null; // nếu không có user DB -> booking dạng guest
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1) check schedule belongs to tour + slotsLeft
            const schedule = await tx.schedule.findFirst({
                where: { id: scheduleId, tourId },
                select: { id: true, slotsLeft: true, startDate: true },
            });
            if (!schedule) throw new Error("SCHEDULE_NOT_FOUND");
            if (schedule.slotsLeft < guests) throw new Error("NOT_ENOUGH_SLOTS");

            // 2) get tour price
            const tour = await tx.tour.findUnique({
                where: { id: tourId },
                select: { id: true, priceVnd: true, titleVi: true, titleEn: true, durationDays: true },
            });
            if (!tour) throw new Error("TOUR_NOT_FOUND");

            // 3) validate discount (if any)
            let percent = 0;
            if (discountCode) {
                const d = await tx.discount.findUnique({ where: { code: discountCode } });
                if (!d) throw new Error("DISCOUNT_INVALID");
                if (d.validUntil < new Date()) throw new Error("DISCOUNT_EXPIRED");
                if (d.usedCount >= d.usageLimit) throw new Error("DISCOUNT_USED_UP");
                percent = d.percent;
            }

            // 4) compute price
            const totalPrice = tour.priceVnd * guests;
            const discountAmount = Math.round((totalPrice * percent) / 100);
            const finalPrice = Math.max(0, totalPrice - discountAmount);

            // 5) decrement slotsLeft (atomic)
            const updated = await tx.schedule.update({
                where: { id: scheduleId },
                data: { slotsLeft: { decrement: guests } },
                select: { slotsLeft: true },
            });
            if (updated.slotsLeft < 0) throw new Error("SLOTS_NEGATIVE");

            // 6) increment discount usedCount (if any)
            if (discountCode) {
                await tx.discount.update({
                    where: { code: discountCode },
                    data: { usedCount: { increment: 1 } },
                });
            }

            const resolvedContactEmail = email;

            // 7) create booking
            const booking = await tx.booking.create({
                data: {
                    userId: dbUserId,
                    tourId,
                    scheduleId,
                    guests,
                    totalPrice: finalPrice,
                    currency,
                    status: "PAID",
                    date: new Date(),
                    discountCode,

                    contactName: body.contactName ?? null,
                    contactEmail: resolvedContactEmail,
                    contactPhone: body.contactPhone ?? null,
                },
            });

            await seedJourneyFollowUpsTx(tx, {
                bookingId: booking.id,
                startDate: schedule.startDate,
                durationDays: tour.durationDays,
            });

            return { booking, pricing: { totalPrice, discountAmount, finalPrice, percent } };
        });
        let emailSent = false;
        try {
            const notifyEmail = process.env.BOOKING_NOTIFY_EMAIL || "";

            const booking = result.booking;

            // bạn đã query schedule.startDate trong transaction, nên lấy lại startDate để email chuẩn:
            const schedule = await prisma.schedule.findUnique({
                where: { id: booking.scheduleId },
                select: { startDate: true },
            });

            const tour = await prisma.tour.findUnique({
                where: { id: booking.tourId },
                select: { titleVi: true, titleEn: true },
            });

            const toCustomer = booking.contactEmail?.trim();
            if (toCustomer) {
                await sendBookingEmails({
                    language: "vi", // hoặc lấy từ body.language nếu bạn gửi lên
                    toCustomer,
                    systemEmail: notifyEmail,
                    bookingId: booking.id,
                    tourTitle: tour ? `${tour.titleVi} / ${tour.titleEn}` : booking.tourId,
                    startDateISO: schedule?.startDate?.toISOString() ?? new Date().toISOString(),
                    guests: booking.guests,
                    totalVnd: booking.totalPrice,
                    discountCode: booking.discountCode ?? null,
                });
                emailSent = true;
            }
        } catch (mailErr) {
            // không block booking nếu mail fail
            console.error("Send booking emails failed:", mailErr);
        }

        return NextResponse.json({ ...result, emailSent }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";

        const map: Record<string, { status: number; message: string }> = {
            TOUR_NOT_FOUND: { status: 404, message: "Tour not found" },
            SCHEDULE_NOT_FOUND: { status: 404, message: "Schedule not found" },
            NOT_ENOUGH_SLOTS: { status: 400, message: "Not enough slots" },
            DISCOUNT_INVALID: { status: 400, message: "Discount invalid" },
            DISCOUNT_EXPIRED: { status: 400, message: "Discount expired" },
            DISCOUNT_USED_UP: { status: 400, message: "Discount used up" },
            SLOTS_NEGATIVE: { status: 409, message: "Slots conflict" },
        };

        const hit = map[msg];
        if (hit) return NextResponse.json({ message: hit.message }, { status: hit.status });

        // nếu FK fail vẫn lọt vào đây, bạn sẽ thấy message chung
        return NextResponse.json({ message: "Booking failed" }, { status: 400 });
    }
}
