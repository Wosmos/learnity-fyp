import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, AppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let appCheck: AppCheck | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth
const auth: Auth = getAuth(app);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase App Check for bot protection
// Disabled in development - enable in production with proper ReCaptcha Enterprise setup
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  try {
    // Only initialize App Check in the browser
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      ),
      isTokenAutoRefreshEnabled: true
    });
    console.log('Firebase App Check initialized');
  } catch (error) {
    console.warn('Failed to initialize Firebase App Check:', error);
    // App Check is optional, continue without it in development
  }
}

// Connect to emulators in development (only if explicitly enabled)
if (process.env.NODE_ENV === 'development' && 
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && 
    typeof window !== 'undefined') {
  try {
    // Connect to Auth emulator
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('Connected to Firebase Auth Emulator');
    } catch {
      // Emulator already connected or not available
    }
    
    // Connect to Storage emulator
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Firebase Storage Emulator');
    } catch {
      // Emulator already connected or not available
    }
  } catch {
    console.warn('Failed to connect to Firebase emulators');
  }
}

export { app, auth, storage, appCheck };
export default app;