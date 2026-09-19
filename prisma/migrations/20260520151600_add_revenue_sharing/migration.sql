/*
  Warnings:

  - Added the required column `teacher_id` to the `marketplace_purchases` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "revenue_share_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform_fee" REAL NOT NULL DEFAULT 20,
    "min_payout" REAL NOT NULL DEFAULT 50,
    "payout_method" TEXT NOT NULL DEFAULT 'manual',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payout_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacher_id" TEXT NOT NULL,
    "payout_method" TEXT NOT NULL DEFAULT 'bank',
    "account_name" TEXT,
    "account_email" TEXT,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "routing_number" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payout_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacher_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "method" TEXT NOT NULL DEFAULT 'bank',
    "description" TEXT,
    "reference_id" TEXT,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_marketplace_purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "platform_fee" REAL NOT NULL DEFAULT 0,
    "teacher_cut" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_marketplace_purchases" ("buyer_id", "created_at", "currency", "id", "listing_id", "metadata", "price", "status") SELECT "buyer_id", "created_at", "currency", "id", "listing_id", "metadata", "price", "status" FROM "marketplace_purchases";
DROP TABLE "marketplace_purchases";
ALTER TABLE "new_marketplace_purchases" RENAME TO "marketplace_purchases";
CREATE INDEX "marketplace_purchases_listing_id_idx" ON "marketplace_purchases"("listing_id");
CREATE INDEX "marketplace_purchases_buyer_id_idx" ON "marketplace_purchases"("buyer_id");
CREATE INDEX "marketplace_purchases_teacher_id_idx" ON "marketplace_purchases"("teacher_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "payout_accounts_teacher_id_idx" ON "payout_accounts"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "payout_accounts_teacher_id_payout_method_key" ON "payout_accounts"("teacher_id", "payout_method");

-- CreateIndex
CREATE INDEX "payout_transactions_teacher_id_idx" ON "payout_transactions"("teacher_id");

-- CreateIndex
CREATE INDEX "payout_transactions_status_idx" ON "payout_transactions"("status");
