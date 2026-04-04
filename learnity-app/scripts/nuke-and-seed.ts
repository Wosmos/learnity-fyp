/**
 * NUKE & SEED — Wipes entire DB + Firebase Auth, then populates with realistic data.
 *
 * Usage:
 *   cd learnity-app
 *   source ../.env.local && DATABASE_URL="$DATABASE_URL" bunx tsx scripts/nuke-and-seed.ts
 *
 * Creates:
 *   - 1 admin (admin@learnity.com / admin123)
 *   - 100 teachers (teacher1@yopmail.com ... teacher100@yopmail.com / password@123)
 *   - 900 students (student1@yopmail.com ... student900@yopmail.com / password@123)
 *   - 15 categories, 2500 courses with sections + lessons
 *   - ~8000 enrollments, reviews, XP, progress
 *   - Dates spread Jan 2025 – Apr 4 2026
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, type UserImportRecord } from 'firebase-admin/auth';
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const auth = getAuth();

// ─── Config ──────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.STATIC_ADMIN_EMAIL || 'admin@learnity.com';
const ADMIN_PASSWORD = process.env.STATIC_ADMIN_PASSWORD || 'admin123';
const DUMMY_PASSWORD = 'password@123';
const NUM_TEACHERS = 100;
const NUM_STUDENTS = 900;
const NUM_COURSES = 2500;
const DATE_START = new Date('2025-01-01');
const DATE_END = new Date('2026-04-04');

// ─── Helpers ─────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const pickN = <T>(a: T[], n: number): T[] => [...a].sort(() => Math.random() - 0.5).slice(0, n);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function randomDate(start = DATE_START, end = DATE_END): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function dateAfter(d: Date): Date {
  const max = DATE_END.getTime();
  return new Date(Math.min(max, d.getTime() + Math.random() * (max - d.getTime())));
}

/** Hash password for Firebase importUsers (SHA256 + salt) */
function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = createHash('sha256').update(salt).update(Buffer.from(password)).digest();
  return { hash, salt };
}

const MALE_NAMES = [
  'Ahmed','Ali','Hassan','Omar','Muhammad','Bilal','Usman','Ibrahim','Hamza','Yusuf',
  'Arslan','Talha','Zain','Saad','Danish','Fahad','Kashif','Adeel','Junaid','Shoaib',
  'Asad','Waqar','Naveed','Rizwan','Faisal','Imran','Kamran','Tariq','Waseem','Farhan',
];
const FEMALE_NAMES = [
  'Fatima','Ayesha','Zainab','Sara','Maryam','Hira','Amna','Khadija','Noor','Sana',
  'Maham','Iqra','Rabia','Hafsa','Anam','Nimra','Bushra','Mehwish','Saba','Anum',
  'Lubna','Sidra','Komal','Kinza','Laiba','Alina','Rimsha','Arooj','Momina','Zara',
];
const LAST_NAMES = [
  'Khan','Ahmed','Ali','Malik','Hussain','Shah','Iqbal','Raza','Siddiqui','Butt',
  'Sheikh','Mirza','Qureshi','Javed','Aslam','Chaudhry','Farooq','Rehman','Akram','Saeed',
  'Tahir','Abbasi','Ansari','Bajwa','Dar','Gill','Hashmi','Kazmi','Lodhi','Naqvi',
];
const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','Computer Science','English','Urdu',
  'History','Geography','Economics','Business Studies','Accounting','Psychology',
  'Data Science','Web Development','Mobile Development','Machine Learning','Cybersecurity',
  'Graphic Design','Digital Marketing','Cloud Computing','DevOps',
];
const CATEGORIES = [
  { name: 'Web Development', desc: 'Frontend, backend, and full-stack web technologies' },
  { name: 'Mobile Development', desc: 'Android, iOS, and cross-platform mobile apps' },
  { name: 'Data Science', desc: 'Statistics, analytics, and data visualization' },
  { name: 'Machine Learning', desc: 'AI, deep learning, and neural networks' },
  { name: 'Cybersecurity', desc: 'Network security, ethical hacking, and compliance' },
  { name: 'Cloud Computing', desc: 'AWS, Azure, GCP, and DevOps practices' },
  { name: 'Mathematics', desc: 'Algebra, calculus, geometry, and applied math' },
  { name: 'Science', desc: 'Physics, chemistry, biology, and earth science' },
  { name: 'Languages', desc: 'English, Urdu, Arabic, and foreign languages' },
  { name: 'Business', desc: 'Entrepreneurship, management, and finance' },
  { name: 'Design', desc: 'UI/UX, graphic design, and creative tools' },
  { name: 'Test Preparation', desc: 'Board exams, entry tests, and competitive exams' },
  { name: 'Personal Development', desc: 'Productivity, communication, and career skills' },
  { name: 'Arts & Music', desc: 'Drawing, painting, music theory, and instruments' },
  { name: 'Health & Fitness', desc: 'Nutrition, exercise science, and wellness' },
];
const YOUTUBE_IDS = ['dQw4w9WgXcQ','jNQXAC9IVRw','9bZkp7q19f0','kJQP7kiw5Fk','JGwWNGJdvx8','RgKAFK5djSk','OPf0YbXqDm0','fRh_vgS2dFE','CevxZvSJLk8','hT_nvWreIhg'];

