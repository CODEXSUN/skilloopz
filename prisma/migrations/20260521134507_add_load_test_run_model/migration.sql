-- CreateTable
CREATE TABLE "load_test_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "target_url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "concurrency" INTEGER NOT NULL DEFAULT 5,
    "total_requests" INTEGER NOT NULL DEFAULT 20,
    "results" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '{}',
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE INDEX "load_test_runs_created_at_idx" ON "load_test_runs"("created_at");
