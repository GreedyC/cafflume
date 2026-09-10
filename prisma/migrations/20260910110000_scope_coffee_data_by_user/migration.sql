ALTER TABLE "Bean" ADD COLUMN "userId" TEXT;
ALTER TABLE "BrewLog" ADD COLUMN "userId" TEXT;
ALTER TABLE "CuppingSession" ADD COLUMN "userId" TEXT;

UPDATE "Bean" SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1);
UPDATE "BrewLog" b SET "userId" = bean."userId" FROM "Bean" bean WHERE b."beanId" = bean."id";
UPDATE "CuppingSession" c SET "userId" = bean."userId" FROM "Bean" bean WHERE c."beanId" = bean."id";

ALTER TABLE "Bean" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "BrewLog" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CuppingSession" ALTER COLUMN "userId" SET NOT NULL;

DROP INDEX IF EXISTS "Bean_isFinished_roastDate_idx";
DROP INDEX IF EXISTS "BrewLog_createdAt_idx";
DROP INDEX IF EXISTS "BrewLog_beanId_createdAt_idx";
DROP INDEX IF EXISTS "CuppingSession_createdAt_idx";
DROP INDEX IF EXISTS "CuppingSession_beanId_createdAt_idx";

CREATE INDEX "Bean_userId_isFinished_roastDate_idx" ON "Bean"("userId", "isFinished", "roastDate" DESC);
CREATE INDEX "BrewLog_userId_createdAt_idx" ON "BrewLog"("userId", "createdAt" DESC);
CREATE INDEX "BrewLog_userId_beanId_createdAt_idx" ON "BrewLog"("userId", "beanId", "createdAt" DESC);
CREATE INDEX "CuppingSession_userId_createdAt_idx" ON "CuppingSession"("userId", "createdAt" DESC);
CREATE INDEX "CuppingSession_userId_beanId_createdAt_idx" ON "CuppingSession"("userId", "beanId", "createdAt" DESC);

ALTER TABLE "Bean" ADD CONSTRAINT "Bean_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrewLog" ADD CONSTRAINT "BrewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuppingSession" ADD CONSTRAINT "CuppingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
