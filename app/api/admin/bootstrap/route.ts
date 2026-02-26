import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const [toursRaw, locationsRaw, bookingsRaw, usersRaw, discountsRaw, coursesRaw] =
        await Promise.all([
            prisma.tour.findMany({ orderBy: { id: "asc" } }),
            prisma.location.findMany({ orderBy: { id: "asc" } }),
            prisma.booking.findMany({ orderBy: { date: "desc" } }),
            prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.discount.findMany({ orderBy: { validUntil: "desc" } }),
            prisma.course.findMany({ orderBy: { id: "asc" } }),
        ]);

    const tours = toursRaw.map((t) => ({
        id: t.id,
        title: { vi: t.titleVi, en: t.titleEn },
        description: { vi: t.descriptionVi, en: t.descriptionEn },
        introduction: { vi: t.introductionVi, en: t.introductionEn },
        meaning: { vi: t.meaningVi, en: t.meaningEn },
        suitable_for: { vi: t.suitableForVi, en: t.suitableForEn },
        price_vnd: t.priceVnd,
        duration_days: t.durationDays,
        level: t.level,
        images: t.images,
        locations: [], // admin UI đang only cần list, mapping bạn handle ở modal
        schedule: [],
    }));

    const locations = locationsRaw.map((l) => ({
        id: l.id,
        name: { vi: l.nameVi, en: l.nameEn },
        type: l.type,
        region: l.region,
        tags: l.tags,
        image: l.image,
    }));

    const courses = coursesRaw.map((c) => ({
        id: c.id,
        title: { vi: c.titleVi, en: c.titleEn },
        description: { vi: c.descriptionVi, en: c.descriptionEn },
        price_vnd: c.priceVnd,
        duration: c.duration,
        group_link: c.groupLink,
        image: c.image,
    }));

    const discounts = discountsRaw.map((d) => ({
        code: d.code,
        percent: d.percent,
        valid_until: d.validUntil.toISOString().slice(0, 10),
        usage_limit: d.usageLimit,
        used_count: d.usedCount,
    }));

    const users = usersRaw.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? null,
        role: u.role,
        active: u.active,
    }));

    const bookings = bookingsRaw.map((b) => ({
        id: b.id,
        userId: b.userId,
        tourId: b.tourId,
        scheduleId: b.scheduleId,
        guests: b.guests,
        totalPrice: b.totalPrice,
        currency: b.currency,
        status: b.status,
        date: b.date.toISOString().slice(0, 10),
        contactName: b.contactName ?? null,
        contactEmail: b.contactEmail ?? null,
        contactPhone: b.contactPhone ?? null,
    }));

    return NextResponse.json({ tours, locations, bookings, users, discounts, courses });
}