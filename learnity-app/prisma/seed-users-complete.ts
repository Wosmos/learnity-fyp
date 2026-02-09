/**
 * FAST Complete Seed Script for Pakistani Users
 * Creates 500 students and 70 teachers in BOTH Firebase Auth AND Database
 * Password for all users: password123
 *
 * Optimizations:
 *  - Pre-generates unique name/email combos (no duplicates hit Firebase/DB)
 *  - Batched concurrent processing (BATCH_SIZE at a time)
 *  - Parallel Firebase + DB operations where possible
 *
 * Run with: bun run prisma/seed-users-complete.ts
 * Or: npx tsx prisma/seed-users-complete.ts
 */

import { PrismaClient } from '@prisma/client';
import { adminAuth } from '../src/lib/config/firebase-admin';

const prisma = new PrismaClient();

// ---- Tuning ----
const BATCH_SIZE = 35; // concurrent Firebase calls per batch (raise to 20-25 if no rate-limit issues)

// Pakistani First Names (Male & Female)
const pakistaniFirstNames = {
  male: [
    'Muhammad','Ahmed','Ali','Hassan','Hussain','Usman','Omar','Bilal','Hamza','Zain',
    'Faisal','Imran','Kamran','Adnan','Arslan','Asad','Fahad','Haris','Junaid','Kashif',
    'Khalid','Majid','Nadeem','Nasir','Naveed','Rashid','Saad','Salman','Shahid','Tariq',
    'Waqar','Wasim','Yasir','Zahid','Zubair','Aamir','Amir','Asif','Azhar','Babar',
    'Danish','Farhan','Haider','Hamid','Haroon','Ibrahim','Iqbal','Irfan','Javed','Kamal',
    'Mansoor','Muneeb','Mustafa','Naeem','Noman','Owais','Raza','Rehan','Rizwan','Saqib',
    'Shehzad','Shoaib','Sohail','Talha','Taimur','Umair','Umar','Waleed','Wasif','Yousaf',
    'Zeeshan','Abdullah','Abrar','Adeel','Affan','Ahsan','Akbar','Akram','Amjad','Anwar',
    'Arif','Atif','Awais','Ayaz','Azeem','Basit','Ehsan','Fawad','Ghulam','Habib',
    'Hafeez','Hanif','Haseeb','Idrees','Ijaz','Ikram','Ismail','Jawad','Kaleem','Kareem', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Usman', 'Omar', 'Bilal', 'Hamza', 'Zain', 
    // Hindu
    'Arjun','Vijay','Rohan','Aakash','Deepak','Suresh','Rajesh','Karan','Sunil','Anil',
    'Vikram','Rahul','Sanjay','Manoj','Kailash','Ramesh','Mahesh','Dinesh','Naresh','Ganesh',
    // Christian
    'Isaac','Daniel','Samuel','David','John','Simon','Peter','Paul','Stephen','Justin',
    'Joshua','Aaron','Caleb','Luke','Matthew','Mark','Andrew','Philip','Thomas','James'
  ],
  female: [
    'Fatima','Ayesha','Zainab','Maryam','Khadija','Hafsa','Aisha','Sana','Hira','Mahnoor',
    'Aliza','Amna','Anum','Areeba','Asma','Bushra','Faiza','Fariha','Hania','Hina',
    'Iqra','Javeria','Kainat','Laiba','Maheen','Mehwish','Nadia','Naila','Nimra','Rabia',
    'Ramsha','Rida','Rubab','Sadia','Saima','Samina','Sara','Shazia','Sidra','Sumera',
    'Tayyaba','Urooj','Uzma','Warda','Zara','Zoya','Aiman','Alina','Amber','Aneela',
    'Arooj','Asiya','Azra','Beenish','Farah','Faryal','Ghazala','Habiba','Hajra','Haleema',
    'Humera','Iram','Kinza','Lubna','Madiha','Maha','Maira','Maria','Mariam','Mehreen',
    'Misbah','Nargis','Nazia','Neha','Noreen','Nosheen','Palwasha','Qurat','Rafia','Rehana',
    'Riffat','Rimsha','Rukhsar','Sabeen','Sadaf','Sahar','Saira','Saleha','Samra','Saniya',
    'Sehar','Shaista','Shama','Shamsa','Shehla','Sumaira','Tahira','Tanzeela','Yasmeen','Zeenat',
    // Hindu
    'Anjali','Priya','Kavita','Laxmi','Sita','Meera','Radha','Pooja','Jyoti','Sapna',
    'Aarti','Deepa','Kiran','Rekha','Sunita','Anita','Neelam','Maya','Gita','Shanti',
    // Christian
    'Mary','Elizabeth','Martha','Ruth','Esther','Rachel','Sarah','Rebecca','Miriam','Lydia',
    'Anna','Phoebe','Tabitha','Naomi','Priscilla','Chloe','Joanna','Susanna','Abigail','Deborah'
  ],
};

