# Learnity - MVP Requirements Document

## Introduction

Learnity is a platform connecting Pakistani students with tutors and study groups. The platform enables 1-on-1 tutoring sessions, group study rooms with real-time chat and video calls, and includes a gamified credit system to encourage engagement. This MVP focuses on core functionality to validate the concept and build a user base.

## Requirements

### Requirement 1: User Authentication & Role Management

**User Story:** As a user, I want to create an account and choose my role (Student/Tutor), so that I can access role-specific features and connect with others on the platform.

#### Acceptance Criteria

1. WHEN a new user visits the platform THEN the system SHALL provide registration with email/password using NextAuth.js
2. WHEN a user registers THEN the system SHALL allow them to choose between Student and Tutor roles
3. WHEN a user registers THEN the system SHALL collect basic profile information (name, email, profile picture)
4. WHEN a user logs in THEN the system SHALL authenticate using JWT tokens and maintain session state
5. WHEN a user forgets their password THEN the system SHALL provide password reset functionality via email
6. IF implemented THEN the system SHALL support Google OAuth sign-in as an optional feature

### Requirement 2: Tutor Discovery & Booking System

**User Story:** As a student, I want to search for and book tutoring sessions with qualified tutors, so that I can get personalized help with my studies.

#### Acceptance Criteria

1. WHEN a student searches for tutors THEN the system SHALL allow filtering by subject (Math, Physics, etc.) and grade level (9th, FSC Part 1, etc.)
2. WHEN tutor profiles are displayed THEN the system SHALL show name, subjects, grade levels, hourly rate, bio, and rating
3. WHEN a student selects a tutor THEN the system SHALL allow booking a session by confirming date/time and payment
4. WHEN a tutor sets availability THEN the system SHALL provide either a simple "Available" toggle or weekly calendar interface
5. WHEN a session is booked THEN the system SHALL notify both student and tutor with session details
6. WHEN a session is completed THEN the system SHALL allow students to rate and review the tutor

### Requirement 3: Study Group Management

**User Story:** As a user, I want to create and join study groups for collaborative learning, so that I can study with peers who share similar academic interests.

#### Acceptance Criteria

1. WHEN any user wants to create a study group THEN the system SHALL allow them to provide group name, subject, and description
2. WHEN users browse study groups THEN the system SHALL display all public groups with member count and subject information
3. WHEN a user wants to join a group THEN the system SHALL allow immediate joining of public groups
4. WHEN a group is created THEN the system SHALL automatically make the creator the group admin
5. WHEN users are in a group THEN the system SHALL provide access to the group's dedicated chat room
6. WHEN a group admin manages the group THEN the system SHALL allow basic moderation capabilities

### Requirement 4: Real-time Communication System

**User Story:** As a group member, I want to chat with other members in real-time and start video calls, so that I can collaborate effectively and get immediate help when needed.

#### Acceptance Criteria

1. WHEN users are in a study group THEN the system SHALL provide real-time text messaging using Firebase Firestore listeners
2. WHEN messages are sent THEN the system SHALL display them instantly to all group members with timestamps
3. WHEN users want to start a video call THEN the system SHALL provide a "Start Video Call" button that redirects to Jitsi Meet
4. WHEN a video call is started THEN the system SHALL create a unique room URL (e.g., `https://8x8.vc/learnity-group-{id}`)
5. WHEN users join video calls THEN the system SHALL support multiple participants without additional setup
6. WHEN chat history exists THEN the system SHALL persist and display previous messages when users rejoin

### Requirement 5: Gamification & Credit System

**User Story:** As a user, I want to earn and redeem credits for platform activities, so that I feel motivated to engage more and can access premium features.

#### Acceptance Criteria

1. WHEN a student completes a booked tutoring session THEN the system SHALL award 10 credits to their account
2. WHEN a tutor completes a tutoring session THEN the system SHALL award 10 credits to their account
3. WHEN a user accumulates 50 credits THEN the system SHALL allow them to redeem for one free tutoring session
4. WHEN credits are redeemed THEN the system SHALL mark the session as "free" and deduct credits from user balance
5. WHEN users view their profile or dashboard THEN the system SHALL prominently display their current credit balance
6. WHEN credit transactions occur THEN the system SHALL maintain a transaction history for user reference

