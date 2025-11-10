# Database Seeding Guide

## Overview
This directory contains seed scripts to populate the database with sample data for development and demo purposes.

---

## Available Seed Scripts

### 1. Teacher Seed (`seed-teachers.ts`)
Populates the database with 15 diverse, realistic teacher profiles.

**Run Command:**
```bash
npm run db:seed:teachers
```

**What it creates:**
- 15 Teacher user accounts
- Complete teacher profiles with:
  - Approved application status
  - Subjects taught
  - Years of experience
  - Professional bio
  - Hourly rates ($50-$80)
  - Qualifications and credentials
  - Email addresses (@topmail.com)

---

## Teacher Profiles Created

### 1. Sarah Johnson - Mathematics Expert
- **Email**: sarah.johnson@topmail.com
- **Subjects**: Mathematics, Physics, Calculus
- **Experience**: 8 years
- **Rate**: $65/hr
- **Credentials**: PhD Applied Mathematics (MIT)

### 2. Michael Chen - Computer Science
- **Email**: michael.chen@topmail.com
- **Subjects**: Computer Science, Python, Web Development, JavaScript
- **Experience**: 6 years
- **Rate**: $75/hr
- **Credentials**: BS Computer Science (Stanford), Ex-Google Engineer

### 3. Emily Rodriguez - English & Writing
- **Email**: emily.rodriguez@topmail.com
- **Subjects**: English, Literature, Creative Writing
- **Experience**: 10 years
- **Rate**: $55/hr
- **Credentials**: MFA Creative Writing (Iowa), Published Novelist

### 4. David Patel - Chemistry & Biology
- **Email**: david.patel@topmail.com
- **Subjects**: Chemistry, Biology, Science
- **Experience**: 12 years
- **Rate**: $60/hr
- **Credentials**: PhD Chemistry (Cambridge), Research Scientist

### 5. Jessica Williams - Languages
- **Email**: jessica.williams@topmail.com
- **Subjects**: Spanish, French, Languages
- **Experience**: 7 years
- **Rate**: $50/hr
- **Credentials**: BA Linguistics (Barcelona), DELE Certified

### 6. Robert Thompson - History
- **Email**: robert.thompson@topmail.com
- **Subjects**: History, Social Studies, Geography
- **Experience**: 15 years
- **Rate**: $58/hr
- **Credentials**: PhD History (Yale), AP History Expert

### 7. Amanda Lee - Art & Design
- **Email**: amanda.lee@topmail.com
- **Subjects**: Art, Design, Digital Art
- **Experience**: 5 years
- **Rate**: $52/hr
- **Credentials**: BFA Design (RISD), Adobe Certified

### 8. James Anderson - Economics & Business
- **Email**: james.anderson@topmail.com
- **Subjects**: Economics, Business, Finance
- **Experience**: 9 years
- **Rate**: $70/hr
- **Credentials**: MBA Finance (Wharton), CFA, Ex-Goldman Sachs

### 9. Lisa Martinez - Music
- **Email**: lisa.martinez@topmail.com
- **Subjects**: Music, Piano, Music Theory
- **Experience**: 11 years
- **Rate**: $62/hr
- **Credentials**: MM Piano Performance (Juilliard), Concert Pianist

### 10. Kevin Brown - Physics & Engineering
- **Email**: kevin.brown@topmail.com
- **Subjects**: Physics, Engineering, Robotics
- **Experience**: 8 years
- **Rate**: $68/hr
- **Credentials**: MS Mechanical Engineering (MIT), Patent Holder

### 11. Rachel Kim - Psychology
- **Email**: rachel.kim@topmail.com
- **Subjects**: Psychology, Sociology, Social Sciences
- **Experience**: 6 years
- **Rate**: $56/hr
- **Credentials**: PhD Psychology (Berkeley), Licensed Psychologist

### 12. Thomas Garcia - Statistics & Data Science
- **Email**: thomas.garcia@topmail.com
- **Subjects**: Statistics, Data Science, Mathematics
- **Experience**: 7 years
- **Rate**: $72/hr
- **Credentials**: MS Statistics (Stanford), Kaggle Master

### 13. Nicole Taylor - Biology & Health Sciences
- **Email**: nicole.taylor@topmail.com
- **Subjects**: Biology, Anatomy, Health Sciences
- **Experience**: 10 years
- **Rate**: $80/hr
- **Credentials**: MD (Johns Hopkins), MCAT Prep Expert

