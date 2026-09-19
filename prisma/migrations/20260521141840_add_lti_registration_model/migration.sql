-- CreateTable
CREATE TABLE "lti_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "deployment_id" TEXT NOT NULL,
    "auth_url" TEXT NOT NULL,
    "token_url" TEXT NOT NULL,
    "keyset_url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "lti_registrations_issuer_idx" ON "lti_registrations"("issuer");

-- CreateIndex
CREATE INDEX "lti_registrations_client_id_idx" ON "lti_registrations"("client_id");

-- CreateIndex
CREATE INDEX "lti_registrations_enabled_idx" ON "lti_registrations"("enabled");
