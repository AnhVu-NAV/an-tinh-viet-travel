import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const tours = await prisma.tour.findMany({
        orderBy: { id: "asc" },
        include: {
            schedules: { orderBy: { startDate: "asc" } },
            locations: { include: { location: true } },
        },
    });

    const locations = await prisma.location.findMany({
        orderBy: { region: "asc" },
    });

    const payloadTours = tours.map((t) => ({
        id: t.id,
        title: { vi: t.titleVi, en: t.titleEn },
        description: { vi: t.descriptionVi, en: t.descriptionEn },
        introduction: { vi: t.introductionVi, en: t.introductionEn },
        meaning: { vi: t.meaningVi, en: t.meaningEn },
        price_vnd: t.priceVnd,
        duration_days: t.durationDays,
        level: t.level,
        suitable_for: { vi: t.suitableForVi, en: t.suitableForEn },
        images: t.images,
        locations: t.locations.map((x) => x.locationId),
        schedule: t.schedules.map((s) => ({
            id: s.id,
            startDate: s.startDate.toISOString().slice(0, 10),
            slots: s.slots,
            slotsLeft: s.slotsLeft,
        })),
    }));

    const payloadLocations = locations.map((l) => ({
        id: l.id,
        region: l.region,
        type: l.type,
        name: { vi: l.nameVi, en: l.nameEn },
        images: l.image,
    }));

    return NextResponse.json({ tours: payloadTours, locations: payloadLocations });
}