import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; scheduleId: string }> };

export async function PUT(req: Request, ctx: Ctx) {
    const { id: tourId, scheduleId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const startDate = body.startDate ? String(body.startDate) : null;
    const slots = body.slots != null ? Number(body.slots) : null;

    const current = await prisma.schedule.findFirst({ where: { id: scheduleId, tourId } });
    if (!current) return NextResponse.json({ message: "Schedule not found" }, { status: 404 });

    // nếu đổi slots, giữ nguyên số đã booking:
    // booked = slots - slotsLeft
    let nextSlots = current.slots;
    let nextSlotsLeft = current.slotsLeft;

    if (slots != null) {
        if (!Number.isFinite(slots) || slots <= 0)
            return NextResponse.json({ message: "slots must be > 0" }, { status: 400 });

        const booked = current.slots - current.slotsLeft;
        if (slots < booked)
            return NextResponse.json({ message: `slots cannot be < booked (${booked})` }, { status: 400 });

        nextSlots = slots;
        nextSlotsLeft = slots - booked;
    }

    const updated = await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
            startDate: startDate ? new Date(startDate + "T00:00:00.000Z") : undefined,
            slots: nextSlots,
            slotsLeft: nextSlotsLeft,
        },
    });

    return NextResponse.json({
        id: updated.id,
        tourId: updated.tourId,
        startDate: updated.startDate.toISOString().slice(0, 10),
        slots: updated.slots,
        slotsLeft: updated.slotsLeft,
    });
}

export async function DELETE(_: Request, ctx: Ctx) {
    const { id: tourId, scheduleId } = await ctx.params;

    // chặn xoá nếu đã có booking dùng schedule này
    const used = await prisma.booking.count({ where: { scheduleId } });
    if (used > 0) {
        return NextResponse.json({ message: "Cannot delete schedule: has bookings" }, { status: 409 });
    }

    await prisma.schedule.delete({ where: { id: scheduleId } });
    return NextResponse.json({ ok: true });
}