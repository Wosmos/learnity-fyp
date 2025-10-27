# Learnity Rapid Development - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies (Fast!)
```bash
npm install
# Should complete in under 2 minutes with minimal dependencies
```

### 2. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 3. Follow the Spec
- **Requirements**: `.kiro/specs/learnity-rapid/requirements.md`
- **Design**: `.kiro/specs/learnity-rapid/design.md`  
- **Tasks**: `.kiro/specs/learnity-rapid/tasks.md`

## 📋 7-Day Development Plan

### Day 1-2: Foundation
- ✅ Minimal Next.js setup (no heavy dependencies)
- ✅ Custom UI components (no external library)
- ✅ Simple JWT authentication (no NextAuth complexity)
- ✅ localStorage data (no database setup)

### Day 3-4: Core Features  
- 🎮 Gamification engine (XP, streaks, levels)
- 📱 Role-based dashboards
- 🎯 Action cards and navigation

### Day 5-6: Social Features
- 👥 Study groups
- 💬 Basic chat
- 📹 Video calling (iframe)

### Day 7: Mobile & Polish
- 📱 Mobile optimization
- ✨ Animations and transitions
- 🚀 Ready to deploy

## 🛠️ Tech Stack (Minimal)

```json
{
  "frontend": "Next.js 15 + TypeScript + Tailwind",
  "auth": "JWT + localStorage (simple)",
  "data": "localStorage → JSON files → Database",
  "ui": "Custom components (no external library)",
  "video": "Jitsi Meet iframe",
  "deploy": "Vercel (zero config)"
}
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Core utilities
│   ├── services/         # Business logic services
│   ├── repositories/     # Data access layer
│   ├── interfaces/       # TypeScript interfaces
│   ├── factories/        # Object factories
│   ├── validators/       # Zod schemas
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── constants/           # Application constants
```

## 🎮 Gamification System

### XP Rewards
```typescript
const XP_REWARDS = {
  DAILY_LOGIN: 5,
  LESSON_COMPLETE: 15,
  HELP_PEER: 20,
  SESSION_ATTEND: 30,
  GROUP_JOIN: 10
}
```

### Streak Multipliers
- Days 1-2: 1.0x XP
- Days 3-6: 1.2x XP  
- Days 7-13: 1.5x XP
- Days 14+: 2.0x XP

### Level Formula
```typescript
level = Math.floor(Math.sqrt(totalXP / 100)) + 1
```

## 📱 Mobile-First Features

- **Touch Targets**: Minimum 44px
- **Gestures**: Swipe, tap, long press
- **Animations**: Smooth 60fps
- **Responsive**: Works on all screen sizes

## 🎯 Success Metrics

### Day 7 MVP Goals
- [ ] Role selection working
- [ ] Student/Teacher/Admin dashboards
- [ ] XP, streaks, levels functional
- [ ] Study groups and basic chat
- [ ] Video calling integration
- [ ] Mobile responsive

### Performance Targets
- Page load: < 2 seconds
- Bundle size: < 500KB
- Mobile: 60fps animations
- Install time: < 2 minutes

## 🚀 Next Steps

1. **Run `npm install`** (should be fast now!)
2. **Start with Task 1.1** in the tasks.md file
3. **Build incrementally** following the 7-day plan
4. **Test on mobile** throughout development
5. **Deploy early** and iterate

The spec is designed for rapid development with minimal complexity. You can always add more features later, but this gets you a working MVP fast!

**Ready to code? Start with the tasks in `.kiro/specs/learnity-rapid/tasks.md`** 🚀