### 14. Daniel Wilson - Philosophy
- **Email**: daniel.wilson@topmail.com
- **Subjects**: Philosophy, Ethics, Critical Thinking
- **Experience**: 13 years
- **Rate**: $54/hr
- **Credentials**: PhD Philosophy (Oxford), Published Author

### 15. Sophia Nguyen - Mandarin Chinese
- **Email**: sophia.nguyen@topmail.com
- **Subjects**: Mandarin, Chinese Culture, Languages
- **Experience**: 9 years
- **Rate**: $58/hr
- **Credentials**: BA Chinese Literature (Beijing University), HSK Examiner

---

## Subject Coverage

The seed data covers a comprehensive range of subjects:

### STEM
- Mathematics, Calculus, Statistics
- Physics, Chemistry, Biology
- Computer Science, Programming
- Engineering, Robotics
- Data Science

### Languages
- Spanish, French
- Mandarin Chinese
- English, Literature

### Arts & Humanities
- Art, Design, Digital Art
- Music, Piano
- History, Geography
- Philosophy, Ethics
- Psychology, Sociology

### Business & Professional
- Economics, Finance
- Business, MBA prep

---

## Usage Instructions

### First Time Setup
```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema to database
npm run db:push

# 3. Seed teachers
npm run db:seed:teachers
```

### Reset and Reseed
```bash
# Clear existing data and reseed
npm run db:push -- --force-reset
npm run db:seed:teachers
```

### View Seeded Data
```bash
# Open Prisma Studio
npm run db:studio
```

---

## Important Notes

### Firebase UIDs
- Seed data uses temporary Firebase UIDs in format: `seed_firstname.lastname`
- These are for development only
- In production, real Firebase UIDs would be used

### Passwords
- Seed script includes a default password hash
- Teachers would set their own passwords in production
- Default: `Teacher123!` (for development only)

### Email Addresses
- All emails use `@topmail.com` domain
- This is a safe domain for testing
- No real emails will be sent

### Application Status
- All teachers are pre-approved (`APPROVED` status)
- This allows immediate display on the teachers page
- In production, teachers go through approval process

---

## Verification

After running the seed, verify the data:

1. **Check Database**:
   ```bash
   npm run db:studio
   ```
   - Navigate to `User` table
   - Filter by `role = TEACHER`
   - Should see 15 teachers

2. **Check API**:
   ```bash
   curl http://localhost:3000/api/teachers/featured
   ```
   - Should return JSON with 12 teachers (API limit)

3. **Check UI**:
   - Visit: `http://localhost:3000/teachers`
   - Should see teacher cards displayed

---

## Troubleshooting

### Error: "Unique constraint failed"
**Cause**: Teachers already exist in database
**Solution**: 
```bash
# Reset database
npm run db:push -- --force-reset
# Reseed
npm run db:seed:teachers
```

### Error: "Cannot find module"
**Cause**: Missing dependencies
**Solution**:
```bash
npm install
npm run db:generate
```

### Error: "Database connection failed"
**Cause**: DATABASE_URL not configured
**Solution**: Check `.env` file has valid `DATABASE_URL`

---

## Customization

### Add More Teachers
Edit `seed-teachers.ts` and add to `TEACHERS_DATA` array:

```typescript
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@topmail.com',
  subjects: ['Subject1', 'Subject2'],
  experience: 5,
  bio: 'Your bio here...',
  hourlyRate: '60',
  qualifications: ['Qualification 1', 'Qualification 2'],
}
```

### Modify Existing Teachers
Update the data in `TEACHERS_DATA` array and re-run seed.

### Change Email Domain
Replace `@topmail.com` with your preferred domain.

---

## Production Considerations

⚠️ **DO NOT** run seed scripts in production!

These scripts are for:
- ✅ Development
- ✅ Testing
- ✅ Demo environments
- ❌ Production (never!)

---

## Related Files

- `seed-teachers.ts` - Teacher seed script
- `schema.prisma` - Database schema
- `../src/app/api/teachers/featured/route.ts` - API endpoint
- `../src/components/teachers/TeacherCard.tsx` - UI component

---

*Last Updated: November 10, 2024*