const pakistaniLastNames = [
  'Ahmed','Ali','Khan','Malik','Sheikh','Hussain','Hassan','Mahmood','Akhtar','Aziz',
  'Butt','Chaudhry','Dar','Farooq','Haider','Iqbal','Javed','Karim','Latif','Mirza',
  'Naqvi','Qureshi','Raza','Saeed','Siddiqui','Tariq','Usman','Waheed','Yousaf','Zaidi',
  'Abbas','Abbasi','Afridi','Akram','Alam','Anwar','Aslam','Baig','Bashir','Bhatti',
  'Cheema','Durrani','Farooqui','Gilani','Hafeez','Hameed','Hanif','Hashmi','Hussaini','Ilyas',
  'Jamil','Javaid','Kamran','Khalid','Khawaja','Lodhi','Memon','Mughal','Mukhtar','Nadeem',
  'Nasir','Nawaz','Niazi','Pasha','Qadri','Rafiq','Rahim','Rahman','Rasheed','Riaz',
  'Sabir','Sadiq','Saleem','Shafiq','Shaheen','Shakeel','Sharif','Sher','Siddique','Sultan',
  'Tahir','Talib','Wali','Waseem','Yasin','Younus','Zafar','Zaheer','Zakir','Zaman',
  // Non-Muslim common surnames
  'Gill','Masih','Victor','Anthony','Sahotra','Lal','Kumar','Ram','Chander','Das'
];

const pakistaniCities = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta',
  'Sialkot','Gujranwala','Hyderabad','Bahawalpur','Sargodha','Sukkur','Larkana','Mardan',
  'Abbottabad','Sahiwal','Jhang','Dera Ghazi Khan','Gujrat','Sheikhupura','Mirpur Khas',
  'Nawabshah','Chiniot','Kamoke','Sadiqabad','Burewala','Jacobabad','Muzaffargarh',
  'Okara','Murree','Gilgit','Skardu','Gwadar','Hub','Taxila','Wah Cantt','Attock','Kohat',
  'Nowshera','Swabi','Charsadda','Mingora','Mansehra','Dera Ismail Khan','Bannu','Chaman',
  'Zhob','Khuzdar','Kalat','Panjgur','Turbat','Umarkot','Tharparkar','Badin','Thatta',
  'Kotri','Tando Adam','Shahdadpur','Sanghar','Matiari','Hala','Ghotki','Pano Akil',
  'Rohri','Khairpur','Shikarpur','Kandhkot','Kashmore','Dadu','Sehwan','Mehar','Moro',
  'Rahim Yar Khan','Khanpur','Liaquatpur','Ahmedpur East','Lodhran','Dunaypur','Kehror Pacca',
  'Mailsi','Vehari','Hasilpur','Chishtian','Haroonabad','Bahawalnagar','Fort Abbas','Pakpattan',
  'Arifwala','Chichawatni','Kamalia','Pir Mahal','Toba Tek Singh','Gojra','Jaranwala','Chakwal'
];

const teacherSubjects = [
  ['Mathematics','Algebra','Calculus'],['Physics','Mechanics','Thermodynamics'],
  ['Chemistry','Organic Chemistry','Inorganic Chemistry'],['Computer Science','Programming','Data Structures'],
  ['English','Literature','Grammar'],['Urdu','Poetry','Prose'],
  ['Biology','Genetics','Ecology'],['Economics','Microeconomics','Macroeconomics'],
  ['Business Studies','Accounting','Finance'],['History','Pakistan Studies','World History'],
  ['Geography','Physical Geography','Human Geography'],['Islamic Studies','Quran','Hadith'],
  ['Statistics','Probability','Data Analysis'],['Web Development','JavaScript','React'],
  ['Python Programming','Django','Flask'],['Mobile Development','Android','iOS'],
  ['Graphic Design','Photoshop','Illustrator'],['Digital Marketing','SEO','Social Media'],
  ['Artificial Intelligence','Machine Learning','Deep Learning'],['Cybersecurity','Ethical Hacking','Network Security'],
];

const teacherQualifications = [
  ['MSc Computer Science','BSc Software Engineering'],['PhD Mathematics','MSc Applied Mathematics'],
  ['MSc Physics','BSc Physics'],['MSc Chemistry','BSc Chemistry'],
  ['MA English Literature','BA English'],['MA Urdu','BA Urdu'],
  ['MSc Biology','BSc Zoology'],['MBA Finance','BBA'],
  ['MSc Economics','BSc Economics'],['MA History','BA History'],
  ['MSc Statistics','BSc Mathematics'],['BSc Computer Science','Certified Web Developer'],
  ['MSc Data Science','BSc Computer Science'],['BE Software Engineering','Certified Scrum Master'],
  ['MA Islamic Studies','BA Islamic Studies'],
];

const gradeLevels = ['High School','Intermediate','University','Graduate','Professional'];
const studentSubjects = [
  ['Mathematics','Physics'],['Computer Science','Programming'],['Chemistry','Biology'],
  ['Business Studies','Economics'],['English','Urdu'],['Web Development','Mobile Development'],
  ['Data Science','Machine Learning'],['Graphic Design','Digital Marketing'],
  ['Accounting','Finance'],['Islamic Studies','Pakistan Studies'],
];
const learningGoals = [
  ['Prepare for university entrance','Improve grades'],['Learn programming','Build projects'],
  ['Career change to tech','Get a better job'],['Master mathematics','Ace exams'],
  ['Learn web development','Become a developer'],['Improve English skills','Study abroad'],
  ['Start freelancing','Earn online'],['Prepare for CSS exam','Join civil service'],
  ['Learn data science','Become data analyst'],['Master business skills','Start own business'],
];

// ---- Helpers ----
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function toEmail(first: string, last: string) {
  return `${first.toLowerCase().replace(/\s+/g, '.')}.${last.toLowerCase().replace(/\s+/g, '.')}@yopmail.com`;
}

/** Generate `count` unique {firstName, lastName, email} combos. Skips duplicates by email. */
function generateUniqueUsers(count: number, femalePct: number) {
  const seen = new Set<string>();
  const users: { firstName: string; lastName: string; email: string; isMale: boolean }[] = [];

  // Safety cap to avoid infinite loop if name pool is too small
  let attempts = 0;
  const maxAttempts = count * 10;

  while (users.length < count && attempts < maxAttempts) {
    attempts++;
    const isMale = Math.random() > femalePct;
    const firstName = isMale ? rand(pakistaniFirstNames.male) : rand(pakistaniFirstNames.female);
    const lastName = rand(pakistaniLastNames);
    const email = toEmail(firstName, lastName);

    if (seen.has(email)) continue; // skip duplicate
    seen.add(email);
    users.push({ firstName, lastName, email, isMale });
  }

  if (users.length < count) {
    console.warn(`⚠️  Could only generate ${users.length}/${count} unique users from name pool`);
  }
  return users;
}

/** Run an async fn over items in batches of `size`, returning results. */
async function batchProcess<T, R>(
  items: T[],
  size: number,
  fn: (item: T, idx: number) => Promise<R>,
  label: string,
): Promise<(R | null)[]> {
  const results: (R | null)[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const settled = await Promise.allSettled(
      batch.map((item, bi) => fn(item, i + bi))
    );
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : null);
      if (r.status === 'rejected') {
        console.log(`   ⚠️  ${label} error: ${(r.reason as Error)?.message ?? r.reason}`);
      }
    }
    const done = Math.min(i + size, items.length);
    if (done % 50 === 0 || done === items.length) {
      console.log(`   ✅ ${done}/${items.length} ${label}...`);
    }
  }
  return results;
}

/** Create Firebase user, return uid. Reuses existing if email taken. */
async function ensureFirebaseUser(email: string, firstName: string, lastName: string): Promise<string> {
  try {
    const rec = await adminAuth.createUser({
      email, password: 'password123', emailVerified: true,
      displayName: `${firstName} ${lastName}`,
    });
    return rec.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await adminAuth.getUserByEmail(email);
      return existing.uid;
    }
    throw err;
  }
}

