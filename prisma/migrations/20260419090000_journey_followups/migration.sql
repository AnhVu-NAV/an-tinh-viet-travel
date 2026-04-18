CREATE TYPE "JourneyFollowUpKind" AS ENUM ('DAILY_CHECKIN', 'POST_TRIP_REVIEW');

CREATE TABLE "JourneyFollowUp" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "JourneyFollowUpKind" NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "chatPromptedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyFollowUp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JourneyFollowUp_bookingId_dueAt_idx" ON "JourneyFollowUp"("bookingId", "dueAt");
CREATE INDEX "JourneyFollowUp_dueAt_idx" ON "JourneyFollowUp"("dueAt");
CREATE UNIQUE INDEX "JourneyFollowUp_bookingId_kind_dayNumber_key" ON "JourneyFollowUp"("bookingId", "kind", "dayNumber");

ALTER TABLE "JourneyFollowUp"
ADD CONSTRAINT "JourneyFollowUp_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
