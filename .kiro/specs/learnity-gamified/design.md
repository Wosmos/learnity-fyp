# Learnity Gamified Platform - Technical Design Document

## Overview

Learnity is a simplified, gamified learning platform built with Next.js that focuses on creating engaging learning habits through streaks, micro-lessons, and social learning. The platform emphasizes simplicity, performance, and user engagement through game-like mechanics inspired by Duolingo, Snapchat, and GitHub.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js 14 App<br/>Vercel]
        B[Mobile PWA]
    end
    
    subgraph "Data Layer"
        C[PostgreSQL<br/>Neon DB]
        D[Firebase Firestore<br/>Real-time Features]
        E[Firebase Storage<br/>Media Files]
    end
    
    subgraph "External Services"
        F[Jitsi Meet<br/>Video Calls]
        G[Resend<br/>Email Service]
        H[Sentry<br/>Error Monitoring]
    end
    
    subgraph "Authentication"
        I[NextAuth.js<br/>Google OAuth]
    end
    
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    B --> A
```

### Technology Stack Rationale

**Frontend (Next.js 14)**
- App Router for modern routing and layouts
- Server-side rendering for SEO and performance
- Built-in API routes eliminating need for separate backend
- Excellent TypeScript support and developer experience
- Perfect for gamification with React's component model

**Database Strategy**
- **PostgreSQL (Neon)**: User data, streaks, XP, lessons, sessions
- **Firebase Firestore**: Real-time chat, live activities, notifications
- **Firebase Storage**: Profile pictures, lesson media, documents

**Gamification Focus**
- Custom React components for streak visualizations
- Zustand for lightweight state management
- Framer Motion for engaging animations
- Chart.js for progress visualizations

## Core Gamification System

### Streak System Design

```typescript
interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakType: 'learning' | 'tutoring' | 'social';
  milestones: StreakMilestone[];
}

interface StreakMilestone {
  days: number;
  badgeId: string;
  xpReward: number;
  unlockedAt?: Date;
}
```

### XP and Leveling System

```typescript
interface UserProgress {
  id: string;
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  badges: Badge[];
  achievements: Achievement[];
}

interface XPActivity {
  type: 'lesson_complete' | 'daily_challenge' | 'session_attend' | 'help_peer';
  baseXP: number;
  multiplier: number; // Based on streak, difficulty, etc.
}
```

## Component Architecture

### Frontend Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── role-selection/
│   ├── (student)/         # Student dashboard routes
│   │   ├── dashboard/
│   │   ├── book-tutor/
│   │   ├── study-groups/
│   │   └── content/
│   ├── (teacher)/         # Teacher dashboard routes
│   │   ├── dashboard/
│   │   ├── pricing/
│   │   ├── videos/
│   │   └── sessions/
│   ├── (admin)/           # Admin dashboard routes
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── users/
│   │   └── analytics/
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui base components
│   ├── gamification/     # Streak, XP, badge components
│   │   ├── StreakCounter.tsx
│   │   ├── XPProgressBar.tsx
│   │   ├── BadgeCollection.tsx
│   │   └── LevelIndicator.tsx
│   ├── lessons/          # Lesson components
│   │   ├── LessonCard.tsx
│   │   ├── QuestionTypes/
│   │   └── ProgressTracker.tsx
│   ├── social/           # Social learning components
│   └── admin/            # Admin components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── firebase.ts       # Firebase configuration
│   ├── prisma.ts         # Database client
│   ├── gamification.ts   # XP and streak logic
│   └── validations.ts    # Zod schemas
└── stores/               # Zustand stores
    ├── auth.ts
    ├── gamification.ts
    ├── lessons.ts
    └── social.ts
```

### Role-Based Dashboard Components

**Role Selection Component**
```typescript
interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'teacher' | 'admin') => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      <RoleCard
        role="student"
        title="Student"
        description="Learn with tutors and join study groups"
        icon={<GraduationCap />}
        onClick={() => onRoleSelect('student')}
      />
      <RoleCard
        role="teacher"
        title="Teacher"
        description="Apply to teach and share knowledge"
        icon={<BookOpen />}
        onClick={() => onRoleSelect('teacher')}
      />
      <RoleCard
        role="admin"
        title="Admin"
        description="Manage platform and users"
        icon={<Shield />}
        onClick={() => onRoleSelect('admin')}
      />
    </div>
  );
}
```

**Student Dashboard Component**
```typescript
interface StudentDashboardProps {
  user: User;
  progress: UserProgress;
}

export function StudentDashboard({ user, progress }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      <WelcomeHeader user={user} progress={progress} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          title="Book Tutor"
          description="Find and book sessions with verified tutors"
          icon={<UserCheck />}
          href="/student/book-tutor"
        />
        <ActionCard
          title="Join Study Group"
          description="Connect with peers in study groups"
          icon={<Users />}
          href="/student/study-groups"
        />
        <ActionCard
          title="Watch Content"
          description="Access video lessons and materials"
          icon={<Play />}
          href="/student/content"
        />
      </div>
      <ProgressSection progress={progress} />
    </div>
  );
}
```

