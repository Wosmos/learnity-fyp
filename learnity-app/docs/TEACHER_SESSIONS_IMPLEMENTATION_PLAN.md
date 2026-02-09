# Teacher Sessions & Communication Hub - Implementation Plan

## 📋 Overview
Expand teacher communication capabilities beyond course-bound chats to include:
- Independent group chats with enrolled students
- One-on-one messaging
- Instant video calls from any chat
- Scheduled video sessions (one-time and recurring)
- Push notifications for all communication events

## 🗄️ Database Schema Changes

### 1. New Models Needed

```prisma
// Teacher-created group chats (independent of courses)
model TeacherGroupChat {
  id          String   @id @default(cuid())
  teacherId   String
  name        String
  description String?
  streamChannelId String @unique // GetStream channel ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  teacher User @relation("TeacherGroupChats", fields: [teacherId], references: [id], onDelete: Cascade)
  members TeacherGroupChatMember[]
  
  @@index([teacherId])
  @@map("teacher_group_chats")
}

model TeacherGroupChatMember {
  id        String   @id @default(cuid())
  chatId    String
  studentId String
  addedAt   DateTime @default(now())
  
  chat    TeacherGroupChat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  student User @relation("GroupChatMemberships", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([chatId, studentId])
  @@index([studentId])
  @@map("teacher_group_chat_members")
}

// Scheduled video sessions
model VideoSession {
  id          String   @id @default(cuid())
  teacherId   String
  title       String
  description String?
  sessionType SessionType // CLASS, ONE_ON_ONE, GROUP_MEETING
  
  // Scheduling
  scheduledAt DateTime
  duration    Int // minutes
  isRecurring Boolean @default(false)
  recurrence  RecurrenceType? // DAILY, WEEKLY
  
  // 100ms integration
  hmsRoomId   String?
  hmsRoomName String?
  
  // GetStream chat for session
  streamChannelId String? @unique
  
  // Status
  status      SessionStatus @default(SCHEDULED)
  startedAt   DateTime?
  endedAt     DateTime?
  cancelledAt DateTime?
  cancellationReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  teacher      User @relation("TeacherSessions", fields: [teacherId], references: [id], onDelete: Cascade)
  participants VideoSessionParticipant[]
  notifications SessionNotification[]
  
  @@index([teacherId])
  @@index([scheduledAt])
  @@index([status])
  @@map("video_sessions")
}

model VideoSessionParticipant {
  id        String   @id @default(cuid())
  sessionId String
  studentId String
  
  // Attendance tracking
  joinedAt  DateTime?
  leftAt    DateTime?
  attended  Boolean @default(false)
  
  session VideoSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student User @relation("SessionParticipations", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([sessionId, studentId])
  @@index([studentId])
  @@map("video_session_participants")
}

// Push notifications tracking
model SessionNotification {
  id         String   @id @default(cuid())
  sessionId  String?
  userId     String
  type       NotificationType
  title      String
  body       String
  data       Json? // Additional data for deep linking
  
  // Delivery status
  sent       Boolean @default(false)
  sentAt     DateTime?
  read       Boolean @default(false)
  readAt     DateTime?
  
  // FCM/APNs tokens
  fcmToken   String?
  apnsToken  String?
  
  createdAt  DateTime @default(now())
  
  session VideoSession? @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user    User @relation("UserNotifications", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([sessionId])
  @@index([sent])
  @@index([read])
  @@map("session_notifications")
}

// Store FCM/APNs device tokens
model DeviceToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  Platform // WEB, ANDROID, IOS
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation("DeviceTokens", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isActive])
  @@map("device_tokens")
}

// Enums
enum SessionType {
  CLASS
  ONE_ON_ONE
  GROUP_MEETING
}

enum RecurrenceType {
  DAILY
  WEEKLY
}

enum SessionStatus {
  SCHEDULED
  LIVE
  COMPLETED
  CANCELLED
}

enum NotificationType {
  GROUP_CHAT_CREATED
  NEW_MESSAGE
  INSTANT_CALL_STARTED
  SESSION_SCHEDULED
  SESSION_REMINDER
  SESSION_LIVE
  SESSION_CANCELLED
  SESSION_RESCHEDULED
}

enum Platform {
  WEB
  ANDROID
  IOS
}
```

