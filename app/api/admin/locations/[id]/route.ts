import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.location.update({
        where: { id },
        data: {
            nameEn: String(body.name?.en ?? ""),
            nameVi: String(body.name?.vi ?? ""),
            type: String(body.type ?? "Landmark"),
            region: String(body.region ?? "Vietnam"),
            tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
            image: String(body.image ?? ""),
        },
    });

    return NextResponse.json({
        id: updated.id,
        name: { vi: updated.nameVi, en: updated.nameEn },
        type: updated.type,
        region: updated.region,
        tags: updated.tags,
        image: updated.image,
    });
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const { id } = await params;
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}