**Teacher Dashboard Component**
```typescript
interface TeacherDashboardProps {
  teacher: Teacher;
  earnings: TeacherEarnings;
}

export function TeacherDashboard({ teacher, earnings }: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      <TeacherHeader teacher={teacher} earnings={earnings} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          title="Set Pricing"
          description="Configure your hourly rates and pricing"
          icon={<DollarSign />}
          href="/teacher/pricing"
        />
        <ActionCard
          title="Upload Videos"
          description="Create and upload educational content"
          icon={<Upload />}
          href="/teacher/videos"
        />
        <ActionCard
          title="Conduct Sessions"
          description="Manage and conduct tutoring sessions"
          icon={<Video />}
          href="/teacher/sessions"
        />
      </div>
      <SessionSchedule sessions={teacher.upcomingSessions} />
    </div>
  );
}
```

**Admin Dashboard Component**
```typescript
interface AdminDashboardProps {
  stats: PlatformStats;
  pendingApplications: number;
}

export function AdminDashboard({ stats, pendingApplications }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <AdminHeader stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          title="Review Applications"
          description={`${pendingApplications} pending teacher applications`}
          icon={<FileCheck />}
          href="/admin/applications"
          badge={pendingApplications > 0 ? pendingApplications : undefined}
        />
        <ActionCard
          title="Manage Users"
          description="View and manage all platform users"
          icon={<Users />}
          href="/admin/users"
        />
        <ActionCard
          title="View Analytics"
          description="Platform insights and performance metrics"
          icon={<BarChart />}
          href="/admin/analytics"
        />
      </div>
      <PlatformMetrics stats={stats} />
    </div>
  );
}
```

### Key Gamification Components

**Streak Counter Component**
```typescript
interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  animated?: boolean;
}

export function StreakCounter({ currentStreak, longestStreak, animated = true }: StreakCounterProps) {
  return (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={animated ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      >
        <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
        <span className="text-2xl font-bold text-orange-500">{currentStreak}</span>
      </motion.div>
      <div className="text-sm text-gray-600">
        <div>Current Streak</div>
        <div>Best: {longestStreak} days</div>
      </div>
    </div>
  );
}
```

**XP Progress Bar Component**
```typescript
interface XPProgressBarProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  animated?: boolean;
}

export function XPProgressBar({ currentXP, xpToNextLevel, level, animated = true }: XPProgressBarProps) {
  const progress = (currentXP / (currentXP + xpToNextLevel)) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-600">Level {level}</span>
        <span className="text-sm text-gray-600">{currentXP} / {currentXP + xpToNextLevel} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: animated ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
```

## Database Schema Design

### Core Tables

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  profile_image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Teacher Applications Table**
```sql
CREATE TABLE teacher_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  qualifications TEXT NOT NULL,
  experience TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  documents JSONB, -- Array of document URLs
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_feedback TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Teacher Profiles Table**
```sql
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subjects TEXT[] NOT NULL,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**User Progress Table**
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Lessons Table**
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER DEFAULT 10, -- minutes
  xp_reward INTEGER DEFAULT 10,
  content JSONB NOT NULL, -- Lesson content and questions
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**User Activities Table**
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  metadata JSONB, -- Additional activity data
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Badges Table**
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL, -- Badge earning criteria
  xp_reward INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);
```

**User Badges Table**
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

## Gamification Logic

### Streak Management System

```typescript
export class StreakManager {
  static async updateUserStreak(userId: string, activityType: string): Promise<UserProgress> {
    const today = new Date().toDateString();
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!userProgress) {
      throw new Error('User progress not found');
    }

    const lastActivityDate = userProgress.lastActivityDate?.toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let newStreak = userProgress.currentStreak;

    if (lastActivityDate === today) {
      // Already active today, no streak change
      return userProgress;
    } else if (lastActivityDate === yesterday) {
      // Continuing streak
      newStreak += 1;
    } else {
      // Streak broken or starting new
      newStreak = 1;
    }

    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userProgress.longestStreak),
        lastActivityDate: new Date()
      }
    });

    // Check for streak milestones
    await this.checkStreakMilestones(userId, newStreak);

    return updatedProgress;
  }

  static async checkStreakMilestones(userId: string, streak: number): Promise<void> {
    const milestones = [7, 14, 30, 50, 100, 365];
    const milestone = milestones.find(m => m === streak);

    if (milestone) {
      await this.awardStreakBadge(userId, milestone);
    }
  }

  private static async awardStreakBadge(userId: string, days: number): Promise<void> {
    const badge = await prisma.badge.findFirst({
      where: { name: `${days} Day Streak` }
    });

    if (badge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      });

      // Award bonus XP
      await XPManager.awardXP(userId, 'streak_milestone', badge.xpReward);
    }
  }
}
```

### XP Management System

```typescript
export class XPManager {
  static readonly XP_VALUES = {
    lesson_complete: 10,
    daily_challenge: 15,
    session_attend: 25,
    help_peer: 5,
    streak_milestone: 50
  };

