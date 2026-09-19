-- CreateTable
CREATE TABLE "school_contracts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "school_id" TEXT NOT NULL,
    "contract_type" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "max_students" INTEGER NOT NULL DEFAULT 100,
    "max_teachers" INTEGER NOT NULL DEFAULT 50,
    "price_per_month" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "signed_by" TEXT,
    "signed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "school_contracts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "school_contracts_school_id_idx" ON "school_contracts"("school_id");

-- CreateIndex
CREATE INDEX "school_contracts_status_idx" ON "school_contracts"("status");
