-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "max_users" INTEGER NOT NULL DEFAULT 10,
    "current_users" INTEGER NOT NULL DEFAULT 0,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "custom_domain" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "category_id" TEXT,
    "teacher_id" TEXT NOT NULL,
    "school_id" TEXT,
    "tenant_id" TEXT,
    "subject" TEXT,
    "grade_level" TEXT,
    "age_range" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "is_adaptive" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "estimated_minutes" INTEGER,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_courses" ("age_range", "category_id", "created_at", "deleted_at", "description", "difficulty", "estimated_minutes", "grade_level", "id", "is_adaptive", "metadata", "school_id", "status", "subject", "teacher_id", "thumbnail_url", "title", "updated_at") SELECT "age_range", "category_id", "created_at", "deleted_at", "description", "difficulty", "estimated_minutes", "grade_level", "id", "is_adaptive", "metadata", "school_id", "status", "subject", "teacher_id", "thumbnail_url", "title", "updated_at" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
CREATE TABLE "new_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "email_verified" DATETIME,
    "verification_token" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "status" TEXT NOT NULL DEFAULT 'active',
    "password_hash" TEXT,
    "age_group" TEXT,
    "parent_id" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATETIME,
    "school_id" TEXT,
    "tenant_id" TEXT,
    CONSTRAINT "profiles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_profiles" ("age_group", "avatar_url", "created_at", "current_streak", "email", "email_verified", "full_name", "id", "last_activity_date", "level", "longest_streak", "metadata", "onboarding_completed", "parent_id", "password_hash", "role", "school_id", "status", "updated_at", "verification_token", "xp") SELECT "age_group", "avatar_url", "created_at", "current_streak", "email", "email_verified", "full_name", "id", "last_activity_date", "level", "longest_streak", "metadata", "onboarding_completed", "parent_id", "password_hash", "role", "school_id", "status", "updated_at", "verification_token", "xp" FROM "profiles";
DROP TABLE "profiles";
ALTER TABLE "new_profiles" RENAME TO "profiles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");
