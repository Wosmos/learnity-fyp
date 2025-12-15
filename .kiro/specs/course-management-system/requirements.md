# Course Management System Requirements

## Introduction

The Course Management System is a comprehensive platform enabling verified teachers to create, manage, and deliver courses with video lessons (via YouTube links) and quizzes. Students can browse, enroll, learn at their own pace, track progress, and earn gamification rewards. All data is stored in Neon DB (PostgreSQL) with Firebase handling authentication only. The system includes course ratings, reviews, categories, difficulty levels, and teacher analytics.

## Glossary

- **Course_System**: The course management platform for creating and taking courses
- **Teacher**: A verified user (TEACHER role) who can create and manage courses
- **Student**: A user (STUDENT role) enrolled in courses
- **Course**: A collection of sections containing video lessons and quizzes on a specific topic
- **Section**: A logical grouping of lessons within a course (e.g., "Chapter 1: Introduction")
- **Lesson**: A single video (YouTube link) or quiz within a section
- **Quiz**: A set of multiple-choice questions to test understanding
- **Enrollment**: A student's registration in a course
- **Progress**: Tracking of completed lessons and quiz scores per student
- **XP**: Experience points awarded for learning activities
- **Streak**: Consecutive days of learning activity

## Requirements

### Requirement 1: Course Creation

**User Story:** As a Teacher, I want to create comprehensive courses with organized sections and video lessons, so that I can deliver structured learning content to students.

#### Acceptance Criteria

1. WHEN a Teacher creates a course, THE Course_System SHALL require a title (3-100 characters), description (10-2000 characters), and category selection
2. THE Course_System SHALL allow Teachers to upload a thumbnail image (max 2MB, jpg/png) stored via Vercel Blob with URL saved to Neon DB
3. THE Course_System SHALL enable Teachers to set course difficulty level (Beginner, Intermediate, Advanced)
4. THE Course_System SHALL allow Teachers to add tags (up to 5) for better discoverability
5. THE Course_System SHALL enable Teachers to set course as Free or Paid (price field for future use)
6. WHEN a Teacher adds a section, THE Course_System SHALL allow naming and ordering of sections
7. THE Course_System SHALL enable Teachers to add YouTube video links as lessons with title and duration
8. THE Course_System SHALL validate YouTube URLs and extract video metadata (title, duration) automatically
9. THE Course_System SHALL allow Teachers to reorder sections and lessons via drag-and-drop
10. WHEN a Teacher saves a course, THE Course_System SHALL store it as Draft status until published

### Requirement 2: Course Publishing & Management

**User Story:** As a Teacher, I want to publish, edit, and manage my courses, so that I can maintain quality content for students.

#### Acceptance Criteria

1. WHEN a Teacher publishes a course, THE Course_System SHALL validate that at least one section with one lesson exists
2. THE Course_System SHALL change course status from Draft to Published and make it visible to students
3. THE Course_System SHALL allow Teachers to unpublish a course, hiding it from new enrollments while preserving existing student progress
4. WHEN a Teacher edits a published course, THE Course_System SHALL allow adding new content without affecting existing student progress
5. THE Course_System SHALL enable Teachers to delete draft courses permanently
6. THE Course_System SHALL prevent deletion of published courses with enrolled students (only unpublish allowed)
7. THE Course_System SHALL display a preview mode for Teachers to see the student view before publishing

### Requirement 3: Course Discovery & Browsing

**User Story:** As a Student, I want to browse and search for courses, so that I can find relevant learning content.

#### Acceptance Criteria

1. THE Course_System SHALL display a course catalog with thumbnail, title, teacher name, rating, and enrollment count
2. THE Course_System SHALL enable filtering courses by category, difficulty level, and rating
3. THE Course_System SHALL provide search functionality by course title, description, and tags
4. THE Course_System SHALL sort courses by popularity (enrollments), rating, or newest
5. WHEN a Student views a course, THE Course_System SHALL display full details including syllabus, teacher info, reviews, and lesson count
6. THE Course_System SHALL show estimated course duration based on total video length
7. THE Course_System SHALL display "Continue Learning" section for enrolled courses on student dashboard

### Requirement 4: Course Enrollment

**User Story:** As a Student, I want to enroll in courses, so that I can access the learning content.

#### Acceptance Criteria

1. WHEN a Student clicks enroll on a free course, THE Course_System SHALL immediately add them to the course
2. THE Course_System SHALL create an enrollment record with enrolled date and initial progress of 0%
3. THE Course_System SHALL prevent duplicate enrollments for the same course
4. THE Course_System SHALL display enrolled courses in the student's "My Courses" section
5. WHEN a Student unenrolls, THE Course_System SHALL remove enrollment but preserve completion history for analytics

### Requirement 5: Video Lesson Consumption

**User Story:** As a Student, I want to watch video lessons in an organized manner, so that I can learn effectively.

