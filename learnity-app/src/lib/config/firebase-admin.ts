import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

// Firebase Admin configuration from environment variables
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
};

// Validate required environment variables
const requiredAdminEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

for (const envVar of requiredAdminEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required Firebase Admin environment variable: ${envVar}`);
  }
}

// Initialize Firebase Admin app (singleton pattern)
let adminApp: App;
let adminAuth: Auth;
let adminStorage: Storage;

if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey,
    }),
    projectId: firebaseAdminConfig.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getApps()[0];
}

// Initialize Firebase Admin services
adminAuth = getAuth(adminApp);
adminStorage = getStorage(adminApp);

export { adminApp, adminAuth, adminStorage };
export default adminApp;