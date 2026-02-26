import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const code = String(body?.code ?? "").toUpperCase();
    const percent = Number(body?.percent ?? 10);
    const usageLimit = Number(body?.usage_limit ?? 100);
    const validUntil = body?.valid_until ? new Date(`${body.valid_until}T00:00:00.000Z`) : new Date();

    if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

    const d = await prisma.discount.create({
        data: { code, percent, usageLimit, usedCount: 0, validUntil },
    });

    return NextResponse.json({
        code: d.code,
        percent: d.percent,
        usage_limit: d.usageLimit,
        used_count: d.usedCount,
        valid_until: d.validUntil.toISOString().slice(0, 10),
    });
}