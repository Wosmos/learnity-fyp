import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  // Firebase Client Config (Public)
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID is required'),

  // Firebase Admin Config (Server-side only)
  FIREBASE_ADMIN_PRIVATE_KEY: z
    .string()
    .min(1, 'FIREBASE_ADMIN_PRIVATE_KEY is required'),
  FIREBASE_ADMIN_CLIENT_EMAIL: z
    .string()
    .email('FIREBASE_ADMIN_CLIENT_EMAIL must be a valid email'),
  FIREBASE_ADMIN_PROJECT_ID: z
    .string()
    .min(1, 'FIREBASE_ADMIN_PROJECT_ID is required'),

  // Optional environment variables
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  // Admin user configuration
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

/**
 * Validates and parses environment variables
 * Throws an error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