### 2. Update User Model Relations

```prisma
model User {
  // ... existing fields ...
  
  // New relations
  teacherGroupChats TeacherGroupChat[] @relation("TeacherGroupChats")
  groupChatMemberships TeacherGroupChatMember[] @relation("GroupChatMemberships")
  teacherSessions VideoSession[] @relation("TeacherSessions")
  sessionParticipations VideoSessionParticipant[] @relation("SessionParticipations")
  notifications SessionNotification[] @relation("UserNotifications")
  deviceTokens DeviceToken[] @relation("DeviceTokens")
}
```

## 🔧 Backend Services to Create

### 1. Teacher Session Service
**File**: `src/lib/services/teacher-session.service.ts`

```typescript
export interface ITeacherSessionService {
  // Group Chat Management
  createGroupChat(teacherId: string, name: string, studentIds: string[]): Promise<TeacherGroupChat>;
  addStudentsToGroupChat(chatId: string, studentIds: string[]): Promise<void>;
  removeStudentFromGroupChat(chatId: string, studentId: string): Promise<void>;
  getTeacherGroupChats(teacherId: string): Promise<TeacherGroupChat[]>;
  deleteGroupChat(chatId: string): Promise<void>;
  
  // Video Session Management
  scheduleSession(data: ScheduleSessionData): Promise<VideoSession>;
  updateSession(sessionId: string, data: UpdateSessionData): Promise<VideoSession>;
  cancelSession(sessionId: string, reason: string): Promise<void>;
  startInstantCall(chatId: string, teacherId: string): Promise<VideoSession>;
  endSession(sessionId: string): Promise<void>;
  
  // Session Queries
  getTeacherSessions(teacherId: string, filters?: SessionFilters): Promise<VideoSession[]>;
  getStudentSessions(studentId: string): Promise<VideoSession[]>;
  getUpcomingSessions(userId: string): Promise<VideoSession[]>;
  
  // Participant Management
  getEnrolledStudents(teacherId: string): Promise<User[]>;
  trackAttendance(sessionId: string, studentId: string, joined: boolean): Promise<void>;
}
```

### 2. Notification Service
**File**: `src/lib/services/push-notification.service.ts`

```typescript
export interface IPushNotificationService {
  // Device Token Management
  registerDeviceToken(userId: string, token: string, platform: Platform): Promise<void>;
  unregisterDeviceToken(token: string): Promise<void>;
  
  // Send Notifications
  sendNotification(userId: string, notification: NotificationData): Promise<void>;
  sendBulkNotifications(userIds: string[], notification: NotificationData): Promise<void>;
  
  // Session-specific notifications
  notifyGroupChatCreated(chatId: string, studentIds: string[]): Promise<void>;
  notifyNewMessage(chatId: string, senderId: string): Promise<void>;
  notifyInstantCallStarted(sessionId: string, participantIds: string[]): Promise<void>;
  notifySessionScheduled(sessionId: string): Promise<void>;
  notifySessionReminder(sessionId: string): Promise<void>;
  notifySessionLive(sessionId: string): Promise<void>;
  notifySessionCancelled(sessionId: string, reason: string): Promise<void>;
}
```

### 3. Enhanced Stream Chat Service
**File**: Update `src/lib/services/stream-chat.service.ts`

Add methods:
```typescript
// Create teacher group chat channel
async createTeacherGroupChannel(
  chatId: string,
  chatName: string,
  teacherId: string,
  studentIds: string[]
): Promise<string>;

// Create session chat channel
async createSessionChannel(
  sessionId: string,
  sessionTitle: string,
  teacherId: string,
  participantIds: string[]
): Promise<string>;

// Start instant call in channel
async startCallInChannel(channelId: string, callId: string): Promise<void>;
```

### 4. Enhanced HMS Video Service
**File**: Update `src/lib/services/hms-video.service.ts`

Add methods:
```typescript
// Create instant call room
async createInstantCallRoom(callId: string, hostName: string): Promise<HMSRoom>;

// Create scheduled session room
async createScheduledSessionRoom(sessionId: string, sessionTitle: string): Promise<HMSRoom>;

// Get room participants
async getRoomParticipants(roomId: string): Promise<Participant[]>;
```