### Requirement 6: User Profile Management

**User Story:** As a user, I want to manage my profile information and view my activity, so that I can present myself professionally and track my engagement.

#### Acceptance Criteria

1. WHEN users access their profile THEN the system SHALL display name, email, profile picture, and credit balance
2. WHEN users edit their profile THEN the system SHALL allow updating name, profile picture, and bio
3. WHEN a tutor manages their profile THEN the system SHALL additionally allow setting subjects taught, hourly rate, and availability
4. WHEN profile pictures are uploaded THEN the system SHALL store them using Firebase Storage
5. WHEN users view their profile THEN the system SHALL show their role (Student/Tutor) and join date
6. WHEN tutors have ratings THEN the system SHALL display average rating and review count on their profile

### Requirement 7: Admin Dashboard & User Management

**User Story:** As an admin, I want to monitor platform activity and manage users, so that I can ensure quality and handle any issues that arise.

#### Acceptance Criteria

1. WHEN an admin logs in THEN the system SHALL provide access to a separate admin dashboard at `/admin`
2. WHEN admin views the dashboard THEN the system SHALL display total users, tutors, groups, and system health metrics
3. WHEN admin manages users THEN the system SHALL provide a searchable list of all users with their roles and status
4. WHEN admin needs to remove a user THEN the system SHALL allow user deletion with cascading removal of related data
5. WHEN admin reviews tutors THEN the system SHALL provide tutor verification functionality (approve/reject applications)
6. WHEN admin monitors activity THEN the system SHALL show recent registrations, bookings, and group activities

### Requirement 8: Session Management & Booking Flow

**User Story:** As a tutor, I want to manage my tutoring sessions and availability, so that I can organize my schedule and provide quality service to students.

#### Acceptance Criteria

1. WHEN a tutor sets availability THEN the system SHALL allow them to specify available time slots or toggle availability status
2. WHEN sessions are booked THEN the system SHALL display upcoming sessions with student details and timing
3. WHEN a session is about to start THEN the system SHALL provide a "Start Session" button for video calling
4. WHEN sessions are completed THEN the system SHALL allow marking sessions as complete and trigger credit rewards
5. WHEN tutors view their history THEN the system SHALL show past sessions with earnings and student feedback
6. WHEN booking conflicts occur THEN the system SHALL prevent double-booking and show appropriate error messages

### Requirement 9: Mobile Responsiveness & Performance

**User Story:** As a mobile user, I want to access all platform features on my smartphone, so that I can use Learnity on-the-go without limitations.

#### Acceptance Criteria

1. WHEN users access the platform on mobile devices THEN the system SHALL provide responsive design using Tailwind CSS
2. WHEN mobile users interact with chat THEN the system SHALL provide touch-friendly interface with proper keyboard handling
3. WHEN mobile users join video calls THEN the system SHALL ensure Jitsi Meet integration works seamlessly on mobile browsers
4. WHEN pages load THEN the system SHALL achieve loading times under 3 seconds on standard mobile connections
5. WHEN users switch between devices THEN the system SHALL maintain session continuity and sync data
6. WHEN mobile users upload images THEN the system SHALL handle camera access and image compression appropriately

### Requirement 10: Data Security & Platform Reliability

**User Story:** As a user, I want my personal information to be secure and the platform to be reliable, so that I can trust Learnity with my data and depend on it for my studies.

#### Acceptance Criteria

1. WHEN user passwords are stored THEN the system SHALL hash them using industry-standard encryption
2. WHEN data is transmitted THEN the system SHALL use HTTPS and secure communication protocols
3. WHEN user sessions are managed THEN the system SHALL implement proper JWT token handling with expiration
4. WHEN the platform operates THEN the system SHALL maintain 99%+ uptime during beta testing phase
5. WHEN errors occur THEN the system SHALL implement error monitoring using Sentry for both frontend and backend
6. WHEN user data is stored THEN the system SHALL use secure database connections and proper access controls