#### Acceptance Criteria

1. THE Course_System SHALL embed YouTube videos using the YouTube IFrame API for seamless playback
2. THE Course_System SHALL display lessons organized by sections with clear navigation
3. THE Course_System SHALL track video watch progress and mark lesson complete when 90% watched
4. WHEN a Student completes a lesson, THE Course_System SHALL award 10 XP points
5. THE Course_System SHALL allow Students to manually mark lessons as complete
6. THE Course_System SHALL remember last watched position and resume from there
7. THE Course_System SHALL show next lesson recommendation after completion
8. THE Course_System SHALL lock subsequent sections until previous section is 80% complete (optional setting per course)

### Requirement 6: Quiz System

**User Story:** As a Student, I want to take quizzes to test my understanding, so that I can validate my learning.

#### Acceptance Criteria

1. THE Course_System SHALL allow Teachers to create multiple-choice quizzes with 2-4 options per question
2. THE Course_System SHALL support adding explanations for correct answers
3. WHEN a Student takes a quiz, THE Course_System SHALL display one question at a time with progress indicator
4. THE Course_System SHALL provide immediate feedback showing correct/incorrect after each answer
5. WHEN a Student completes a quiz, THE Course_System SHALL display final score and review of answers
6. THE Course_System SHALL require 70% score to pass a quiz
7. WHEN a Student passes a quiz, THE Course_System SHALL award 20 XP bonus points
8. THE Course_System SHALL allow unlimited quiz retakes with best score recorded
9. THE Course_System SHALL track quiz attempts, scores, and time taken in Neon DB

### Requirement 7: Progress Tracking

**User Story:** As a Student, I want to track my course progress, so that I can see my learning journey.

#### Acceptance Criteria

1. THE Course_System SHALL display overall course progress percentage based on completed lessons
2. THE Course_System SHALL show completed lessons with checkmark icons
3. THE Course_System SHALL display section-wise progress bars
4. WHEN a Student completes all lessons and quizzes, THE Course_System SHALL mark course as completed
5. THE Course_System SHALL update student's daily streak when any lesson is completed
6. THE Course_System SHALL display total XP earned from the course
7. THE Course_System SHALL show time spent on course (aggregate of video durations watched)

### Requirement 8: Course Ratings & Reviews

**User Story:** As a Student, I want to rate and review courses, so that I can help other students make informed decisions.

#### Acceptance Criteria

1. WHEN a Student completes at least 50% of a course, THE Course_System SHALL enable rating and review submission
2. THE Course_System SHALL allow rating from 1-5 stars with optional written review (10-500 characters)
3. THE Course_System SHALL display average rating and total review count on course cards
4. THE Course_System SHALL show all reviews on course detail page with student name and date
5. THE Course_System SHALL allow Students to edit or delete their own reviews
6. THE Course_System SHALL prevent multiple reviews from same student for same course
7. THE Course_System SHALL notify Teacher when a new review is submitted

### Requirement 9: Teacher Analytics Dashboard

**User Story:** As a Teacher, I want to see analytics for my courses, so that I can understand student engagement and improve content.

#### Acceptance Criteria

1. THE Course_System SHALL display total enrollments, completions, and average rating per course
2. THE Course_System SHALL show student progress distribution (0-25%, 25-50%, 50-75%, 75-100%)
3. THE Course_System SHALL display quiz performance analytics (average scores, pass rates)
4. THE Course_System SHALL show lesson-wise engagement (completion rates per lesson)
5. THE Course_System SHALL identify drop-off points where students stop progressing
6. THE Course_System SHALL display recent student activity feed
7. THE Course_System SHALL provide exportable reports in CSV format

### Requirement 10: Course Completion & Certificates

**User Story:** As a Student, I want to receive recognition for completing courses, so that I can showcase my achievements.

#### Acceptance Criteria

1. WHEN a Student completes 100% of lessons and passes all quizzes, THE Course_System SHALL mark course as completed
2. THE Course_System SHALL generate a completion certificate with student name, course title, completion date, and unique certificate ID
3. THE Course_System SHALL allow Students to download certificate as PDF
4. THE Course_System SHALL award 50 XP bonus for course completion
5. THE Course_System SHALL display completed courses in student profile with completion date
6. THE Course_System SHALL unlock "Course Completer" badge after first course completion

### Requirement 11: Teacher Communication

**User Story:** As a Teacher, I want to provide communication channels for students, so that they can get help when needed.

#### Acceptance Criteria

1. THE Course_System SHALL allow Teachers to add WhatsApp group link for course-specific Q&A
2. THE Course_System SHALL allow Teachers to add their contact preferences (WhatsApp, Email)
3. THE Course_System SHALL display teacher's communication links on course page for enrolled students only
4. THE Course_System SHALL generate wa.me direct chat links for quick teacher contact
