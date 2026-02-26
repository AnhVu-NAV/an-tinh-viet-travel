import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const rows = await prisma.course.findMany({ orderBy: { titleEn: "asc" } });

    const courses = rows.map((c) => ({
        id: c.id,
        title: { vi: c.titleVi, en: c.titleEn },
        description: { vi: c.descriptionVi, en: c.descriptionEn },
        price_vnd: c.priceVnd,
        duration: c.duration,
        group_link: c.groupLink,
        image: c.image,
    }));

    return NextResponse.json({ courses });
}