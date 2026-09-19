-- CreateTable
CREATE TABLE "question_bank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "question_type" TEXT NOT NULL DEFAULT 'mcq',
    "options" TEXT NOT NULL DEFAULT '[]',
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "hint" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "question_bank_subject_idx" ON "question_bank"("subject");

-- CreateIndex
CREATE INDEX "question_bank_topic_idx" ON "question_bank"("topic");

-- CreateIndex
CREATE INDEX "question_bank_difficulty_idx" ON "question_bank"("difficulty");

-- CreateIndex
CREATE INDEX "question_bank_is_public_idx" ON "question_bank"("is_public");
