-- CreateIndex
CREATE INDEX "Bean_isFinished_roastDate_idx"
ON "Bean"("isFinished", "roastDate" DESC);

-- CreateIndex
CREATE INDEX "BrewLog_createdAt_idx"
ON "BrewLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "BrewLog_beanId_createdAt_idx"
ON "BrewLog"("beanId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BrewLog_rating_createdAt_idx"
ON "BrewLog"("rating" DESC, "createdAt" DESC);
