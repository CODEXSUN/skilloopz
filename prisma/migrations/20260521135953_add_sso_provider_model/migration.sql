-- CreateTable
CREATE TABLE "sso_providers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "issuer_url" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "button_label" TEXT,
    "icon_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_links_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "sso_providers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "sso_providers_provider_type_idx" ON "sso_providers"("provider_type");

-- CreateIndex
CREATE INDEX "sso_providers_enabled_idx" ON "sso_providers"("enabled");

-- CreateIndex
CREATE INDEX "user_links_user_id_idx" ON "user_links"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_links_provider_id_external_id_key" ON "user_links"("provider_id", "external_id");
