import { PrismaClient, UserRole, ApplicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning existing data...");
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
      teacherProfile: {
        create: {
          applicationStatus: ApplicationStatus.APPROVED,
          qualifications: [
            "PhD in Mathematics",
            "Teaching Certificate",
            "10 years experience",
          ],
          subjects: ["Mathematics", "Statistics", "Calculus"],
          experience: 10,
          bio: "Experienced mathematics teacher with a passion for helping students understand complex mathematical concepts. I specialize in making abstract ideas concrete and accessible.",
          hourlyRate: 45.0,
          documents: [
            "https://example.com/cv.pdf",
            "https://example.com/certificates.pdf",
          ],
          approvedBy: staticAdmin.id,
          reviewedAt: new Date(),
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
