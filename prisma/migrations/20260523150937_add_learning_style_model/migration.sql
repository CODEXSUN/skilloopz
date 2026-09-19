/*
  Warnings:

  - You are about to drop the column `learningStyle` on the `student_learning_profiles` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "learning_styles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_student_learning_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "learning_style_id" TEXT,
    "preferred_difficulty" INTEGER NOT NULL DEFAULT 2,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "attention_span" INTEGER NOT NULL DEFAULT 20,
    "memory_score" REAL NOT NULL DEFAULT 0.5,
    "quiz_completed" BOOLEAN NOT NULL DEFAULT false,
    "style_overridden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "student_learning_profiles_learning_style_id_fkey" FOREIGN KEY ("learning_style_id") REFERENCES "learning_styles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_student_learning_profiles" ("attention_span", "created_at", "id", "interests", "memory_score", "preferred_difficulty", "quiz_completed", "style_overridden", "updated_at", "user_id") SELECT "attention_span", "created_at", "id", "interests", "memory_score", "preferred_difficulty", "quiz_completed", "style_overridden", "updated_at", "user_id" FROM "student_learning_profiles";
DROP TABLE "student_learning_profiles";
ALTER TABLE "new_student_learning_profiles" RENAME TO "student_learning_profiles";
CREATE UNIQUE INDEX "student_learning_profiles_user_id_key" ON "student_learning_profiles"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "learning_styles_name_key" ON "learning_styles"("name");
