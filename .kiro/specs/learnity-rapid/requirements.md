# Learnity Platform - Rapid Development Requirements

## 🎯 Project Overview

**Timeline**: 7-14 days  
**Approach**: Minimal viable product with core gamification  
**Tech Stack**: Next.js + TypeScript + Tailwind + Minimal dependencies  

## 📋 Core Requirements

### Requirement 1: Minimal Authentication System

**User Story:** As a user, I want to quickly sign up and select my role so I can start using the platform immediately.

#### Acceptance Criteria

1. WHEN users visit the platform THEN the Learnity_Platform SHALL provide role selection (Student/Teacher/Admin)
2. WHEN users select Student THEN the Learnity_Platform SHALL allow instant signup with email/password
3. WHEN users select Teacher THEN the Learnity_Platform SHALL show application form with basic info
4. WHEN users select Admin THEN the Learnity_Platform SHALL provide secure admin login
5. WHEN users complete signup THEN the Learnity_Platform SHALL redirect to appropriate dashboard

### Requirement 2: Core Gamification Engine

**User Story:** As a student, I want to earn XP and maintain streaks so I feel motivated to learn daily.

#### Acceptance Criteria

1. WHEN students complete activities THEN the Learnity_Platform SHALL award XP points with visual feedback
2. WHEN students login daily THEN the Learnity_Platform SHALL maintain learning streaks with fire emoji
3. WHEN students reach milestones THEN the Learnity_Platform SHALL award badges and level up
4. WHEN students view dashboard THEN the Learnity_Platform SHALL show XP bar, level, and current streak
5. WHEN students earn achievements THEN the Learnity_Platform SHALL show celebration animations

### Requirement 3: Student Dashboard

**User Story:** As a student, I want a gamified dashboard to access learning features and track my progress.

#### Acceptance Criteria

1. WHEN students login THEN the Learnity_Platform SHALL show dashboard with gamification stats
2. WHEN students view dashboard THEN the Learnity_Platform SHALL provide "Book Tutor" action card
3. WHEN students view dashboard THEN the Learnity_Platform SHALL provide "Join Study Group" action card
4. WHEN students view dashboard THEN the Learnity_Platform SHALL provide "Watch Content" action card
5. WHEN students complete actions THEN the Learnity_Platform SHALL update XP and streaks immediately

### Requirement 4: Teacher Dashboard

**User Story:** As a teacher, I want to manage my teaching activities and track my earnings.

#### Acceptance Criteria

1. WHEN teachers login THEN the Learnity_Platform SHALL show teacher dashboard with earnings
2. WHEN teachers access dashboard THEN the Learnity_Platform SHALL provide "Set Pricing" feature
3. WHEN teachers access dashboard THEN the Learnity_Platform SHALL provide "Upload Videos" feature
4. WHEN teachers access dashboard THEN the Learnity_Platform SHALL provide "Conduct Sessions" feature
5. WHEN teachers complete sessions THEN the Learnity_Platform SHALL update earnings automatically

### Requirement 5: Admin Panel

**User Story:** As an admin, I want to manage users and approve teachers efficiently.

#### Acceptance Criteria

1. WHEN admins login THEN the Learnity_Platform SHALL show admin dashboard with pending applications
2. WHEN admins view applications THEN the Learnity_Platform SHALL show teacher details and documents
3. WHEN admins approve teachers THEN the Learnity_Platform SHALL update teacher status to approved
4. WHEN admins reject teachers THEN the Learnity_Platform SHALL provide feedback option
5. WHEN admins manage users THEN the Learnity_Platform SHALL show user list with search and filters

### Requirement 6: Basic Study Groups

**User Story:** As a student, I want to create and join study groups for collaborative learning.

#### Acceptance Criteria

1. WHEN students create groups THEN the Learnity_Platform SHALL allow group name, subject, and description
2. WHEN students join groups THEN the Learnity_Platform SHALL add them to group member list
3. WHEN students participate in groups THEN the Learnity_Platform SHALL award social XP
4. WHEN students help peers THEN the Learnity_Platform SHALL award collaboration badges
5. WHEN students view groups THEN the Learnity_Platform SHALL show member count and activity

### Requirement 7: Simple Video Integration

**User Story:** As users, I want basic video calling for tutoring sessions.

