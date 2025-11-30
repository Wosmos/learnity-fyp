# Implementation Plan

## Phase 1: Database Schema & Core Infrastructure

- [x] 1. Set up database schema and migrations





  - [x] 1.1 Create Prisma schema for Category model


    - Add Category model with id, name, slug, description, icon fields
    - Add relation to Course model
    - _Requirements: 1.1_

  - [x] 1.2 Create Prisma schema for Course model

    - Add all fields: title, slug, description, thumbnailUrl, teacherId, categoryId, difficulty, tags, status, isFree, price, communication fields
    - Add cached fields: totalDuration, lessonCount, enrollmentCount, averageRating, reviewCount
    - Add relations to User, Category, Section, Enrollment, Review, Certificate

    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [ ] 1.3 Create Prisma schema for Section and Lesson models
    - Add Section with courseId, title, description, order
    - Add Lesson with sectionId, title, description, type, youtubeUrl, youtubeId, duration, order

    - Add LessonType enum (VIDEO, QUIZ)

    - _Requirements: 1.6, 1.7_
  - [ ] 1.4 Create Prisma schema for Quiz, Question, and QuizAttempt models
    - Add Quiz with lessonId, title, description, passingScore

    - Add Question with quizId, question, options, correctOptionIndex, explanation, order
    - Add QuizAttempt with quizId, studentId, score, passed, answers, timeTaken
    - _Requirements: 6.1, 6.2, 6.9_
  - [x] 1.5 Create Prisma schema for Enrollment and LessonProgress models

    - Add Enrollment with studentId, courseId, status, progress, completedAt, enrolledAt, lastAccessedAt
    - Add EnrollmentStatus enum (ACTIVE, COMPLETED, UNENROLLED)
    - Add LessonProgress with studentId, lessonId, watchedSeconds, completed, completedAt, lastPosition


    - _Requirements: 4.2, 5.3, 5.6_
  - [ ] 1.6 Create Prisma schema for Review and Certificate models
    - Add Review with studentId, courseId, rating, comment
    - Add Certificate with studentId, courseId, certificateId, issuedAt
    - _Requirements: 8.2, 10.2_
  - [x] 1.7 Create Prisma schema for gamification models


    - Add UserProgress with userId, totalXP, currentLevel, currentStreak, longestStreak, lastActivityAt
    - Add XPActivity with userId, amount, reason, sourceId
    - Add XPReason enum
    - Add Badge with userId, type, unlockedAt
    - Add BadgeType enum
    - _Requirements: 5.4, 6.7, 7.5, 10.4_
  - [x] 1.8 Run Prisma migration and generate client

    - Run `npx prisma migrate dev --name add_course_management`
    - Verify all models created in Neon DB
    - _Requirements: All_

- [x] 2. Checkpoint - Verify database schema





  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Core Services & Validation

- [x] 3. Create validation schemas and utilities





  - [x] 3.1 Create Zod validation schemas for course operations


    - Create CreateCourseSchema with title (3-100 chars), description (10-2000 chars), categoryId, difficulty, tags (max 5)
    - Create UpdateCourseSchema with optional fields
    - Create CourseFiltersSchema for search/filter
    - _Requirements: 1.1, 1.4_
  - [ ]* 3.2 Write property test for course title validation
    - **Property 1: Course Title Validation**
    - **Validates: Requirements 1.1**
  - [ ]* 3.3 Write property test for tag limit enforcement
    - **Property 2: Tag Limit Enforcement**
    - **Validates: Requirements 1.4**
  - [x] 3.4 Create YouTube URL validation utility


    - Validate youtube.com/watch and youtu.be formats
    - Extract video ID from URL
    - Fetch video metadata (title, duration) via YouTube oEmbed API
    - _Requirements: 1.7, 1.8_
  - [ ]* 3.5 Write property test for YouTube URL validation
    - **Property 3: YouTube URL Validation**
    - **Validates: Requirements 1.8**

  - [x] 3.6 Create Zod schemas for Section, Lesson, Quiz, Question

    - CreateSectionSchema, UpdateSectionSchema
    - CreateLessonSchema, UpdateLessonSchema
    - CreateQuizSchema with questions array
    - _Requirements: 1.6, 6.1_

  - [x] 3.7 Create Zod schemas for Enrollment, Review

    - CreateReviewSchema with rating (1-5), comment (10-500 chars optional)
    - _Requirements: 8.2_

