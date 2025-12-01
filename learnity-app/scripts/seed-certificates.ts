/**
 * Seed Certificates Script
 * Generates test certificates for existing courses and students
 * 
 * Usage: npx tsx scripts/seed-certificates.ts
 */

import { PrismaClient, EnrollmentStatus, BadgeType, XPReason } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

/**
 * Generate a unique certificate ID
 */
function generateCertificateId(): string {
  const uuid = randomUUID().replace(/-/g, '').toUpperCase();
  return `CERT-${uuid.substring(0, 8)}-${uuid.substring(8, 12)}`;
}

/**
 * Main seed function
 */
async function main() {
  console.log('🎓 Starting certificate seeding...\n');

  try {
    // Get all students
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`✅ Found ${students.length} students\n`);

    // Get all published courses with their lessons and quizzes
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                quiz: true,
              },
            },
          },
        },
      },
    });

    if (courses.length === 0) {
      console.log('❌ No published courses found in database');
      return;
    }

    console.log(`✅ Found ${courses.length} published courses\n`);

    let certificatesCreated = 0;
    let enrollmentsCreated = 0;

    // For each student, create enrollments and certificates for some courses
    for (const student of students) {
      console.log(`\n👤 Processing student: ${student.firstName} ${student.lastName}`);

      // Randomly select 1-3 courses for this student
      const numCourses = Math.min(Math.floor(Math.random() * 3) + 1, courses.length);
      const selectedCourses = courses
        .sort(() => Math.random() - 0.5)
        .slice(0, numCourses);

      for (const course of selectedCourses) {
        try {
          // Check if enrollment exists
          let enrollment = await prisma.enrollment.findUnique({
            where: {
              studentId_courseId: {
                studentId: student.id,
                courseId: course.id,
              },
            },
          });

          // Create enrollment if it doesn't exist
          if (!enrollment) {
            enrollment = await prisma.enrollment.create({
              data: {
                studentId: student.id,
                courseId: course.id,
                status: EnrollmentStatus.COMPLETED,
                progress: 100,
                completedAt: new Date(),
                enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              },
            });
            enrollmentsCreated++;
            console.log(`  ✅ Created enrollment for: ${course.title}`);
          } else if (enrollment.status !== EnrollmentStatus.COMPLETED) {
            // Update existing enrollment to completed
            enrollment = await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: {
                status: EnrollmentStatus.COMPLETED,
                progress: 100,
                completedAt: new Date(),
              },
            });
            console.log(`  ✅ Updated enrollment to completed for: ${course.title}`);
          }

          // Get all lessons for this course
          const allLessons = course.sections.flatMap(s => s.lessons);
          const allLessonIds = allLessons.map(l => l.id);

          // Mark all lessons as completed
          for (const lessonId of allLessonIds) {
            const existingProgress = await prisma.lessonProgress.findUnique({
              where: {
                studentId_lessonId: {
                  studentId: student.id,
                  lessonId: lessonId,
                },
              },
            });

            if (!existingProgress) {
              await prisma.lessonProgress.create({
                data: {
                  studentId: student.id,
                  lessonId: lessonId,
                  completed: true,
                  completedAt: new Date(),
                  watchedSeconds: 300, // 5 minutes
                  lastPosition: 300,
                },
              });
            } else if (!existingProgress.completed) {
              await prisma.lessonProgress.update({
                where: { id: existingProgress.id },
                data: {
                  completed: true,
                  completedAt: new Date(),
                },
              });
            }
          }

          // Pass all quizzes
          const allQuizzes = allLessons.filter(l => l.quiz).map(l => l.quiz!);
          for (const quiz of allQuizzes) {
            const existingAttempt = await prisma.quizAttempt.findFirst({
              where: {
                studentId: student.id,
                quizId: quiz.id,
                passed: true,
              },
            });

            if (!existingAttempt) {
              await prisma.quizAttempt.create({
                data: {
                  studentId: student.id,
                  quizId: quiz.id,
                  score: 85,
                  passed: true,
                  answers: [],
                  timeTaken: 300,
                },
              });
            }
          }

          // Check if certificate already exists
          const existingCertificate = await prisma.certificate.findUnique({
            where: {
              studentId_courseId: {
                studentId: student.id,
                courseId: course.id,
              },
            },
          });

          if (existingCertificate) {
            console.log(`  ⏭️  Certificate already exists for: ${course.title}`);
            console.log(`     Certificate ID: ${existingCertificate.certificateId}`);
            continue;
          }

          // Generate certificate
          const certificateId = generateCertificateId();

          await prisma.certificate.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              certificateId: certificateId,
              issuedAt: new Date(),
            },
          });

          certificatesCreated++;
          console.log(`  🎓 Created certificate for: ${course.title}`);
          console.log(`     Certificate ID: ${certificateId}`);

          // Award XP
          let userProgress = await prisma.userProgress.findUnique({
            where: { userId: student.id },
          });

          if (!userProgress) {
            userProgress = await prisma.userProgress.create({
              data: {
                userId: student.id,
                totalXP: 50,
                currentLevel: 1,
                currentStreak: 0,
                longestStreak: 0,
                lastActivityAt: new Date(),
              },
            });
          } else {
            await prisma.userProgress.update({
              where: { userId: student.id },
              data: {
                totalXP: { increment: 50 },
                lastActivityAt: new Date(),
              },
            });
          }

          // Log XP activity
          await prisma.xPActivity.create({
            data: {
              userId: student.id,
              amount: 50,
              reason: XPReason.COURSE_COMPLETE,
              sourceId: course.id,
            },
          });

          // Award first completion badge if this is their first certificate
          const certificateCount = await prisma.certificate.count({
            where: { studentId: student.id },
          });

          if (certificateCount === 1) {
            const existingBadge = await prisma.badge.findUnique({
              where: {
                userId_type: {
                  userId: student.id,
                  type: BadgeType.FIRST_COURSE_COMPLETE,
                },
              },
            });

            if (!existingBadge) {
              await prisma.badge.create({
                data: {
                  userId: student.id,
                  type: BadgeType.FIRST_COURSE_COMPLETE,
                },
              });
              console.log(`  🏆 Awarded FIRST_COURSE_COMPLETE badge`);
            }
          }
        } catch (error) {
          console.error(`  ❌ Error processing course ${course.title}:`, error);
        }
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`✅ Enrollments created/updated: ${enrollmentsCreated}`);
    console.log(`🎓 Certificates created: ${certificatesCreated}`);
    console.log('\n✨ Certificate seeding completed!\n');

    // Display some sample certificate IDs
    const sampleCertificates = await prisma.certificate.findMany({
      take: 5,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    if (sampleCertificates.length > 0) {
      console.log('📋 Sample Certificate IDs for testing:\n');
      sampleCertificates.forEach((cert) => {
        console.log(`   ${cert.certificateId}`);
        console.log(`   Student: ${cert.student.firstName} ${cert.student.lastName}`);
        console.log(`   Course: ${cert.course.title}`);
        console.log(`   URL: /certificates/${cert.certificateId}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run the seed function
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
