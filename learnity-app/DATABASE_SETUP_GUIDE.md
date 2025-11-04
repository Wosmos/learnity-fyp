# Database Setup Guide - Why No Data in Neon DB

## The Problem

Your user data is **NOT in Neon DB** because the registration API was incomplete (stub code).

### What Was Happening Before:
```typescript
// Old code (lines 30-40 in route.ts)
// Note: In a real implementation, you would:
// 1. Get the Firebase UID from the authenticated user
// 2. Create the user profile in your database
// 3. Set custom claims in Firebase

console.log('Student registration data:', studentProfile);
// ⬆️ Only logged to console, never saved to database!

return NextResponse.json({ success: true }); // Fake success
```

## What I Fixed ✅

### 1. Updated API Route (`src/app/api/auth/register/student/route.ts`)
Now it:
- ✅ Gets Firebase UID from request headers
- ✅ Creates DatabaseService instance
- ✅ Calls `createUserProfile()` to save to Neon DB
- ✅ Returns actual user ID from database

### 2. Updated Client Service (`src/lib/services/client-auth.service.ts`)
Now it:
- ✅ Gets Firebase ID token
- ✅ Sends Firebase UID in headers
- ✅ Backend can now save to database with correct UID

---

## Setup Required

### Step 1: Check Database Connection

You need `DATABASE_URL` in your `.env` or `.env.local`:

```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

**Get your Neon DB connection string:**
1. Go to https://console.neon.tech/
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Add to `.env.local`

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client that DatabaseService uses.

### Step 3: Push Schema to Database

```bash
npx prisma db push
```

This creates all tables in your Neon database.

### Step 4: Verify Database

```bash
npx prisma studio
```

Opens a GUI to view your database tables.

---

## Test the Fix

### Option 1: Register a New User

1. Go to `/auth/register`
2. Register a new student
3. Check console logs - you should see:
   ```
   Creating student profile for Firebase UID: [uid]
   ✅ Student profile created in database: [id]
   ```
4. Check Neon DB - user should be there!

### Option 2: Manually Add Existing User

Your existing user (m.wasifmalik17@gmail.com) is in Firebase but not in DB.

You can manually add it:

1. Get Firebase UID from Firebase Console → Authentication → Users
2. Run this in Prisma Studio or directly in DB:

```sql
INSERT INTO users (
  id, 
  "firebaseUid", 
  email, 
  "firstName", 
  "lastName", 
  role, 
  "emailVerified", 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'cuid_here',  -- Generate a CUID
  'your-firebase-uid-here',
  'm.wasifmalik17@gmail.com',
  'Your',
  'Name',
  'STUDENT',
  true,
  true,
  NOW(),
  NOW()
);
```

---

## Architecture: Firebase + Neon DB

### Current Setup (Correct):

```
Registration Flow:
1. Create user in Firebase Auth ✅
2. Send email verification ✅
3. Create profile in Neon DB ✅ (NOW WORKING)
4. Set custom claims ⏳ (TODO)

Login Flow:
1. Authenticate with Firebase ✅
2. Get user profile from Neon DB ✅
3. Load custom claims ⏳
```

### Data Storage:

| Data Type | Storage Location | Why |
|-----------|------------------|-----|
| Authentication | Firebase Auth | Secure auth, tokens, sessions |
| User Profile | Neon DB | Source of truth, queryable |
| Custom Claims | Firebase Auth | Role/permissions for security rules |
| Files/Images | Firebase Storage | Scalable file storage |

---

## Why This Architecture?

### Firebase Auth:
- ✅ Handles authentication securely
- ✅ Provides JWT tokens
- ✅ Email verification
- ✅ Password reset
- ✅ Social login (Google, Microsoft)

### Neon DB (PostgreSQL):
- ✅ **Source of truth** for user data
- ✅ Complex queries and joins
- ✅ Relational data (students, teachers, courses)
- ✅ Full-text search
- ✅ Transactions and data integrity

### Why Both?
- Firebase Auth = Authentication & Authorization
- Neon DB = Application Data & Business Logic

---

## Verify It's Working

### Check Neon DB:

1. **Via Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   - Open http://localhost:5555
   - Click "User" table
   - You should see users

2. **Via Neon Console:**
   - Go to https://console.neon.tech/
   - Select your project
   - Go to "SQL Editor"
   - Run: `SELECT * FROM users;`

3. **Via API:**
   Create a test endpoint to query users

---

## Common Issues

### Issue 1: "PrismaClient is not configured"
**Solution:**
```bash
npx prisma generate
```

### Issue 2: "Table 'users' doesn't exist"
**Solution:**
```bash
npx prisma db push
```

### Issue 3: "DATABASE_URL not found"
**Solution:**
Add to `.env.local`:
```env
DATABASE_URL="your-neon-connection-string"
```

### Issue 4: "Cannot connect to database"
**Solution:**
- Check Neon DB is active (not suspended)
- Check connection string is correct
- Check firewall/network settings

---

## Next Steps

### 1. Test New Registration
Register a new user and verify it appears in Neon DB

### 2. Migrate Existing User
Add your existing Firebase user to Neon DB manually

### 3. Implement Custom Claims
Set up Firebase Admin SDK to set role/permissions

### 4. Build Dashboards
Now that data is in DB, you can query it for dashboards

---

## Summary

✅ **Fixed:** Registration now saves to Neon DB
✅ **Architecture:** Firebase Auth + Neon DB (correct approach)
✅ **Source of Truth:** Neon DB is the single source of truth
⏳ **TODO:** Set up Firebase Admin SDK for custom claims
⏳ **TODO:** Build dashboards to display user data

**Your existing user is in Firebase but not in DB. New registrations will now save to both!**
