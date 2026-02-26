import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const { id } = await params;

    const t = await prisma.tour.findUnique({
        where: { id },
        include: { locations: true, schedules: { orderBy: { startDate: "asc" } } },
    });

    if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({
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
    });
}

export async function PUT(req: Request, { params }: Ctx) {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.tour.update({
        where: { id },
        data: {
            titleEn: String(body.title?.en ?? ""),
            titleVi: String(body.title?.vi ?? ""),
            priceVnd: Number(body.price_vnd ?? 0),
            durationDays: Number(body.duration_days ?? 1),
            level: body.level ?? "light",
            images: Array.isArray(body.images) ? body.images.map(String) : [],
            // giữ optional fields nếu có gửi lên
            descriptionEn: body.description?.en != null ? String(body.description.en) : undefined,
            descriptionVi: body.description?.vi != null ? String(body.description.vi) : undefined,
            suitableForEn: body.suitable_for?.en != null ? String(body.suitable_for.en) : undefined,
            suitableForVi: body.suitable_for?.vi != null ? String(body.suitable_for.vi) : undefined,
        },
    });

    const locationIds: string[] = Array.isArray(body.locations) ? body.locations.map(String) : [];

    // sync tourLocation (xóa hết rồi add lại)
    await prisma.tourLocation.deleteMany({ where: { tourId: id } });
    if (locationIds.length) {
        await prisma.tourLocation.createMany({
            data: locationIds.map((locationId) => ({ tourId: id, locationId })),
            skipDuplicates: true,
        });
    }

    return NextResponse.json({
        id: updated.id,
        title: { vi: updated.titleVi, en: updated.titleEn },
        description: { vi: updated.descriptionVi, en: updated.descriptionEn },
        price_vnd: updated.priceVnd,
        duration_days: updated.durationDays,
        level: updated.level,
        suitable_for: { vi: updated.suitableForVi, en: updated.suitableForEn },
        locations: locationIds,
        images: updated.images,
        schedule: [],
    });
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const { id } = await params;
    await prisma.tour.delete({ where: { id } }); // cascade xoá tourLocation/schedule/booking/review tuỳ schema
    return NextResponse.json({ ok: true });
}