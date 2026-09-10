CREATE TABLE "CuppingSession" (
    "id" TEXT NOT NULL,
    "beanId" TEXT NOT NULL,
    "fragranceAroma" DOUBLE PRECISION NOT NULL,
    "flavor" DOUBLE PRECISION NOT NULL,
    "aftertaste" DOUBLE PRECISION NOT NULL,
    "acidity" DOUBLE PRECISION NOT NULL,
    "sweetness" DOUBLE PRECISION NOT NULL,
    "body" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CuppingSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CuppingSession_createdAt_idx" ON "CuppingSession"("createdAt" DESC);
CREATE INDEX "CuppingSession_beanId_createdAt_idx" ON "CuppingSession"("beanId", "createdAt" DESC);
CREATE INDEX "CuppingSession_totalScore_createdAt_idx" ON "CuppingSession"("totalScore" DESC, "createdAt" DESC);

ALTER TABLE "CuppingSession" ADD CONSTRAINT "CuppingSession_beanId_fkey"
FOREIGN KEY ("beanId") REFERENCES "Bean"("id") ON DELETE CASCADE ON UPDATE CASCADE;
