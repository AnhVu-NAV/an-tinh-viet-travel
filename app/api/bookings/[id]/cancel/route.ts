import { NextResponse } from "next/server";

import { canCancelBooking } from "@/lib/journey-care";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
    _req: Request,
    ctx: { params: Promise<{ id: string }> } // ✅ params là Promise
) {
    try {
        const { id: bookingId } = await ctx.params; // ✅ unwrap params

        if (!bookingId) {
            return NextResponse.json({ message: "Missing booking id" }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                status: true,
                guests: true,
                scheduleId: true,
                schedule: {
                    select: {
                        startDate: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (
            !canCancelBooking({
                bookingStatus: booking.status,
                startDate: booking.schedule.startDate,
            })
        ) {
            return NextResponse.json(
                { message: "This booking can only be cancelled before the departure date" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" },
            });

            // nếu 1 booking = 1 slot, đổi booking.guests -> 1
            await tx.schedule.update({
                where: { id: booking.scheduleId },
                data: { slotsLeft: { increment: booking.guests ?? 1 } },
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        console.error("Cancel error:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Server error" },
            { status: 500 }
        );
    }
}