// Profile pictures — randomuser.me with deterministic seeds (real faces)
const profilePic = (i: number, gender: 'men' | 'women') =>
  `https://randomuser.me/api/portraits/${gender}/${i % 100}.jpg`;

// Course thumbnails — Unsplash direct URLs (real course-like images, no API key)
const COURSE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1509966756634-9c23dd6e6815?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fc8?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
];
const REVIEW_COMMENTS = [
  'Excellent course! The explanations were crystal clear and the pace was perfect for beginners.',
  'Very well structured. Each section builds on the previous one naturally.',
  'The teacher really knows their stuff. Concepts I struggled with for months finally clicked.',
  'Great content! The real-world examples made everything so much easier to understand.',
  'Good course overall. Would have liked more practice exercises between sections.',
  'This helped me prepare for my exams. The quizzes at the end of each section were great.',
  'Amazing teacher. Patient, knowledgeable, and genuinely passionate about the subject.',
  'Best investment in my education. Already seeing improvement in my grades.',
  'Content is up to date and very relevant. No outdated material.',
  'The practical projects really solidified my understanding. Highly recommended!',
  'Solid fundamentals course. Perfect if you are just starting out.',
  'I have taken multiple courses on this topic — this one is by far the best.',
  'Clear explanations, good examples, and the teacher responds to questions quickly.',
  'Would recommend to anyone looking to learn this subject from scratch.',
  'Completed the entire course in 2 weeks. Learned more here than a whole semester at uni.',
  'The course material is well-organized and the progression feels natural.',
  null, null, null,
];
const COURSE_TEMPLATES = [
  'Complete {s} Course','Advanced Guide to {s}','{s} Masterclass','{s} from Scratch',
  '{s} for Beginners','{s} Bootcamp','Learn {s} in 30 Days','{s} Fundamentals',
  'Practical {s} Workshop','{s}: Zero to Hero',
];

// ═══════════════════════════════════════════════════════════════
// STEP 1: NUKE
// ═══════════════════════════════════════════════════════════════

