# Learnity Project Status & Roadmap

## 📅 Last Updated: 2025-12-15

## 📊 Executive Summary
The Learnity platform is pivoting to focus heavily on **Gamification** and **User Engagement**, while simplifying the communication and booking flows by leveraging external tools (WhatsApp, Google Meet).

**Current Focus:** Implementing a robust Gamification Engine (Badges, Leaderboards, Quests) and finalizing the Teacher Availability display for manual booking via WhatsApp.

---

## 🧩 Module Status Breakdown

| Module | Status | Notes |
| :--- | :---: | :--- |
| **1. Authentication** | ✅ **Complete** | Role-based flows working. |
| **2. Gamification** | 🚧 **In Progress** | **HIGH PRIORITY.** Basic XP exists. Needs Badges, Leaderboards, Quests. |
| **3. Lesson Management** | 🟡 **Partial** | Core components exist. Needs integration. |
| **4. Study Groups** | 📉 **De-scoped** | Chat/Meetings removed. Will focus on *Resource Sharing* only (Optional). |
| **5. Tutor Verification** | ✅ **Complete** | Registration & Profile enhancement done. |
| **6. Session Booking** | 🔄 **Modified** | **Manual Flow.** Student views schedule -> Requests via WhatsApp -> Meets on Google Meet. |
| **7. Analytics** | 🟡 **Partial** | Basic Admin analytics. Needs Gamification stats. |
| **8. Admin Panel** | ✅ **Complete** | User/Teacher management active. |

---

## 🚦 Implementation Priorities & Categories

### 🚨 Critical (Do Immediately)
*   **Teacher Availability Display:** Students MUST see the teacher's schedule to know when to request a session.
*   **Gamification Database Schema:** Define tables for `Badges`, `UserBadges`, `Quests`, `Leaderboards`.

### 🟢 Must Have (Core Value)
*   **Badges System:** Logic to award badges (e.g., "First Login", "Course Completed").
*   **Student Dashboard "Achievements" Section:** UI to show earned badges and current level/XP.
*   **WhatsApp Booking Integration:** "Book Session" button on Teacher Profile that opens WhatsApp with a pre-filled message.

### 🔵 Necessary (Standard Features)
*   **Leaderboards:** Global and Course-specific rankings to drive competition.
*   **Daily Quests:** Simple tasks (e.g., "Complete 1 Lesson") to drive daily retention.
*   **Course Completion Logic:** robustly triggering XP awards and Badge unlocks.

### 🟣 Nice to Have (Enhancements)
*   **Streak Freeze/Protection:** Advanced streak logic.
*   **Animated Celebrations:** Confetti/Sound effects when earning a badge.
*   **Public Profiles:** Students can see each other's badges/level.

### ⚪ Optional (Future/Overkill)
*   **Resource Sharing Groups:** Simple file/link sharing spaces without chat.
*   **Avatar Customization:** Spending XP on cosmetic items.

---

## 🗺 Step-by-Step Implementation Guide

### Phase 1: The Gamification Foundation (Current Sprint)
1.  **Database Setup:**
    *   Create `Badge` model (name, description, icon, criteria).
    *   Create `UserBadge` model (user_id, badge_id, earned_at).
    *   Update `User` model to track `current_streak`, `last_login_date`.
2.  **Badge Seeding:**
    *   Create a script to seed initial badges (e.g., "Newcomer", "Scholar", "7-Day Streak").
3.  **Dashboard UI Update:**
    *   Add a "My Badges" grid to the Student Dashboard.
    *   Add a "Next Level" progress bar prominently.

### Phase 2: The "Manual" Booking Flow
1.  **Teacher Profile UI:**
    *   Fetch and display the `preferredTimes` (Schedule) on `src/app/teachers/[id]/page.tsx`.
    *   Format it nicely (e.g., "Mon: 10am - 2pm").
2.  **WhatsApp Integration:**
    *   Add a **"Request Session"** button.
    *   **Logic:** `href="https://wa.me/${teacherPhoneNumber}?text=Hi, I would like to book a session on..."`
    *   *Note:* Ensure Teacher model has a `phoneNumber` field (or add it).

### Phase 3: Engagement Loops (Leaderboards & Quests)
1.  **Leaderboard Page:**
    *   Create `src/app/leaderboard/page.tsx`.
    *   Fetch top 10 students by XP.
    *   Display user avatars, names, and XP.
2.  **Daily Quests:**
    *   Simple logic: Check if user completed a lesson today.
    *   UI: Small widget on Dashboard "Daily Goal: 0/1 Lesson".

---

## 📝 Developer Notes
*   **Gamification Logic:** Keep it modular. Create a `GamificationService` to handle awarding XP/Badges so it can be called from anywhere (e.g., after Lesson Complete, after Login).
*   **WhatsApp:** Verify we have the teacher's phone number. If not, fallback to Email or show a "Contact Info Missing" state.