- [x] 4. Implement CourseService



  - [x] 4.1 Create CourseService class with dependency injection


    - Implement constructor with PrismaClient injection
    - Create ICourseService interface
    - _Requirements: All course requirements_

  - [x] 4.2 Implement createCourse method
    - Validate input with Zod schema
    - Generate unique slug from title
    - Create course with DRAFT status
    - Return created course
    - _Requirements: 1.1, 1.10_
  - [ ]* 4.3 Write property test for draft status on creation
    - **Property 5: Draft Status on Creation**
    - **Validates: Requirements 1.10**

  - [x] 4.4 Implement updateCourse method
    - Validate ownership
    - Update allowed fields
    - Recalculate cached fields if needed
    - _Requirements: 2.4_
  - [x] 4.5 Implement publishCourse method

    - Validate at least one section with one lesson exists
    - Change status to PUBLISHED
    - Set publishedAt timestamp
    - _Requirements: 2.1, 2.2_
  - [ ]* 4.6 Write property test for publish validation
    - **Property 6: Publish Validation**
    - **Validates: Requirements 2.1**

  - [x] 4.7 Implement unpublishCourse and deleteCourse methods
    - unpublishCourse: Change status to UNPUBLISHED
    - deleteCourse: Only allow for DRAFT courses or courses with no enrollments
    - _Requirements: 2.3, 2.5, 2.6_
  - [x] 4.8 Implement getCourseById and getCoursesByTeacher methods

    - Include relations (sections, lessons, teacher, category)
    - Filter by teacher for teacher dashboard
    - _Requirements: 3.5, 5.1_

  - [x] 4.9 Implement getPublishedCourses with filtering and pagination
    - Filter by category, difficulty, rating
    - Sort by popularity, rating, newest
    - Paginate results
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 4.10 Implement searchCourses method

    - Search by title, description, tags
    - Apply filters and pagination
    - _Requirements: 3.3_

- [x] 5. Implement SectionService and LessonService





  - [x] 5.1 Create SectionService with CRUD operations


    - createSection, updateSection, deleteSection
    - Implement reorderSections method
    - _Requirements: 1.6, 1.9_
  - [ ]* 5.2 Write property test for section order preservation
    - **Property 4: Section Order Preservation**
    - **Validates: Requirements 1.6, 1.9**

  - [x] 5.3 Create LessonService with CRUD operations
    - createLesson with YouTube URL validation
    - updateLesson, deleteLesson
    - Implement reorderLessons method
    - Update course totalDuration and lessonCount on changes
    - _Requirements: 1.7, 1.9_

- [ ] 6. Checkpoint - Verify core services




  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Enrollment & Progress Services

- [x] 7. Implement EnrollmentService





  - [x] 7.1 Create EnrollmentService class


    - Implement constructor with PrismaClient injection
    - Create IEnrollmentService interface
    - _Requirements: 4.1-4.5_

  - [x] 7.2 Implement enrollStudent method

    - Check for existing enrollment (prevent duplicates)
    - Create enrollment with 0% progress, ACTIVE status
    - Increment course enrollmentCount
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 7.3 Write property test for enrollment uniqueness
    - **Property 7: Enrollment Uniqueness**
    - **Validates: Requirements 4.3**
  - [ ]* 7.4 Write property test for initial enrollment state
    - **Property 8: Initial Enrollment State**
    - **Validates: Requirements 4.2**


  - [x] 7.5 Implement unenrollStudent method
    - Change status to UNENROLLED (preserve history)
    - Decrement course enrollmentCount
    - _Requirements: 4.5_
  - [x] 7.6 Implement getEnrollment, getStudentEnrollments, getCourseEnrollments

    - Include course/student details
    - Filter by status
    - _Requirements: 4.4, 9.1_
  - [x] 7.7 Implement isEnrolled helper method


    - Check for active enrollment
    - _Requirements: 11.3_