async function nukeDatabase() {
  console.log('🗑️  Nuking database...');
  // Raw SQL is faster than individual deleteMany for full wipe
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" CASCADE';
      END LOOP;
    END $$;
  `);
  console.log('✅ Database wiped');
}

async function nukeFirebase() {
  console.log('🔥 Deleting Firebase users...');
  let deleted = 0;
  let nextPageToken: string | undefined;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    if (result.users.length > 0) {
      await auth.deleteUsers(result.users.map(u => u.uid));
      deleted += result.users.length;
      process.stdout.write(`\r   Deleted ${deleted} Firebase users`);
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  console.log(`\n✅ ${deleted} Firebase users deleted`);
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: CREATE USERS (Firebase importUsers = instant, no rate limit)
// ═══════════════════════════════════════════════════════════════

interface UserSeed {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: Date;
  uid?: string;
  profilePicture?: string;
}

async function createUsers() {
  console.log('👤 Creating 1001 users (Firebase bulk import)...');

  // Build user list
  const users: UserSeed[] = [];

  // Admin
  users.push({ email: ADMIN_EMAIL, firstName: 'Platform', lastName: 'Admin', role: 'ADMIN', createdAt: new Date('2025-01-01') });

  // Teachers — gender-matched names + photos
  for (let i = 1; i <= NUM_TEACHERS; i++) {
    const isMale = i % 2 !== 0;
    users.push({
      email: `teacher${i}@yopmail.com`,
      firstName: pick(isMale ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      role: 'TEACHER', createdAt: randomDate(DATE_START, new Date('2025-10-01')),
      profilePicture: profilePic(i, isMale ? 'men' : 'women'),
    });
  }

  // Students — gender-matched names + photos
  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const isMale = i % 2 !== 0;
    users.push({
      email: `student${i}@yopmail.com`,
      firstName: pick(isMale ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      role: 'STUDENT', createdAt: randomDate(),
      profilePicture: profilePic(i, isMale ? 'men' : 'women'),
    });
  }

  // ── Firebase bulk import (1000 per batch) ──
  const importRecords: UserImportRecord[] = users.map(u => {
    const pw = u.role === 'ADMIN' ? ADMIN_PASSWORD : DUMMY_PASSWORD;
    const { hash, salt } = hashPassword(pw);
    return {
      uid: undefined as any, // auto-generated
      email: u.email,
      emailVerified: true,
      displayName: `${u.firstName} ${u.lastName}`,
      passwordHash: hash,
      passwordSalt: salt,
      customClaims: {
        role: u.role,
        profileComplete: true,
        emailVerified: true,
        ...(u.role === 'ADMIN' ? {
          permissions: ['view:admin_panel', 'manage:users', 'approve:teachers', 'view:audit_logs', 'manage:platform'],
        } : {}),
      },
    };
  });

  // importUsers doesn't auto-generate UIDs, we need to provide them
  for (const rec of importRecords) {
    rec.uid = randomBytes(14).toString('hex'); // 28-char UID
  }

  // Import in batches of 1000
  for (let i = 0; i < importRecords.length; i += 1000) {
    const batch = importRecords.slice(i, i + 1000);
    const result = await auth.importUsers(batch, {
      hash: { algorithm: 'SHA256', rounds: 1 },
    });
    if (result.failureCount > 0) {
      console.warn(`   ⚠️  ${result.failureCount} failures in batch ${Math.floor(i/1000) + 1}`);
      result.errors.slice(0, 3).forEach(e => console.warn(`      ${e.index}: ${e.error.message}`));
    }
  }
  console.log(`   ✅ ${users.length} Firebase users imported`);

  // Map UIDs back
  for (let i = 0; i < users.length; i++) {
    users[i].uid = importRecords[i].uid;
  }

  // ── Bulk DB insert (createMany + batched profiles) ──
  console.log('   Inserting users into DB...');

  // 1. Bulk create all users at once
  await prisma.user.createMany({
    data: users.map(u => ({
      firebaseUid: u.uid!, email: u.email,
      firstName: u.firstName, lastName: u.lastName,
      role: u.role, emailVerified: true, isActive: true,
      authProvider: 'email', createdAt: u.createdAt,
      lastLoginAt: dateAfter(u.createdAt),
      profilePicture: u.profilePicture || null,
    })),
  });
  console.log('   ✅ Users bulk inserted');

  // 2. Fetch back IDs (createMany doesn't return IDs)
  const dbUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  const emailToId = new Map(dbUsers.map(u => [u.email, { id: u.id, createdAt: u.createdAt }]));

  const teacherIds: string[] = [];
  const studentIds: string[] = [];

  // 3. Batch create profiles by role
  console.log('   Creating profiles...');

  // Admin profile
  const adminId = emailToId.get(ADMIN_EMAIL)?.id;
  if (adminId) await prisma.adminProfile.create({ data: { userId: adminId, isStatic: true } });

  // Teacher profiles + wallets (batch)
  const teacherProfiles: any[] = [];
  const teacherWallets: any[] = [];

  for (let i = 1; i <= NUM_TEACHERS; i++) {
    const entry = emailToId.get(`teacher${i}@yopmail.com`);
    if (!entry) continue;
    teacherIds.push(entry.id);
    const subjects = pickN(SUBJECTS, rand(2, 5));
    const exp = rand(1, 15);
    teacherProfiles.push({
      userId: entry.id, applicationStatus: 'APPROVED',
      qualifications: [`BSc ${pick(SUBJECTS)}`, `MSc ${pick(SUBJECTS)}`],
      subjects, experience: exp,
      bio: `Experienced ${subjects[0]} teacher with ${exp} years of teaching.`,
      hourlyRate: rand(500, 5000),
      submittedAt: entry.createdAt, reviewedAt: dateAfter(entry.createdAt),
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      lessonsCompleted: rand(0, 500),
      headline: `${subjects[0]} Expert | ${exp}+ Years`,
      teachingStyle: pick(['Interactive', 'Lecture-based', 'Project-based', 'Discussion-based']),
      profilePicture: profilePic(i, i % 2 === 0 ? 'women' : 'men'),
    });
    teacherWallets.push({ userId: entry.id, balance: rand(0, 50000) });
  }
  await prisma.teacherProfile.createMany({ data: teacherProfiles });
  await prisma.wallet.createMany({ data: teacherWallets });
  console.log(`   ✅ ${NUM_TEACHERS} teacher profiles`);

  // Student profiles + wallets + progress (batch)
  const studentProfiles: any[] = [];
  const studentWallets: any[] = [];
  const studentProgress: any[] = [];

  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const entry = emailToId.get(`student${i}@yopmail.com`);
    if (!entry) continue;
    studentIds.push(entry.id);
    const subjects = pickN(SUBJECTS, rand(2, 4));
    studentProfiles.push({
      userId: entry.id,
      gradeLevel: pick(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate', 'Graduate']),
      subjects, learningGoals: pickN(['Improve grades', 'New skills', 'Career change', 'Exam prep'], 2),
      interests: pickN(['Technology', 'Science', 'Arts', 'Sports', 'Music', 'Reading'], 2),
      studyPreferences: pickN(['Video lectures', 'Practice problems', 'Group study', 'One-on-one'], 2),
      bio: `Learner interested in ${subjects[0]}.`,
      profileCompletionPercentage: rand(40, 100),
    });
    studentWallets.push({ userId: entry.id, balance: rand(0, 10000) });
    studentProgress.push({
      userId: entry.id, totalXP: rand(0, 5000), currentLevel: rand(1, 10),
      currentStreak: rand(0, 30), longestStreak: rand(0, 60),
      lastActivityAt: dateAfter(entry.createdAt),
    });
  }
  await prisma.studentProfile.createMany({ data: studentProfiles });
  await prisma.wallet.createMany({ data: studentWallets });
  await prisma.userProgress.createMany({ data: studentProgress });
  console.log(`   ✅ ${NUM_STUDENTS} student profiles`);
  return { teacherIds, studentIds };
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: COURSES
// ═══════════════════════════════════════════════════════════════

async function createCourses(teacherIds: string[]) {
  console.log('📚 Creating categories + courses...');

  // Categories
  await prisma.category.createMany({
    data: CATEGORIES.map(c => ({ name: c.name, slug: slug(c.name), description: c.desc })),
  });
  const cats = await prisma.category.findMany({ select: { id: true } });
  const catIds = cats.map(c => c.id);
  console.log(`   ✅ ${CATEGORIES.length} categories`);

  // Pre-generate all course data in memory, then batch insert
  type CourseSeed = { title: string; slug: string; teacherId: string; catId: string; subj: string; pub: boolean; free: boolean; createdAt: Date; numSections: number; sectionLessons: number[] };
  const seeds: CourseSeed[] = [];

  for (let i = 0; i < NUM_COURSES; i++) {
    const numSections = rand(2, 5);
    const sectionLessons = Array.from({ length: numSections }, () => rand(2, 5));
    const subj = pick(SUBJECTS);
    const title = pick(COURSE_TEMPLATES).replace('{s}', subj);
    seeds.push({
      title,
      slug: slug(title) + '-' + Math.random().toString(36).slice(2, 8),
      teacherId: pick(teacherIds), catId: pick(catIds), subj,
      pub: Math.random() > 0.15, free: Math.random() > 0.6,
      createdAt: randomDate(new Date('2025-01-15'), new Date('2026-03-15')),
      numSections, sectionLessons,
    });
  }

  // Batch courses in chunks of 500
  const CHUNK = 500;
  for (let c = 0; c < seeds.length; c += CHUNK) {
    const chunk = seeds.slice(c, c + CHUNK);
    await prisma.course.createMany({
      data: chunk.map(s => ({
        title: s.title,
        slug: s.slug,
        description: `Learn ${s.subj} with practical examples and hands-on projects. This course covers everything from fundamentals to advanced concepts with real-world exercises.`,
        thumbnailUrl: pick(COURSE_THUMBNAILS),
        teacherId: s.teacherId, categoryId: s.catId,
        difficulty: pick(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        tags: pickN(SUBJECTS, 3),
        status: s.pub ? 'PUBLISHED' : 'DRAFT',
        isFree: s.free, price: s.free ? null : rand(500, 9500),
        publishedAt: s.pub ? dateAfter(s.createdAt) : null,
        createdAt: s.createdAt,
        lessonCount: s.sectionLessons.reduce((a, b) => a + b, 0),
        totalDuration: s.sectionLessons.reduce((a, b) => a + b * rand(300, 2700), 0),
      })),
    });
    process.stdout.write(`\r   ${Math.min(c + CHUNK, seeds.length)}/${NUM_COURSES} courses`);
  }

  // Fetch course IDs back
  const allCourses = await prisma.course.findMany({ select: { id: true, teacherId: true, slug: true } });
  const slugToId = new Map(allCourses.map(c => [c.slug, c.id]));
  const courseData = allCourses.map(c => ({ id: c.id, teacherId: c.teacherId }));
  console.log(`\n   ✅ ${allCourses.length} courses inserted`);

  // Batch sections
  console.log('   Creating sections...');
  const sectionData: { courseId: string; title: string; order: number; createdAt: Date }[] = [];
  for (const s of seeds) {
    const courseId = slugToId.get(s.slug);
    if (!courseId) continue;
    for (let si = 0; si < s.numSections; si++) {
      sectionData.push({
        courseId, title: `Section ${si + 1}: ${pick(['Intro to', 'Advanced', 'Practical', 'Mastering'])} ${s.subj}`,
        order: si, createdAt: s.createdAt,
      });
    }
  }
  for (let c = 0; c < sectionData.length; c += 1000) {
    await prisma.section.createMany({ data: sectionData.slice(c, c + 1000) });
  }
  console.log(`   ✅ ${sectionData.length} sections`);

  // Fetch section IDs and create lessons
  console.log('   Creating lessons...');
  const allSections = await prisma.section.findMany({ select: { id: true, courseId: true, order: true } });
  const courseSectionMap = new Map<string, { id: string; order: number }[]>();
  for (const sec of allSections) {
    if (!courseSectionMap.has(sec.courseId)) courseSectionMap.set(sec.courseId, []);
    courseSectionMap.get(sec.courseId)!.push(sec);
  }

  const lessonData: any[] = [];
  for (const s of seeds) {
    const courseId = slugToId.get(s.slug);
    if (!courseId) continue;
    const sections = courseSectionMap.get(courseId) || [];
    sections.sort((a, b) => a.order - b.order);
    for (let si = 0; si < sections.length && si < s.sectionLessons.length; si++) {
      const numLessons = s.sectionLessons[si];
      for (let li = 0; li < numLessons; li++) {
        lessonData.push({
          sectionId: sections[si].id,
          title: `Lesson ${li + 1}: ${pick(['Understanding', 'Working with', 'Building', 'Deep Dive'])} ${s.subj}`,
          type: 'VIDEO', youtubeId: pick(YOUTUBE_IDS),
          youtubeUrl: `https://youtube.com/watch?v=${pick(YOUTUBE_IDS)}`,
          duration: rand(300, 2700), order: li, createdAt: s.createdAt,
        });
      }
    }
  }
  for (let c = 0; c < lessonData.length; c += 1000) {
    await prisma.lesson.createMany({ data: lessonData.slice(c, c + 1000) });
    process.stdout.write(`\r   ${Math.min(c + 1000, lessonData.length)}/${lessonData.length} lessons`);
  }
  console.log(`\n   ✅ ${lessonData.length} lessons`);

  return courseData;
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: ENROLLMENTS & REVIEWS
// ═══════════════════════════════════════════════════════════════

