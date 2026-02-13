# Pending Implementations & Implementation Plan

## Overview
This document outlines the pending features, tasks, and implementation plans for the Learnity application, specifically focusing on critical communication features and administrative controls.

## 1. Student-Teacher Chat Implementation
**Objective**: Enable real-time, direct communication between students and teachers using GetStream.

### Current Status
- **Backend**: 
  - `DirectMessageChannel` model exists in Prisma schema.
  - API Routes defined in `src/app/api/chat/direct/route.ts` (GET list, POST create).
  - Stream Chat service initialized in `src/lib/services/stream-chat.service.ts`.
- **Frontend**:
  - `DirectMessages.tsx` component exists for listing and viewing chats.
  - "Message" button exists in `TeacherHero.tsx` but points to a non-existent route `/messages/[id]`.

### Implementation Plan (Immediate Actions)
1.  **Create Message Route**: Implement `src/app/messages/[teacherId]/page.tsx`.
    - **Logic**:
      - Verify user is logged in.
      - On mount, call `POST /api/chat/direct` with `teacherId` to ensure a channel exists.
      - Redirect to the main messages view with the channel selected, OR render the chat interface directly.
    - **Best Practice**: Use a consistent layout where the chat list is visible on the left and the active conversation on the right.
2.  **Enhance Chat UI**:
    - Ensure `DirectMessages` component can accept an `activeChannelId` or `targetUserId` to auto-select the conversation.

## 2. Super Admin Module
**Objective**: Define and implement a comprehensive dashboard for Super Admins with full read/write capabilities.

### Permissions & Capabilities

#### READ Options (Visibility)
- **User Management**: 
  - View all users (Students, Teachers, Admins).
  - View user details: profile stats, enrollment history, activity logs.
- **Content Management**:
  - View all courses (Active, Pending, Draft, Archived).
  - View all lessons, quizzes, and resources.
  - Access to course analytics (enrollments, completion rates, ratings).
- **Financials**:
  - View total platform revenue.
  - View teacher earnings and payout history.
  - View transaction logs.
- **System Health**:
  - View audit logs (`AuditLog` table).
  - View security events (`SecurityEvent` table).
  - View error logs and system performance metrics.

#### WRITE Options (Actions)
- **User Governance**:
  - **Ban/Suspend User**: Revoke access immediately (updates `isActive` flag).
  - **Impersonate User**: Log in as a user for support (requires careful security implementation).
  - **Edit User Details**: Override profile information if necessary (e.g., remove inappropriate content).
- **Teacher Approval Workflow**:
  - **Approve/Reject Applications**: Review teacher applications and change status.
  - **Verify Credentials**: Mark documents/qualifications as verified.
- **Content Moderation**:
  - **Unpublish Course**: Take a course offline for policy violations.
  - **Featured Content**: Mark courses/teachers as "Featured" or "Top Rated".
  - **Edit Categories**: Create, update, or delete course categories.
- **Platform Configuration**:
  - Configure global settings (e.g., commission rates, supported languages).
  - Manage announcement banners.

### Implementation Next Steps for Admin
1.  **Dashboard Structure**: Expand `src/app/admin` to include sub-pages for `users`, `courses`, `finance`, `approvals`.
2.  **Role-Based Access Control (RBAC)**: Ensure middleware strictly enforces `ADMIN` role for these routes.
3.  **Data Tables**: Use `@tanstack/react-table` for efficient display of large datasets with filtering and sorting.

## 3. General Pending Items
- **Documentation**: API documentation for mobile app developers (if applicable).
- **Testing**: End-to-end testing for the complete User -> Enrol -> Complete Lesson flow.
- **Mobile Optimization**: Verify chat and classroom experience on mobile browsers.
- **Testing**: End-to-end testing for the complete User -> Enrol -> Complete Lesson flow.

## 4. Gamification & Engagement (Updated)
**Objective**: Enhance user retention through XP, streaks, and leaderboards.

### Current Status (Frontend & Backend)
- **Gamification Service**: Implemented `GamificationService` with XP keys, Streak logic, and Badge awards.
- **XP & Levels**: Backend calculates levels based on XP thresholds. Frontend displays progress.
- **Streaks**:
  - Backend: `updateStreak` logic handles daily streaks and resets.
  - Frontend: `EliteStreakCard` now visualizes 35-day activity history (heatmap).
- **Achievements/Badges**:
  - Backend: `checkAndAwardBadge` logic exists.
  - Frontend: `AchievementsPage` updated to show real data.

### Pending / To-Do
1.  **Background Jobs**:
    - **Daily Streak Maintenance**: Currently streaks update on user activity. A cron job (using Vercel Cron or Inngest) is recommended to identify "missed" days for data analysis, though the current "on-activity" check is sufficient for user-facing features.
    - **Leaderboard Caching**: `getGlobalLeaderboard` is real-time. For scale, implement Redis caching with 1-5 minute TTL.
2.  **XP Sources**:
    - Navbar now displays real XP/Streak (removed placeholders).
    - Ensure `CourseCompletion` and `QuizPass` events correctly trigger `awardXP`.
3.  **UI Localization**:
    - Removed "sci-fi" jargon (Protocol, Manifest, Sync) from Achievements page to make it more friendly for the target audience.

## 5. Thesis Alignment (Chapter 6)
- **Results Verification**:
  - The gamification implementation aligns with Chapter 6 results ("Engagement is driven by gamification...").
  - The "Western" language issue in UI has been addressed to better fit the local context as per "Project Overview".