#### Acceptance Criteria

1. WHEN students book sessions THEN the Learnity_Platform SHALL schedule video calls
2. WHEN session time arrives THEN the Learnity_Platform SHALL provide "Join Call" button
3. WHEN users join calls THEN the Learnity_Platform SHALL open video interface
4. WHEN sessions end THEN the Learnity_Platform SHALL allow rating and feedback
5. WHEN sessions complete THEN the Learnity_Platform SHALL award session XP

### Requirement 8: Mobile-First Design

**User Story:** As a mobile user, I want the platform to work perfectly on my phone.

#### Acceptance Criteria

1. WHEN users access on mobile THEN the Learnity_Platform SHALL provide responsive design
2. WHEN mobile users interact THEN the Learnity_Platform SHALL show touch-friendly buttons (44px min)
3. WHEN mobile users earn XP THEN the Learnity_Platform SHALL show satisfying animations
4. WHEN mobile users maintain streaks THEN the Learnity_Platform SHALL show large streak counter
5. WHEN mobile users navigate THEN the Learnity_Platform SHALL provide swipe-friendly interface

## 🛠️ Technical Constraints

### Minimal Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (no external UI library)
- **Database**: JSON files or localStorage (no external database initially)
- **State**: React useState/useContext (no Zustand initially)
- **Auth**: Simple JWT with localStorage (no NextAuth initially)
- **Video**: Embedded iframe solution (no complex integration)

### Performance Requirements
- **Page Load**: Under 2 seconds on 3G
- **Bundle Size**: Under 500KB initial load
- **Mobile**: 60fps animations on mid-range devices
- **Offline**: Basic offline functionality with service worker

### Development Constraints
- **Dependencies**: Maximum 10 npm packages
- **Build Time**: Under 30 seconds
- **Install Time**: Under 2 minutes
- **File Count**: Under 50 source files

## 🎮 Gamification Rules

### XP System
```typescript
const XP_REWARDS = {
  DAILY_LOGIN: 5,
  LESSON_COMPLETE: 15,
  HELP_PEER: 20,
  SESSION_ATTEND: 30,
  GROUP_JOIN: 10
}
```

### Streak System
- Daily activity maintains streak
- Streak multiplier: 1.0x (1-2 days), 1.2x (3-6 days), 1.5x (7+ days)
- Visual: Fire emoji + number + progress dots

### Level System
- Level = Math.floor(Math.sqrt(totalXP / 100)) + 1
- Level up celebration with animation
- Each level unlocks new features

## 📱 Mobile-First Features

### Touch Interactions
- Tap to earn XP (with haptic feedback)
- Swipe between dashboard cards
- Pull to refresh progress
- Long press for quick actions

### Visual Feedback
- Smooth animations (CSS transforms)
- Color-coded progress (green XP, orange streaks, purple levels)
- Emoji-based achievements (🔥 streaks, ⭐ levels, 🏆 badges)
- Progress bars with gradient fills

## 🚀 MVP Scope (7 Days)

### Day 1-2: Foundation
- [ ] Next.js setup with TypeScript
- [ ] Tailwind CSS configuration
- [ ] Basic routing structure
- [ ] Simple authentication (localStorage)

### Day 3-4: Core Features
- [ ] Role selection interface
- [ ] Student/Teacher/Admin dashboards
- [ ] Basic gamification (XP, streaks, levels)
- [ ] Local data storage

### Day 5-6: Interactions
- [ ] Study group creation/joining
- [ ] Basic video call integration
- [ ] Mobile responsive design
- [ ] Touch interactions

### Day 7: Polish
- [ ] Animations and transitions
- [ ] Error handling
- [ ] Performance optimization
- [ ] Basic testing

## 🔄 Extended Scope (Days 8-14)

### Days 8-10: Enhanced Features
- [ ] Real database integration
- [ ] Advanced gamification
- [ ] File upload system
- [ ] Push notifications

### Days 11-13: Social Features
- [ ] Real-time chat
- [ ] Advanced study groups
- [ ] Peer rating system
- [ ] Achievement sharing

### Day 14: Production Ready
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Deployment setup
- [ ] Documentation

This requirements document focuses on rapid development with minimal dependencies while maintaining the core gamification and learning features.