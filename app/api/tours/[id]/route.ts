import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    ctx: { params: Promise<Record<string, string | string[] | undefined>> }
) {
    const params = await ctx.params; // ✅ unwrap Promise params

    const id =
        (params?.id as string | undefined) ??
        (params?.slug as string | undefined) ??
        (params?.tourId as string | undefined);

    if (!id) {
        return NextResponse.json({ message: "Missing id param" }, { status: 400 });
    }

    const t = await prisma.tour.findUnique({
        where: { id },
        include: {
            schedules: { orderBy: { startDate: "asc" } },
            locations: { include: { location: true } },
        },
    });

    if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const tour = {
        id: t.id,
        title: { vi: t.titleVi, en: t.titleEn },
        description: { vi: t.descriptionVi, en: t.descriptionEn },
        introduction: { vi: t.introductionVi, en: t.introductionEn },
        meaning: { vi: t.meaningVi, en: t.meaningEn },
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
    };

    const locations = t.locations.map((x) => ({
        id: x.location.id,
        region: x.location.region,
        type: x.location.type,
        name: { vi: x.location.nameVi, en: x.location.nameEn },
    }));

    return NextResponse.json({ tour, locations });
}