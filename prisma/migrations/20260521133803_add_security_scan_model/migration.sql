-- CreateTable
CREATE TABLE "security_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "results" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '{}',
    "triggered_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE INDEX "security_scans_created_at_idx" ON "security_scans"("created_at");

-- CreateIndex
CREATE INDEX "security_scans_status_idx" ON "security_scans"("status");
