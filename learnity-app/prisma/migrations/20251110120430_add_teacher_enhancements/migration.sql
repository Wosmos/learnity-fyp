-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "activeStudents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "availableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "education" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "faqs" JSONB,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "preferredTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rating" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "responseTime" TEXT,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sampleLessons" JSONB,
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "successStories" JSONB,
ADD COLUMN     "teachingApproach" TEXT,
ADD COLUMN     "teachingStyle" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "trustBadges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoIntroUrl" TEXT,
ADD COLUMN     "whyChooseMe" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "subject" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_teacherId_idx" ON "testimonials"("teacherId");

-- CreateIndex
CREATE INDEX "testimonials_rating_idx" ON "testimonials"("rating");

-- CreateIndex
CREATE INDEX "teacher_profiles_rating_idx" ON "teacher_profiles"("rating");

-- CreateIndex
CREATE INDEX "teacher_profiles_lessonsCompleted_idx" ON "teacher_profiles"("lessonsCompleted");
