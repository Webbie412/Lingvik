-- CreateEnum
CREATE TYPE "LevelBand" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('VOCABULARY', 'SENTENCE_CORPUS', 'MORPHOLOGY', 'CURRICULUM');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "LessonMode" AS ENUM ('STANDARD', 'CONVERSATIONAL');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE_TRANSLATION', 'MATCHING', 'WORD_ORDER', 'FILL_IN_THE_BLANK', 'TYPING', 'LISTENING', 'PRONUNCIATION');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'learner',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Units" (
    "id" TEXT NOT NULL,
    "levelBand" "LevelBand" NOT NULL,
    "levelOrder" INTEGER NOT NULL,
    "unitOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT,
    "description" TEXT,
    "grammarFocus" TEXT NOT NULL,
    "cefrLevel" TEXT NOT NULL,
    "vocabularyTags" TEXT[],
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lessons" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "mode" "LessonMode" NOT NULL DEFAULT 'STANDARD',
    "theme" TEXT,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "grammarTarget" TEXT NOT NULL,
    "isReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "icelandic" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "frequencyRank" INTEGER,
    "frequencyBand" TEXT,
    "frequencyList" TEXT,
    "cefrLevel" TEXT,
    "difficultyBand" TEXT,
    "partOfSpeech" TEXT,
    "lessonGroup" TEXT,
    "grammarTags" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercises" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "vocabularyId" TEXT,
    "type" "ExerciseType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "hint" TEXT,
    "explanation" TEXT,
    "correctAnswers" TEXT[],
    "answers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "acceptedAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "options" TEXT[],
    "grammarTag" TEXT NOT NULL,
    "vocabularyTag" TEXT NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'EASY',
    "sentenceSourceId" TEXT,
    "audioUrl" TEXT,
    "pronunciationRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonDrafts" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedById" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceNotes" TEXT,
    "jsonPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonDrafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGenerationLogs" (
    "id" TEXT NOT NULL,
    "draftId" TEXT,
    "requestHash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "promptVersion" TEXT,
    "tokenInput" INTEGER,
    "tokenOutput" INTEGER,
    "latencyMs" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "cachedResponse" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGenerationLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completionPct" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumImports" (
    "id" TEXT NOT NULL,
    "importedById" TEXT,
    "type" "ImportType" NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "rawPayload" JSONB NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumImports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabularyMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVocabularyMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonDialogues" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "grammarExplanation" TEXT NOT NULL,
    "vocabularyFocus" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "speakingPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonDialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueLines" (
    "id" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "speaker" TEXT NOT NULL,
    "icelandic" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DialogueLines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularySets" (
    "id" TEXT NOT NULL,
    "importId" TEXT,
    "name" TEXT NOT NULL,
    "cefrLevel" TEXT,
    "difficultyLevel" TEXT,
    "lessonGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularySets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularySetItems" (
    "id" TEXT NOT NULL,
    "vocabularySetId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularySetItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationHistory" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "lessonId" TEXT,
    "importId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Units_levelBand_levelOrder_unitOrder_key" ON "Units"("levelBand", "levelOrder", "unitOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_icelandic_english_key" ON "Vocabulary"("icelandic", "english");

-- CreateIndex
CREATE INDEX "LessonDrafts_unitId_createdAt_idx" ON "LessonDrafts"("unitId", "createdAt");

-- CreateIndex
CREATE INDEX "LessonDrafts_status_generatedAt_idx" ON "LessonDrafts"("status", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIGenerationLogs_requestHash_key" ON "AIGenerationLogs"("requestHash");

-- CreateIndex
CREATE INDEX "AIGenerationLogs_createdAt_idx" ON "AIGenerationLogs"("createdAt");

-- CreateIndex
CREATE INDEX "AIGenerationLogs_success_createdAt_idx" ON "AIGenerationLogs"("success", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_lessonId_key" ON "UserProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_userId_code_key" ON "Achievements"("userId", "code");

-- CreateIndex
CREATE INDEX "ReviewQueue_userId_dueAt_idx" ON "ReviewQueue"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewQueue_userId_vocabularyId_key" ON "ReviewQueue"("userId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVocabularyMastery_userId_vocabularyId_key" ON "UserVocabularyMastery"("userId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonDialogues_lessonId_key" ON "LessonDialogues"("lessonId");

-- CreateIndex
CREATE INDEX "DialogueLines_dialogueId_sortOrder_idx" ON "DialogueLines"("dialogueId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularySetItems_vocabularySetId_vocabularyId_key" ON "VocabularySetItems"("vocabularySetId", "vocabularyId");

-- CreateIndex
CREATE INDEX "GenerationHistory_status_createdAt_idx" ON "GenerationHistory"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercises" ADD CONSTRAINT "Exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercises" ADD CONSTRAINT "Exercises_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDrafts" ADD CONSTRAINT "LessonDrafts_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDrafts" ADD CONSTRAINT "LessonDrafts_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGenerationLogs" ADD CONSTRAINT "AIGenerationLogs_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "LessonDrafts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGenerationLogs" ADD CONSTRAINT "AIGenerationLogs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempts" ADD CONSTRAINT "ExerciseAttempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempts" ADD CONSTRAINT "ExerciseAttempts_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewQueue" ADD CONSTRAINT "ReviewQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewQueue" ADD CONSTRAINT "ReviewQueue_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumImports" ADD CONSTRAINT "CurriculumImports_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabularyMastery" ADD CONSTRAINT "UserVocabularyMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVocabularyMastery" ADD CONSTRAINT "UserVocabularyMastery_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonDialogues" ADD CONSTRAINT "LessonDialogues_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueLines" ADD CONSTRAINT "DialogueLines_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "LessonDialogues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularySets" ADD CONSTRAINT "VocabularySets_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularySetItems" ADD CONSTRAINT "VocabularySetItems_vocabularySetId_fkey" FOREIGN KEY ("vocabularySetId") REFERENCES "VocabularySets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularySetItems" ADD CONSTRAINT "VocabularySetItems_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationHistory" ADD CONSTRAINT "GenerationHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationHistory" ADD CONSTRAINT "GenerationHistory_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationHistory" ADD CONSTRAINT "GenerationHistory_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
