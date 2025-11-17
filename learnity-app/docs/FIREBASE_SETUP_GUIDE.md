# Firebase Setup Guide for Production

## 🔥 Firebase Configuration Issue

Your registration is failing because Firebase environment variables are missing in production.

## 📋 Step-by-Step Setup

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one if needed)
3. Click **Project Settings** (gear icon)

### 2. Get Client Configuration

In **Project Settings** → **General** → **Your apps**:

```javascript
// Copy these values to Vercel environment variables
const firebaseConfig = {
  apiKey: "AIza...",                    // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",          // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",  // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",        // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"             // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### 3. Get Admin Configuration

In **Project Settings** → **Service Accounts**:

1. Click **Generate new private key**
2. Download the JSON file
3. Extract these values:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  // → FIREBASE_ADMIN_PRIVATE_KEY
  "client_email": "firebase-adminsdk-...@project.iam.gserviceaccount.com", // → FIREBASE_ADMIN_CLIENT_EMAIL
  "project_id": "your-project-id"  // → FIREBASE_ADMIN_PROJECT_ID
}
```

### 4. Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

#### Firebase Client (Public) Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123:web:abc123
```

#### Firebase Admin (Server) Variables:
```
FIREBASE_ADMIN_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...
FIREBASE_ADMIN_CLIENT_EMAIL = firebase-adminsdk-...@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PROJECT_ID = your-project-id
```

#### Other Required Variables:
```
DATABASE_URL = your_neon_db_connection_string
```

### 5. Configure Firebase Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. In **Settings** → **Authorized domains**
4. Add your Vercel domain: `your-app.vercel.app`

### 6. Redeploy

After adding all environment variables:

```bash
vercel --prod
```

## 🔍 Verify Setup

Run the diagnostic script to check configuration:

```bash
npm run diagnose:firebase
```

## 🚨 Common Issues

### Private Key Format
- Must include `\n` for line breaks
- Should start with `-----BEGIN PRIVATE KEY-----\n`
- Should end with `\n-----END PRIVATE KEY-----\n`

### Project ID Mismatch
- Ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `FIREBASE_ADMIN_PROJECT_ID` are the same

### Authorized Domains
- Add your Vercel domain to Firebase authorized domains
- Include both `your-app.vercel.app` and `your-custom-domain.com`

## ✅ Success Indicators

After proper setup, you should see:
- ✅ Registration works without errors
- ✅ Email verification emails are sent
- ✅ User profiles are created in database
- ✅ Firebase authentication works

## 🆘 Still Having Issues?

1. Check Vercel deployment logs
2. Run the diagnostic script
3. Verify Firebase project settings
4. Check browser console for errors

The diagnostic script will help identify any remaining configuration issues.