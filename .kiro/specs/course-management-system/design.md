# Course Management System Design

## Overview

The Course Management System provides a comprehensive platform for teachers to create and manage courses with YouTube video lessons and quizzes, while students can browse, enroll, learn, and track their progress with gamification rewards. All data is stored in Neon DB (PostgreSQL) via Prisma ORM, with Firebase handling authentication only and Vercel Blob for file storage.

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js App Router)"
        A[Course Catalog Page]
        B[Course Detail Page]
        C[Course Player Page]
        D[Teacher Dashboard]
        E[Course Builder]
        F[Student Dashboard]
    end
    
    subgraph "API Layer (Next.js API Routes)"
        G[/api/courses]
        H[/api/enrollments]
        I[/api/progress]
        J[/api/quizzes]
        K[/api/reviews]
        L[/api/analytics]
    end
    
    subgraph "Service Layer"
        M[CourseService]
        N[EnrollmentService]
        O[ProgressService]
        P[QuizService]
        Q[ReviewService]
        R[GamificationService]
    end
    
    subgraph "Data Layer"
        S[(Neon DB - PostgreSQL)]
        T[Vercel Blob Storage]
        U[Firebase Auth]
    end
    
    A --> G
    B --> G
    C --> I
    D --> L
    E --> G
    F --> H
    
    G --> M
    H --> N
    I --> O
    J --> P
    K --> Q
    
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S
    
    M --> T
    G --> U
```

## Components and Interfaces

### Service Interfaces

```typescript
// ICourseService - Course management operations
interface ICourseService {
  createCourse(teacherId: string, data: CreateCourseDto): Promise<Course>;
  updateCourse(courseId: string, data: UpdateCourseDto): Promise<Course>;
  publishCourse(courseId: string): Promise<Course>;
  unpublishCourse(courseId: string): Promise<Course>;
  deleteCourse(courseId: string): Promise<void>;
  getCourseById(courseId: string): Promise<CourseWithDetails | null>;
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  getPublishedCourses(filters: CourseFilters): Promise<PaginatedCourses>;
  searchCourses(query: string, filters: CourseFilters): Promise<PaginatedCourses>;
}

// ISectionService - Section management
interface ISectionService {
  createSection(courseId: string, data: CreateSectionDto): Promise<Section>;
  updateSection(sectionId: string, data: UpdateSectionDto): Promise<Section>;
  deleteSection(sectionId: string): Promise<void>;
  reorderSections(courseId: string, sectionIds: string[]): Promise<void>;
}

// ILessonService - Lesson management
interface ILessonService {
  createLesson(sectionId: string, data: CreateLessonDto): Promise<Lesson>;
  updateLesson(lessonId: string, data: UpdateLessonDto): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  reorderLessons(sectionId: string, lessonIds: string[]): Promise<void>;
  validateYouTubeUrl(url: string): Promise<YouTubeMetadata>;
}

// IEnrollmentService - Enrollment operations
interface IEnrollmentService {
  enrollStudent(studentId: string, courseId: string): Promise<Enrollment>;
  unenrollStudent(studentId: string, courseId: string): Promise<void>;
  getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null>;
  getStudentEnrollments(studentId: string): Promise<EnrollmentWithCourse[]>;
  getCourseEnrollments(courseId: string): Promise<EnrollmentWithStudent[]>;
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;
}

// IProgressService - Progress tracking
interface IProgressService {
  markLessonComplete(studentId: string, lessonId: string): Promise<LessonProgress>;
  updateVideoProgress(studentId: string, lessonId: string, watchedSeconds: number): Promise<void>;
  getLessonProgress(studentId: string, lessonId: string): Promise<LessonProgress | null>;
  getCourseProgress(studentId: string, courseId: string): Promise<CourseProgress>;
  getSectionProgress(studentId: string, sectionId: string): Promise<number>;
  isSectionUnlocked(studentId: string, sectionId: string): Promise<boolean>;
}

