import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGamification() {
  console.log('🎮 Seeding Gamification System...');

  // 1. Seed Badge Definitions
  console.log('📛 Creating Badge Definitions...');
  
  const badgeDefinitions = [
    // Achievement Badges
    {
      key: 'first_lesson',
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      category: 'ACHIEVEMENT',
      xpReward: 50,
      rarity: 'COMMON',
      criteria: { type: 'lesson_count', value: 1 },
    },
    {
      key: 'first_course',
      name: 'Course Conqueror',
      description: 'Complete your first course',
      icon: '🏆',
      category: 'ACHIEVEMENT',
      xpReward: 200,
      rarity: 'RARE',
      criteria: { type: 'course_count', value: 1 },
    },
    {
      key: 'five_courses',
      name: 'Learning Legend',
      description: 'Complete 5 courses',
      icon: '⭐',
      category: 'ACHIEVEMENT',
      xpReward: 500,
      rarity: 'EPIC',
      criteria: { type: 'course_count', value: 5 },
    },
    {
      key: 'ten_courses',
      name: 'Master Scholar',
      description: 'Complete 10 courses',
      icon: '👑',
      category: 'ACHIEVEMENT',
      xpReward: 1000,
      rarity: 'LEGENDARY',
      criteria: { type: 'course_count', value: 10 },
    },

    // Streak Badges
    {
      key: 'streak_3',
      name: 'Getting Started',
      description: 'Complete lessons for 3 days in a row',
      icon: '🔥',
      category: 'STREAK',
      xpReward: 100,
      rarity: 'COMMON',
      criteria: { type: 'streak', value: 3 },
    },
    {
      key: 'streak_7',
      name: 'Week Warrior',
      description: 'Complete lessons for 7 days in a row',
      icon: '🔥🔥',
      category: 'STREAK',
      xpReward: 250,
      rarity: 'RARE',
      criteria: { type: 'streak', value: 7 },
    },
    {
      key: 'streak_30',
      name: 'Monthly Master',
      description: 'Complete lessons for 30 days in a row',
      icon: '🔥🔥🔥',
      category: 'STREAK',
      xpReward: 1000,
      rarity: 'EPIC',
      criteria: { type: 'streak', value: 30 },
    },
    {
      key: 'streak_100',
      name: 'Century Champion',
      description: 'Complete lessons for 100 days in a row',
      icon: '💎',
      category: 'STREAK',
      xpReward: 5000,
      rarity: 'LEGENDARY',
      criteria: { type: 'streak', value: 100 },
    },

    // Mastery Badges
    {
      key: 'quiz_ace',
      name: 'Quiz Ace',
      description: 'Pass 10 quizzes with 100% score',
      icon: '🎓',
      category: 'MASTERY',
      xpReward: 300,
      rarity: 'RARE',
      criteria: { type: 'perfect_quizzes', value: 10 },
    },
    {
      key: 'speed_learner',
      name: 'Speed Learner',
      description: 'Complete 5 lessons in one day',
      icon: '⚡',
      category: 'MASTERY',
      xpReward: 200,
      rarity: 'RARE',
      criteria: { type: 'lessons_per_day', value: 5 },
    },

    // Social Badges
    {
      key: 'first_review',
      name: 'Helpful Reviewer',
      description: 'Leave your first course review',
      icon: '💬',
      category: 'SOCIAL',
      xpReward: 50,
      rarity: 'COMMON',
      criteria: { type: 'review_count', value: 1 },
    },
    {
      key: 'top_reviewer',
      name: 'Review Master',
      description: 'Leave 10 helpful course reviews',
      icon: '⭐⭐⭐',
      category: 'SOCIAL',
      xpReward: 500,
      rarity: 'EPIC',
      criteria: { type: 'review_count', value: 10 },
    },
  ];

  for (const badge of badgeDefinitions) {
    await prisma.badgeDefinition.upsert({
      where: { key: badge.key },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Created ${badgeDefinitions.length} badge definitions`);

  // 2. Seed Quest Definitions
  console.log('🎯 Creating Quest Definitions...');

  const questDefinitions = [
    // Daily Quests
    {
      key: 'daily_lesson',
      title: 'Daily Learner',
      description: 'Complete 1 lesson today',
      type: 'LESSON_COMPLETION',
      frequency: 'DAILY',
      targetValue: 1,
      xpReward: 50,
    },
    {
      key: 'daily_quiz',
      title: 'Quiz Master',
      description: 'Pass 1 quiz today',
      type: 'QUIZ_COMPLETION',
      frequency: 'DAILY',
      targetValue: 1,
      xpReward: 75,
    },

    // Weekly Quests
    {
      key: 'weekly_5_lessons',
      title: 'Weekly Warrior',
      description: 'Complete 5 lessons this week',
      type: 'LESSON_COMPLETION',
      frequency: 'WEEKLY',
      targetValue: 5,
      xpReward: 300,
    },
    {
      key: 'weekly_3_quizzes',
      title: 'Quiz Champion',
      description: 'Pass 3 quizzes this week',
      type: 'QUIZ_COMPLETION',
      frequency: 'WEEKLY',
      targetValue: 3,
      xpReward: 250,
    },
    {
      key: 'weekly_streak',
      title: 'Consistency King',
      description: 'Maintain a 7-day learning streak',
      type: 'LOGIN_STREAK',
      frequency: 'WEEKLY',
      targetValue: 7,
      xpReward: 500,
      badgeReward: 'streak_7',
    },

    // Monthly Quests
    {
      key: 'monthly_course',
      title: 'Course Completer',
      description: 'Complete 1 full course this month',
      type: 'COURSE_ENROLLMENT',
      frequency: 'MONTHLY',
      targetValue: 1,
      xpReward: 1000,
    },

    // One-time Quests (Onboarding)
    {
      key: 'onboarding_first_lesson',
      title: 'Welcome to Learnity!',
      description: 'Complete your first lesson',
      type: 'LESSON_COMPLETION',
      frequency: 'ONE_TIME',
      targetValue: 1,
      xpReward: 100,
      badgeReward: 'first_lesson',
    },
    {
      key: 'onboarding_first_quiz',
      title: 'Test Your Knowledge',
      description: 'Complete your first quiz',
      type: 'QUIZ_COMPLETION',
      frequency: 'ONE_TIME',
      targetValue: 1,
      xpReward: 100,
    },
  ];

  for (const quest of questDefinitions) {
    await prisma.quest.upsert({
      where: { key: quest.key },
      update: quest,
      create: quest,
    });
  }

  console.log(`✅ Created ${questDefinitions.length} quest definitions`);

  console.log('🎮 Gamification seeding complete!');
}

async function main() {
  try {
    await seedGamification();
    console.log('✅ Gamification seeding completed successfully!');
  } catch (error) {
    console.error('❌ Gamification seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
