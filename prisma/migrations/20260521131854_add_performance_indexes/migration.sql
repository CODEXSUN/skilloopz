-- CreateIndex
CREATE INDEX "courses_teacher_id_idx" ON "courses"("teacher_id");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "lesson_progress_updated_at_idx" ON "lesson_progress"("updated_at");

-- CreateIndex
CREATE INDEX "marketplace_listings_price_idx" ON "marketplace_listings"("price");