// IQuizService - Quiz operations
interface IQuizService {
  createQuiz(lessonId: string, data: CreateQuizDto): Promise<Quiz>;
  updateQuiz(quizId: string, data: UpdateQuizDto): Promise<Quiz>;
  deleteQuiz(quizId: string): Promise<void>;
  getQuizByLesson(lessonId: string): Promise<QuizWithQuestions | null>;
  submitQuizAttempt(studentId: string, quizId: string, answers: QuizAnswer[]): Promise<QuizAttempt>;
  getQuizAttempts(studentId: string, quizId: string): Promise<QuizAttempt[]>;
  getBestAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null>;
}

// IReviewService - Review operations
interface IReviewService {
  createReview(studentId: string, courseId: string, data: CreateReviewDto): Promise<Review>;
  updateReview(reviewId: string, data: UpdateReviewDto): Promise<Review>;
  deleteReview(reviewId: string): Promise<void>;
  getCourseReviews(courseId: string): Promise<ReviewWithStudent[]>;
  getStudentReview(studentId: string, courseId: string): Promise<Review | null>;
  canReview(studentId: string, courseId: string): Promise<boolean>;
  getCourseRating(courseId: string): Promise<CourseRating>;
}

// IGamificationService - XP and streak management
interface IGamificationService {
  awardXP(studentId: string, amount: number, reason: XPReason): Promise<void>;
  updateStreak(studentId: string): Promise<StreakUpdate>;
  checkAndAwardBadge(studentId: string, badgeType: BadgeType): Promise<Badge | null>;
  getStudentProgress(studentId: string): Promise<GamificationProgress>;
}

// IAnalyticsService - Teacher analytics
interface IAnalyticsService {
  getCourseAnalytics(courseId: string): Promise<CourseAnalytics>;
  getLessonEngagement(courseId: string): Promise<LessonEngagement[]>;
  getQuizPerformance(courseId: string): Promise<QuizPerformance>;
  getStudentDistribution(courseId: string): Promise<ProgressDistribution>;
  getDropOffPoints(courseId: string): Promise<DropOffPoint[]>;
  exportAnalyticsCSV(courseId: string): Promise<string>;
}

// ICertificateService - Certificate generation
interface ICertificateService {
  generateCertificate(studentId: string, courseId: string): Promise<Certificate>;
  getCertificate(certificateId: string): Promise<Certificate | null>;
  getStudentCertificates(studentId: string): Promise<Certificate[]>;
  downloadCertificatePDF(certificateId: string): Promise<Buffer>;
}
```

### DTOs (Data Transfer Objects)

```typescript
// Course DTOs
interface CreateCourseDto {
  title: string;
  description: string;
  categoryId: string;
  difficulty: DifficultyLevel;
  tags: string[];
  thumbnailUrl?: string;
  isFree: boolean;
  price?: number;
  requireSequentialProgress: boolean;
}

interface UpdateCourseDto {
  title?: string;
  description?: string;
  categoryId?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  thumbnailUrl?: string;
  isFree?: boolean;
  price?: number;
  requireSequentialProgress?: boolean;
  whatsappGroupLink?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
}

interface CourseFilters {
  categoryId?: string;
  difficulty?: DifficultyLevel;
  minRating?: number;
  isFree?: boolean;
  sortBy?: 'popular' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

// Section DTOs
interface CreateSectionDto {
  title: string;
  description?: string;
  order: number;
}

// Lesson DTOs
interface CreateLessonDto {
  title: string;
  description?: string;
  youtubeUrl: string;
  duration: number; // in seconds
  order: number;
  type: LessonType; // VIDEO or QUIZ
}

// Quiz DTOs
interface CreateQuizDto {
  title: string;
  description?: string;
  passingScore: number; // percentage (default 70)
  questions: CreateQuestionDto[];
}

interface CreateQuestionDto {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface QuizAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

// Review DTOs
interface CreateReviewDto {
  rating: number; // 1-5
  comment?: string; // 10-500 chars
}
```

## Data Models

### Prisma Schema Extensions

```prisma
// Course Categories
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  courses     Course[]
  createdAt   DateTime @default(now())
  
