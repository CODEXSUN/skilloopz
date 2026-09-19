-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "domain" TEXT NOT NULL DEFAULT 'coding',
    "icon" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "world_id" TEXT,
    "island_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "concepts_island_id_fkey" FOREIGN KEY ("island_id") REFERENCES "islands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "concept_prerequisites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concept_id" TEXT NOT NULL,
    "prerequisite_id" TEXT NOT NULL,
    CONSTRAINT "concept_prerequisites_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "concept_prerequisites_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "concepts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learning_worlds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "icon" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "islands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "world_id" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT DEFAULT '#6366f1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "required_mastery" REAL NOT NULL DEFAULT 0.8,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "islands_world_id_fkey" FOREIGN KEY ("world_id") REFERENCES "learning_worlds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "world_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "world_id" TEXT,
    "island_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "progress" REAL NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "world_progress_island_id_fkey" FOREIGN KEY ("island_id") REFERENCES "islands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_learning_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "learningStyle" TEXT NOT NULL DEFAULT 'unknown',
    "preferred_difficulty" INTEGER NOT NULL DEFAULT 2,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "attention_span" INTEGER NOT NULL DEFAULT 20,
    "memory_score" REAL NOT NULL DEFAULT 0.5,
    "quiz_completed" BOOLEAN NOT NULL DEFAULT false,
    "style_overridden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ad_placements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "slot_name" TEXT NOT NULL,
    "ad_unit" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "concepts_domain_idx" ON "concepts"("domain");

-- CreateIndex
CREATE INDEX "concepts_world_id_idx" ON "concepts"("world_id");

-- CreateIndex
CREATE INDEX "concepts_island_id_idx" ON "concepts"("island_id");

-- CreateIndex
CREATE INDEX "concept_prerequisites_concept_id_idx" ON "concept_prerequisites"("concept_id");

-- CreateIndex
CREATE INDEX "concept_prerequisites_prerequisite_id_idx" ON "concept_prerequisites"("prerequisite_id");

-- CreateIndex
CREATE UNIQUE INDEX "concept_prerequisites_concept_id_prerequisite_id_key" ON "concept_prerequisites"("concept_id", "prerequisite_id");

-- CreateIndex
CREATE INDEX "learning_worlds_order_idx" ON "learning_worlds"("order");

-- CreateIndex
CREATE INDEX "learning_worlds_is_active_idx" ON "learning_worlds"("is_active");

-- CreateIndex
CREATE INDEX "islands_world_id_idx" ON "islands"("world_id");

-- CreateIndex
CREATE INDEX "islands_order_idx" ON "islands"("order");

-- CreateIndex
CREATE INDEX "world_progress_user_id_idx" ON "world_progress"("user_id");

-- CreateIndex
CREATE INDEX "world_progress_status_idx" ON "world_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "world_progress_user_id_island_id_key" ON "world_progress"("user_id", "island_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_learning_profiles_user_id_key" ON "student_learning_profiles"("user_id");

-- CreateIndex
CREATE INDEX "ad_placements_enabled_idx" ON "ad_placements"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ad_placements_page_location_key" ON "ad_placements"("page", "location");
