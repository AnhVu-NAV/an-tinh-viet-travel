import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const bk = await tx.booking.findUnique({
                where: { id },
                select: { id: true, status: true, scheduleId: true, guests: true },
            });
            if (!bk) throw new Error("NOT_FOUND");
            if (bk.status === "CANCELLED") return { alreadyCancelled: true };

            // restore slots
            await tx.schedule.update({
                where: { id: bk.scheduleId },
                data: { slotsLeft: { increment: bk.guests } },
            });

            const updated = await tx.booking.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            return { booking: updated };
        });

        return NextResponse.json(result);
    } catch (e: any) {
        const msg = String(e?.message ?? "");
        if (msg === "NOT_FOUND") return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Cancel failed" }, { status: 400 });
    }
}