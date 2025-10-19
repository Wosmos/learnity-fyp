# Learnity - Gamified Learning Platform

## 🎯 Quick Overview
Simplified gamified learning platform for Pakistani students and tutors. Think Duolingo meets tutoring marketplace.

## 🚀 Tech Stack (Free Tools)
- **Frontend**: Next.js 14 + Tailwind + shadcn/ui
- **Database**: PostgreSQL (Neon) + Prisma
- **Auth**: NextAuth.js + Google OAuth
- **Real-time**: Firebase Firestore
- **Video**: Jitsi Meet
- **Deploy**: Vercel

## 📋 Core Features
1. **Role-based auth** (Student/Teacher/Admin)
2. **Gamification** (XP, streaks, badges)
3. **Student dashboard** (book tutors, join groups, watch content)
4. **Teacher dashboard** (set pricing, upload videos, conduct sessions)
5. **Admin panel** (approve teachers, manage users)
6. **Study groups** with real-time chat
7. **Video calling** for tutoring sessions

## 🏗️ Development Phases (7-14 days)

### Phase 1: Core Setup (Days 1-3)
- Database schema + Prisma setup
- Authentication system (NextAuth.js)
- Basic UI components (shadcn/ui)
- Role-based routing

### Phase 2: User Dashboards (Days 4-7)
- Student dashboard with gamification
- Teacher dashboard with content management
- Admin panel for user management
- Basic CRUD operations

### Phase 3: Advanced Features (Days 8-11)
- Study groups with Firebase chat
- Video calling integration (Jitsi)
- File uploads (Firebase Storage)
- Real-time notifications

### Phase 4: Polish & Deploy (Days 12-14)
- UI/UX improvements
- Performance optimization
- Testing & bug fixes
- Production deployment

## 📁 Project Structure
```
src/
├── app/
│   ├── (auth)/          # Login, register, role selection
│   ├── (student)/       # Student dashboard & features
│   ├── (teacher)/       # Teacher dashboard & features
│   ├── (admin)/         # Admin panel
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Auth components
│   ├── gamification/    # XP, streaks, badges
│   └── shared/          # Reusable components
├── lib/
│   ├── prisma.ts        # Database client
│   ├── auth.ts          # NextAuth config
│   └── utils.ts         # Utility functions
└── types/               # TypeScript types
```

## 🎮 Gamification System
- **XP Points**: Earn for activities (lessons, helping peers, sessions)
- **Streaks**: Daily learning streaks with fire emoji indicators
- **Levels**: Progress through levels based on total XP
- **Badges**: Milestone achievements (7-day streak, first session, etc.)

## 🔗 Key User Flows
1. **Student**: Register → Dashboard → Book tutor/Join group → Earn XP
2. **Teacher**: Apply → Admin approval → Dashboard → Set pricing → Conduct sessions
3. **Admin**: Login → Review applications → Manage users → View analytics

Ready to start coding! 🚀