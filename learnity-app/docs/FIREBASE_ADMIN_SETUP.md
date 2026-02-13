# Firebase Admin SDK Setup Guide

This guide will help you set up Firebase Admin SDK to enable programmatic user management and custom claims.

## 🔧 Step 1: Generate Service Account Key

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ in the sidebar
   - Select "Project settings"

3. **Go to Service Accounts Tab**
   - Click on "Service accounts" tab
   - You should see "Firebase Admin SDK" section

4. **Generate New Private Key**
   - Click "Generate new private key"
   - A JSON file will be downloaded
   - **Keep this file secure!** It contains sensitive credentials

## 🔑 Step 2: Extract Credentials from JSON

The downloaded JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

## 📝 Step 3: Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Firebase Admin SDK Configuration
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Admin Setup Secret (for initial admin promotion)
ADMIN_SETUP_SECRET=your-super-secret-key-change-this
```

### ⚠️ Important Notes:

- **Private Key**: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Line Breaks**: Keep the `\n` characters in the private key
- **Quotes**: Wrap the private key in double quotes
- **Security**: Never commit these credentials to version control

## 🧪 Step 4: Test the Configuration

1. **Restart your development server**

   ```bash
   npm run dev
   ```

2. **Visit the Admin Setup page**
   - Go to `/admin-setup`
   - Enter your email and the secret key
   - Click "Promote to Admin"

3. **Check for success**
   - You should see a success message
   - The user should now have admin privileges

## 🔍 Step 5: Verify Admin Access

1. **Refresh your browser** (to get new auth token with claims)
2. **Visit `/admin/test`** to check your admin status
3. **Try accessing admin pages** like `/admin`, `/admin/audit-logs`

## 🛠️ Alternative: Manual Setup in Firebase Console

If the automatic setup doesn't work, you can manually set custom claims:

1. **Go to Firebase Console > Authentication > Users**
2. **Find your user** and click on them
3. **In the user details, scroll down to "Custom claims"**
4. **Add this JSON:**
   ```json
   {
     "role": "ADMIN",
     "permissions": [
       "VIEW_ADMIN_PANEL",
       "MANAGE_USERS",
       "APPROVE_TEACHERS",
       "VIEW_AUDIT_LOGS",
       "MANAGE_PLATFORM"
     ],
     "profileComplete": true,
     "emailVerified": true
   }
   ```
5. **Save the changes**
6. **Refresh your browser** to get the new token

## 🚨 Troubleshooting

### Error: "Firebase Admin SDK not properly configured"

- Check that all environment variables are set correctly
- Verify the private key format (should include `\n` characters)
- Make sure you restarted the development server

### Error: "There is no user record"

- The user must be registered in Firebase Auth first
- Go to `/auth/register` and create an account
- Then try the admin promotion

### Error: "Unauthorized"

- Check that `ADMIN_SETUP_SECRET` matches what you're entering
- Make sure the secret is set in your `.env.local` file

### Still having issues?

- Check the browser console for detailed error messages
- Check the server logs in your terminal
- Verify your Firebase project settings

## 🔒 Security Considerations

1. **Remove the promote-admin endpoint** in production
2. **Use proper admin authentication** for user management
3. **Rotate service account keys** regularly
4. **Limit service account permissions** to minimum required
5. **Monitor admin actions** through audit logs

## ✅ Success Checklist

- [ ] Downloaded service account JSON from Firebase Console
- [ ] Added environment variables to `.env.local`
- [ ] Restarted development server
- [ ] Successfully promoted user to admin
- [ ] Verified admin access on `/admin/test`
- [ ] Can access admin dashboard and features

Once you complete these steps, your Firebase Admin SDK will be properly configured and you'll have full admin access to the platform! 🎉
