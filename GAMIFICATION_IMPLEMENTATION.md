# Gamification System Implementation Summary

## ✅ Completed: Database Schema

### New Models Added

#### 1. **BadgeDefinition** (Badge Metadata)
Separates badge definitions from user achievements for better flexibility.

**Fields:**
- `key`: Unique identifier (e.g., "first_course", "streak_7")
- `name`: Display name (e.g., "Course Conqueror")
- `description`: What the badge is for
- `icon`: Emoji or icon identifier
- `category`: ACHIEVEMENT, STREAK, MASTERY, SOCIAL, SPECIAL
- `rarity`: COMMON, RARE, EPIC, LEGENDARY
- `xpReward`: Bonus XP when earned
- `criteria`: JSON field for flexible criteria definition

#### 2. **UserBadge** (User's Earned Badges)
Tracks which badges each user has earned.

**Fields:**
- `userId`: Reference to User
- `badgeDefinitionId`: Reference to BadgeDefinition
- `earnedAt`: Timestamp
- `progress`: For progressive badges (e.g., 3/10 courses)

#### 3. **Quest** (Challenge Definitions)
Defines daily/weekly/monthly challenges.

**Fields:**
- `key`: Unique identifier
- `title`: Display title
- `description`: What to do
- `type`: LESSON_COMPLETION, QUIZ_COMPLETION, COURSE_ENROLLMENT, LOGIN_STREAK, REVIEW_SUBMISSION
- `frequency`: DAILY, WEEKLY, MONTHLY, ONE_TIME
- `targetValue`: Goal (e.g., 5 lessons)
- `xpReward`: XP awarded on completion
- `badgeReward`: Optional badge key to award

#### 4. **UserQuest** (User's Quest Progress)
Tracks each user's progress on quests.

**Fields:**
- `userId`: Reference to User
- `questId`: Reference to Quest
- `currentProgress`: Current count (e.g., 3/5 lessons)
- `status`: IN_PROGRESS, COMPLETED, EXPIRED
- `lastResetAt`: For recurring quests

### Enhanced Existing Models

#### **User Model**
- Added `lastLessonDate`: Tracks last day a lesson was completed (for streak calculation)
  - **Important**: Streaks are based on **daily lesson completion**, not just logins (like Duolingo)

#### **UserProgress Model**
- Added detailed comments explaining streak logic
- Added indexes on `totalXP` and `currentLevel` for leaderboard queries

#### **XPActivity Model**
- Added `QUEST_COMPLETE` to XPReason enum

---

## 🎮 Seeded Data

### Badge Definitions (12 total)

**Achievement Badges:**
- 🎯 First Steps (1 lesson)
- 🏆 Course Conqueror (1 course)
- ⭐ Learning Legend (5 courses)
- 👑 Master Scholar (10 courses)

**Streak Badges:**
- 🔥 Getting Started (3 days)
- 🔥🔥 Week Warrior (7 days)
- 🔥🔥🔥 Monthly Master (30 days)
- 💎 Century Champion (100 days)

**Mastery Badges:**
- 🎓 Quiz Ace (10 perfect quizzes)
- ⚡ Speed Learner (5 lessons in one day)

**Social Badges:**
- 💬 Helpful Reviewer (1 review)
- ⭐⭐⭐ Review Master (10 reviews)

### Quest Definitions (8 total)

**Daily Quests:**
- Daily Learner (1 lesson) - 50 XP
- Quiz Master (1 quiz) - 75 XP

**Weekly Quests:**
- Weekly Warrior (5 lessons) - 300 XP
- Quiz Champion (3 quizzes) - 250 XP
- Consistency King (7-day streak) - 500 XP + Week Warrior badge

**Monthly Quests:**
- Course Completer (1 course) - 1000 XP

**One-Time Quests (Onboarding):**
- Welcome to Learnity! (first lesson) - 100 XP + First Steps badge
- Test Your Knowledge (first quiz) - 100 XP

---

## 📋 Next Steps

### Phase 1: Database Migration ✅ (Schema Ready)
Run when ready:
```bash
npx prisma db push
# or
npx prisma migrate dev --name add_gamification_system
```

Then seed the data:
```bash
npx tsx prisma/seed-gamification.ts
```

### Phase 2: Backend Services (To Implement)
Create `src/lib/gamification/` with:

1. **`GamificationService.ts`**
   - `awardXP(userId, amount, reason, sourceId?)`
   - `updateStreak(userId)` - Called after lesson completion
   - `checkAndAwardBadges(userId)` - Checks criteria and awards badges
   - `updateQuestProgress(userId, questType, increment)`

2. **`BadgeService.ts`**
   - `getUserBadges(userId)`
   - `checkBadgeCriteria(userId, badgeKey)`
   - `awardBadge(userId, badgeKey)`

3. **`QuestService.ts`**
   - `getDailyQuests(userId)`
   - `getWeeklyQuests(userId)`
   - `updateQuestProgress(userId, questId, progress)`
   - `resetExpiredQuests()` - Cron job

4. **`LeaderboardService.ts`**
   - `getGlobalLeaderboard(limit = 10)`
   - `getCourseLeaderboard(courseId, limit = 10)`
   - `getUserRank(userId)`

### Phase 3: API Endpoints (To Implement)
- `GET /api/gamification/badges` - Get user's badges
- `GET /api/gamification/quests` - Get active quests
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/stats` - Get user stats (XP, level, streak)

### Phase 4: UI Components (To Implement)
1. **Student Dashboard:**
   - Badge showcase grid
   - Current streak display with fire emoji
   - Level progress bar
   - Daily quest widget

2. **Leaderboard Page:**
   - Top 10 students by XP
   - User's current rank
   - Filter by course/global

3. **Achievement Celebrations:**
   - Confetti animation when earning badge
   - Toast notifications for XP gains
   - Streak milestone celebrations

---

## 🔑 Key Design Decisions

1. **Streak = Lesson Completion, Not Login**
   - Follows Duolingo's proven engagement model
   - Drives meaningful learning activity
   - Leverages loss aversion psychology

2. **Separate Badge Definitions from User Badges**
   - Easier to add new badges without migration
   - Can update badge metadata (name, icon) centrally
   - Supports progressive badges with progress tracking

3. **Flexible Quest System**
   - Supports daily, weekly, monthly, and one-time quests
   - Can award both XP and badges
   - Auto-reset logic for recurring quests

4. **Leaderboard-Ready Schema**
   - Indexed `totalXP` and `currentLevel` fields
   - Can easily query top users
   - Supports both global and course-specific leaderboards

---

## 🎯 Engagement Hooks

**Daily:**
- Daily quest notifications
- Streak reminder if user hasn't completed a lesson
- XP progress toward next level

**Weekly:**
- Weekly quest summary
- Leaderboard position update
- New badges earned this week

**Milestone:**
- Badge unlock celebrations
- Level up animations
- Streak milestone achievements (7, 30, 100 days)

---

## 📊 Analytics to Track

- Daily Active Users (DAU) with lesson completion
- Average streak length
- Badge unlock rate
- Quest completion rate
- XP distribution
- Leaderboard engagement
