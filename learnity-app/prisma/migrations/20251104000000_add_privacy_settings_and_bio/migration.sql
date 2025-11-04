-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "bio" TEXT;
ALTER TABLE "student_profiles" ADD COLUMN "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "student_profiles" ADD COLUMN "showEmail" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "student_profiles" ADD COLUMN "showLearningGoals" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN "showInterests" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN "showProgress" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "student_profiles" ADD COLUMN "allowMessages" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- AlterTable - Change column type to enum
ALTER TABLE "student_profiles" ALTER COLUMN "profileVisibility" TYPE "ProfileVisibility" USING "profileVisibility"::"ProfileVisibility";
