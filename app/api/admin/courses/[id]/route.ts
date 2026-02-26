import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.course.update({
        where: { id },
        data: {
            titleEn: String(body.title?.en ?? ""),
            titleVi: String(body.title?.vi ?? ""),
            descriptionEn: String(body.description?.en ?? ""),
            descriptionVi: String(body.description?.vi ?? ""),
            priceVnd: Number(body.price_vnd ?? 0),
            duration: String(body.duration ?? ""),
            groupLink: String(body.group_link ?? ""),
            image: String(body.image ?? ""),
        },
    });

    return NextResponse.json({
        id: updated.id,
        title: { vi: updated.titleVi, en: updated.titleEn },
        description: { vi: updated.descriptionVi, en: updated.descriptionEn },
        price_vnd: updated.priceVnd,
        duration: updated.duration,
        group_link: updated.groupLink,
        image: updated.image,
    });
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}