- [x] 8. Implement ProgressService

  - [x] 8.1 Create ProgressService class
    - Implement constructor with dependencies
    - Create IProgressService interface
    - _Requirements: 5.3-5.8, 7.1-7.7_

  - [x] 8.2 Implement updateVideoProgress method
    - Update watchedSeconds and lastPosition
    - Auto-complete when 90% watched
    - _Requirements: 5.3, 5.6_
  - [ ]* 8.3 Write property test for lesson completion threshold
    - **Property 9: Lesson Completion Threshold**
    - **Validates: Requirements 5.3**

  - [x] 8.4 Implement markLessonComplete method
    - Set completed=true, completedAt timestamp
    - Award 10 XP via GamificationService
    - Update enrollment progress percentage
    - Update streak
    - _Requirements: 5.4, 5.5, 7.5_

  - [x] 8.5 Implement getCourseProgress method
    - Calculate overall progress percentage
    - Return completed lessons count, total lessons
    - _Requirements: 7.1_
  - [ ]* 8.6 Write property test for progress calculation
    - **Property 13: Progress Calculation**
    - **Validates: Requirements 7.1**

  - [x] 8.7 Implement getSectionProgress and isSectionUnlocked methods

    - Calculate section completion percentage
    - Check if previous section is 80% complete for unlock
    - _Requirements: 5.8, 7.3_

- [ ] 9. Checkpoint - Verify enrollment and progress




  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Quiz Service

- [x] 10. Implement QuizService





  - [x] 10.1 Create QuizService class


    - Implement constructor with dependencies
    - Create IQuizService interface
    - _Requirements: 6.1-6.9_

  - [x] 10.2 Implement createQuiz and updateQuiz methods

    - Create quiz with questions (2-4 options each)
    - Support explanations for correct answers
    - _Requirements: 6.1, 6.2_

  - [x] 10.3 Implement submitQuizAttempt method

    - Calculate score based on correct answers
    - Determine pass/fail (70% threshold)
    - Award 20 XP if passed
    - Store attempt with answers and time taken
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.9_
  - [ ]* 10.4 Write property test for quiz pass threshold
    - **Property 11: Quiz Pass Threshold**
    - **Validates: Requirements 6.6**
  - [ ]* 10.5 Write property test for XP award consistency
    - **Property 10: XP Award Consistency**
    - **Validates: Requirements 5.4, 6.7, 10.4**

  - [x] 10.6 Implement getQuizAttempts and getBestAttempt methods

    - Return all attempts for a student
    - Return attempt with highest score
    - _Requirements: 6.8_
  - [ ]* 10.7 Write property test for best score tracking
    - **Property 12: Best Score Tracking**
    - **Validates: Requirements 6.8**

- [ ] 11. Checkpoint - Verify quiz functionality
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Review & Certificate Services

- [x] 12. Implement ReviewService

  - [x] 12.1 Create ReviewService class
    - Implement constructor with dependencies
    - Create IReviewService interface
    - _Requirements: 8.1-8.7_

  - [x] 12.2 Implement canReview method
    - Check enrollment progress >= 50%
    - Check no existing review
    - _Requirements: 8.1_
  - [ ]* 12.3 Write property test for review eligibility
    - **Property 15: Review Eligibility**
    - **Validates: Requirements 8.1**

  - [x] 12.4 Implement createReview method
    - Validate eligibility
    - Create review with rating (1-5) and optional comment
    - Update course averageRating and reviewCount
    - _Requirements: 8.2, 8.3_
  - [ ]* 12.5 Write property test for review uniqueness
    - **Property 16: Review Uniqueness**
    - **Validates: Requirements 8.6**
  - [ ]* 12.6 Write property test for rating calculation
    - **Property 17: Rating Calculation**
    - **Validates: Requirements 8.3**
  - [x] 12.7 Implement updateReview and deleteReview methods
    - Validate ownership
    - Recalculate course rating on changes
    - _Requirements: 8.5_
  - [x] 12.8 Implement getCourseReviews method

    - Return reviews with student info
    - Sort by newest
    - _Requirements: 8.4_

