import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const reviews = await prisma.review.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(reviews);
}