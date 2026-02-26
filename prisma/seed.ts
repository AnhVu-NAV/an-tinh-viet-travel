import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, BookingStatus, Role } from "@prisma/client";
import {
    LOCATIONS,
    TOURS,
    COURSES,
    DISCOUNTS,
    REVIEWS,
    MOCK_USERS,
} from "../lib/constants";

const prisma = new PrismaClient();

function toISODate(dateStr: string) {
    // "2024-06-15" -> Date
    return new Date(`${dateStr}T00:00:00.000Z`);
}

async function main() {
    console.log("🌱 Seeding...");
    const DEFAULT_PW = "123456";
    const defaultHash = await bcrypt.hash(DEFAULT_PW, 10);

    // 1) Clear tables (order matters due FK)
    await prisma.booking.deleteMany();
    await prisma.review.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.tourLocation.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.location.deleteMany();
    await prisma.course.deleteMany();
    await prisma.discount.deleteMany();
    await prisma.user.deleteMany();

    // 2) Users (add phone demo)
    // Nếu MOCK_USERS của bạn chưa có phone, seed sẽ tự gán demo
    const usersWithPhone = MOCK_USERS.map((u, idx) => ({
        ...u,
        phone:
            (u as any).phone ??
            (u.email === "user@antinh.com"
                ? "0987000001"
                : u.email === "admin@antinh.com"
                    ? "0987000002"
                    : u.email === "sale@antinh.com"
                        ? "0987000003"
                        : `09870000${(idx + 10).toString().padStart(2, "0")}`),
    }));

    await prisma.user.createMany({
        data: usersWithPhone.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone ?? null,
            role: u.role as Role,
            active: u.active,
            passwordHash: defaultHash,
        })),
    });

    // 3) Locations
    await prisma.location.createMany({
        data: LOCATIONS.map((l) => ({
            id: l.id,
            nameVi: l.name.vi,
            nameEn: l.name.en,
            type: l.type,
            region: l.region,
            tags: l.tags,
            image: l.image,
            descriptionVi: l.description?.vi ?? null,
            descriptionEn: l.description?.en ?? null,
            introductionVi: l.introduction?.vi ?? null,
            introductionEn: l.introduction?.en ?? null,
            historyVi: l.history?.vi ?? null,
            historyEn: l.history?.en ?? null,
            significanceVi: l.significance?.vi ?? null,
            significanceEn: l.significance?.en ?? null,
        })),
    });

    // 4) Tours
    await prisma.tour.createMany({
        data: TOURS.map((t) => ({
            id: t.id,
            titleVi: t.title.vi,
            titleEn: t.title.en,
            descriptionVi: t.description.vi,
            descriptionEn: t.description.en,
            introductionVi: t.introduction.vi,
            introductionEn: t.introduction.en,
            meaningVi: t.meaning.vi,
            meaningEn: t.meaning.en,
            priceVnd: t.price_vnd,
            durationDays: t.duration_days,
            level: t.level,
            suitableForVi: t.suitable_for.vi,
            suitableForEn: t.suitable_for.en,
            images: t.images,
        })),
    });

    // 5) Tour ↔ Location mapping
    for (const t of TOURS) {
        for (const locationId of t.locations) {
            await prisma.tourLocation.create({
                data: { tourId: t.id, locationId },
            });
        }
    }

    // 6) Schedules
    for (const t of TOURS) {
        for (const s of t.schedule) {
            await prisma.schedule.create({
                data: {
                    id: s.id,
                    tourId: t.id,
                    startDate: toISODate(s.startDate),
                    slots: s.slots,
                    slotsLeft: s.slotsLeft,
                },
            });
        }
    }

    // 7) Courses
    await prisma.course.createMany({
        data: COURSES.map((c) => ({
            id: c.id,
            titleVi: c.title.vi,
            titleEn: c.title.en,
            descriptionVi: c.description.vi,
            descriptionEn: c.description.en,
            priceVnd: c.price_vnd,
            duration: c.duration,
            groupLink: c.group_link,
            image: c.image,
        })),
    });

    // 8) Discounts
    await prisma.discount.createMany({
        data: DISCOUNTS.map((d) => ({
            code: d.code,
            percent: d.percent,
            validUntil: toISODate(d.valid_until),
            usageLimit: d.usage_limit,
            usedCount: d.used_count,
        })),
    });

    // 9) Reviews (giữ nguyên logic)
    await prisma.review.createMany({
        data: REVIEWS.map((r) => ({
            id: r.id,
            tourId: r.tourId,
            bookingId: r.bookingId ?? null,
            user: r.user,
            rating: r.rating,
            comment: r.comment,
            date: toISODate(r.date),
        })),
    });

    // 10) Seed Bookings demo cho case "guest đặt bằng email/phone"
    // - b_guest_email: userId=null nhưng contactEmail trùng user@antinh.com
    // - b_guest_phone: userId=null nhưng contactPhone trùng user@antinh.com
    // - b_user: userId gắn luôn
    const u1 = usersWithPhone.find((u) => u.email === "user@antinh.com")!;
    const tour1 = TOURS[0]; // t1
    const schedule1 = tour1.schedule[0]; // s1

    await prisma.booking.createMany({
        data: [
            {
                id: "b_guest_email",
                userId: null,
                tourId: tour1.id,
                scheduleId: schedule1.id,
                guests: 2,
                totalPrice: tour1.price_vnd * 2,
                currency: "VND",
                status: BookingStatus.PAID,
                date: new Date("2024-05-01T00:00:00.000Z"),
                contactName: "Guest Email",
                contactEmail: u1.email, // trùng email => later claim
                contactPhone: null,
            },
            {
                id: "b_guest_phone",
                userId: null,
                tourId: tour1.id,
                scheduleId: schedule1.id,
                guests: 1,
                totalPrice: tour1.price_vnd,
                currency: "VND",
                status: BookingStatus.PENDING,
                date: new Date("2024-05-10T00:00:00.000Z"),
                contactName: "Guest Phone",
                contactEmail: null,
                contactPhone: u1.phone ?? "0987000001", // trùng phone => later claim
            },
            {
                id: "b_user_linked",
                userId: u1.id,
                tourId: TOURS[2].id,
                scheduleId: TOURS[2].schedule[0].id,
                guests: 1,
                totalPrice: TOURS[2].price_vnd,
                currency: "VND",
                status: BookingStatus.COMPLETED,
                date: new Date("2024-01-15T00:00:00.000Z"),
                contactName: u1.name,
                contactEmail: u1.email,
                contactPhone: u1.phone ?? null,
            },
        ],
    });

    console.log("✅ Seed done!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });