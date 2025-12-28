import { PrismaClient, UserRole, ApplicationStatus, Difficulty, CourseStatus, LessonType, XPReason, BadgeType, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: clean URLs (remove trailing spaces)
const cleanUrl = (url: string) => url.trim();

// Sample avatars
const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
];

// Realistic YouTube embed (safe placeholder)
const sampleVideo = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // You can replace this

async function main() {
  console.log("🌱 Starting enhanced database seed...");

  // 🔥 Clean data (dev only)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning database...");
    await prisma.certificate.deleteMany();
    await prisma.review.deleteMany();
    await prisma.lessonProgress.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.section.deleteMany();
    await prisma.course.deleteMany();
    await prisma.category.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.xPActivity.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.securityEvent.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  // 👤 Static Admin
  const staticAdmin = await prisma.user.upsert({
    where: { email: process.env.STATIC_ADMIN_EMAIL || "admin@learnity.com" },
    update: {},
    create: {
      firebaseUid: "static-admin-uid",
      email: process.env.STATIC_ADMIN_EMAIL || "admin@learnity.com",
      firstName: "System",
      lastName: "Administrator",
      role: UserRole.ADMIN,
      emailVerified: true,
      isActive: true,
      adminProfile: { create: { department: "Platform Management", isStatic: true } },
    },
  });

  // 🎓 Students
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      firebaseUid: "student-alice-uid",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      role: UserRole.STUDENT,
      emailVerified: true,
      isActive: true,
      profilePicture: avatars[0],
      studentProfile: {
        create: {
          gradeLevel: "10th Grade",
          subjects: ["Mathematics", "Physics"],
          learningGoals: ["Improve problem-solving", "Prepare for SATs"],
          interests: ["Science", "Reading"],
          profileCompletionPercentage: 90,
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      firebaseUid: "student-bob-uid",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Smith",
      role: UserRole.STUDENT,
      emailVerified: true,
      isActive: true,
      profilePicture: avatars[1],
      studentProfile: {
        create: {
          gradeLevel: "11th Grade",
          subjects: ["English", "History"],
          profileCompletionPercentage: 60,
        },
      },
    },
  });

  // 👨‍🏫 Approved Teacher
  const teacher = await prisma.user.upsert({
    where: { email: "sarah@learnity.com" },
    update: {},
    create: {
      firebaseUid: "teacher-sarah-uid",
      email: "sarah@learnity.com",
      firstName: "Dr. Sarah",
      lastName: "Wilson",
      role: UserRole.TEACHER,
      emailVerified: true,
      isActive: true,
      profilePicture: avatars[2],
      teacherProfile: {
        create: {
          applicationStatus: ApplicationStatus.APPROVED,
          qualifications: ["PhD Mathematics, MIT"],
          subjects: ["Mathematics", "Calculus", "SAT"],
          experience: 10,
          bio: "Passionate math educator with 10+ years experience.",
          hourlyRate: 45.0,
          approvedBy: staticAdmin.id,
          reviewedAt: new Date(),
          rating: 4.9,
          reviewCount: 20,
          lessonsCompleted: 200,
          activeStudents: 15,
        },
      },
    },
  });

  // 📂 Categories
  const mathCat = await prisma.category.upsert({
    where: { slug: "math" },
    update: {},
    create: { name: "Mathematics", slug: "math", description: "Math courses for all levels" },
  });

  const englishCat = await prisma.category.upsert({
    where: { slug: "english" },
    update: {},
    create: { name: "English", slug: "english", description: "Language & literature" },
  });

  // 📘 Courses
  const mathCourse = await prisma.course.upsert({
    where: { slug: "mastering-algebra" },
    update: {},
    create: {
      title: "Mastering Algebra",
      slug: "mastering-algebra",
      description: "Build a strong foundation in algebra with real-world examples.",
      teacherId: teacher.id,
      categoryId: mathCat.id,
      difficulty: Difficulty.BEGINNER,
      tags: ["algebra", "math", "foundations"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      lessonCount: 6,
      enrollmentCount: 2,
    },
  });

  const englishCourse = await prisma.course.upsert({
    where: { slug: "essay-writing" },
    update: {},
    create: {
      title: "Essay Writing Mastery",
      slug: "essay-writing",
      description: "Learn to write compelling essays for school and beyond.",
      teacherId: teacher.id,
      categoryId: englishCat.id,
      difficulty: Difficulty.INTERMEDIATE,
      tags: ["writing", "english", "essays"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      lessonCount: 5,
      enrollmentCount: 1,
    },
  });

  // 📑 Sections & Lessons (Math Course)
  const algebraSection = await prisma.section.create({
    data: {
      courseId: mathCourse.id,
      title: "Core Algebra Concepts",
      order: 1,
    },
  });

  const algebraLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        sectionId: algebraSection.id,
        title: "Introduction to Variables",
        type: LessonType.VIDEO,
        youtubeUrl: cleanUrl(sampleVideo),
        youtubeId: "dQw4w9WgXcQ",
        duration: 420,
        order: 1,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: algebraSection.id,
        title: "Solving Linear Equations",
        type: LessonType.VIDEO,
        youtubeUrl: cleanUrl(sampleVideo),
        youtubeId: "dQw4w9WgXcQ",
        duration: 540,
        order: 2,
      },
    }),
  ]);

  // 🧠 Quiz for first lesson
  const quiz = await prisma.quiz.create({
    data: {
      lessonId: algebraLessons[0].id,
      title: "Variables Quiz",
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quiz.id,
        question: "What is a variable in algebra?",
        options: ["A fixed number", "A symbol representing a value", "An operation", "A graph"],
        correctOptionIndex: 1,
        order: 1,
      },
      {
        quizId: quiz.id,
        question: "Which is NOT a valid variable name?",
        options: ["x", "total", "3name", "price"],
        correctOptionIndex: 2,
        order: 2,
      },
    ],
  });

  // 👥 Enrollments
  await prisma.enrollment.createMany({
    data: [
      { studentId: alice.id, courseId: mathCourse.id, status: EnrollmentStatus.ACTIVE },
      { studentId: alice.id, courseId: englishCourse.id, status: EnrollmentStatus.ACTIVE },
      { studentId: bob.id, courseId: mathCourse.id, status: EnrollmentStatus.ACTIVE },
    ],
  });

  // ✍️ Reviews
  await prisma.review.createMany({
    data: [
      { studentId: alice.id, courseId: mathCourse.id, rating: 5, comment: "Amazing course! Clear explanations." },
      { studentId: bob.id, courseId: mathCourse.id, rating: 4, comment: "Very helpful for my exams." },
    ],
  });

  // 🏆 Certificates (for completed courses — mock as completed)
  await prisma.certificate.create({
    data: {
      studentId: alice.id,
      courseId: mathCourse.id,
      certificateId: `cert-${alice.id}-${mathCourse.id}`,
    },
  });

  // 🎮 Gamification
  await prisma.userProgress.create({
    data: {
      userId: alice.id,
      totalXP: 250,
      currentLevel: 3,
      currentStreak: 5,
      longestStreak: 7,
    },
  });

  await prisma.xPActivity.createMany({
    data: [
      { userId: alice.id, amount: 100, reason: XPReason.COURSE_COMPLETE, sourceId: mathCourse.id },
      { userId: alice.id, amount: 50, reason: XPReason.LESSON_COMPLETE, sourceId: algebraLessons[0].id },
    ],
  });

  await prisma.badge.create({
    data: { userId: alice.id, type: BadgeType.FIRST_COURSE_COMPLETE },
  });

  // ⭐ Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        teacherId: teacher.id,
        studentName: "Alice Johnson",
        rating: 5,
        comment: "Dr. Wilson made algebra so easy to understand!",
        subject: "Mathematics",
      },
      {
        teacherId: teacher.id,
        studentName: "Bob Smith",
        rating: 4,
        comment: "Great teaching style and very patient.",
        subject: "Mathematics",
      },
    ],
  });

  // 📋 Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: staticAdmin.id,
      firebaseUid: staticAdmin.firebaseUid,
      eventType: "TEACHER_APPLICATION_APPROVE",
      action: "approve_teacher",
      resource: "user",
      ipAddress: "127.0.0.1",
      userAgent: "Node.js",
      success: true,
    },
  });

  // 🔒 Security Events
  await prisma.securityEvent.create({
    data: {
      userId: alice.id,
      firebaseUid: alice.firebaseUid,
      eventType: "NEW_DEVICE_LOGIN",
      riskLevel: "LOW",
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0...",
      deviceFingerprint: "device-alice-001",
      blocked: false,
    },
  });

  console.log("✅ Enhanced seed completed!");
  console.log(`- Admin: ${staticAdmin.email}`);
  console.log(`- Students: ${alice.email}, ${bob.email}`);
  console.log(`- Teacher: ${teacher.email}`);
  console.log(`- Courses: ${mathCourse.title}, ${englishCourse.title}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });