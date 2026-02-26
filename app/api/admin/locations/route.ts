import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const locations = await prisma.location.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(
        locations.map((l) => ({
            id: l.id,
            name: { vi: l.nameVi, en: l.nameEn },
            type: l.type,
            region: l.region,
            tags: l.tags,
            image: l.image,
        }))
    );
}

export async function POST(req: Request) {
    const body = await req.json();
    const id = String(body.id);
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const created = await prisma.location.create({
        data: {
            id,
            nameEn: String(body.name?.en ?? ""),
            nameVi: String(body.name?.vi ?? ""),
            type: String(body.type ?? "Landmark"),
            region: String(body.region ?? "Vietnam"),
            tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
            image: String(body.image ?? ""),
            descriptionEn: body.description?.en != null ? String(body.description.en) : null,
            descriptionVi: body.description?.vi != null ? String(body.description.vi) : null,
            introductionEn: body.introduction?.en != null ? String(body.introduction.en) : null,
            introductionVi: body.introduction?.vi != null ? String(body.introduction.vi) : null,
            historyEn: body.history?.en != null ? String(body.history.en) : null,
            historyVi: body.history?.vi != null ? String(body.history.vi) : null,
            significanceEn: body.significance?.en != null ? String(body.significance.en) : null,
            significanceVi: body.significance?.vi != null ? String(body.significance.vi) : null,
        },
    });

    return NextResponse.json({
        id: created.id,
        name: { vi: created.nameVi, en: created.nameEn },
        type: created.type,
        region: created.region,
        tags: created.tags,
        image: created.image,
    });
}