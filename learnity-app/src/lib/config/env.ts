import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Firebase Client
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),
  
  // Firebase Admin
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'FIREBASE_ADMIN_PROJECT_ID is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email('FIREBASE_ADMIN_CLIENT_EMAIL must be a valid email'),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, 'FIREBASE_ADMIN_PRIVATE_KEY is required'),
  
  // hCaptcha
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().min(1, 'NEXT_PUBLIC_HCAPTCHA_SITE_KEY is required'),
  HCAPTCHA_SECRET_KEY: z.string().min(1, 'HCAPTCHA_SECRET_KEY is required'),
  
  // Static Admin
  STATIC_ADMIN_EMAIL: z.string().email('STATIC_ADMIN_EMAIL must be a valid email'),
  STATIC_ADMIN_PASSWORD: z.string().min(8, 'STATIC_ADMIN_PASSWORD must be at least 8 characters'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional reCAPTCHA (for Firebase App Check)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
});

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper function to check if all required env vars are set
export function checkRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const result = envSchema.safeParse(process.env);
  
  if (result.success) {
    return { valid: true, missing: [] };
  }
  
  const missing = result.error.errors.map(err => err.path.join('.'));
  return { valid: false, missing };
}

// Helper function to get environment-specific configuration
export function getConfig() {
  return {
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    
    database: {
      url: env.DATABASE_URL,
    },
    
    firebase: {
      client: {
        apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
      admin: {
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
      }
    },
    
    hcaptcha: {
      siteKey: env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
      secretKey: env.HCAPTCHA_SECRET_KEY,
    },
    
    staticAdmin: {
      email: env.STATIC_ADMIN_EMAIL,
      password: env.STATIC_ADMIN_PASSWORD,
    },
    
    nextAuth: {
      secret: env.NEXTAUTH_SECRET,
      url: env.NEXTAUTH_URL,
    },
    
    recaptcha: {
      siteKey: env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    }
  };
}