async function createActivity(studentIds: string[], courseData: { id: string; teacherId: string }[]) {
  console.log('📊 Creating enrollments + reviews...');

  // Get published course IDs
  const pubCourses = await prisma.course.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, teacherId: true } });

  // Pre-generate all enrollments and reviews in memory
  const enrollments: any[] = [];
  const reviews: any[] = [];
  const seen = new Set<string>(); // track studentId-courseId to avoid dups

  for (const sid of studentIds) {
    const courses = pickN(pubCourses, rand(3, 10));
    for (const c of courses) {
      const key = `${sid}-${c.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const enrolledAt = randomDate(new Date('2025-02-01'));
      const progress = rand(0, 100);
      const done = progress === 100;

      enrollments.push({
        studentId: sid, courseId: c.id,
        status: done ? 'COMPLETED' : 'ACTIVE',
        progress, enrolledAt,
        lastAccessedAt: dateAfter(enrolledAt),
        completedAt: done ? dateAfter(enrolledAt) : null,
      });

      if (Math.random() < 0.35) {
        reviews.push({
          studentId: sid, courseId: c.id,
          rating: rand(3, 5), comment: pick(REVIEW_COMMENTS),
          createdAt: dateAfter(enrolledAt),
        });
      }
    }
  }

  // Batch insert enrollments
  console.log(`   Inserting ${enrollments.length} enrollments...`);
  for (let c = 0; c < enrollments.length; c += 1000) {
    await prisma.enrollment.createMany({ data: enrollments.slice(c, c + 1000), skipDuplicates: true });
    process.stdout.write(`\r   ${Math.min(c + 1000, enrollments.length)}/${enrollments.length} enrollments`);
  }

  // Batch insert reviews
  console.log(`\n   Inserting ${reviews.length} reviews...`);
  for (let c = 0; c < reviews.length; c += 1000) {
    await prisma.review.createMany({ data: reviews.slice(c, c + 1000), skipDuplicates: true });
  }

  // Update enrollment counts on courses (raw SQL is fastest)
  console.log('   Updating course stats...');
  await prisma.$executeRaw`
    UPDATE courses SET "enrollmentCount" = sub.cnt
    FROM (SELECT "courseId", COUNT(*) as cnt FROM enrollments GROUP BY "courseId") sub
    WHERE courses.id = sub."courseId"
  `;

  // Update course ratings from reviews
  await prisma.$executeRaw`
    UPDATE courses SET
      "averageRating" = sub.avg_rating,
      "reviewCount" = sub.cnt
    FROM (SELECT "courseId", AVG(rating)::numeric(3,1) as avg_rating, COUNT(*) as cnt FROM reviews GROUP BY "courseId") sub
    WHERE courses.id = sub."courseId"
  `;

  // Update teacher ratings
  await prisma.$executeRaw`
    UPDATE teacher_profiles SET
      "reviewCount" = sub.cnt,
      rating = sub.avg_rating
    FROM (
      SELECT c."teacherId" as user_id, AVG(r.rating)::numeric(3,1) as avg_rating, COUNT(*) as cnt
      FROM reviews r JOIN courses c ON r."courseId" = c.id
      GROUP BY c."teacherId"
    ) sub
    WHERE teacher_profiles."userId" = sub.user_id
  `;

  console.log(`   ✅ ${enrollments.length} enrollments, ${reviews.length} reviews (stats updated)`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  LEARNITY — NUKE & SEED');
  console.log('═══════════════════════════════════════════\n');
  const t = Date.now();

  await nukeDatabase();
  await nukeFirebase();
  const { teacherIds, studentIds } = await createUsers();
  const courseData = await createCourses(teacherIds);
  await createActivity(studentIds, courseData);

  const sec = Math.round((Date.now() - t) / 1000);
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Done in ${sec}s`);
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Teachers: teacher1-${NUM_TEACHERS}@yopmail.com / ${DUMMY_PASSWORD}`);
  console.log(`  Students: student1-${NUM_STUDENTS}@yopmail.com / ${DUMMY_PASSWORD}`);
  console.log('═══════════════════════════════════════════');
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌ Failed:', e); prisma.$disconnect(); process.exit(1); });
