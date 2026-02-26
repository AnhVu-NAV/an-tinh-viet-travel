import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const tours = await prisma.tour.findMany({
        orderBy: { id: "asc" },
        include: {
            locations: { include: { location: true } },
            schedules: { orderBy: { startDate: "asc" } },
        },
    });

    // trả shape giống frontend Tour
    const data = tours.map((t) => ({
        id: t.id,
        title: { vi: t.titleVi, en: t.titleEn },
        description: { vi: t.descriptionVi, en: t.descriptionEn },
        price_vnd: t.priceVnd,
        duration_days: t.durationDays,
        level: t.level,
        suitable_for: { vi: t.suitableForVi, en: t.suitableForEn },
        locations: t.locations.map((x) => x.locationId),
        images: t.images,
        schedule: t.schedules.map((s) => ({
            id: s.id,
            startDate: s.startDate.toISOString().slice(0, 10),
            slots: s.slots,
            slotsLeft: s.slotsLeft,
        })),
    }));

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();

    const id = String(body.id);
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const titleEn = String(body.title?.en ?? "");
    const titleVi = String(body.title?.vi ?? "");
    if (!titleEn || !titleVi) return NextResponse.json({ message: "Missing title" }, { status: 400 });

    const created = await prisma.tour.create({
        data: {
            id,
            titleEn,
            titleVi,
            descriptionEn: String(body.description?.en ?? ""),
            descriptionVi: String(body.description?.vi ?? ""),
            introductionEn: String(body.introduction?.en ?? ""),
            introductionVi: String(body.introduction?.vi ?? ""),
            meaningEn: String(body.meaning?.en ?? ""),
            meaningVi: String(body.meaning?.vi ?? ""),
            priceVnd: Number(body.price_vnd ?? 0),
            durationDays: Number(body.duration_days ?? 1),
            level: body.level ?? "light",
            suitableForEn: String(body.suitable_for?.en ?? ""),
            suitableForVi: String(body.suitable_for?.vi ?? ""),
            images: Array.isArray(body.images) ? body.images.map(String) : [],
        },
    });

    const locationIds: string[] = Array.isArray(body.locations) ? body.locations.map(String) : [];
    if (locationIds.length) {
        await prisma.tourLocation.createMany({
            data: locationIds.map((locationId) => ({ tourId: created.id, locationId })),
            skipDuplicates: true,
        });
    }

    return NextResponse.json({
        id: created.id,
        title: { vi: created.titleVi, en: created.titleEn },
        description: { vi: created.descriptionVi, en: created.descriptionEn },
        price_vnd: created.priceVnd,
        duration_days: created.durationDays,
        level: created.level,
        suitable_for: { vi: created.suitableForVi, en: created.suitableForEn },
        locations: locationIds,
        images: created.images,
        schedule: [],
    });
}