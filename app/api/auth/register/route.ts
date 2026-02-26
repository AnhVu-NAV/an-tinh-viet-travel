import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

type Body = {
    name?: string;
    email?: string;
    phone?: string | null;
    password?: string;
};

export async function POST(req: Request) {
    try {
        const body = (await req.json().catch(() => ({}))) as Body;

        const name = (body.name ?? "").trim();
        const email = (body.email ?? "").trim().toLowerCase();
        const phone = (body.phone ?? "").trim() || null;
        const password = (body.password ?? "").trim();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "name, email, password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // email exists?
        const existed = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (existed) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }

        // phone unique check (nếu bạn dùng)
        if (phone) {
            const phoneUsed = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
            if (phoneUsed) {
                return NextResponse.json({ message: "Phone already used" }, { status: 409 });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                role: Role.USER,
                active: true,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                active: true,
                createdAt: true,
            },
        });

        // CLAIM bookings guest theo email/phone
        await prisma.booking.updateMany({
            where: {
                userId: null,
                OR: [
                    { contactEmail: user.email },
                    ...(user.phone ? [{ contactPhone: user.phone }] : []),
                ],
            },
            data: { userId: user.id },
        });

        return NextResponse.json({
            user,
            message: "Registered. Guest bookings (if any) were linked to this account.",
        });
    } catch (e: any) {
        // Prisma unique errors fallback
        const msg = String(e?.message ?? "");
        return NextResponse.json({ message: "Register failed", debug: msg }, { status: 400 });
    }
}