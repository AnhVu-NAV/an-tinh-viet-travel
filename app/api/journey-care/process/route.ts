import { NextResponse } from "next/server";

import { processDueJourneyFollowUpEmails } from "@/lib/journey-care-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
    try {
        const result = await processDueJourneyFollowUpEmails();
        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/journey-care/process error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
