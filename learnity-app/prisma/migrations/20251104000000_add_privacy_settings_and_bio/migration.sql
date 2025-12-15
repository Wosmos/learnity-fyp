-- CreateEnum (must be created first)
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "showEmail" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "showLearningGoals" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "showInterests" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "showProgress" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "allowMessages" BOOLEAN NOT NULL DEFAULT true;
