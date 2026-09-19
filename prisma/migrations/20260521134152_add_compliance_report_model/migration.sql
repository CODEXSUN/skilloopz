-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "category" TEXT NOT NULL DEFAULT 'all',
    "results" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE INDEX "compliance_reports_created_at_idx" ON "compliance_reports"("created_at");

-- CreateIndex
CREATE INDEX "compliance_reports_category_idx" ON "compliance_reports"("category");

-- CreateIndex
CREATE INDEX "compliance_reports_status_idx" ON "compliance_reports"("status");