- [x] 13. Implement CertificateService





  - [x] 13.1 Create CertificateService class


    - Implement constructor with dependencies
    - Create ICertificateService interface
    - _Requirements: 10.1-10.6_


  - [x] 13.2 Implement generateCertificate method
    - Verify course completion (100% lessons, all quizzes passed)
    - Generate unique certificateId
    - Award 50 XP for completion
    - Award badge if first completion
    - _Requirements: 10.1, 10.2, 10.4, 10.6_
  - [ ]* 13.3 Write property test for course completion criteria
    - **Property 14: Course Completion Criteria**
    - **Validates: Requirements 7.4, 10.1**
  - [ ]* 13.4 Write property test for certificate generation
    - **Property 18: Certificate Generation**

    - **Validates: Requirements 10.2**
  - [x] 13.5 Implement downloadCertificatePDF method

    - Generate PDF with student name, course title, date, certificate ID
    - Use @react-pdf/renderer or similar
    - _Requirements: 10.3_

- [ ] 14. Checkpoint - Verify review and certificate
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Gamification Service

- [x] 15. Implement GamificationService





  - [x] 15.1 Create GamificationService class


    - Implement constructor with dependencies
    - Create IGamificationService interface
    - _Requirements: 5.4, 6.7, 7.5, 10.4_

  - [x] 15.2 Implement awardXP method

    - Add XP to user's totalXP
    - Log XP activity with reason
    - Recalculate level
    - _Requirements: 5.4, 6.7, 10.4_

  - [x] 15.3 Implement updateStreak method

    - Check lastActivityAt date
    - Increment streak if new day, reset if missed day
    - Update longestStreak if current > longest
    - _Requirements: 7.5_
  - [ ]* 15.4 Write property test for streak update on activity
    - **Property 20: Streak Update on Activity**
    - **Validates: Requirements 7.5**


  - [x] 15.5 Implement checkAndAwardBadge method
    - Check badge criteria
    - Award badge if not already earned

    - _Requirements: 10.6_
  - [x] 15.6 Implement getStudentProgress method

    - Return totalXP, level, streak, badges
    - _Requirements: 7.6_

- [ ] 16. Checkpoint - Verify gamification
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: API Routes

- [x] 17. Create Course API routes



  - [x] 17.1 Create GET /api/courses route


    - List published courses with filters
    - Support search, pagination
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 17.2 Create GET /api/courses/[courseId] route


    - Return course details with sections, lessons
    - Include teacher info, reviews summary
    - _Requirements: 3.5, 3.6_

  - [x] 17.3 Create POST /api/courses route (Teacher only)


    - Create new course
    - Validate teacher role
    - _Requirements: 1.1-1.10_


  - [x] 17.4 Create PUT /api/courses/[courseId] route (Teacher only)

    - Update course details
    - Validate ownership
    - _Requirements: 2.4_
  - [x] 17.5 Create POST /api/courses/[courseId]/publish route (Teacher only)


    - Publish course
    - Validate requirements
    - _Requirements: 2.1, 2.2_
  - [x] 17.6 Create POST /api/courses/[courseId]/unpublish route (Teacher only)


    - Unpublish course

    - _Requirements: 2.3_


  - [x] 17.7 Create DELETE /api/courses/[courseId] route (Teacher only)

    - Delete draft course
    - _Requirements: 2.5, 2.6_

- [x] 18. Create Section and Lesson API routes





  - [x] 18.1 Create CRUD routes for sections


    - POST /api/courses/[courseId]/sections
    - PUT /api/sections/[sectionId]
    - DELETE /api/sections/[sectionId]
    - PUT /api/courses/[courseId]/sections/reorder
    - _Requirements: 1.6, 1.9_

  - [x] 18.2 Create CRUD routes for lessons

    - POST /api/sections/[sectionId]/lessons
    - PUT /api/lessons/[lessonId]
    - DELETE /api/lessons/[lessonId]
    - PUT /api/sections/[sectionId]/lessons/reorder
    - _Requirements: 1.7, 1.9_


  - [x] 18.3 Create YouTube validation route





    - POST /api/youtube/validate
    - Return video metadata
    - _Requirements: 1.8_

