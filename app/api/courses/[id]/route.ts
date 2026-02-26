import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    const c = await prisma.course.findUnique({ where: { id } });
    if (!c) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const course = {
        id: c.id,
        title: { vi: c.titleVi, en: c.titleEn },
        description: { vi: c.descriptionVi, en: c.descriptionEn },
        price_vnd: c.priceVnd,
        duration: c.duration,
        group_link: c.groupLink,
        image: c.image,
    };

    return NextResponse.json({ course });
}