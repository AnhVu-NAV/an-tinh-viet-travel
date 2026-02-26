import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const discounts = await prisma.discount.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json(discounts);
}