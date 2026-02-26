import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const courses = await prisma.course.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(
        courses.map((c) => ({
            id: c.id,
            title: { vi: c.titleVi, en: c.titleEn },
            description: { vi: c.descriptionVi, en: c.descriptionEn },
            price_vnd: c.priceVnd,
            duration: c.duration,
            group_link: c.groupLink,
            image: c.image,
        }))
    );
}

export async function POST(req: Request) {
    const body = await req.json();
    const id = String(body.id);
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const created = await prisma.course.create({
        data: {
            id,
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
        id: created.id,
        title: { vi: created.titleVi, en: created.titleEn },
        description: { vi: created.descriptionVi, en: created.descriptionEn },
        price_vnd: created.priceVnd,
        duration: created.duration,
        group_link: created.groupLink,
        image: created.image,
    });
}