// ---- Main ----
async function main() {
  const t0 = Date.now();
  console.log('🌱 Starting FAST Pakistani users seed (Firebase + Database)...\n');
  console.log(`🔐 Password for all users: password123`);
  console.log(`⚡ Batch size: ${BATCH_SIZE} concurrent operations\n`);

  // ===================== TEACHERS =====================
  console.log('👨‍🏫 Generating 70 unique teacher profiles...');
  const teacherData = generateUniqueUsers(70, 0.3);
  console.log(`   Generated ${teacherData.length} unique teachers\n`);

  console.log('👨‍🏫 Creating teachers (Firebase + DB)...');
  const teachers = await batchProcess(
    teacherData,
    BATCH_SIZE,
    async (u, idx) => {
      const firebaseUid = await ensureFirebaseUser(u.email, u.firstName, u.lastName);

      const subjects = rand(teacherSubjects);
      const qualifications = rand(teacherQualifications);
      const experience = randInt(2, 15);
      const rating = parseFloat((4.0 + Math.random()).toFixed(1));
      const reviewCount = randInt(5, 100);
      const lessonsCompleted = randInt(50, 500);
      const activeStudents = randInt(10, 50);
      const city = rand(pakistaniCities);

      const teacher = await prisma.user.upsert({
        where: { email: u.email },
        update: { firebaseUid, firstName: u.firstName, lastName: u.lastName },
        create: {
          firebaseUid, email: u.email,
          firstName: u.firstName, lastName: u.lastName,
          role: 'TEACHER', emailVerified: true, isActive: true,
          teacherProfile: {
            create: {
              applicationStatus: 'APPROVED', qualifications, subjects, experience,
              bio: `Experienced ${subjects[0]} teacher from ${city} with ${experience} years of teaching experience. Passionate educator specializing in ${subjects.join(', ')}. Dedicated to helping students achieve their academic goals.`,
              rating, reviewCount, lessonsCompleted, activeStudents,
            },
          },
        },
      });
      return teacher;
    },
    'teachers',
  );

  const createdTeachers = teachers.filter(Boolean) as any[];
  console.log(`   ✅ Successfully created ${createdTeachers.length} teachers\n`);

  // ===================== STUDENTS =====================
  console.log('👨‍🎓 Generating 500 unique student profiles...');
  const studentData = generateUniqueUsers(100, 0.4);
  console.log(`   Generated ${studentData.length} unique students\n`);

  console.log('👨‍🎓 Creating students (Firebase + DB)...');
  const students = await batchProcess(
    studentData,
    BATCH_SIZE,
    async (u) => {
      const firebaseUid = await ensureFirebaseUser(u.email, u.firstName, u.lastName);

      const gradeLevel = rand(gradeLevels);
      const subjects = rand(studentSubjects);
      const goals = rand(learningGoals);
      const profileCompletion = randInt(40, 100);
      const city = rand(pakistaniCities);

      const student = await prisma.user.upsert({
        where: { email: u.email },
        update: { firebaseUid, firstName: u.firstName, lastName: u.lastName },
        create: {
          firebaseUid, email: u.email,
          firstName: u.firstName, lastName: u.lastName,
          role: 'STUDENT', emailVerified: true, isActive: true,
          studentProfile: {
            create: {
              gradeLevel, subjects, learningGoals: goals,
              profileCompletionPercentage: profileCompletion,
              bio: `${gradeLevel} student from ${city} passionate about learning.`,
            },
          },
        },
      });
      return student;
    },
    'students',
  );

  const createdStudents = students.filter(Boolean) as any[];
  console.log(`   ✅ Successfully created ${createdStudents.length} students\n`);

  // ===================== SUMMARY =====================
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Teachers: ${createdTeachers.length}`);
  console.log(`   - Students: ${createdStudents.length}`);
  console.log(`   - Total Users: ${createdTeachers.length + createdStudents.length}`);
  console.log(`   - Created in: Firebase Auth + Database`);
  console.log(`   - Time: ${elapsed}s\n`);

  console.log('🔑 Sample Accounts:');
  console.log('   Teachers (first 5):');
  createdTeachers.slice(0, 5).forEach((t: any) =>
    console.log(`     - ${t.email} (${t.firstName} ${t.lastName})`)
  );
  console.log('   Students (first 5):');
  createdStudents.slice(0, 5).forEach((s: any) =>
    console.log(`     - ${s.email} (${s.firstName} ${s.lastName})`)
  );

  console.log('\n🔐 Login Credentials:');
  console.log('   Email: Any email from above');
  console.log('   Password: password123');
  console.log('\n💡 All users are created in Firebase Auth and can login immediately!\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());