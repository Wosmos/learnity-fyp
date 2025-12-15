import { PrismaClient, UserRole, ApplicationStatus, Difficulty, CourseStatus, LessonType, XPReason, BadgeType, EnrollmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: clean URLs (remove trailing spaces)
const cleanUrl = (url: string) => url.trim();

// Sample avatars
const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
];

// Educational YouTube videos (real examples)
const educationalVideos = [
  { url: "https://www.youtube.com/embed/HEfHFsfGXjs", id: "HEfHFsfGXjs", duration: 480 }, // Math intro
  { url: "https://www.youtube.com/embed/riXcZT2ICjA", id: "riXcZT2ICjA", duration: 360 }, // Algebra basics
  { url: "https://www.youtube.com/embed/fNk_zzaMoSs", id: "fNk_zzaMoSs", duration: 600 }, // Calculus
  { url: "https://www.youtube.com/embed/YQHsXMglC9A", id: "YQHsXMglC9A", duration: 420 }, // English grammar
  { url: "https://www.youtube.com/embed/Ctc4tLOv4jQ", id: "Ctc4tLOv4jQ", duration: 540 }, // Essay writing
];

async function main() {
  console.log("🌱 Adding sample data to database (preserving existing data)...");

  // Get existing teacher or use the one from base seed
  let teacher = await prisma.user.findFirst({
    where: { 
      role: UserRole.TEACHER,
      teacherProfile: {
        applicationStatus: ApplicationStatus.APPROVED
      }
    },
    include: { teacherProfile: true }
  });

  // If no teacher exists, we need the admin to approve
  let staticAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN }
  });

  if (!staticAdmin) {
    console.log("⚠️ No admin found. Creating one...");
    staticAdmin = await prisma.user.create({
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

  if (!teacher) {
    console.log("⚠️ No approved teacher found. Creating one...");
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
            bio: "Passionate math educator with 10+ years experience teaching high school and college students.",
            hourlyRate: 45.0,
            approvedBy: staticAdmin.id,
            reviewedAt: new Date(),
            rating: 4.9,
            reviewCount: 25,
            lessonsCompleted: 250,
            activeStudents: 18,
          },
        },
      },
      include: { teacherProfile: true }
    });
  }

  // 🎓 Create additional students (only if they don't exist)
  const studentsData = [
    {
      uid: "student-charlie-uid",
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Brown",
      gradeLevel: "12th Grade",
      subjects: ["Calculus", "Physics", "Chemistry"],
      learningGoals: ["College prep", "AP Exams", "Scholarship applications"],
      interests: ["STEM", "Robotics"],
    },
    {
      uid: "student-diana-uid",
      email: "diana@example.com",
      firstName: "Diana",
      lastName: "Prince",
      gradeLevel: "11th Grade",
      subjects: ["English", "Literature", "Writing"],
      learningGoals: ["Improve writing", "SAT prep"],
      interests: ["Reading", "Creative Writing"],
    },
    {
      uid: "student-emma-uid",
      email: "emma@example.com",
      firstName: "Emma",
      lastName: "Watson",
      gradeLevel: "10th Grade",
      subjects: ["Mathematics", "Computer Science"],
      learningGoals: ["Learn programming", "Math mastery"],
      interests: ["Technology", "Gaming"],
    },
  ];

  const students = [];
  for (const studentData of studentsData) {
    let student = await prisma.user.findUnique({
      where: { firebaseUid: studentData.uid }
    });

    if (!student) {
      student = await prisma.user.create({
        data: {
          firebaseUid: studentData.uid,
          email: studentData.email,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          role: UserRole.STUDENT,
          emailVerified: true,
          isActive: true,
          profilePicture: avatars[students.length % avatars.length],
          studentProfile: {
            create: {
              gradeLevel: studentData.gradeLevel,
              subjects: studentData.subjects,
              learningGoals: studentData.learningGoals,
              interests: studentData.interests,
              profileCompletionPercentage: 75 + (students.length * 5),
            },
          },
        },
      });
      console.log(`✅ Created student: ${student.email}`);
    }
    students.push(student);
  }

  // 📂 Create categories (if they don't exist)
  const categories = [];
  const categoryData = [
    { name: "Mathematics", slug: "mathematics", description: "Math courses for all levels" },
    { name: "English", slug: "english", description: "Language & Literature courses" },
    { name: "Science", slug: "science", description: "Physics, Chemistry, Biology courses" },
    { name: "Computer Science", slug: "computer-science", description: "Programming and CS fundamentals" },
  ];

  for (const catData of categoryData) {
    let category = await prisma.category.findUnique({
      where: { slug: catData.slug }
    });

    if (!category) {
      category = await prisma.category.create({
        data: catData
      });
      console.log(`✅ Created category: ${category.name}`);
    }
    categories.push(category);
  }

  const [mathCat, englishCat, scienceCat, csCat] = categories;

  // 📘 Create comprehensive courses
  const coursesData = [
    {
      slug: "advanced-calculus-mastery",
      title: "Advanced Calculus Mastery",
      description: "Master differential and integral calculus with in-depth explanations and real-world applications.",
      category: mathCat,
      difficulty: Difficulty.ADVANCED,
      status: CourseStatus.PUBLISHED,
      tags: ["calculus", "mathematics", "advanced"],
      sections: [
        {
          title: "Limits and Continuity",
          lessons: [
            { title: "Introduction to Limits", type: LessonType.VIDEO, video: educationalVideos[0] },
            { title: "Evaluating Limits", type: LessonType.VIDEO, video: educationalVideos[1] },
            { title: "Limits Quiz", type: LessonType.QUIZ, quiz: {
              title: "Limits Fundamentals",
              questions: [
                {
                  question: "What is the limit of f(x) = x² as x approaches 2?",
                  options: ["2", "4", "8", "undefined"],
                  correctIndex: 1,
                },
                {
                  question: "A function is continuous if...",
                  options: ["It has no breaks", "Limit equals function value", "Both A and B", "Neither"],
                  correctIndex: 2,
                }
              ]
            }},
          ]
        },
        {
          title: "Derivatives",
          lessons: [
            { title: "What are Derivatives?", type: LessonType.VIDEO, video: educationalVideos[2] },
            { title: "Power Rule and Chain Rule", type: LessonType.VIDEO, video: educationalVideos[0] },
          ]
        }
      ]
    },
    {
      slug: "algebra-foundations",
      title: "Algebra Foundations",
      description: "Build a rock-solid foundation in algebra from variables to quadratic equations.",
      category: mathCat,
      difficulty: Difficulty.BEGINNER,
      status: CourseStatus.PUBLISHED,
      tags: ["algebra", "basics", "mathematics"],
      sections: [
        {
          title: "Variables and Expressions",
          lessons: [
            { title: "What is Algebra?", type: LessonType.VIDEO, video: educationalVideos[1] },
            { title: "Working with Variables", type: LessonType.VIDEO, video: educationalVideos[0] },
          ]
        },
        {
          title: "Linear Equations",
          lessons: [
            { title: "Solving Linear Equations", type: LessonType.VIDEO, video: educationalVideos[1] },
            { title: "Word Problems", type: LessonType.VIDEO, video: educationalVideos[2] },
          ]
        }
      ]
    },
    {
      slug: "essay-writing-excellence",
      title: "Essay Writing Excellence",
      description: "Learn to write compelling, structured essays that impress teachers and examiners.",
      category: englishCat,
      difficulty: Difficulty.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      tags: ["writing", "essays", "english"],
      sections: [
        {
          title: "Essay Structure",
          lessons: [
            { title: "Introduction to Essays", type: LessonType.VIDEO, video: educationalVideos[3] },
            { title: "Thesis Statements", type: LessonType.VIDEO, video: educationalVideos[4] },
          ]
        }
      ]
    },
    {
      slug: "physics-mechanics-draft",
      title: "Physics: Mechanics (Work in Progress)",
      description: "Introduction to classical mechanics - Newton's laws and motion.",
      category: scienceCat,
      difficulty: Difficulty.INTERMEDIATE,
      status: CourseStatus.DRAFT,
      tags: ["physics", "mechanics", "science"],
      sections: [
        {
          title: "Forces and Motion",
          lessons: [
            { title: "Newton's First Law", type: LessonType.VIDEO, video: educationalVideos[0] },
          ]
        }
      ]
    },
  ];

  const createdCourses = [];
  for (const courseData of coursesData) {
    // Check if course already exists
    let course = await prisma.course.findUnique({
      where: { slug: courseData.slug }
    });

    if (course) {
      console.log(`⏭️  Course already exists: ${courseData.title}`);
      createdCourses.push(course);
      continue;
    }

    // Create course
    course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        teacherId: teacher!.id,
        categoryId: courseData.category.id,
        difficulty: courseData.difficulty,
        tags: courseData.tags,
        status: courseData.status,
        publishedAt: courseData.status === CourseStatus.PUBLISHED ? new Date() : null,
      },
    });

    console.log(`✅ Created course: ${course.title}`);

    // Create sections and lessons
    for (let sIndex = 0; sIndex < courseData.sections.length; sIndex++) {
      const sectionData = courseData.sections[sIndex];
      
      const section = await prisma.section.create({
        data: {
          courseId: course.id,
          title: sectionData.title,
          order: sIndex + 1,
        },
      });

      for (let lIndex = 0; lIndex < sectionData.lessons.length; lIndex++) {
        const lessonData = sectionData.lessons[lIndex];
        
        const lesson = await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: lessonData.title,
            type: lessonData.type,
            youtubeUrl: lessonData.video ? cleanUrl(lessonData.video.url) : null,
            youtubeId: lessonData.video?.id,
            duration: lessonData.video?.duration || 0,
            order: lIndex + 1,
          },
        });

        // Create quiz if lesson has one
        if (lessonData.type === LessonType.QUIZ && 'quiz' in lessonData && lessonData.quiz) {
          const quiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              title: lessonData.quiz.title,
              passingScore: 70,
            },
          });

          // Create questions
          for (let qIndex = 0; qIndex < lessonData.quiz.questions.length; qIndex++) {
            const q = lessonData.quiz.questions[qIndex];
            await prisma.question.create({
              data: {
                quizId: quiz.id,
                question: q.question,
                options: q.options,
                correctOptionIndex: q.correctIndex,
                order: qIndex + 1,
              },
            });
          }
        }
      }
    }

    // Update course counts
    const lessonCount = await prisma.lesson.count({
      where: {
        section: {
          courseId: course.id
        }
      }
    });

    const totalDuration = await prisma.lesson.aggregate({
      where: {
        section: {
          courseId: course.id
        }
      },
      _sum: {
        duration: true
      }
    });

    await prisma.course.update({
      where: { id: course.id },
      data: {
        lessonCount,
        totalDuration: totalDuration._sum.duration || 0,
      }
    });

    createdCourses.push(course);
  }

  // 👥 Create enrollments
  console.log("📝 Creating enrollments...");
  const publishedCourses = createdCourses.filter(c => c.status === CourseStatus.PUBLISHED);
  
  for (const student of students) {
    // Enroll each student in 1-2 random courses
    const numEnrollments = Math.floor(Math.random() * 2) + 1;
    const selectedCourses = publishedCourses.slice(0, numEnrollments);
    
    for (const course of selectedCourses) {
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id
          }
        }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            status: EnrollmentStatus.ACTIVE,
            progress: Math.floor(Math.random() * 60) + 10, // 10-70% progress
          },
        });

        // Update enrollment count
        await prisma.course.update({
          where: { id: course.id },
          data: {
            enrollmentCount: {
              increment: 1
            }
          }
        });
      }
    }
  }

  // ✍️ Add reviews
  console.log("⭐ Adding reviews...");
  for (const course of publishedCourses) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      take: 2, // Review from 2 students per course
    });

    for (const enrollment of enrollments) {
      const existing = await prisma.review.findUnique({
        where: {
          studentId_courseId: {
            studentId: enrollment.studentId,
            courseId: course.id
          }
        }
      });

      if (!existing) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const comments = [
          "Excellent course! Very clear explanations.",
          "Great teacher, learned a lot!",
          "Perfect pacing and well-structured.",
          "Exactly what I needed for my exams.",
        ];

        await prisma.review.create({
          data: {
            studentId: enrollment.studentId,
            courseId: course.id,
            rating,
            comment: comments[Math.floor(Math.random() * comments.length)],
          },
        });

        // Update course rating
        const reviews = await prisma.review.findMany({
          where: { courseId: course.id }
        });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await prisma.course.update({
          where: { id: course.id },
          data: {
            averageRating: avgRating,
            reviewCount: reviews.length,
          }
        });
      }
    }
  }

  console.log("✅ Sample data added successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Teacher: ${teacher!.email}`);
  console.log(`   - Students: ${students.length} (${students.map(s => s.email).join(', ')})`);
  console.log(`   - Courses: ${createdCourses.length}`);
  console.log(`   - Published courses: ${publishedCourses.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
