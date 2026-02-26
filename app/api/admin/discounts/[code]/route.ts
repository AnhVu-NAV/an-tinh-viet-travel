import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ code: string }> }) {
    const { code } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const percent = Number(body?.percent ?? 10);
    const usageLimit = Number(body?.usage_limit ?? 100);
    const validUntil = body?.valid_until ? new Date(`${body.valid_until}T00:00:00.000Z`) : undefined;

    const d = await prisma.discount.update({
        where: { code: code.toUpperCase() },
        data: { percent, usageLimit, ...(validUntil ? { validUntil } : {}) },
    });

    return NextResponse.json({
        code: d.code,
        percent: d.percent,
        usage_limit: d.usageLimit,
        used_count: d.usedCount,
        valid_until: d.validUntil.toISOString().slice(0, 10),
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ code: string }> }) {
    const { code } = await ctx.params;
    await prisma.discount.delete({ where: { code: code.toUpperCase() } });
    return NextResponse.json({ ok: true });
}