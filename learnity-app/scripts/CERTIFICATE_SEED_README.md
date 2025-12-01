# Certificate Seeding Script

## Overview

This script generates test certificates for existing students and courses in your database. It will:

1. Find all students in the database
2. Find all published courses
3. Create enrollments for students (if they don't exist)
4. Mark all lessons as completed
5. Pass all quizzes
6. Generate certificates with unique IDs
7. Award XP and badges

## Prerequisites

- Database must be set up and migrated
- At least one student user must exist
- At least one published course with lessons must exist

## Usage

Run the seeding script:

```bash
npm run db:seed:certificates
```

Or directly with tsx:

```bash
npx tsx scripts/seed-certificates.ts
```

## What It Does

### For Each Student:
- Randomly selects 1-3 courses
- Creates or updates enrollment to COMPLETED status
- Marks all lessons in those courses as completed
- Creates passing quiz attempts for all quizzes
- Generates a unique certificate ID (format: CERT-XXXXXXXX-XXXX)
- Awards 50 XP for course completion
- Awards "First Course Complete" badge for first certificate

### Output:
The script will display:
- Number of enrollments created/updated
- Number of certificates created
- Sample certificate IDs for testing
- Direct URLs to view certificates

## Example Output

```
🎓 Starting certificate seeding...

✅ Found 5 students
✅ Found 3 published courses

👤 Processing student: John Doe
  ✅ Created enrollment for: Introduction to React
  🎓 Created certificate for: Introduction to React
     Certificate ID: CERT-A1B2C3D4-E5F6
  🏆 Awarded FIRST_COURSE_COMPLETE badge

📊 Summary:
✅ Enrollments created/updated: 8
🎓 Certificates created: 8

📋 Sample Certificate IDs for testing:

   CERT-A1B2C3D4-E5F6
   Student: John Doe
   Course: Introduction to React
   URL: /certificates/CERT-A1B2C3D4-E5F6
```

## Testing Certificates

After running the script, you can:

1. **View Certificate Page**: Visit `/certificates/[certificateId]`
2. **Download PDF**: Click the download button on the certificate page
3. **Test Demo Page**: Visit `/certificates/demo` and enter a certificate ID

## Certificate ID Format

Certificate IDs follow this format:
- Prefix: `CERT-`
- 8 uppercase alphanumeric characters
- Hyphen
- 4 uppercase alphanumeric characters
- Example: `CERT-A1B2C3D4-E5F6`

## Database Tables Affected

- `enrollments` - Creates/updates enrollment records
- `lesson_progress` - Marks lessons as completed
- `quiz_attempts` - Creates passing quiz attempts
- `certificates` - Creates certificate records
- `user_progress` - Awards XP
- `xp_activities` - Logs XP activities
- `badges` - Awards completion badges

## Notes

- The script is idempotent - running it multiple times won't create duplicate certificates
- Existing certificates are skipped
- All operations are wrapped in try-catch for error handling
- The script will continue even if individual operations fail

## Troubleshooting

### No students found
Make sure you have users with role='STUDENT' in your database.

### No courses found
Make sure you have courses with status='PUBLISHED' in your database.

### Permission errors
Make sure your database connection string in `.env` is correct.

## Related Files

- `/components/courses/CertificatePage.tsx` - Certificate display component
- `/app/certificates/[certificateId]/page.tsx` - Certificate page
- `/app/certificates/demo/page.tsx` - Demo page for testing
- `/lib/services/certificate.service.ts` - Certificate service