  @@map("categories")
}

// Main Course Model
model Course {
  id                       String       @id @default(cuid())
  title                    String
  slug                     String       @unique
  description              String
  thumbnailUrl             String?
  teacherId                String
  categoryId               String
  difficulty               Difficulty   @default(BEGINNER)
  tags                     String[]
  status                   CourseStatus @default(DRAFT)
  isFree                   Boolean      @default(true)
  price                    Decimal?
  requireSequentialProgress Boolean     @default(false)
  
  // Communication
  whatsappGroupLink        String?
  contactEmail             String?
  contactWhatsapp          String?
  
  // Computed/Cached fields
  totalDuration            Int          @default(0) // seconds
  lessonCount              Int          @default(0)
  enrollmentCount          Int          @default(0)
  averageRating            Decimal      @default(0)
  reviewCount              Int          @default(0)
  
  // Timestamps
  publishedAt              DateTime?
  createdAt                DateTime     @default(now())
  updatedAt                DateTime     @updatedAt
  
  // Relations
  teacher                  User         @relation("TeacherCourses", fields: [teacherId], references: [id])
  category                 Category     @relation(fields: [categoryId], references: [id])
  sections                 Section[]
  enrollments              Enrollment[]
  reviews                  Review[]
  certificates             Certificate[]
  
  @@index([teacherId])
  @@index([categoryId])
  @@index([status])
  @@index([difficulty])
  @@index([averageRating])
  @@index([enrollmentCount])
  @@map("courses")
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  UNPUBLISHED
}

// Course Sections
model Section {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  description String?
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons     Lesson[]
  
  @@index([courseId])
  @@index([order])
  @@map("sections")
}

// Lessons (Video or Quiz)
model Lesson {
  id          String     @id @default(cuid())
  sectionId   String
  title       String
  description String?
  type        LessonType @default(VIDEO)
  youtubeUrl  String?
  youtubeId   String?    // Extracted video ID
  duration    Int        @default(0) // seconds
  order       Int
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  section     Section    @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  quiz        Quiz?
  progress    LessonProgress[]
  
  @@index([sectionId])
  @@index([order])
  @@map("lessons")
}

enum LessonType {
  VIDEO
  QUIZ
}

// Quiz Model
model Quiz {
  id           String     @id @default(cuid())
  lessonId     String     @unique
  title        String
  description  String?
  passingScore Int        @default(70) // percentage
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  lesson       Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions    Question[]
  attempts     QuizAttempt[]
  
  @@map("quizzes")
}

// Quiz Questions
model Question {
  id                 String   @id @default(cuid())
  quizId             String
  question           String
  options            String[] // Array of options
  correctOptionIndex Int
  explanation        String?
  order              Int
  createdAt          DateTime @default(now())
  
  quiz               Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  @@index([quizId])
  @@map("questions")
}

// Quiz Attempts
model QuizAttempt {
  id          String   @id @default(cuid())
  quizId      String
  studentId   String
  score       Int      // percentage
  passed      Boolean
  answers     Json     // Array of {questionId, selectedIndex, isCorrect}
  timeTaken   Int      // seconds
  createdAt   DateTime @default(now())
  
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  student     User     @relation(fields: [studentId], references: [id])
  
  @@index([quizId])
  @@index([studentId])
  @@index([score])
  @@map("quiz_attempts")
}

// Enrollments
model Enrollment {
  id              String           @id @default(cuid())
  studentId       String
  courseId        String
  status          EnrollmentStatus @default(ACTIVE)
  progress        Int              @default(0) // percentage
  completedAt     DateTime?
  enrolledAt      DateTime         @default(now())
  lastAccessedAt  DateTime         @default(now())
  
  student         User             @relation(fields: [studentId], references: [id])
  course          Course           @relation(fields: [courseId], references: [id])
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@index([status])
  @@map("enrollments")
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  UNENROLLED
}

// Lesson Progress
model LessonProgress {
  id              String   @id @default(cuid())
  studentId       String
  lessonId        String
  watchedSeconds  Int      @default(0)
  completed       Boolean  @default(false)
  completedAt     DateTime?
  lastPosition    Int      @default(0) // resume position
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  student         User     @relation(fields: [studentId], references: [id])
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, lessonId])
  @@index([studentId])
  @@index([lessonId])
  @@map("lesson_progress")
}