## 🌐 API Routes to Create

### 1. Group Chat APIs
```
POST   /api/teacher/group-chats              - Create group chat
GET    /api/teacher/group-chats              - List teacher's group chats
POST   /api/teacher/group-chats/[id]/members - Add students to chat
DELETE /api/teacher/group-chats/[id]/members - Remove student from chat
DELETE /api/teacher/group-chats/[id]         - Delete group chat
GET    /api/teacher/enrolled-students        - Get all enrolled students
```

### 2. Video Session APIs
```
POST   /api/teacher/sessions                 - Schedule new session
GET    /api/teacher/sessions                 - List teacher's sessions
GET    /api/teacher/sessions/[id]            - Get session details
PATCH  /api/teacher/sessions/[id]            - Update session
DELETE /api/teacher/sessions/[id]            - Cancel session
POST   /api/teacher/sessions/instant-call    - Start instant call
POST   /api/teacher/sessions/[id]/start      - Start scheduled session
POST   /api/teacher/sessions/[id]/end        - End session
POST   /api/teacher/sessions/[id]/attendance - Track attendance
```

### 3. Student Session APIs
```
GET    /api/student/sessions                 - Get student's sessions
GET    /api/student/sessions/upcoming        - Get upcoming sessions
POST   /api/student/sessions/[id]/join       - Join session (get token)
```

### 4. Notification APIs
```
POST   /api/notifications/register-device    - Register FCM/APNs token
DELETE /api/notifications/unregister-device  - Unregister device
GET    /api/notifications                    - Get user notifications
PATCH  /api/notifications/[id]/read          - Mark as read
POST   /api/notifications/test               - Test notification (dev only)
```

## 🎨 Frontend Components to Create

### 1. Teacher Session Page
**File**: `src/app/dashboard/teacher/sessions/page.tsx`

**Sections**:
- Active Sessions (currently live)
- Upcoming Sessions (calendar view)
- Group Chats List
- Quick Actions (Start Instant Call, Schedule Session, Create Group Chat)

### 2. Components

```
src/components/teacher-sessions/
├── SessionCalendar.tsx           - Calendar view of scheduled sessions
├── SessionCard.tsx               - Session details card
├── GroupChatList.tsx             - List of teacher's group chats
├── GroupChatCard.tsx             - Group chat card with members
├── CreateGroupChatModal.tsx      - Modal to create group chat
├── ScheduleSessionModal.tsx      - Modal to schedule session
├── StudentPicker.tsx             - Multi-select student picker
├── InstantCallButton.tsx         - Start instant call from chat
├── SessionLiveIndicator.tsx      - Live session indicator
├── UpcomingSessionsWidget.tsx    - Widget for dashboard
└── NotificationCenter.tsx        - In-app notification center
```

### 3. Student Dashboard Components

```
src/components/student-sessions/
├── UpcomingSessionsCard.tsx      - Student's upcoming sessions
├── SessionJoinButton.tsx         - Join session button
├── SessionNotificationBanner.tsx - Banner for live sessions
└── GroupChatsList.tsx            - Student's group chats
```

## 🔔 Push Notification Implementation

### 1. Firebase Cloud Messaging Setup

**File**: `src/lib/config/firebase-messaging.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    return token;
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
```

### 2. Service Worker for Web Push

**File**: `public/firebase-messaging-sw.js`

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  // Firebase config
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg',
    badge: '/badge.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 3. Notification Types & Priorities

```typescript
export const NOTIFICATION_PRIORITIES = {
  // High priority - immediate attention
  INSTANT_CALL_STARTED: 'high',
  SESSION_LIVE: 'high',
  SESSION_REMINDER: 'high',
  
  // Normal priority
  SESSION_SCHEDULED: 'normal',
  GROUP_CHAT_CREATED: 'normal',
  NEW_MESSAGE: 'normal',
  SESSION_CANCELLED: 'normal',
};
```

## 📱 Implementation Steps

