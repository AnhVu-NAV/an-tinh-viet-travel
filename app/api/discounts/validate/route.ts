import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const codeRaw = String(body?.code ?? "").trim();
        const code = codeRaw.toUpperCase();

        if (!code) {
            return NextResponse.json({ ok: false, message: "Missing code" }, { status: 400 });
        }

        const d = await prisma.discount.findUnique({ where: { code } });
        if (!d) return NextResponse.json({ ok: false, message: "INVALID" }, { status: 404 });

        const now = new Date();
        const expired = d.validUntil < now;
        const usedUp = d.usedCount >= d.usageLimit;

        if (expired) return NextResponse.json({ ok: false, message: "EXPIRED" }, { status: 400 });
        if (usedUp) return NextResponse.json({ ok: false, message: "USED_UP" }, { status: 400 });

        return NextResponse.json({
            ok: true,
            discount: {
                code: d.code,
                percent: d.percent,
                validUntil: d.validUntil.toISOString(),
                usageLimit: d.usageLimit,
                usedCount: d.usedCount,
            },
        });
    } catch (e) {
        return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
    }
}