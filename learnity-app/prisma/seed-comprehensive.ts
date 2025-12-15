import { PrismaClient, UserRole, ApplicationStatus, Difficulty, CourseStatus, LessonType, XPReason, BadgeType, EnrollmentStatus, ProfileVisibility, RiskLevel, EventType, SecurityEventType } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: clean URLs
const cleanUrl = (url: string) => url.trim();

// Real educational videos
const educationalVideos = [
  { url: "https://www.youtube.com/embed/HEfHFsfGXjs", id: "HEfHFsfGXjs", duration: 480 },
  { url: "https://www.youtube.com/embed/riXcZT2ICjA", id: "riXcZT2ICjA", duration: 360 },
  { url: "https://www.youtube.com/embed/fNk_zzaMoSs", id: "fNk_zzaMoSs", duration: 600 },
  { url: "https://www.youtube.com/embed/YQHsXMglC9A", id: "YQHsXMglC9A", duration: 420 },
  { url: "https://www.youtube.com/embed/Ctc4tLOv4jQ", id: "Ctc4tLOv4jQ", duration: 540 },
];

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // 1. Ensure Admin Exists & Update Profile
  let admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        firebaseUid: "static-admin-uid-" + Date.now(),
        email: "admin@learnity.com",
        firstName: "System",
        lastName: "Administrator",
        role: UserRole.ADMIN,
        emailVerified: true,
        isActive: true,
        adminProfile: { create: { department: "Platform Management", isStatic: true } },
      },
    });
  }
  
  // Update Admin Profile with full details
  await prisma.adminProfile.update({
    where: { userId: admin.id },
    data: {
      department: "Executive Administration",
      createdBy: "System Init",
    }
  });

  // 2. Ensure Teacher Exists & Populate ALL Profile Fields
  let teacher = await prisma.user.findFirst({ 
    where: { role: UserRole.TEACHER },
    include: { teacherProfile: true }
  });

  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        firebaseUid: "teacher-sarah-uid-" + Date.now(),
        email: "sarah.wilson@learnity.com",
        firstName: "Dr. Sarah",
        lastName: "Wilson",
        role: UserRole.TEACHER,
        emailVerified: true,
        isActive: true,
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        teacherProfile: {
          create: {
            applicationStatus: ApplicationStatus.APPROVED,
            qualifications: ["PhD Mathematics, MIT", "MEd Education, Stanford"],
            subjects: ["Mathematics", "Calculus", "Algebra", "SAT Prep"],
            experience: 10,
            approvedBy: admin.id,
          },
        },
      },
      include: { teacherProfile: true }
    });
  }

  // Update Teacher Profile with comprehensive data
  await prisma.teacherProfile.update({
    where: { userId: teacher.id },
    data: {
      // Basic Info
      bio: "Hello! I'm Dr. Sarah Wilson, and I'm passionate about making mathematics accessible and enjoyable for every student. With a Master's degree in Education and 10 years of experience teaching high school math, I specialize in Algebra I & II, Geometry, and SAT/ACT Math preparation. I hold an active state teaching certification in Mathematics and have successfully helped over 300 students improve their grades and confidence.",
      headline: "Certified & Engaging Math Tutor | Specializing in Algebra & Geometry for High School Success!",
      hourlyRate: 45.0,
      phone: "+1 (555) 123-4567",
      address: "123 Education Lane",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      zipCode: "94105",
      dateOfBirth: new Date("1985-06-15"),
      gender: "Female",
      
      // Professional Details
      rating: 4.9,
      reviewCount: 25,
      responseTime: "< 1 hour",
      availability: "Weekdays 4pm-8pm, Weekends 10am-2pm",
      languages: ["English", "Spanish"],
      timezone: "America/Los_Angeles",
      videoIntroUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
      
      // Teaching Details
      teachingStyle: "Interactive & Student-Centered",
      specialties: ["Calculus", "Algebra", "SAT Math", "Trigonometry"],
      certifications: ["National Board Certification", "Google Certified Educator"],
      education: ["PhD Mathematics, MIT", "MEd Education, Stanford"],
      
      // Enhanced Teaching Info
      teachingMethods: ["Flipped Classroom", "Inquiry-Based Learning", "Gamification", "Socratic Method"],
      ageGroups: ["Middle School (11-13)", "High School (14-18)", "College"],
      lessonTypes: ["One-on-One", "Group Sessions", "Homework Help"],
      onlineExperience: 5,
      technologySkills: ["Zoom", "Google Classroom", "GeoGebra", "Desmos", "Digital Whiteboards"],
      
      // Schedule
      availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
      preferredTimes: ["Afternoons", "Evenings"],
      minSessionLength: 30,
      maxSessionLength: 120,
      
      // Personal
      achievements: ["Teacher of the Year 2022", "Published Author in Math Education Journal"],
      teachingApproach: "My teaching philosophy centers on creating a supportive and interactive learning environment where students feel empowered to ask questions and explore complex concepts without intimidation. I believe that understanding the 'why' behind the 'how' is crucial.",
      personalInterests: ["Hiking", "Chess", "Coding"],
      hobbies: ["Baking", "Reading Sci-Fi"],
      
      // Social Links
      linkedinUrl: "https://linkedin.com/in/sarahwilson-math",
      twitterUrl: "https://twitter.com/sarahmath",
      websiteUrl: "https://sarahwilsonmath.com",
      youtubeUrl: "https://youtube.com/c/sarahwilsonmath",
      
      // Trust & Credibility
      trustBadges: ["Background Checked", "Degree Verified", "Top Rated Tutor"],
      whyChooseMe: ["Customized Learning Plans", "Patient & Encouraging", "Proven Track Record of Success"],
      
      // FAQs
      faqs: [
        { question: "What subjects do you teach?", answer: "I specialize in Mathematics, specifically Algebra, Calculus, and Geometry for high school and college students." },
        { question: "Do you offer trial sessions?", answer: "Yes, I offer a free 15-minute consultation to discuss your goals and see if we're a good fit." },
        { question: "What is your cancellation policy?", answer: "I require 24 hours notice for cancellations to avoid being charged for the session." }
      ],
      
      // Sample Lessons
      sampleLessons: [
        { title: "Introduction to Derivatives", description: "A 15-minute overview of the concept of derivatives using real-world examples.", duration: 15 },
        { title: "Solving Quadratic Equations", description: "Learn three different methods to solve quadratic equations.", duration: 20 }
      ],
      
      // Success Stories
      successStories: [
        { studentName: "Emily R.", achievement: "Improved SAT Math score by 150 points", subject: "SAT Prep" },
        { studentName: "Jason M.", achievement: "Went from failing to an A in AP Calculus", subject: "Calculus" }
      ],
      
      // Emergency Contact
      emergencyContactName: "John Wilson",
      emergencyContactPhone: "+1 (555) 987-6543",
      emergencyContactRelation: "Spouse",
      
      // Preferences
      communicationPreference: "Email",
      notificationSettings: { email: true, sms: false, push: true }
    }
  });

  // 3. Ensure Students Exist & Populate ALL Profile Fields
  const studentsData = [
    {
      uid: "student-charlie-uid",
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Brown",
      gradeLevel: "12th Grade",
      subjects: ["Calculus", "Physics", "Chemistry"],
      learningGoals: ["Score 5 on AP Calculus BC", "Get accepted to MIT", "Master Python programming"],
      interests: ["Robotics Club", "Sci-Fi Novels", "Video Game Development"],
      studyPreferences: ["Visual Learning", "Group Study", "Late Night"],
      bio: "Aspiring engineer passionate about robotics and space exploration. Currently preparing for college applications and AP exams.",
      visibility: ProfileVisibility.PUBLIC
    },
    {
      uid: "student-diana-uid",
      email: "diana@example.com",
      firstName: "Diana",
      lastName: "Prince",
      gradeLevel: "11th Grade",
      subjects: ["English", "History", "Art History"],
      learningGoals: ["Publish a short story", "Score 1500+ on SAT", "Improve public speaking"],
      interests: ["Creative Writing", "Museums", "Debate Club"],
      studyPreferences: ["Quiet Environment", "Morning Study", "Reading/Writing"],
      bio: "Literature enthusiast and aspiring writer. I love analyzing classic novels and participating in competitive debate.",
      visibility: ProfileVisibility.FRIENDS
    }
  ];

  for (const sData of studentsData) {
    let student = await prisma.user.findUnique({ where: { firebaseUid: sData.uid } });
    
    if (!student) {
      student = await prisma.user.create({
        data: {
          firebaseUid: sData.uid,
          email: sData.email,
          firstName: sData.firstName,
          lastName: sData.lastName,
          role: UserRole.STUDENT,
          emailVerified: true,
          isActive: true,
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sData.firstName}`,
          studentProfile: {
            create: {
              gradeLevel: sData.gradeLevel,
              subjects: sData.subjects,
            }
          }
        }
      });
    }

    // Update Student Profile with comprehensive data
    await prisma.studentProfile.update({
      where: { userId: student.id },
      data: {
        gradeLevel: sData.gradeLevel,
        subjects: sData.subjects,
        learningGoals: sData.learningGoals,
        interests: sData.interests,
        studyPreferences: sData.studyPreferences,
        bio: sData.bio,
        profileCompletionPercentage: 85,
        profileVisibility: sData.visibility,
        showEmail: false,
        showLearningGoals: true,
        showInterests: true,
        showProgress: true,
        allowMessages: true
      }
    });

    // Add Gamification Data
    const progress = await prisma.userProgress.upsert({
      where: { userId: student.id },
      create: {
        userId: student.id,
        totalXP: 1250,
        currentLevel: 5,
        currentStreak: 3,
        longestStreak: 12,
        lastActivityAt: new Date()
      },
      update: {
        totalXP: 1250,
        currentLevel: 5
      }
    });

    // Add Badges
    await prisma.badge.upsert({
      where: { userId_type: { userId: student.id, type: BadgeType.FIRST_COURSE_COMPLETE } },
      create: { userId: student.id, type: BadgeType.FIRST_COURSE_COMPLETE },
      update: {}
    });
  }

  // 4. Update Courses with Comprehensive Data
  const courses = await prisma.course.findMany();
  
  for (const course of courses) {
    await prisma.course.update({
      where: { id: course.id },
      data: {
        // Ensure these fields are populated
        thumbnailUrl: course.thumbnailUrl || `https://source.unsplash.com/random/800x600?${course.slug.split('-')[0]}`,
        price: course.isFree ? null : 49.99,
        whatsappGroupLink: "https://chat.whatsapp.com/sample-group-link",
        contactEmail: teacher.email,
        contactWhatsapp: "+15551234567",
        requireSequentialProgress: true,
      }
    });
  }

  // 5. Add Audit Logs & Security Events (for realism)
  const student = await prisma.user.findFirst({ where: { email: "charlie@example.com" } });
  if (student) {
    await prisma.auditLog.create({
      data: {
        userId: student.id,
        firebaseUid: student.firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        action: "login",
        resource: "auth",
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        success: true,
        metadata: { method: "email_password" }
      }
    });

    await prisma.securityEvent.create({
      data: {
        userId: student.id,
        firebaseUid: student.firebaseUid,
        eventType: SecurityEventType.NEW_DEVICE_LOGIN,
        riskLevel: RiskLevel.LOW,
        ipAddress: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        deviceFingerprint: "device-hash-12345",
        blocked: false
      }
    });
  }

  console.log("✅ Comprehensive seed completed! All columns populated.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
