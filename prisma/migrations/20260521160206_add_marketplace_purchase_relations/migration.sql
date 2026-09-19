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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "marketplace_purchases_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "marketplace_purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "marketplace_purchases_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_marketplace_purchases" ("buyer_id", "created_at", "currency", "id", "listing_id", "metadata", "platform_fee", "price", "status", "teacher_cut", "teacher_id") SELECT "buyer_id", "created_at", "currency", "id", "listing_id", "metadata", "platform_fee", "price", "status", "teacher_cut", "teacher_id" FROM "marketplace_purchases";
DROP TABLE "marketplace_purchases";
ALTER TABLE "new_marketplace_purchases" RENAME TO "marketplace_purchases";
CREATE INDEX "marketplace_purchases_listing_id_idx" ON "marketplace_purchases"("listing_id");
CREATE INDEX "marketplace_purchases_buyer_id_idx" ON "marketplace_purchases"("buyer_id");
CREATE INDEX "marketplace_purchases_teacher_id_idx" ON "marketplace_purchases"("teacher_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
