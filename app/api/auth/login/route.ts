import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!email || !password) {
        return NextResponse.json({ message: "Missing email/password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.passwordHash) {
        return NextResponse.json(
            { message: "Account has no password set. Please seed/reset password." },
            { status: 400 }
        );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Demo: trả user info (chưa làm token/cookie)
    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    });
}