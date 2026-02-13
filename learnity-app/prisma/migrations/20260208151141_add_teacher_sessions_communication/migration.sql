/*
  Warnings:

  - You are about to drop the column `lastLessonDate` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_COURSE_COMPLETE', 'FIVE_COURSES_COMPLETE', 'TEN_COURSES_COMPLETE', 'STREAK_7_DAYS', 'STREAK_30_DAYS', 'STREAK_100_DAYS', 'QUIZ_MASTER', 'TOP_REVIEWER');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('CLASS', 'ONE_ON_ONE', 'GROUP_MEETING');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "VideoSessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GROUP_CHAT_CREATED', 'NEW_MESSAGE', 'INSTANT_CALL_STARTED', 'SESSION_SCHEDULED', 'SESSION_REMINDER', 'SESSION_LIVE', 'SESSION_CANCELLED', 'SESSION_RESCHEDULED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'ANDROID', 'IOS');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastLessonDate";

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_group_chats" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "streamChannelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_group_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_group_chat_members" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_group_chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_sessions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionType" "SessionType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" "RecurrenceType",
    "hmsRoomId" TEXT,
    "hmsRoomName" TEXT,
    "streamChannelId" TEXT,
    "status" "VideoSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "video_session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notifications" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "fcmToken" TEXT,
    "apnsToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "badges_userId_idx" ON "badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_userId_type_key" ON "badges"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_group_chats_streamChannelId_key" ON "teacher_group_chats"("streamChannelId");

-- CreateIndex
CREATE INDEX "teacher_group_chats_teacherId_idx" ON "teacher_group_chats"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_group_chat_members_studentId_idx" ON "teacher_group_chat_members"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_group_chat_members_chatId_studentId_key" ON "teacher_group_chat_members"("chatId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "video_sessions_streamChannelId_key" ON "video_sessions"("streamChannelId");

-- CreateIndex
CREATE INDEX "video_sessions_teacherId_idx" ON "video_sessions"("teacherId");

-- CreateIndex
CREATE INDEX "video_sessions_scheduledAt_idx" ON "video_sessions"("scheduledAt");

-- CreateIndex
CREATE INDEX "video_sessions_status_idx" ON "video_sessions"("status");

-- CreateIndex
CREATE INDEX "video_session_participants_studentId_idx" ON "video_session_participants"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "video_session_participants_sessionId_studentId_key" ON "video_session_participants"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "session_notifications_userId_idx" ON "session_notifications"("userId");

-- CreateIndex
CREATE INDEX "session_notifications_sessionId_idx" ON "session_notifications"("sessionId");

-- CreateIndex
CREATE INDEX "session_notifications_sent_idx" ON "session_notifications"("sent");

-- CreateIndex
CREATE INDEX "session_notifications_read_idx" ON "session_notifications"("read");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "device_tokens_isActive_idx" ON "device_tokens"("isActive");

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_group_chats" ADD CONSTRAINT "teacher_group_chats_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_group_chat_members" ADD CONSTRAINT "teacher_group_chat_members_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "teacher_group_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_group_chat_members" ADD CONSTRAINT "teacher_group_chat_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_sessions" ADD CONSTRAINT "video_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_session_participants" ADD CONSTRAINT "video_session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "video_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_session_participants" ADD CONSTRAINT "video_session_participants_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notifications" ADD CONSTRAINT "session_notifications_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "video_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notifications" ADD CONSTRAINT "session_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
