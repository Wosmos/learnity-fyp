# How to Run Teacher Seed

## Quick Start (3 Steps)

### Step 1: Update Database Schema
```bash
npm run db:push
```
This updates your database with the new teacher fields (isTopRated, rating, etc.)

### Step 2: Run the Seed
```bash
npm run db:seed:teachers
```
This creates 15 teachers in your database.

### Step 3: View Results
Visit: `http://localhost:3000/teachers`

---

## What You'll See

### Teachers Page
- Shows 3 teachers initially
- "Show All Teachers" button to see all 15
- Clean, minimal cards
- Click any card to see full profile

### Teacher Cards Show:
- Profile picture or initials
- Name with "Top Rated" badge (for top 3)
- Star rating and review count
- Top 2 subjects
- Bio preview (2 lines)
- Years of experience
- Hourly rate

### Teacher Detail Page
- Full profile with all information
- Hero section with large profile
- Complete bio
- All subjects taught
- All qualifications
- Languages spoken
- Quick facts sidebar
- Book a lesson CTA

---

## Verification

### Check Database
```bash
npm run db:studio
```
- Go to `User` table
- Filter: `role = TEACHER`
- Should see 15 teachers

### Check API
```bash
curl http://localhost:3000/api/teachers/featured
```
Should return JSON with all teachers

### Check UI
1. Visit: `http://localhost:3000/teachers`
2. See 3 teacher cards
3. Click "Show All Teachers"
4. See all 15 teachers
5. Click any teacher card
6. See full teacher profile

---

## Top Rated Teachers

Only 3 teachers are marked as "Top Rated":
1. **Sarah Johnson** - Mathematics (4.9★, 127 reviews)
2. **Michael Chen** - Computer Science (4.95★, 203 reviews)
3. **Emily Rodriguez** - English (4.85★, 156 reviews)

These will show the yellow "Top Rated" badge.

---

## Troubleshooting

### Error: "Column does not exist"
**Solution**: Run database push first
```bash
npm run db:push
npm run db:seed:teachers
```

### Error: "Unique constraint failed"
**Solution**: Teachers already exist, reset database
```bash
npm run db:push -- --force-reset
npm run db:seed:teachers
```

### Teachers not showing
**Solution**: Check if seed ran successfully
```bash
npm run db:studio
# Check User table for TEACHER role
```

---

## Features Implemented

✅ Database schema updated with new fields
✅ 15 diverse teachers with realistic data
✅ Only 3 marked as "Top Rated"
✅ Clean, minimal teacher cards
✅ Show 3 initially, "Show More" button
✅ Dynamic teacher detail pages (`/teachers/[id]`)
✅ All details stored in database
✅ Ratings, reviews, response time, availability
✅ Languages spoken
✅ Professional credentials

---

## Next Steps

After seeding, you can:
1. ✅ Browse teachers page
2. ✅ Click teacher cards to see details
3. ✅ Test "Show More" functionality
4. ✅ View top-rated badges
5. ✅ See ratings and reviews
6. 🔄 Add filtering by subject (future)
7. 🔄 Add search functionality (future)
8. 🔄 Add sorting options (future)

---

*Ready to go! Run the seed and explore the teachers page.* 🎓