// Course Reviews
model Review {
  id        String   @id @default(cuid())
  studentId String
  courseId  String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  student   User     @relation(fields: [studentId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, courseId])
  @@index([courseId])
  @@index([rating])
  @@map("reviews")
}

// Certificates
model Certificate {
  id            String   @id @default(cuid())
  studentId     String
  courseId      String
  certificateId String   @unique // Public unique ID for verification
  issuedAt      DateTime @default(now())
  
  student       User     @relation(fields: [studentId], references: [id])
  course        Course   @relation(fields: [courseId], references: [id])
  
  @@unique([studentId, courseId])
  @@index([certificateId])
  @@map("certificates")
}

// Gamification - User Progress
model UserProgress {
  id            String   @id @default(cuid())
  userId        String   @unique
  totalXP       Int      @default(0)
  currentLevel  Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastActivityAt DateTime?
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@map("user_progress")
}

// XP Activity Log
model XPActivity {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    XPReason
  sourceId  String?  // lessonId, quizId, courseId
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([createdAt])
  @@map("xp_activities")
}

enum XPReason {
  LESSON_COMPLETE
  QUIZ_PASS
  COURSE_COMPLETE
  DAILY_LOGIN
  STREAK_BONUS
}

// Badges
model Badge {
  id          String   @id @default(cuid())
  userId      String
  type        BadgeType
  unlockedAt  DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, type])
  @@index([userId])
  @@map("badges")
}

