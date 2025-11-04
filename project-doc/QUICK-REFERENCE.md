# Learnity - Quick Development Reference

## 🎯 7-14 Day Sprint Plan

### **Day 1-3: Foundation**
- [ ] Database schema design
- [ ] Prisma setup + migrations
- [ ] NextAuth.js configuration
- [ ] Basic UI components (shadcn/ui)
- [ ] Role-based routing structure

### **Day 4-7: Core Features**
- [ ] Student dashboard with gamification
- [ ] Teacher dashboard with content upload
- [ ] Admin panel for user management
- [ ] Basic CRUD operations
- [ ] XP/streak system implementation

### **Day 8-11: Advanced Features**
- [ ] Study groups with Firebase chat
- [ ] Jitsi Meet video integration
- [ ] File upload system
- [ ] Real-time notifications
- [ ] Teacher application workflow

### **Day 12-14: Polish & Deploy**
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Bug fixes and testing
- [ ] Production deployment
- [ ] Final documentation

## 🗄️ Database Schema (Core Tables)

```sql
-- Users
users (id, email, name, role, profile_image, created_at)

-- User Progress (Gamification)
user_progress (user_id, total_xp, current_level, current_streak, last_activity)

-- Teacher Applications
teacher_applications (user_id, qualifications, documents, status, reviewed_at)

-- Study Groups
study_groups (id, name, subject, creator_id, member_count, created_at)

-- Sessions (Tutoring)
sessions (id, student_id, teacher_id, scheduled_at, status, price)

-- Activities (XP Tracking)
activities (user_id, type, xp_earned, created_at)
```

## 🎮 Gamification Rules

### **XP System**
- Complete lesson: 10 XP
- Help peer: 15 XP
- Attend session: 25 XP
- Daily login: 5 XP
- Streak bonus: +50% XP

### **Streak System**
- Track daily activity
- Reset if missed day
- Milestones: 7, 14, 30, 100 days
- Visual: Fire emoji + counter

### **Level Calculation**
```javascript
// Level = floor(sqrt(totalXP / 100))
const level = Math.floor(Math.sqrt(totalXP / 100));
const nextLevelXP = Math.pow(level + 1, 2) * 100;
```

## 🔗 API Endpoints (Essential)

```typescript
// Auth
POST /api/auth/register
POST /api/auth/login

// Users
GET /api/users/profile
PUT /api/users/profile
POST /api/users/upload-avatar

// Gamification
GET /api/gamification/progress
POST /api/gamification/award-xp
PUT /api/gamification/update-streak

// Teachers
POST /api/teachers/apply
GET /api/teachers/applications
PUT /api/teachers/approve/:id

// Study Groups
GET /api/study-groups
POST /api/study-groups
POST /api/study-groups/:id/join

// Sessions
GET /api/sessions
POST /api/sessions/book
PUT /api/sessions/:id/complete
```

## 🎨 UI Components (Priority)

### **High Priority**
- [ ] AuthForm (login/register)
- [ ] Dashboard (student/teacher/admin)
- [ ] XPBar (progress visualization)
- [ ] StreakCounter (fire emoji + days)
- [ ] BadgeDisplay (achievement showcase)
- [ ] UserCard (profile display)

### **Medium Priority**
- [ ] StudyGroupCard (group info)
- [ ] SessionCard (booking/history)
- [ ] TeacherCard (tutor profiles)
- [ ] ChatMessage (group chat)
- [ ] VideoCall (Jitsi wrapper)

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# File Upload
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
```

## 🚀 Deployment Checklist

### **Pre-Deploy**
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Build passes locally
- [ ] Basic testing done

### **Deploy**
- [ ] Push to GitHub
- [ ] Connect Vercel
- [ ] Set production env vars
- [ ] Run production build
- [ ] Test live site

## 📱 Mobile-First Approach
- Use Tailwind responsive classes
- Touch-friendly buttons (min 44px)
- Swipe gestures for navigation
- Optimized for portrait mode
- Fast loading on mobile networks

## 🎯 MVP Features (Must Have)
1. User registration with role selection
2. Student dashboard with XP/streaks
3. Teacher application system
4. Admin approval workflow
5. Basic study groups
6. Simple video calling
7. File upload for teacher docs

## 🔄 Nice-to-Have (If Time Permits)
- Advanced gamification (badges, leaderboards)
- Real-time chat in study groups
- Calendar integration for sessions
- Push notifications
- Advanced analytics
- Mobile PWA features

Focus on MVP first, then add nice-to-haves if time allows!