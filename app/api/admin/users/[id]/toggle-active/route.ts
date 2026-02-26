import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const updated = await prisma.user.update({
        where: { id },
        data: { active: !u.active },
    });

    return NextResponse.json({ id: updated.id, active: updated.active });
}