CREATE TABLE "JourneyCareResponse" (
    "id" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyCareResponse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JourneyCareResponse_followUpId_createdAt_idx" ON "JourneyCareResponse"("followUpId", "createdAt");
CREATE INDEX "JourneyCareResponse_bookingId_createdAt_idx" ON "JourneyCareResponse"("bookingId", "createdAt");

ALTER TABLE "JourneyCareResponse"
ADD CONSTRAINT "JourneyCareResponse_followUpId_fkey"
FOREIGN KEY ("followUpId") REFERENCES "JourneyFollowUp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JourneyCareResponse"
ADD CONSTRAINT "JourneyCareResponse_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JourneyCareResponse"
ADD CONSTRAINT "JourneyCareResponse_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
