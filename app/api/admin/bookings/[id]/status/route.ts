import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function PATCH(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const status = body?.status as BookingStatus | undefined;

    if (!status) return NextResponse.json({ message: "Missing status" }, { status: 400 });

    const updated = await prisma.booking.update({
        where: { id },
        data: { status },
    });

    return NextResponse.json({
        id: updated.id,
        status: updated.status,
    });
}