### Phase 1: Database & Backend (Week 1)
1. ✅ Create Prisma schema changes
2. ✅ Run migration: `npx prisma migrate dev --name add_teacher_sessions`
3. ✅ Create `TeacherSessionService`
4. ✅ Create `PushNotificationService`
5. ✅ Update `StreamChatService` with new methods
6. ✅ Update `HMSVideoService` with new methods
7. ✅ Create all API routes

### Phase 2: Frontend Core (Week 2)
1. ✅ Create Teacher Session page layout
2. ✅ Build `StudentPicker` component
3. ✅ Build `CreateGroupChatModal`
4. ✅ Build `ScheduleSessionModal`
5. ✅ Build `GroupChatList` and `GroupChatCard`
6. ✅ Build `SessionCalendar`
7. ✅ Integrate with GetStream chat UI

### Phase 3: Video Integration (Week 2-3)
1. ✅ Implement instant call functionality
2. ✅ Implement scheduled session start/end
3. ✅ Build video room UI with 100ms
4. ✅ Add call controls (mute, camera, screen share)
5. ✅ Track attendance

### Phase 4: Notifications (Week 3)
1. ✅ Set up Firebase Cloud Messaging
2. ✅ Create service worker for web push
3. ✅ Implement device token registration
4. ✅ Build notification center UI
5. ✅ Implement all notification triggers
6. ✅ Test notification delivery

### Phase 5: Student Experience (Week 4)
1. ✅ Build student session dashboard
2. ✅ Add upcoming sessions widget
3. ✅ Build session join flow
4. ✅ Add live session notifications
5. ✅ Test end-to-end flows

### Phase 6: Polish & Testing (Week 4)
1. ✅ Add loading states and error handling
2. ✅ Implement optimistic UI updates
3. ✅ Add session reminders (15 min before)
4. ✅ Test recurring sessions
5. ✅ Test notification delivery across platforms
6. ✅ Performance optimization

## 🔑 Key Features Summary

### For Teachers:
- ✅ Create unlimited group chats with enrolled students
- ✅ Start instant video calls from any chat
- ✅ Schedule one-time or recurring sessions
- ✅ Manage session participants
- ✅ View session calendar
- ✅ Track student attendance
- ✅ Send notifications to students

### For Students:
- ✅ Receive notifications for all communication events
- ✅ View upcoming sessions on dashboard
- ✅ Join sessions with one click
- ✅ Participate in group chats
- ✅ Get reminders before sessions start
- ✅ Access session chat before/after meetings

### Technical:
- ✅ GetStream for chat (already integrated)
- ✅ 100ms for video (already integrated)
- ✅ Firebase Cloud Messaging for push notifications
- ✅ Real-time updates
- ✅ Attendance tracking
- ✅ Recurring session support

## 🚀 Quick Start Commands

```bash
# 1. Update database schema
npx prisma migrate dev --name add_teacher_sessions

# 2. Generate Prisma client
npx prisma generate

# 3. Create services
mkdir -p src/lib/services
# Create teacher-session.service.ts
# Create push-notification.service.ts

# 4. Create API routes
mkdir -p src/app/api/teacher/sessions
mkdir -p src/app/api/teacher/group-chats
mkdir -p src/app/api/notifications

# 5. Create components
mkdir -p src/components/teacher-sessions
mkdir -p src/components/student-sessions

# 6. Set up Firebase Messaging
# Add FIREBASE_VAPID_KEY to .env
# Create firebase-messaging-sw.js in public/
```

## 📝 Environment Variables Needed

```env
# Existing (already have)
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_API_SECRET=
HMS_ACCESS_KEY=
HMS_SECRET=
HMS_TEMPLATE_ID=

# New (need to add)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
FIREBASE_SERVER_KEY=
```

## ✅ Success Criteria

- [ ] Teachers can create group chats with any enrolled students
- [ ] Teachers can start instant calls from chats
- [ ] Teachers can schedule one-time and recurring sessions
- [ ] Students receive push notifications for all events
- [ ] Students can join sessions with one click
- [ ] Attendance is tracked automatically
- [ ] Session reminders sent 15 minutes before start
- [ ] All notifications work on web, Android, iOS
- [ ] Calendar view shows all scheduled sessions
- [ ] Chat works before, during, and after sessions

---

**Ready to implement? Let's start with Phase 1: Database & Backend!**