- [x] 19. Create Enrollment and Progress API routes









  - [x] 19.1 Create enrollment routes


    - POST /api/courses/[courseId]/enroll
    - DELETE /api/courses/[courseId]/enroll
    - GET /api/enrollments (student's courses)
    - _Requirements: 4.1-4.5_

  - [x] 19.2 Create progress routes



    - POST /api/lessons/[lessonId]/progress
    - POST /api/lessons/[lessonId]/complete
    - GET /api/courses/[courseId]/progress
    - _Requirements: 5.3-5.8, 7.1-7.7_

- [x] 20. Create Quiz API routes





  - [x] 20.1 Create quiz management routes (Teacher only)


    - POST /api/lessons/[lessonId]/quiz
    - PUT /api/quizzes/[quizId]
    - DELETE /api/quizzes/[quizId]
    - _Requirements: 6.1, 6.2_
  - [x] 20.2 Create quiz taking routes (Student)


    - GET /api/quizzes/[quizId]
    - POST /api/quizzes/[quizId]/submit
    - GET /api/quizzes/[quizId]/attempts
    - _Requirements: 6.3-6.9_

- [x] 21. Create Review and Certificate API routes






  - [x] 21.1 Create review routes

    - POST /api/courses/[courseId]/reviews
    - PUT /api/reviews/[reviewId]
    - DELETE /api/reviews/[reviewId]
    - GET /api/courses/[courseId]/reviews
    - _Requirements: 8.1-8.7_
  - [x] 21.2 Create certificate routes


    - POST /api/courses/[courseId]/certificate
    - GET /api/certificates/[certificateId]
    - GET /api/certificates/[certificateId]/download
    - _Requirements: 10.1-10.6_

- [x] 22. Checkpoint - Verify all API routes





  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Teacher UI Components

- [x] 23. Create reusable UI components






  - [x] 23.1 Create CourseCard component


    - Display thumbnail, title, teacher, rating, enrollment count
    - Support different sizes (grid, list)
    - _Requirements: 3.1_


  - [x] 23.2 Create CourseFilters component


    - Category dropdown, difficulty selector, rating filter
    - Sort options

    - _Requirements: 3.2, 3.4_
  - [x] 23.3 Create SearchInput component

    - Debounced search input
    - Clear button
    - _Requirements: 3.3_

  - [x] 23.4 Create ProgressBar component

    - Animated progress bar
    - Percentage display

    - _Requirements: 7.1, 7.3_
  - [x] 23.5 Create StarRating component



    - Display and input modes
    - Half-star support
    - _Requirements: 8.2, 8.3_

  - [x] 23.6 Create XPBadge and StreakCounter components

    - XP display with icon
    - Streak fire emoji with count
    - _Requirements: 7.5, 7.6_

- [x] 24. Create Teacher Course Builder UI





  - [x] 24.1 Create CourseBuilderPage layout


    - Multi-step form or tabbed interface
    - Save draft functionality
    - _Requirements: 1.1-1.10_

  - [x] 24.2 Create CourseBasicInfoForm component

    - Title, description, category, difficulty inputs
    - Thumbnail upload with preview
    - Tags input (max 5)

    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 24.3 Create SectionManager component

    - Add/edit/delete sections

    - Drag-and-drop reordering
    - _Requirements: 1.6, 1.9_
  - [x] 24.4 Create LessonManager component

    - Add video lessons with YouTube URL input
    - Auto-fetch video metadata
    - Add quiz lessons

    - Drag-and-drop reordering
    - _Requirements: 1.7, 1.8, 1.9_
  - [x] 24.5 Create QuizBuilder component

    - Add questions with options

    - Mark correct answer
    - Add explanations
    - _Requirements: 6.1, 6.2_

  - [x] 24.6 Create CoursePreview component

    - Preview course as student would see it
    - _Requirements: 2.7_
  - [x] 24.7 Create PublishCourseDialog component


    - Validation checklist
    - Publish/unpublish actions
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 25. Create Teacher Dashboard pages








  - [x] 25.1 Create TeacherCoursesPage

    - List teacher's courses with status badges
    - Quick actions (edit, publish, view analytics)
    - _Requirements: 2.2, 2.3_


  - [x] 25.2 Create CourseAnalyticsPage


    - Enrollment stats, completion rates
    - Progress distribution chart
    - Quiz performance metrics
    - Drop-off analysis

    - _Requirements: 9.1-9.7_

  - [x] 25.3 Create CourseStudentsPage

    - List enrolled students with progress
    - Filter by progress range
    - _Requirements: 9.1, 9.2_

- [ ] 26. Checkpoint - Verify teacher UI
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: Student UI Components

- [ ] 27. Create Student Course Browsing UI
  - [ ] 27.1 Create CourseCatalogPage
    - Grid of CourseCards
    - Filters sidebar
    - Search bar
    - Pagination
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 27.2 Create CourseDetailPage
    - Course info, syllabus, teacher profile
    - Reviews section
    - Enroll button
    - _Requirements: 3.5, 3.6, 4.1_
  - [ ] 27.3 Create MyCoursesPage
    - Enrolled courses with progress
    - Continue learning section
    - Completed courses
    - _Requirements: 3.7, 4.4_

- [ ] 28. Create Course Player UI
  - [ ] 28.1 Create CoursePlayerPage layout
    - Video player area
    - Lesson sidebar
    - Progress tracking
    - _Requirements: 5.1, 5.2_
  - [ ] 28.2 Create YouTubePlayer component
    - Embed YouTube video
    - Track watch progress
    - Resume from last position
    - _Requirements: 5.1, 5.3, 5.6_
  - [ ] 28.3 Create LessonSidebar component
    - Sections with lessons
    - Completion checkmarks
    - Locked section indicators
    - _Requirements: 5.2, 5.8, 7.2_
  - [ ] 28.4 Create LessonCompleteDialog component
    - XP earned display
    - Next lesson button
    - _Requirements: 5.4, 5.7_

- [ ] 29. Create Quiz Taking UI
  - [ ] 29.1 Create QuizPage layout
    - Question display
    - Progress indicator
    - Timer (optional)
    - _Requirements: 6.3_
  - [ ] 29.2 Create QuestionCard component
    - Question text
    - Option buttons
    - Immediate feedback
    - _Requirements: 6.3, 6.4_
  - [ ] 29.3 Create QuizResultsPage
    - Score display
    - Pass/fail indicator
    - Answer review with explanations
    - XP earned
    - Retake button
    - _Requirements: 6.5, 6.7, 6.8_

- [ ] 30. Create Review and Certificate UI
  - [ ] 30.1 Create ReviewForm component
    - Star rating input
    - Comment textarea
    - Submit button
    - _Requirements: 8.1, 8.2_
  - [ ] 30.2 Create ReviewsList component
    - Display reviews with ratings
    - Student name and date
    - _Requirements: 8.4_
  - [ ] 30.3 Create CertificatePage
    - Certificate display
    - Download PDF button
    - Share options
    - _Requirements: 10.2, 10.3, 10.5_

- [ ] 31. Update Student Dashboard
  - [ ] 31.1 Update StudentDashboard with real data
    - Replace hardcoded values with API data
    - Show enrolled courses with progress
    - Display XP, streak, level
    - _Requirements: 3.7, 7.1, 7.5, 7.6_
  - [ ]* 31.2 Write property test for communication link visibility
    - **Property 19: Communication Link Visibility**
    - **Validates: Requirements 11.3**

- [ ] 32. Checkpoint - Verify student UI
  - Ensure all tests pass, ask the user if questions arise.

## Phase 10: Integration & Polish

- [ ] 33. Integrate all components
  - [ ] 33.1 Wire up teacher dashboard navigation
    - Add course management links
    - Connect analytics pages
    - _Requirements: All teacher requirements_
  - [ ] 33.2 Wire up student dashboard navigation
    - Add course browsing links
    - Connect my courses page
    - _Requirements: All student requirements_
  - [ ] 33.3 Add toast notifications
    - Success/error messages for all actions
    - XP earned notifications
    - _Requirements: All_
  - [ ] 33.4 Add loading states and skeletons
    - Course cards skeleton
    - Player loading state
    - _Requirements: All_

- [ ] 34. Seed initial data
  - [ ] 34.1 Create seed script for categories
    - Add common course categories
    - _Requirements: 1.1_
  - [ ] 34.2 Create sample courses for testing
    - Add demo courses with lessons and quizzes
    - _Requirements: All_

- [ ] 35. Final Checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.
