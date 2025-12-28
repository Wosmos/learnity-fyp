---
description: Integration workflow for 100ms Video and GetStream Chat
---

# 100ms & GetStream Integration Plan

## 1. Setup & Dependencies
- [x] Install `@100mslive/react-sdk` and `@100mslive/hms-video-store`
- [x] Install `stream-chat` and `stream-chat-react`
- [ ] Configure Environment Variables (User needs to provide these)

## 2. Backend Services (Token Generation)
- [ ] Create `src/lib/services/video.service.ts` for 100ms logic (Room creation, Token generation).
- [ ] Create `src/lib/services/chat.service.ts` for GetStream logic (User sync, Token generation).
- [ ] Create API Route: `/api/video/token`
- [ ] Create API Route: `/api/chat/token`

## 3. Frontend Components
- [ ] Create `src/components/video/LiveSession.tsx` (Video Room UI).
- [ ] Create `src/components/chat/CourseChat.tsx` (Chat UI).
- [ ] Create `src/components/chat/DirectMessage.tsx` (1:1 Chat).

## 4. Integration Points
- [ ] Update `src/app/dashboard/teacher/sessions/page.tsx` to launch Video Sessions.
- [ ] Update `src/app/dashboard/teacher/courses/[courseId]/page.tsx` (or similar) to include Chat.
- [ ] Ensure `src/app/dashboard/student/learning/[courseId]/page.tsx` includes both.

## 5. Data Seeding & Verification
- [ ] Run `prisma/seed.ts` to populate initial users/courses.
- [ ] Verify `api/teacher/students` returns correct enrolled students.
