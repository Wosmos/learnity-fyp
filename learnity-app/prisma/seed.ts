import { PrismaClient, UserRole, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning existing data...");
    await prisma.testimonial.deleteMany();
    await prisma.securityEvent.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create static admin user
  console.log("👤 Creating static admin user...");
  const staticAdmin = await prisma.user.create({
    data: {
      firebaseUid: "static-admin-uid-placeholder",
      email: process.env.STATIC_ADMIN_EMAIL || "admin@learnity.com",
      firstName: "System",
      lastName: "Administrator",
      role: UserRole.ADMIN,
      emailVerified: true,
      isActive: true,
      adminProfile: {
        create: {
          department: "Platform Management",
          isStatic: true,
        },
      },
    },
    include: {
      adminProfile: true,
    },
  });

  // Create sample student users
  console.log("🎓 Creating sample student users...");
  const student1 = await prisma.user.create({
    data: {
      firebaseUid: "student-1-uid-placeholder",
      email: "student1@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      role: UserRole.STUDENT,
      emailVerified: true,
      isActive: true,
      studentProfile: {
        create: {
          gradeLevel: "10th Grade",
          subjects: ["Mathematics", "Physics", "Chemistry"],
          learningGoals: ["Improve problem-solving skills", "Prepare for SATs"],
          interests: ["Science", "Technology", "Reading"],
          studyPreferences: ["Visual learning", "Group study"],
          profileCompletionPercentage: 85,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      firebaseUid: "student-2-uid-placeholder",
      email: "student2@example.com",
      firstName: "Bob",
      lastName: "Smith",
      role: UserRole.STUDENT,
      emailVerified: true,
      isActive: true,
      studentProfile: {
        create: {
          gradeLevel: "11th Grade",
          subjects: ["English", "History", "Art"],
          profileCompletionPercentage: 40,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  // Create sample approved teacher
  console.log("👨‍🏫 Creating sample approved teacher...");
  const approvedTeacher = await prisma.user.create({
    data: {
      firebaseUid: "teacher-1-uid-placeholder",
      email: "teacher1@example.com",
      firstName: "Dr. Sarah",
      lastName: "Wilson",
      role: UserRole.TEACHER,
      emailVerified: true,
      isActive: true,
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      teacherProfile: {
        create: {
          applicationStatus: ApplicationStatus.APPROVED,
          qualifications: [
            "PhD in Mathematics from MIT",
            "Certified Teaching Professional",
            "Advanced Pedagogy Certification",
          ],
          subjects: ["Mathematics", "Statistics", "Calculus", "Algebra"],
          experience: 10,
          bio: "Experienced mathematics teacher with a passion for helping students understand complex mathematical concepts. I specialize in making abstract ideas concrete and accessible through real-world applications and interactive learning methods.\n\nWith over a decade of teaching experience, I've helped hundreds of students achieve their academic goals, from improving grades to preparing for standardized tests and college admissions.",
          hourlyRate: 45.0,
          documents: [
            "https://example.com/cv.pdf",
            "https://example.com/certificates.pdf",
          ],
          approvedBy: staticAdmin.id,
          reviewedAt: new Date(),
          rating: 4.9,
          reviewCount: 127,
          responseTime: "within 1 hour",
          availability: "Available Mon-Fri, 2pm-8pm EST",
          languages: ["English", "Spanish", "French"],
          timezone: "America/New_York",
          videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          lessonsCompleted: 450,
          activeStudents: 28,
          teachingStyle: "Interactive & Student-Centered",
          specialties: ["SAT/ACT Prep", "AP Calculus", "Competition Math", "College Prep"],
          certifications: [
            "National Board Certification in Mathematics",
            "Google Certified Educator Level 2",
            "Advanced Placement Calculus Certified",
          ],
          education: [
            "PhD in Mathematics - MIT (2013)",
            "Master of Education - Harvard University (2010)",
            "BS in Mathematics - Stanford University (2008)",
          ],
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          preferredTimes: ["Morning (9am-12pm)", "Afternoon (2pm-5pm)", "Evening (6pm-8pm)"],
          headline: "MIT PhD | 450+ Students Taught | SAT/ACT Specialist",
          achievements: [
            "95% of students improved by 2+ grade levels",
            "Average SAT Math score improvement: 150 points",
            "50+ students admitted to Ivy League schools",
            "Featured in Education Weekly Magazine 2023",
            "Winner of 'Outstanding Educator Award' 2022",
            "Published author of 'Math Made Simple' textbook series",
          ],
          teachingApproach: "My teaching philosophy centers on building confidence through understanding. I believe every student can excel in mathematics when concepts are presented in a way that resonates with their learning style.\n\nI use a three-step approach:\n1. Assess & Understand - Identify knowledge gaps and learning preferences\n2. Build Foundation - Strengthen core concepts with interactive examples\n3. Apply & Master - Practice with real-world problems and exam strategies\n\nI incorporate technology, visual aids, and hands-on activities to make math engaging and accessible.",
          trustBadges: [
            "Verified Identity",
            "Background Check Completed",
            "Top 1% Educator",
            "Student Favorite",
            "Quick Responder",
            "Professional Certified",
          ],
          faqs: [
            {
              question: "What is your teaching style?",
              answer: "I use an interactive, student-centered approach that adapts to each learner's needs. I focus on building conceptual understanding rather than just memorization, using real-world examples and visual aids to make math engaging and accessible.",
            },
            {
              question: "How do you handle students who struggle with math anxiety?",
              answer: "I create a supportive, judgment-free environment where mistakes are learning opportunities. We start with confidence-building exercises and gradually tackle more challenging problems. Many of my students who once feared math now genuinely enjoy it!",
            },
            {
              question: "Do you provide homework help or full curriculum teaching?",
              answer: "I offer both! Whether you need help with specific homework problems, comprehensive subject tutoring, or test preparation, I can customize lessons to meet your exact needs.",
            },
            {
              question: "What materials do I need for lessons?",
              answer: "Just a notebook, pencil, and a stable internet connection! I provide all digital materials, practice problems, and resources. For advanced topics, I may recommend specific textbooks.",
            },
            {
              question: "How do you track student progress?",
              answer: "I maintain detailed progress reports, conduct regular assessments, and provide monthly feedback sessions with students and parents. You'll always know exactly where you stand and what we're working towards.",
            },
          ],
          sampleLessons: [
            {
              title: "Introduction to Calculus - Limits & Continuity",
              description: "Master the fundamental concepts of limits through interactive visualizations and real-world applications. Perfect for AP Calculus students or college prep.",
              duration: "60 minutes",
              level: "Advanced",
              topics: ["Limits", "Continuity", "Graphical Analysis"],
            },
            {
              title: "SAT Math Bootcamp - Problem-Solving Strategies",
              description: "Learn proven strategies to tackle SAT math questions efficiently. Covers algebra, geometry, and data analysis with practice from real SAT tests.",
              duration: "90 minutes",
              level: "Intermediate",
              topics: ["Test Strategies", "Time Management", "Common Pitfalls"],
            },
            {
              title: "Algebra Foundations - Equations & Inequalities",
              description: "Build a solid foundation in algebraic thinking. Learn to solve equations, work with inequalities, and apply algebra to word problems.",
              duration: "60 minutes",
              level: "Beginner",
              topics: ["Linear Equations", "Inequalities", "Word Problems"],
            },
          ],
          successStories: [
            {
              studentName: "Emily R.",
              achievement: "Improved SAT Math score from 580 to 750 in 3 months",
              subject: "SAT Prep",
              testimonial: "Dr. Wilson's teaching methods completely transformed my understanding of math. I went from dreading the SAT to feeling confident!",
            },
            {
              studentName: "Marcus T.",
              achievement: "Raised grade from C to A in AP Calculus",
              subject: "Calculus",
              testimonial: "The way she explains complex concepts makes everything click. Best investment in my education!",
            },
            {
              studentName: "Sophia L.",
              achievement: "Accepted to MIT with full scholarship",
              subject: "Competition Math",
              testimonial: "Dr. Wilson prepared me not just for exams, but for thinking like a mathematician. Forever grateful!",
            },
          ],
          whyChooseMe: [
            "10+ years of proven teaching excellence",
            "Personalized learning plans for every student",
            "Flexible scheduling including weekends",
            "Free progress reports and parent consultations",
            "Money-back guarantee if not satisfied",
            "Access to exclusive study materials and resources",
          ],
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  // Create sample pending teacher
  console.log("⏳ Creating sample pending teacher...");
  const pendingTeacher = await prisma.user.create({
    data: {
      firebaseUid: "teacher-2-uid-placeholder",
      email: "teacher2@example.com",
      firstName: "Michael",
      lastName: "Brown",
      role: UserRole.PENDING_TEACHER,
      emailVerified: true,
      isActive: true,
      teacherProfile: {
        create: {
          applicationStatus: ApplicationStatus.PENDING,
          qualifications: ["Master in Physics", "Teaching Certificate"],
          subjects: ["Physics", "Chemistry", "Science"],
          experience: 5,
          bio: "Physics teacher with 5 years of experience in high school education. I love making science fun and engaging for students through hands-on experiments and real-world applications.",
          hourlyRate: 35.0,
          documents: ["https://example.com/physics-cv.pdf"],
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  // Create sample audit logs
  console.log("📋 Creating sample audit logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        userId: staticAdmin.id,
        firebaseUid: staticAdmin.firebaseUid,
        eventType: "AUTH_LOGIN",
        action: "admin_login",
        resource: "admin_panel",
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        success: true,
        metadata: { loginMethod: "static_credentials" },
      },
      {
        userId: approvedTeacher.id,
        firebaseUid: approvedTeacher.firebaseUid,
        eventType: "TEACHER_APPLICATION_APPROVE",
        action: "approve_teacher",
        resource: "teacher_application",
        oldValues: { status: "PENDING" },
        newValues: { status: "APPROVED" },
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        success: true,
        metadata: { approvedBy: staticAdmin.id },
      },
      {
        userId: student1.id,
        firebaseUid: student1.firebaseUid,
        eventType: "AUTH_REGISTER",
        action: "student_registration",
        resource: "user_account",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        success: true,
        metadata: { registrationMethod: "email" },
      },
    ],
  });

  // Create testimonials for approved teacher
  console.log("⭐ Creating testimonials...");
  await prisma.testimonial.createMany({
    data: [
      {
        teacherId: approvedTeacher.id,
        studentName: "Emily Rodriguez",
        rating: 5,
        comment: "Dr. Wilson is an exceptional teacher! She helped me improve my SAT Math score by 150 points. Her teaching methods are clear, engaging, and effective. Highly recommend!",
        subject: "SAT Prep",
        isVerified: true,
      },
      {
        teacherId: approvedTeacher.id,
        studentName: "Marcus Thompson",
        rating: 5,
        comment: "Best math tutor I've ever had. She explains complex calculus concepts in ways that actually make sense. My grade went from C to A in just two months!",
        subject: "AP Calculus",
        isVerified: true,
      },
      {
        teacherId: approvedTeacher.id,
        studentName: "Sophia Lee",
        rating: 5,
        comment: "Dr. Wilson's passion for mathematics is contagious. She helped me prepare for math competitions and I got accepted to MIT! Forever grateful for her guidance.",
        subject: "Competition Math",
        isVerified: true,
      },
      {
        teacherId: approvedTeacher.id,
        studentName: "James Parker",
        rating: 5,
        comment: "Incredibly patient and knowledgeable. She made algebra fun and easy to understand. My confidence in math has skyrocketed!",
        subject: "Algebra",
        isVerified: true,
      },
      {
        teacherId: approvedTeacher.id,
        studentName: "Olivia Chen",
        rating: 4,
        comment: "Great teacher with excellent materials. Very responsive and flexible with scheduling. Would definitely recommend to anyone struggling with math.",
        subject: "Statistics",
        isVerified: true,
      },
    ],
  });

  // Create sample security events
  console.log("🔒 Creating sample security events...");
  await prisma.securityEvent.createMany({
    data: [
      {
        userId: student1.id,
        firebaseUid: student1.firebaseUid,
        eventType: "NEW_DEVICE_LOGIN",
        riskLevel: "LOW",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        deviceFingerprint: "mobile-device-123",
        blocked: false,
        metadata: { deviceType: "mobile", newDevice: true },
      },
      {
        eventType: "MULTIPLE_FAILED_ATTEMPTS",
        riskLevel: "MEDIUM",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        deviceFingerprint: "suspicious-device-456",
        blocked: true,
        reason: "Multiple failed login attempts from same IP",
        metadata: { attemptCount: 5, timeWindow: "5 minutes" },
      },
    ],
  });

  console.log("✅ Database seed completed successfully!");
  console.log(`Created users:`);
  console.log(`- Static Admin: ${staticAdmin.email}`);
  console.log(`- Student 1: ${student1.email}`);
  console.log(`- Student 2: ${student2.email}`);
  console.log(`- Approved Teacher: ${approvedTeacher.email}`);
  console.log(`- Pending Teacher: ${pendingTeacher.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
