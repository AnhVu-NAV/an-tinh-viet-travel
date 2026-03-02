import { NextResponse } from "next/server";
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
            },
        });

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (!(booking.status === "PENDING" || booking.status === "PAID")) {
            return NextResponse.json(
                { message: "This booking cannot be cancelled" },
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
    } catch (e: any) {
        console.error("Cancel error:", e);
        return NextResponse.json(
            { message: e?.message ?? "Server error" },
            { status: 500 }
        );
    }
}