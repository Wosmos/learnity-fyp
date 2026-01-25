#!/usr/bin/env node

/**
 * Firebase Configuration Diagnostic Script
 * Helps identify Firebase configuration issues in production
 */

console.log('🔍 Firebase Configuration Diagnostics\n');

// Check environment variables
console.log('1. Checking Environment Variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PROJECT_ID',
];

const missingVars = [];
const presentVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName);
    // Show partial value for security
    const value = process.env[varName];
    const displayValue =
      value.length > 20
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  } else {
    missingVars.push(varName);
    console.log(`   ❌ ${varName}: MISSING`);
  }
});

console.log(
  `\n   Summary: ${presentVars.length}/${requiredEnvVars.length} variables present`
);

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing Environment Variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n   Please add these to your Vercel environment variables.');
}

// Check Firebase configuration format
console.log('\n2. Checking Firebase Configuration Format...');

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate format
  const validations = [
    { key: 'apiKey', valid: firebaseConfig.apiKey?.startsWith('AIza') },
    {
      key: 'authDomain',
      valid: firebaseConfig.authDomain?.includes('.firebaseapp.com'),
    },
    { key: 'projectId', valid: firebaseConfig.projectId?.length > 0 },
    {
      key: 'storageBucket',
      valid: firebaseConfig.storageBucket?.includes('.appspot.com'),
    },
    {
      key: 'messagingSenderId',
      valid: /^\d+$/.test(firebaseConfig.messagingSenderId || ''),
    },
    { key: 'appId', valid: firebaseConfig.appId?.includes(':') },
  ];

  validations.forEach(({ key, valid }) => {
    console.log(
      `   ${valid ? '✅' : '❌'} ${key}: ${valid ? 'Valid format' : 'Invalid format'}`
    );
  });
} catch (error) {
  console.log('   ❌ Error validating Firebase config:', error.message);
}

// Check Firebase Admin configuration
console.log('\n3. Checking Firebase Admin Configuration...');

try {
  const adminPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  console.log(
    `   ${adminPrivateKey ? '✅' : '❌'} Private Key: ${adminPrivateKey ? 'Present' : 'Missing'}`
  );
  console.log(
    `   ${adminClientEmail ? '✅' : '❌'} Client Email: ${adminClientEmail ? 'Present' : 'Missing'}`
  );
  console.log(
    `   ${adminProjectId ? '✅' : '❌'} Project ID: ${adminProjectId ? 'Present' : 'Missing'}`
  );

  if (adminPrivateKey) {
    const keyValid = adminPrivateKey.includes('-----BEGIN PRIVATE KEY-----');
    console.log(
      `   ${keyValid ? '✅' : '❌'} Private Key Format: ${keyValid ? 'Valid' : 'Invalid (should include BEGIN/END markers)'}`
    );
  }

  if (adminClientEmail) {
    const emailValid =
      adminClientEmail.includes('@') &&
      adminClientEmail.includes('.iam.gserviceaccount.com');
    console.log(
      `   ${emailValid ? '✅' : '❌'} Client Email Format: ${emailValid ? 'Valid' : 'Invalid (should be service account email)'}`
    );
  }
} catch (error) {
  console.log('   ❌ Error validating Firebase Admin config:', error.message);
}

// Check project consistency
console.log('\n4. Checking Project ID Consistency...');

const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

if (clientProjectId && adminProjectId) {
  const consistent = clientProjectId === adminProjectId;
  console.log(
    `   ${consistent ? '✅' : '❌'} Project IDs Match: ${consistent ? 'Yes' : 'No'}`
  );
  if (!consistent) {
    console.log(`     Client: ${clientProjectId}`);
    console.log(`     Admin:  ${adminProjectId}`);
  }
} else {
  console.log('   ⚠️  Cannot check consistency - missing project IDs');
}

// Recommendations
console.log('\n📋 Recommendations:');

if (missingVars.length > 0) {
  console.log('   1. Add missing environment variables to Vercel');
  console.log(
    '   2. Ensure all Firebase config values are from the same project'
  );
}

console.log('   3. Verify Firebase project settings:');
console.log('      - Authentication is enabled');
console.log('      - Email/Password provider is enabled');
console.log('      - Authorized domains include your Vercel domain');

console.log('   4. Check Firebase Admin SDK:');
console.log('      - Service account key is valid');
console.log('      - Service account has proper permissions');

console.log('   5. For production deployment:');
console.log('      - Add your Vercel domain to Firebase authorized domains');
console.log('      - Enable App Check (optional but recommended)');

console.log('\n🔗 Useful Links:');
console.log('   - Firebase Console: https://console.firebase.google.com');
console.log('   - Vercel Environment Variables: https://vercel.com/dashboard');
console.log(
  '   - Firebase Auth Domains: https://console.firebase.google.com/project/_/authentication/settings'
);

console.log('\n✅ Diagnostic completed!');
