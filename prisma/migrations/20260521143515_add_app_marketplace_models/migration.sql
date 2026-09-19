-- CreateTable
CREATE TABLE "marketplace_apps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "developer_url" TEXT,
    "icon_url" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "config_schema" TEXT NOT NULL DEFAULT '{}',
    "webhook_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "install_count" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "app_installations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT,
    "config" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "app_installations_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "marketplace_apps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "marketplace_apps_status_idx" ON "marketplace_apps"("status");

-- CreateIndex
CREATE INDEX "marketplace_apps_category_idx" ON "marketplace_apps"("category");

-- CreateIndex
CREATE INDEX "app_installations_app_id_idx" ON "app_installations"("app_id");

-- CreateIndex
CREATE INDEX "app_installations_user_id_idx" ON "app_installations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_installations_app_id_user_id_school_id_key" ON "app_installations"("app_id", "user_id", "school_id");
