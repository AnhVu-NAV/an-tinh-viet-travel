import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const toDateOnly = (d: Date) => d.toISOString().slice(0, 10);

/* ===========================
   GET – lấy schedules của tour
   =========================== */
export async function GET(_req: Request, ctx: Ctx) {
    try {
        const { id: tourId } = await ctx.params;

        if (!tourId)
            return NextResponse.json(
                { message: "Missing tour id" },
                { status: 400 }
            );

        const rows = await prisma.schedule.findMany({
            where: { tourId },
            orderBy: { startDate: "asc" },
            select: {
                id: true,
                startDate: true,
                slots: true,
                slotsLeft: true,
            },
        });

        return NextResponse.json(
            rows.map((s) => ({
                id: s.id,
                startDate: toDateOnly(s.startDate),
                slots: s.slots,
                slotsLeft: s.slotsLeft,
            }))
        );
    } catch (e) {
        console.error("GET /api/admin/tours/[id]/schedules error:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

/* ===========================
   POST – tạo schedule
   =========================== */
export async function POST(req: Request, ctx: Ctx) {
    try {
        const { id: tourId } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const startDate = String(body.startDate ?? "");
        const slots = Number(body.slots ?? 0);

        if (!tourId)
            return NextResponse.json(
                { message: "Missing tour id" },
                { status: 400 }
            );
        if (!startDate)
            return NextResponse.json(
                { message: "Missing startDate" },
                { status: 400 }
            );
        if (!Number.isFinite(slots) || slots < 1)
            return NextResponse.json(
                { message: "Slots must be >= 1" },
                { status: 400 }
            );

        const existed = await prisma.schedule.findFirst({
            where: { tourId, startDate: new Date(startDate) },
            select: { id: true },
        });

        if (existed)
            return NextResponse.json(
                { message: "Start date already exists" },
                { status: 409 }
            );

        const created = await prisma.schedule.create({
            data: {
                tourId,
                startDate: new Date(startDate),
                slots,
                slotsLeft: slots,
            },
            select: {
                id: true,
                startDate: true,
                slots: true,
                slotsLeft: true,
            },
        });

        return NextResponse.json({
            id: created.id,
            startDate: toDateOnly(created.startDate),
            slots: created.slots,
            slotsLeft: created.slotsLeft,
        });
    } catch (e) {
        console.error("POST /api/admin/tours/[id]/schedules error:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}