  static async awardXP(
    userId: string, 
    activityType: keyof typeof XPManager.XP_VALUES, 
    bonusXP: number = 0
  ): Promise<UserProgress> {
    const baseXP = this.XP_VALUES[activityType];
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!userProgress) {
      throw new Error('User progress not found');
    }

    // Calculate multipliers
    const streakMultiplier = this.getStreakMultiplier(userProgress.currentStreak);
    const totalXP = Math.floor((baseXP + bonusXP) * streakMultiplier);

    const newTotalXP = userProgress.totalXP + totalXP;
    const newLevel = this.calculateLevel(newTotalXP);

    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXP: newTotalXP,
        currentLevel: newLevel
      }
    });

    // Record activity
    await prisma.userActivity.create({
      data: {
        userId,
        activityType,
        xpEarned: totalXP,
        metadata: {
          baseXP,
          bonusXP,
          streakMultiplier,
          streak: userProgress.currentStreak
        }
      }
    });

    // Check for level up
    if (newLevel > userProgress.currentLevel) {
      await this.handleLevelUp(userId, newLevel);
    }

    return updatedProgress;
  }

  private static getStreakMultiplier(streak: number): number {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.25;
    return 1.0;
  }

  private static calculateLevel(totalXP: number): number {
    // Level formula: level = floor(sqrt(totalXP / 100)) + 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  private static async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    // Award level up badge if exists
    const levelBadge = await prisma.badge.findFirst({
      where: { name: `Level ${newLevel}` }
    });

    if (levelBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: levelBadge.id
        }
      });
    }

    // Send celebration notification
    // Implementation depends on notification system
  }
}
```

## Lesson System Design

### Interactive Lesson Structure

```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number; // minutes
  xpReward: number;
  content: LessonContent;
  isPublished: boolean;
}

interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
}

interface LessonSection {
  type: 'explanation' | 'question' | 'practice';
  content: string;
  question?: Question;
}

interface Question {
  type: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  xpReward: number;
}
```

### Lesson Progress Tracking

```typescript
interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentSection: number;
  score: number;
  timeSpent: number; // seconds
  completedAt?: Date;
  attempts: number;
}
```

## Real-time Features with Firebase

### Chat System for Study Groups

```typescript
interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: FirebaseFirestore.Timestamp;
  type: 'text' | 'system' | 'achievement';
  metadata?: {
    xpEarned?: number;
    badgeEarned?: string;
    streakUpdate?: number;
  };
}
```

### Live Activity Feed

```typescript
interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  activityType: string;
  description: string;
  xpEarned: number;
  timestamp: FirebaseFirestore.Timestamp;
  isPublic: boolean;
}
```

## Admin Dashboard Design

### Admin Control Panel Features

```typescript
interface AdminDashboard {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    averageStreak: number;
  };
  contentStats: {
    totalLessons: number;
    publishedLessons: number;
    pendingReviews: number;
  };
  tutorStats: {
    totalTutors: number;
    verifiedTutors: number;
    pendingApplications: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number[];
    lessonCompletions: number[];
    streakDistribution: { [key: number]: number };
  };
}
```

## Performance Optimizations

### Caching Strategy

```typescript
// Redis-like caching with Vercel KV (future enhancement)
export class CacheManager {
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    const cacheKey = `user_progress:${userId}`;
    
    // Try cache first
    const cached = await kv.get(cacheKey);
    if (cached) {
      return cached as UserProgress;
    }

    // Fetch from database
    const progress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (progress) {
      // Cache for 5 minutes
      await kv.setex(cacheKey, 300, progress);
    }

    return progress;
  }
}
```

### Image Optimization

```typescript
// Next.js Image component with optimization
export function OptimizedAvatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src || '/default-avatar.png'}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

## Security Implementation

### Authentication & Authorization

```typescript
// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

## Deployment & Monitoring

### Environment Configuration

```bash
# .env.local
NEXTAUTH_URL=https://learnity.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

DATABASE_URL=postgresql://user:pass@host:5432/learnity
DIRECT_URL=postgresql://user:pass@host:5432/learnity

NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key

RESEND_API_KEY=your-resend-key
SENTRY_DSN=your-sentry-dsn
```

### Monitoring Setup

```typescript
// Sentry configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

This design provides a comprehensive foundation for the gamified Learnity platform, focusing on simplicity, engagement, and scalability while using only free tools and services.