enum BadgeType {
  FIRST_COURSE_COMPLETE
  FIVE_COURSES_COMPLETE
  TEN_COURSES_COMPLETE
  STREAK_7_DAYS
  STREAK_30_DAYS
  STREAK_100_DAYS
  QUIZ_MASTER
  TOP_REVIEWER
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Course Title Validation
*For any* course creation request, the system SHALL accept titles between 3-100 characters and reject titles outside this range.
**Validates: Requirements 1.1**

### Property 2: Tag Limit Enforcement
*For any* course, the system SHALL accept up to 5 tags and reject any attempt to add more than 5 tags.
**Validates: Requirements 1.4**

### Property 3: YouTube URL Validation
*For any* string provided as a YouTube URL, the system SHALL accept only valid YouTube video URLs (youtube.com/watch, youtu.be formats) and reject invalid URLs.
**Validates: Requirements 1.8**

### Property 4: Section Order Preservation
*For any* course with sections, after reordering operations, the section order array SHALL match the requested order exactly.
**Validates: Requirements 1.6, 1.9**

### Property 5: Draft Status on Creation
*For any* newly created course, the initial status SHALL always be DRAFT regardless of other input parameters.
**Validates: Requirements 1.10**

### Property 6: Publish Validation
*For any* course publish request, the system SHALL succeed only if the course has at least one section containing at least one lesson, and reject otherwise.
**Validates: Requirements 2.1**

### Property 7: Enrollment Uniqueness
*For any* student and course pair, the system SHALL prevent duplicate enrollments and maintain at most one active enrollment record.
**Validates: Requirements 4.3**

### Property 8: Initial Enrollment State
*For any* new enrollment, the initial progress SHALL be 0% and status SHALL be ACTIVE.
**Validates: Requirements 4.2**

### Property 9: Lesson Completion Threshold
*For any* video lesson, the system SHALL mark it complete when watchedSeconds >= 90% of lesson duration.
**Validates: Requirements 5.3**

### Property 10: XP Award Consistency
*For any* completed lesson, the system SHALL award exactly 10 XP; for any passed quiz, exactly 20 XP; for any completed course, exactly 50 XP.
**Validates: Requirements 5.4, 6.7, 10.4**

### Property 11: Quiz Pass Threshold
*For any* quiz attempt, the system SHALL mark it as passed if and only if score >= 70%.
**Validates: Requirements 6.6**

### Property 12: Best Score Tracking
*For any* student with multiple quiz attempts, the recorded best score SHALL equal the maximum score across all attempts.
**Validates: Requirements 6.8**

### Property 13: Progress Calculation
*For any* enrollment, the progress percentage SHALL equal (completed lessons / total lessons) * 100, rounded to nearest integer.
**Validates: Requirements 7.1**

### Property 14: Course Completion Criteria
*For any* enrollment, the course SHALL be marked complete if and only if all lessons are completed AND all quizzes are passed.
**Validates: Requirements 7.4, 10.1**

### Property 15: Review Eligibility
*For any* student attempting to review a course, the system SHALL allow review submission if and only if enrollment progress >= 50%.
**Validates: Requirements 8.1**

### Property 16: Review Uniqueness
*For any* student and course pair, the system SHALL maintain at most one review record.
**Validates: Requirements 8.6**

### Property 17: Rating Calculation
*For any* course with reviews, the average rating SHALL equal the arithmetic mean of all review ratings, rounded to one decimal place.
**Validates: Requirements 8.3**

### Property 18: Certificate Generation
*For any* completed course, the generated certificate SHALL contain a unique certificateId that is globally unique across all certificates.
**Validates: Requirements 10.2**

### Property 19: Communication Link Visibility
*For any* course with communication links, the links SHALL be visible only to users with an active enrollment in that course.
**Validates: Requirements 11.3**

### Property 20: Streak Update on Activity
*For any* lesson completion, if the student's lastActivityAt is from a previous calendar day, the currentStreak SHALL increment by 1.
**Validates: Requirements 7.5**

## Error Handling

### Error Categories

```typescript
// Custom error classes
class CourseError extends Error {
  constructor(
    message: string,
    public code: CourseErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

enum CourseErrorCode {
  // Validation errors
  INVALID_TITLE = 'INVALID_TITLE',
  INVALID_DESCRIPTION = 'INVALID_DESCRIPTION',
  INVALID_YOUTUBE_URL = 'INVALID_YOUTUBE_URL',
  TOO_MANY_TAGS = 'TOO_MANY_TAGS',
  
  // Business logic errors
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_COURSE_OWNER = 'NOT_COURSE_OWNER',
  CANNOT_PUBLISH_EMPTY = 'CANNOT_PUBLISH_EMPTY',
  CANNOT_DELETE_WITH_ENROLLMENTS = 'CANNOT_DELETE_WITH_ENROLLMENTS',
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  NOT_ENROLLED = 'NOT_ENROLLED',
  SECTION_LOCKED = 'SECTION_LOCKED',
  CANNOT_REVIEW_YET = 'CANNOT_REVIEW_YET',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}
```

### Error Handling Strategy

1. **Validation Errors**: Return 400 with specific field errors
2. **Not Found**: Return 404 with resource identifier
3. **Authorization**: Return 401/403 with appropriate message
4. **Business Logic**: Return 400/409 with explanation
5. **Server Errors**: Return 500, log details, show generic message

## Testing Strategy

### Dual Testing Approach

The system uses both unit tests and property-based tests for comprehensive coverage.

### Property-Based Testing Library

**Library**: fast-check (TypeScript PBT library)

```typescript
import fc from 'fast-check';

// Example: Property test for title validation
describe('Course Title Validation', () => {
  it('should accept valid titles (3-100 chars)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 100 }),
        (title) => {
          const result = validateCourseTitle(title);
          return result.isValid === true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should reject titles outside valid range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ maxLength: 2 }),
          fc.string({ minLength: 101 })
        ),
        (title) => {
          const result = validateCourseTitle(title);
          return result.isValid === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

Unit tests cover:
- Service method behavior with specific inputs
- Edge cases (empty arrays, null values)
- Error conditions
- Integration points

### Test Configuration

- Minimum 100 iterations per property test
- Each property test tagged with: `**Feature: course-management-system, Property {number}: {property_text}**`
