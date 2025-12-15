/**
 * Professional Teacher Seed Data - Enhanced
 * Auto-calculates top rated status, includes testimonials
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to determine if teacher is top rated
function calculateIsTopRated(rating: number, reviewCount: number, lessonsCompleted: number, experience: number): boolean {
  // Top rated criteria:
  // - Rating >= 4.8
  // - At least 80 reviews
  // - At least 400 lessons completed
  // - At least 5 years experience
  return rating >= 4.8 && reviewCount >= 80 && lessonsCompleted >= 400 && experience >= 5;
}

const TEACHERS_DATA = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@topmail.com',
    subjects: ['Mathematics', 'Physics', 'Calculus', 'Algebra'],
    experience: 8,
    bio: 'I am a passionate mathematics educator with a PhD in Applied Mathematics from MIT. With over 8 years of teaching experience, I specialize in making complex mathematical concepts accessible and engaging for students of all levels.',
    hourlyRate: '65',
    qualifications: ['PhD Applied Mathematics - MIT', 'Certified Math Teacher', 'Published Researcher'],
    rating: 4.9,
    reviewCount: 127,
    responseTime: 'within an hour',
    availability: 'Available today',
    languages: ['English', 'Spanish'],
    lessonsCompleted: 856,
    activeStudents: 23,
    teachingStyle: 'Interactive and patient',
    specialties: ['AP Calculus', 'SAT Math', 'College Math', 'Competition Math'],
    certifications: ['MIT Teaching Certificate', 'Advanced Mathematics Pedagogy'],
    education: ['PhD Applied Mathematics - MIT', 'MS Mathematics - Stanford', 'BS Mathematics - UC Berkeley'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredTimes: ['Morning', 'Afternoon', 'Evening'],
    headline: 'MIT PhD making math simple and fun for everyone',
    achievements: ['500+ students improved by 2+ grade levels', 'Perfect SAT Math score achiever', '95% student satisfaction rate'],
    teachingApproach: 'I believe in building strong foundations and developing problem-solving skills. My lessons are interactive, using real-world examples to make abstract concepts concrete.',
    videoIntroUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    testimonials: [
      { studentName: 'Emily R.', rating: 5, comment: 'Sarah helped me go from struggling with calculus to getting an A! Her explanations are crystal clear.', subject: 'Calculus' },
      { studentName: 'James M.', rating: 5, comment: 'Best math tutor ever! She makes difficult concepts easy to understand.', subject: 'Algebra' },
      { studentName: 'Lisa K.', rating: 5, comment: 'Thanks to Sarah, I scored 800 on SAT Math. Highly recommend!', subject: 'SAT Math' },
    ],
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@topmail.com',
    subjects: ['Computer Science', 'Python', 'JavaScript', 'Web Development'],
    experience: 6,
    bio: 'Former Google software engineer with 6 years of industry experience, now dedicated to teaching programming. I help students learn to code through building real-world projects.',
    hourlyRate: '75',
    qualifications: ['BS Computer Science - Stanford', 'Ex-Google Senior Engineer', 'Published Tech Author'],
    rating: 4.95,
    reviewCount: 203,
    responseTime: 'within 30 minutes',
    availability: 'Available today',
    languages: ['English', 'Mandarin', 'Cantonese'],
    lessonsCompleted: 1240,
    activeStudents: 31,
    teachingStyle: 'Project-based and practical',
    specialties: ['Full-Stack Development', 'Algorithm Design', 'Interview Preparation', 'Career Guidance'],
    certifications: ['Google Cloud Certified', 'AWS Solutions Architect'],
    education: ['BS Computer Science - Stanford University', 'Google Engineering Training'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    preferredTimes: ['Evening', 'Night'],
    headline: 'Ex-Google engineer teaching real-world programming',
    achievements: ['Helped 50+ students land tech jobs', 'Created popular coding curriculum', '100% interview success rate'],
    teachingApproach: 'Learn by doing! I teach programming through building actual projects. We\'ll work on your portfolio while learning concepts.',
    videoIntroUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    testimonials: [
      { studentName: 'Alex T.', rating: 5, comment: 'Michael helped me land a job at Amazon! His interview prep is invaluable.', subject: 'Interview Prep' },
      { studentName: 'Sarah P.', rating: 5, comment: 'Went from zero coding knowledge to building my own website in 3 months!', subject: 'Web Development' },
      { studentName: 'David L.', rating: 5, comment: 'Best investment in my career. Michael knows the industry inside out.', subject: 'Python' },
    ],
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@topmail.com',
    subjects: ['English', 'Literature', 'Creative Writing', 'Essay Writing'],
    experience: 10,
    bio: 'Award-winning author and English educator with an MFA from Iowa Writers\' Workshop. I help students find their unique voice and excel in all forms of writing.',
    hourlyRate: '55',
    qualifications: ['MFA Creative Writing - Iowa', 'Published Novelist', 'College Essay Specialist'],
    rating: 4.85,
    reviewCount: 156,
    responseTime: 'within 2 hours',
    availability: 'Available today',
    languages: ['English', 'Spanish'],
    lessonsCompleted: 678,
    activeStudents: 19,
    teachingStyle: 'Encouraging and detailed',
    specialties: ['College Essays', 'Creative Writing', 'Literary Analysis', 'Grammar & Style'],
    certifications: ['Iowa Writers Workshop Graduate', 'College Board AP English Certified'],
    education: ['MFA Creative Writing - University of Iowa', 'BA English Literature - Columbia'],
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    preferredTimes: ['Morning', 'Afternoon'],
    headline: 'Published author helping students find their voice',
    achievements: ['Students accepted to Ivy League schools', 'Published 3 novels', '90% improve writing scores by 20%+'],
    teachingApproach: 'Writing is a craft that can be learned. I provide detailed feedback and teach techniques used by professional writers.',
    testimonials: [
      { studentName: 'Rachel W.', rating: 5, comment: 'Emily helped me get into Yale! Her college essay guidance was perfect.', subject: 'College Essays' },
      { studentName: 'Tom H.', rating: 5, comment: 'My writing improved dramatically. She\'s patient and gives great feedback.', subject: 'Creative Writing' },
      { studentName: 'Maya S.', rating: 4, comment: 'Excellent teacher who really cares about her students\' success.', subject: 'English' },
    ],
  },
  {
    firstName: 'David',
    lastName: 'Patel',
    email: 'david.patel@topmail.com',
    subjects: ['Chemistry', 'Biology', 'Organic Chemistry'],
    experience: 12,
    bio: 'Research scientist with a PhD in Chemistry from Cambridge. I make science engaging through hands-on experiments and real-world applications.',
    hourlyRate: '60',
    qualifications: ['PhD Chemistry - Cambridge', 'Research Scientist', 'Published 20+ Papers'],
    rating: 4.7,
    reviewCount: 89,
    responseTime: 'within 3 hours',
    availability: 'Weekends preferred',
    languages: ['English', 'Hindi', 'Gujarati'],
    lessonsCompleted: 445,
    activeStudents: 15,
    teachingStyle: 'Experimental and visual',
    specialties: ['AP Chemistry', 'Organic Chemistry', 'Pre-Med Preparation'],
    certifications: ['Cambridge Research Fellow', 'AP Chemistry Certified'],
    education: ['PhD Chemistry - Cambridge', 'MS Chemistry - IIT Delhi'],
    availableDays: ['Saturday', 'Sunday'],
    preferredTimes: ['Morning', 'Afternoon', 'Evening'],
    headline: 'Cambridge PhD making chemistry accessible',
    achievements: ['Research published in Nature', 'Students score 5 on AP exams', 'Innovative teaching methods'],
    teachingApproach: 'Chemistry is everywhere! I use real-world examples and virtual experiments to make concepts stick.',
    testimonials: [
      { studentName: 'Priya M.', rating: 5, comment: 'David made organic chemistry actually make sense! Got an A in the class.', subject: 'Organic Chemistry' },
      { studentName: 'John D.', rating: 4, comment: 'Great teacher, very knowledgeable. Helped me prepare for MCAT.', subject: 'Chemistry' },
    ],
  },
  {
    firstName: 'Jessica',
    lastName: 'Williams',
    email: 'jessica.williams@topmail.com',
    subjects: ['Spanish', 'French', 'Italian'],
    experience: 7,
    bio: 'Polyglot language instructor fluent in 5 languages. I use immersive techniques and cultural context to help students achieve fluency quickly.',
    hourlyRate: '50',
    qualifications: ['BA Linguistics - Barcelona', 'DELE Certified Examiner', 'Polyglot - 5 Languages'],
    rating: 4.8,
    reviewCount: 112,
    responseTime: 'within an hour',
    availability: 'Evenings and weekends',
    languages: ['English', 'Spanish', 'French', 'Italian', 'Portuguese'],
    lessonsCompleted: 567,
    activeStudents: 22,
    teachingStyle: 'Immersive and conversational',
    specialties: ['Conversational Spanish', 'Business Spanish', 'DELE Preparation'],
    certifications: ['DELE Examiner Certification', 'TEFL Certified'],
    education: ['BA Linguistics - University of Barcelona', 'Cervantes Institute Certification'],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    preferredTimes: ['Evening', 'Night'],
    headline: 'Native Spanish speaker teaching through immersion',
    achievements: ['Students achieve fluency in 6 months', 'Lived in 5 countries', '100% DELE exam pass rate'],
    teachingApproach: 'Language learning should be fun and natural! I use immersion techniques, focusing on conversation from day one.',
    testimonials: [
      { studentName: 'Mark B.', rating: 5, comment: 'Jessica is amazing! I can now speak Spanish confidently after just 4 months.', subject: 'Spanish' },
      { studentName: 'Anna K.', rating: 5, comment: 'Best language teacher I\'ve ever had. Makes learning fun and natural.', subject: 'French' },
      { studentName: 'Carlos R.', rating: 4, comment: 'Very patient and encouraging. My Spanish has improved so much!', subject: 'Spanish' },
    ],
  },
];

async function seedTeachers() {
  console.log('🌱 Starting professional teacher seed...\n');

  try {
    // Delete existing seed teachers
    console.log('🗑️  Cleaning up existing seed data...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: '@topmail.com',
        },
      },
    });
    console.log(`✅ Deleted ${deletedUsers.count} existing teachers\n`);

    // Create new teachers
    for (const teacherData of TEACHERS_DATA) {
      console.log(`Creating: ${teacherData.firstName} ${teacherData.lastName}...`);

      // Calculate if teacher is top rated
      const isTopRated = calculateIsTopRated(
        teacherData.rating,
        teacherData.reviewCount,
        teacherData.lessonsCompleted,
        teacherData.experience
      );

      // Create teacher
      const user = await prisma.user.create({
        data: {
          firebaseUid: `seed_${teacherData.email.split('@')[0]}`,
          email: teacherData.email,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          role: 'TEACHER',
          emailVerified: true,
          isActive: true,
          authProvider: 'email',
          teacherProfile: {
            create: {
              applicationStatus: 'APPROVED',
              qualifications: teacherData.qualifications,
              subjects: teacherData.subjects,
              experience: teacherData.experience,
              bio: teacherData.bio,
              hourlyRate: teacherData.hourlyRate,
              documents: [],
              submittedAt: new Date(),
              reviewedAt: new Date(),
              approvedBy: 'system_seed',
              rating: teacherData.rating,
              reviewCount: teacherData.reviewCount,
              responseTime: teacherData.responseTime,
              availability: teacherData.availability,
              languages: teacherData.languages,
              lessonsCompleted: teacherData.lessonsCompleted,
              activeStudents: teacherData.activeStudents,
              teachingStyle: teacherData.teachingStyle,
              specialties: teacherData.specialties,
              certifications: teacherData.certifications,
              education: teacherData.education,
              availableDays: teacherData.availableDays,
              preferredTimes: teacherData.preferredTimes,
              headline: teacherData.headline,
              achievements: teacherData.achievements,
              teachingApproach: teacherData.teachingApproach,
              videoIntroUrl: teacherData.videoIntroUrl,
            },
          },
        },
      });

      // Create testimonials
      for (const testimonial of teacherData.testimonials) {
        await prisma.testimonial.create({
          data: {
            teacherId: user.id,
            studentName: testimonial.studentName,
            rating: testimonial.rating,
            comment: testimonial.comment,
            subject: testimonial.subject,
            isVerified: true,
          },
        });
      }

      console.log(`✅ ${teacherData.firstName} ${teacherData.lastName} ${isTopRated ? '⭐ TOP RATED' : ''} (${teacherData.testimonials.length} testimonials)`);
    }

    const topRatedCount = TEACHERS_DATA.filter(t => 
      calculateIsTopRated(t.rating, t.reviewCount, t.lessonsCompleted, t.experience)
    ).length;
    
    console.log('\n🎉 Professional teacher seed completed!');
    console.log(`📊 Total: ${TEACHERS_DATA.length} teachers`);
    console.log(`⭐ Top Rated: ${topRatedCount} teachers (auto-calculated)`);
    console.log(`💬 Total testimonials: ${TEACHERS_DATA.reduce((sum, t) => sum + t.testimonials.length, 0)}`);
    console.log(`📚 Total lessons: ${TEACHERS_DATA.reduce((sum, t) => sum + t.lessonsCompleted, 0)}`);
  } catch (error) {
    console.error('❌ Error seeding teachers:', error);
    throw error;
  }
}

seedTeachers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
