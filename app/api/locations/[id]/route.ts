import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id?: string }> } // ✅ params là Promise
) {
    const { id } = await context.params; // ✅ unwrap bằng await
    const safeId = id?.trim();

    if (!safeId) {
        return NextResponse.json({ message: "Missing id param" }, { status: 400 });
    }

    const l = await prisma.location.findUnique({
        where: { id: safeId },
    });

    if (!l) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const normalized = {
        id: l.id,
        name: { vi: l.nameVi, en: l.nameEn },
        type: l.type,
        region: l.region,
        tags: l.tags ?? [],
        image: l.image,
        description: l.descriptionVi || l.descriptionEn ? { vi: l.descriptionVi ?? "", en: l.descriptionEn ?? "" } : null,
        introduction: l.introductionVi || l.introductionEn ? { vi: l.introductionVi ?? "", en: l.introductionEn ?? "" } : null,
        history: l.historyVi || l.historyEn ? { vi: l.historyVi ?? "", en: l.historyEn ?? "" } : null,
        significance: l.significanceVi || l.significanceEn ? { vi: l.significanceVi ?? "", en: l.significanceEn ?? "" } : null,
    };

    // ✅ match với client: data.location
    return NextResponse.json({ location: normalized });
}