# Teacher Seed Data - Quick Start Guide

## 🚀 Quick Start

Run this single command to populate your database with 15 teachers:

```bash
npm run db:seed:teachers
```

That's it! Your database now has 15 diverse, realistic teacher profiles.

---

## ✅ What You Get

### 15 Professional Teachers
- **Diverse subjects**: Math, Science, Languages, Arts, Business, and more
- **Realistic profiles**: Complete bios, qualifications, and experience
- **Approved status**: Ready to display immediately
- **Varied rates**: $50-$80/hour range
- **Professional credentials**: PhDs, MBAs, certifications from top universities

### Subject Coverage
- 📐 **STEM**: Math, Physics, Chemistry, Biology, Computer Science, Engineering
- 🌍 **Languages**: Spanish, French, Mandarin
- 🎨 **Arts**: Art, Design, Music
- 📚 **Humanities**: English, History, Philosophy, Psychology
- 💼 **Business**: Economics, Finance, Business

---

## 📊 View Your Data

### Option 1: Prisma Studio (Recommended)
```bash
npm run db:studio
```
Opens a visual database browser at `http://localhost:5555`

### Option 2: API Endpoint
Visit: `http://localhost:3000/api/teachers/featured`

### Option 3: Teachers Page
Visit: `http://localhost:3000/teachers`

---

## 🎯 Sample Teachers

Here are a few examples of what you'll get:

### Sarah Johnson - Mathematics
- PhD from MIT
- 8 years experience
- $65/hour
- Subjects: Math, Physics, Calculus

### Michael Chen - Computer Science
- Ex-Google Engineer
- Stanford graduate
- $75/hour
- Subjects: Python, JavaScript, Web Dev

### Nicole Taylor - Medical Sciences
- MD from Johns Hopkins
- MCAT prep expert
- $80/hour
- Subjects: Biology, Anatomy, Health Sciences

...and 12 more!

---

## 🔄 Reset & Reseed

If you need to start fresh:

```bash
# Reset database (⚠️ deletes all data!)
npm run db:push -- --force-reset

# Reseed teachers
npm run db:seed:teachers
```

---

## 🎨 Features Enabled

With 15 teachers, you can now showcase:

### ✅ Grid Layout
- Multiple rows of teacher cards
- Responsive design (1/2/3 columns)

### ✅ Variety
- Different subjects
- Various experience levels
- Range of pricing
- Diverse backgrounds

### ✅ Filtering (Future)
- Filter by subject
- Filter by price range
- Filter by experience
- Search by name

### ✅ Pagination (Future)
- Show 12 per page
- Load more functionality
- Infinite scroll option

---

## 📝 Teacher Data Structure

Each teacher has:

```typescript
{
  firstName: string;
  lastName: string;
  email: string;              // @topmail.com
  subjects: string[];         // 2-4 subjects
  experience: number;         // 5-15 years
  bio: string;               // Professional bio
  hourlyRate: string;        // $50-$80
  qualifications: string[];  // 3 credentials
  applicationStatus: 'APPROVED';
  emailVerified: true;
  isActive: true;
}
```

---

## 🛠️ Customization

### Add Your Own Teachers

Edit `prisma/seed-teachers.ts`:

```typescript
const TEACHERS_DATA = [
  // ... existing teachers
  {
    firstName: 'Your',
    lastName: 'Name',
    email: 'your.name@topmail.com',
    subjects: ['Your', 'Subjects'],
    experience: 5,
    bio: 'Your bio...',
    hourlyRate: '60',
    qualifications: ['Your credentials'],
  },
];
```

Then run:
```bash
npm run db:seed:teachers
```

---

## 🎓 Subject Distribution

The 15 teachers cover:

| Category | Count | Examples |
|----------|-------|----------|
| STEM | 6 | Math, Physics, CS, Chemistry, Biology, Engineering |
| Languages | 3 | Spanish, French, Mandarin |
| Arts | 2 | Art/Design, Music |
| Humanities | 3 | English, History, Philosophy, Psychology |
| Business | 1 | Economics, Finance |

---

## 🔍 Verification Checklist

After seeding, verify:

- [ ] Database has 15 teachers (Prisma Studio)
- [ ] API returns teachers (featured endpoint)
- [ ] Teachers page displays cards
- [ ] Each card shows correct info
- [ ] Hover effects work
- [ ] "Book a Lesson" buttons work
- [ ] Mobile responsive

---

## 💡 Pro Tips

### 1. Development Workflow
```bash
# Start dev server
npm run dev

# In another terminal, seed data
npm run db:seed:teachers

# View in browser
open http://localhost:3000/teachers
```

### 2. Quick Reset
```bash
# One-liner to reset and reseed
npm run db:push -- --force-reset && npm run db:seed:teachers
```

### 3. Check Specific Teacher
```bash
# Open Prisma Studio
npm run db:studio

# Filter by email
# Search: "sarah.johnson@topmail.com"
```

---

## ⚠️ Important Notes

### Development Only
- ✅ Use in development
- ✅ Use in testing
- ✅ Use for demos
- ❌ **NEVER** use in production

### Email Domain
- All emails use `@topmail.com`
- Safe for testing
- No real emails sent

### Firebase UIDs
- Temporary UIDs: `seed_firstname.lastname`
- For development only
- Production uses real Firebase UIDs

---

## 🐛 Troubleshooting

### "Unique constraint failed"
**Solution**: Teachers already exist. Reset database:
```bash
npm run db:push -- --force-reset
npm run db:seed:teachers
```

### "Cannot connect to database"
**Solution**: Check `.env` file has `DATABASE_URL`

### "No teachers showing on page"
**Solution**: 
1. Check API: `curl http://localhost:3000/api/teachers/featured`
2. Check browser console for errors
3. Verify seed ran successfully

---

## 📚 Related Documentation

- [Seed README](../prisma/SEED_README.md) - Detailed seed documentation
- [Teacher Card Design](./LANDING_PAGE_REFACTOR.md) - UI component details
- [API Documentation](./API_ROUTES.md) - API endpoints

---

## 🎉 Success!

You now have:
- ✅ 15 professional teacher profiles
- ✅ Diverse subject coverage
- ✅ Realistic data for demos
- ✅ Ready-to-use teachers page
- ✅ Foundation for filtering/search features

**Next Steps:**
1. Visit `/teachers` page
2. See the beautiful teacher cards
3. Test hover effects
4. Plan filtering features
5. Add pagination

---

*Happy Teaching! 🎓*
