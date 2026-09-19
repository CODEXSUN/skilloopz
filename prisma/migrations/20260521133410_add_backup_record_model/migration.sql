-- CreateTable
CREATE TABLE "backup_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "type" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "file_path" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "backup_records_created_at_idx" ON "backup_records"("created_at");

-- CreateIndex
CREATE INDEX "backup_records_type_idx" ON "backup_records"("type");

-- CreateIndex
CREATE INDEX "backup_records_status_idx" ON "backup_records"("status");
