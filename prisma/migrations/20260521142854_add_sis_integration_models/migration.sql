-- CreateTable
CREATE TABLE "sis_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "api_url" TEXT,
    "api_key" TEXT,
    "csv_mapping" TEXT NOT NULL DEFAULT '{}',
    "school_id" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sis_sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "config_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "records_failed" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME
);

-- CreateIndex
CREATE INDEX "sis_configs_provider_idx" ON "sis_configs"("provider");

-- CreateIndex
CREATE INDEX "sis_configs_enabled_idx" ON "sis_configs"("enabled");

-- CreateIndex
CREATE INDEX "sis_sync_logs_config_id_idx" ON "sis_sync_logs"("config_id");

-- CreateIndex
CREATE INDEX "sis_sync_logs_status_idx" ON "sis_sync_logs"("status");

-- CreateIndex
CREATE INDEX "sis_sync_logs_created_at_idx" ON "sis_sync_logs"("created_at");
