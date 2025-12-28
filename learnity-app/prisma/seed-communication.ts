/**
 * Seed Script for Communication Features
 * Creates sample users, courses, enrollments, and course rooms
 * 
 * Run with: npx tsx prisma/seed-communication.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting communication seed...\n');

  // Create Categories if not exist
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        description: 'Learn to code with various programming languages',
        icon: '💻',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Master mathematical concepts',
        icon: '📐',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'science' },
      update: {},
      create: {
        name: 'Science',
        slug: 'science',
        description: 'Explore scientific discoveries',
        icon: '🔬',
      },
    }),
  ]);
  console.log(`   ✅ Created ${categories.length} categories\n`);

  // Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.teacher@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'teacher_john_001',
        email: 'john.teacher@learnity.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'TEACHER',
        emailVerified: true,
        isActive: true,
        teacherProfile: {
          create: {
            applicationStatus: 'APPROVED',
            qualifications: ['PhD Computer Science', 'MSc Software Engineering'],
            subjects: ['Python', 'JavaScript', 'Web Development'],
            experience: 8,
            bio: 'Passionate educator with 8 years of experience in software development and teaching.',
            rating: 4.8,
            reviewCount: 45,
            lessonsCompleted: 320,
            activeStudents: 24,
          },
        },
      },
      include: { teacherProfile: true },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.teacher@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'teacher_sarah_002',
        email: 'sarah.teacher@learnity.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'TEACHER',
        emailVerified: true,
        isActive: true,
        teacherProfile: {
          create: {
            applicationStatus: 'APPROVED',
            qualifications: ['MSc Mathematics', 'Teaching Certificate'],
            subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
            experience: 6,
            bio: 'Making math accessible and fun for everyone!',
            rating: 4.9,
            reviewCount: 67,
            lessonsCompleted: 450,
            activeStudents: 32,
          },
        },
      },
      include: { teacherProfile: true },
    }),
    prisma.user.upsert({
      where: { email: 'mike.teacher@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'teacher_mike_003',
        email: 'mike.teacher@learnity.com',
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'TEACHER',
        emailVerified: true,
        isActive: true,
        teacherProfile: {
          create: {
            applicationStatus: 'APPROVED',
            qualifications: ['PhD Physics', 'Research Fellow'],
            subjects: ['Physics', 'Quantum Mechanics', 'Astronomy'],
            experience: 10,
            bio: 'Former NASA researcher now dedicated to teaching the wonders of physics.',
            rating: 4.7,
            reviewCount: 38,
            lessonsCompleted: 280,
            activeStudents: 18,
          },
        },
      },
      include: { teacherProfile: true },
    }),
  ]);
  console.log(`   ✅ Created ${teachers.length} teachers\n`);

  // Create Students
  console.log('👨‍🎓 Creating students...');
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice.student@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'student_alice_001',
        email: 'alice.student@learnity.com',
        firstName: 'Alice',
        lastName: 'Williams',
        role: 'STUDENT',
        emailVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            gradeLevel: 'University',
            subjects: ['Programming', 'Mathematics'],
            learningGoals: ['Learn Python', 'Build web apps'],
            profileCompletionPercentage: 80,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.student@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'student_bob_002',
        email: 'bob.student@learnity.com',
        firstName: 'Bob',
        lastName: 'Davis',
        role: 'STUDENT',
        emailVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            gradeLevel: 'High School',
            subjects: ['Mathematics', 'Physics'],
            learningGoals: ['Prepare for college', 'Master calculus'],
            profileCompletionPercentage: 65,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol.student@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'student_carol_003',
        email: 'carol.student@learnity.com',
        firstName: 'Carol',
        lastName: 'Martinez',
        role: 'STUDENT',
        emailVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            gradeLevel: 'University',
            subjects: ['Science', 'Programming'],
            learningGoals: ['Career change to tech', 'Learn data science'],
            profileCompletionPercentage: 90,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'david.student@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'student_david_004',
        email: 'david.student@learnity.com',
        firstName: 'David',
        lastName: 'Brown',
        role: 'STUDENT',
        emailVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            gradeLevel: 'Professional',
            subjects: ['Programming'],
            learningGoals: ['Upskill in web development'],
            profileCompletionPercentage: 55,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'emma.student@learnity.com' },
      update: {},
      create: {
        firebaseUid: 'student_emma_005',
        email: 'emma.student@learnity.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'STUDENT',
        emailVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            gradeLevel: 'High School',
            subjects: ['Mathematics', 'Science'],
            learningGoals: ['Ace SAT', 'Get into MIT'],
            profileCompletionPercentage: 75,
          },
        },
      },
    }),
  ]);
  console.log(`   ✅ Created ${students.length} students\n`);

  // Create Courses
  console.log('📚 Creating courses...');
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { slug: 'python-fundamentals' },
      update: {},
      create: {
        title: 'Python Fundamentals',
        slug: 'python-fundamentals',
        description: 'Learn Python from scratch. Perfect for beginners who want to start their programming journey.',
        teacherId: teachers[0].id,
        categoryId: categories[0].id,
        difficulty: 'BEGINNER',
        tags: ['python', 'programming', 'beginner'],
        status: 'PUBLISHED',
        isFree: true,
        totalDuration: 7200,
        lessonCount: 12,
        enrollmentCount: 3,
        averageRating: 4.8,
        reviewCount: 15,
        publishedAt: new Date(),
      },
    }),
    prisma.course.upsert({
      where: { slug: 'advanced-javascript' },
      update: {},
      create: {
        title: 'Advanced JavaScript',
        slug: 'advanced-javascript',
        description: 'Master advanced JavaScript concepts including async/await, closures, and modern ES6+ features.',
        teacherId: teachers[0].id,
        categoryId: categories[0].id,
        difficulty: 'ADVANCED',
        tags: ['javascript', 'programming', 'advanced'],
        status: 'PUBLISHED',
        isFree: false,
        price: 49.99,
        totalDuration: 10800,
        lessonCount: 18,
        enrollmentCount: 2,
        averageRating: 4.9,
        reviewCount: 8,
        publishedAt: new Date(),
      },
    }),
    prisma.course.upsert({
      where: { slug: 'calculus-mastery' },
      update: {},
      create: {
        title: 'Calculus Mastery',
        slug: 'calculus-mastery',
        description: 'Complete calculus course covering limits, derivatives, integrals, and applications.',
        teacherId: teachers[1].id,
        categoryId: categories[1].id,
        difficulty: 'INTERMEDIATE',
        tags: ['calculus', 'mathematics', 'college'],
        status: 'PUBLISHED',
        isFree: true,
        totalDuration: 14400,
        lessonCount: 24,
        enrollmentCount: 4,
        averageRating: 4.9,
        reviewCount: 22,
        publishedAt: new Date(),
      },
    }),
    prisma.course.upsert({
      where: { slug: 'quantum-physics-intro' },
      update: {},
      create: {
        title: 'Introduction to Quantum Physics',
        slug: 'quantum-physics-intro',
        description: 'Explore the fascinating world of quantum mechanics. No prior physics knowledge required.',
        teacherId: teachers[2].id,
        categoryId: categories[2].id,
        difficulty: 'INTERMEDIATE',
        tags: ['physics', 'quantum', 'science'],
        status: 'PUBLISHED',
        isFree: true,
        totalDuration: 9000,
        lessonCount: 15,
        enrollmentCount: 2,
        averageRating: 4.7,
        reviewCount: 12,
        publishedAt: new Date(),
      },
    }),
  ]);
  console.log(`   ✅ Created ${courses.length} courses\n`);

  // Create Enrollments
  console.log('📝 Creating enrollments...');
  const enrollments = await Promise.all([
    // Python course enrollments
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[0].id, courseId: courses[0].id } },
      update: {},
      create: { studentId: students[0].id, courseId: courses[0].id, progress: 75, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[2].id, courseId: courses[0].id } },
      update: {},
      create: { studentId: students[2].id, courseId: courses[0].id, progress: 45, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[3].id, courseId: courses[0].id } },
      update: {},
      create: { studentId: students[3].id, courseId: courses[0].id, progress: 30, status: 'ACTIVE' },
    }),
    // JavaScript course enrollments
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[0].id, courseId: courses[1].id } },
      update: {},
      create: { studentId: students[0].id, courseId: courses[1].id, progress: 20, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[3].id, courseId: courses[1].id } },
      update: {},
      create: { studentId: students[3].id, courseId: courses[1].id, progress: 60, status: 'ACTIVE' },
    }),
    // Calculus course enrollments
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[1].id, courseId: courses[2].id } },
      update: {},
      create: { studentId: students[1].id, courseId: courses[2].id, progress: 85, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[4].id, courseId: courses[2].id } },
      update: {},
      create: { studentId: students[4].id, courseId: courses[2].id, progress: 50, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[0].id, courseId: courses[2].id } },
      update: {},
      create: { studentId: students[0].id, courseId: courses[2].id, progress: 35, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[2].id, courseId: courses[2].id } },
      update: {},
      create: { studentId: students[2].id, courseId: courses[2].id, progress: 15, status: 'ACTIVE' },
    }),
    // Physics course enrollments
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[1].id, courseId: courses[3].id } },
      update: {},
      create: { studentId: students[1].id, courseId: courses[3].id, progress: 40, status: 'ACTIVE' },
    }),
    prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: students[4].id, courseId: courses[3].id } },
      update: {},
      create: { studentId: students[4].id, courseId: courses[3].id, progress: 25, status: 'ACTIVE' },
    }),
  ]);
  console.log(`   ✅ Created ${enrollments.length} enrollments\n`);

  // Create Course Rooms (without actual 100ms/GetStream - just DB records)
  console.log('🏠 Creating course rooms...');
  const courseRooms = await Promise.all(
    courses.map((course) =>
      prisma.courseRoom.upsert({
        where: { courseId: course.id },
        update: {},
        create: {
          courseId: course.id,
          hmsRoomName: `course-${course.id}`,
          streamChannelId: `course_${course.id}`,
          chatEnabled: true,
          videoEnabled: true,
        },
      })
    )
  );
  console.log(`   ✅ Created ${courseRooms.length} course rooms\n`);

  // Create sample live sessions
  console.log('📹 Creating live sessions...');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  const sessions = await Promise.all([
    prisma.liveSession.create({
      data: {
        courseRoomId: courseRooms[0].id,
        hostId: teachers[0].id,
        title: 'Python Q&A Session',
        description: 'Live Q&A for Python Fundamentals students',
        scheduledAt: tomorrow,
        duration: 60,
        status: 'SCHEDULED',
        maxParticipants: 50,
      },
    }),
    prisma.liveSession.create({
      data: {
        courseRoomId: courseRooms[2].id,
        hostId: teachers[1].id,
        title: 'Calculus Problem Solving',
        description: 'Work through challenging calculus problems together',
        scheduledAt: nextWeek,
        duration: 90,
        status: 'SCHEDULED',
        maxParticipants: 30,
      },
    }),
  ]);
  console.log(`   ✅ Created ${sessions.length} live sessions\n`);

  // Summary
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Teachers: ${teachers.length}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Courses: ${courses.length}`);
  console.log(`   - Enrollments: ${enrollments.length}`);
  console.log(`   - Course Rooms: ${courseRooms.length}`);
  console.log(`   - Live Sessions: ${sessions.length}`);
  console.log('\n🔑 Test Accounts:');
  console.log('   Teachers:');
  teachers.forEach((t) => console.log(`     - ${t.email} (Firebase UID: ${t.firebaseUid})`));
  console.log('   Students:');
  students.forEach((s) => console.log(`     - ${s.email} (Firebase UID: ${s.firebaseUid})`));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
