# Gamification Seed Guide

## ✅ Issue Resolved!

The `seed-gamification.ts` file is now working correctly. Here's what was fixed:

### Problems Encountered

1. **TypeScript Error**: `Property 'badgeDefinition' does not exist on type 'PrismaClient'`
   - **Cause**: The Prisma Client wasn't regenerated after adding new models to the schema
   - **Fix**: Ran `npx prisma generate` to regenerate the client

2. **Database Schema Mismatch**: Tables didn't exist in the database
   - **Cause**: Schema changes weren't pushed to the database
   - **Fix**: Ran `npx prisma db push --accept-data-loss` to sync the database

3. **Old Badge Table**: Conflicting `badges` table from previous schema
   - **Cause**: Schema evolution - moved from simple `Badge` model to `BadgeDefinition` + `UserBadge`
   - **Fix**: Accepted data loss to drop the old table

## 🎮 What Was Seeded

The gamification system now includes:

### Badge Definitions (12 total)

#### Achievement Badges
- **First Steps** (Common) - Complete your first lesson - 50 XP
- **Course Conqueror** (Rare) - Complete your first course - 200 XP
- **Learning Legend** (Epic) - Complete 5 courses - 500 XP
- **Master Scholar** (Legendary) - Complete 10 courses - 1000 XP

#### Streak Badges
- **Getting Started** (Common) - 3-day streak - 100 XP
- **Week Warrior** (Rare) - 7-day streak - 250 XP
- **Monthly Master** (Epic) - 30-day streak - 1000 XP
- **Century Champion** (Legendary) - 100-day streak - 5000 XP

#### Mastery Badges
- **Quiz Ace** (Rare) - Pass 10 quizzes with 100% - 300 XP
- **Speed Learner** (Rare) - Complete 5 lessons in one day - 200 XP

#### Social Badges
- **Helpful Reviewer** (Common) - Leave your first review - 50 XP
- **Review Master** (Epic) - Leave 10 helpful reviews - 500 XP

### Quest Definitions (8 total)

#### Daily Quests
- **Daily Learner** - Complete 1 lesson today - 50 XP
- **Quiz Master** - Pass 1 quiz today - 75 XP

#### Weekly Quests
- **Weekly Warrior** - Complete 5 lessons this week - 300 XP
- **Quiz Champion** - Pass 3 quizzes this week - 250 XP
- **Consistency King** - Maintain 7-day streak - 500 XP + streak_7 badge

#### Monthly Quests
- **Course Completer** - Complete 1 course this month - 1000 XP

#### One-Time Quests (Onboarding)
- **Welcome to Learnity!** - Complete your first lesson - 100 XP + first_lesson badge
- **Test Your Knowledge** - Complete your first quiz - 100 XP

## 🚀 How to Use

### Run Gamification Seed Only
```bash
npm run db:seed:gamification
```

### Workflow When Modifying Schema

1. **Edit** `prisma/schema.prisma`
2. **Generate** Prisma Client:
   ```bash
   npx prisma generate
   ```
3. **Push** to database:
   ```bash
   npx prisma db push
   ```
   Or in production:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
4. **Seed** the data:
   ```bash
   npm run db:seed:gamification
   ```

### Available Seed Scripts

- `npm run db:seed` - Main seed (users, courses, etc.)
- `npm run db:seed:gamification` - Gamification data only
- `npm run db:seed:teachers` - Teacher profiles
- `npm run db:seed:add` - Additive seed (doesn't delete existing data)
- `npm run db:seed:full` - Comprehensive seed

## 📊 Database Models

The gamification system uses these models:

- **UserProgress** - Tracks XP, level, and streaks per user
- **XPActivity** - Logs all XP-earning activities
- **BadgeDefinition** - Metadata for all available badges
- **UserBadge** - Tracks which badges users have earned
- **Quest** - Defines available quests/challenges
- **UserQuest** - Tracks user progress on quests

## 🔄 Integration with Main Seed

The main `seed.ts` file was using an old `Badge` model. If you want to integrate gamification into the main seed:

1. Remove the old badge references from `seed.ts` (lines 36, 281-283)
2. Import and call `seedGamification()` from `seed-gamification.ts`
3. Or keep them separate and run both seeds

## ⚠️ Important Notes

- Always run `npx prisma generate` after schema changes
- Use `npx prisma db push` for development
- Use `npx prisma migrate dev` for production-ready migrations
- The seed uses `upsert` so it's safe to run multiple times
- Badge keys must be unique (e.g., 'first_lesson', 'streak_7')

## 🎯 Next Steps

1. Create API endpoints to award badges based on user actions
2. Implement quest tracking and completion logic
3. Build UI components to display badges and quests
4. Add leaderboard functionality using UserProgress.totalXP
5. Implement streak calculation logic
6. Create notification system for badge/quest completion
