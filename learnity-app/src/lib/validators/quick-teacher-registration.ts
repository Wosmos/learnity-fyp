/**
 * Quick Teacher Registration Validation Schema
 * Simplified 3-step registration process
 */

import { z } from 'zod';

// Phone number regex for international format
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// YouTube URL regex
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}$/;

export const quickTeacherRegistrationSchema = z
  .object({
    // Step 1: Basic Information
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      ),

    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens, and apostrophes'
      ),

    email: z
      .string()
      .email('Please enter a valid email address')
      .max(100, 'Email must be less than 100 characters'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

    confirmPassword: z.string(),

    country: z.string().min(2, 'Please select your country'),

    phone: z
      .string()
      .regex(
        phoneRegex,
        'Please enter a valid phone number with country code (e.g., +1234567890)'
      )
      .optional(),

    // Step 2: Teaching Profile
    experience: z
      .number()
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience cannot exceed 50 years'),

    subjects: z
      .array(z.string())
      .min(1, 'Please select at least one subject')
      .max(5, 'Please select no more than 5 subjects'),

    ageGroups: z
      .array(z.string())
      .min(1, 'Please select at least one age group')
      .max(3, 'Please select no more than 3 age groups'),

    bio: z
      .string()
      .min(50, 'Bio must be at least 50 characters')
      .max(500, 'Bio must be less than 500 characters'),

    hourlyRate: z
      .number()
      .min(5, 'Hourly rate must be at least $5')
      .max(500, 'Hourly rate cannot exceed $500')
      .optional(),

    // Step 3: Availability & Verification
    availableDays: z
      .array(z.string())
      .min(1, 'Please select at least one available day')
      .max(7, 'Cannot select more than 7 days'),

    timezone: z.string().min(1, 'Please select your timezone'),

    preferredTimes: z
      .array(z.string())
      .min(1, 'Please select at least one preferred time slot')
      .max(4, 'Please select no more than 4 time slots'),

    // Optional fields for later enhancement
    youtubeIntroUrl: z
      .string()
      .regex(youtubeUrlRegex, 'Please enter a valid YouTube URL')
      .optional()
      .or(z.literal('')),

    // Legal agreements
    agreeToTerms: z
      .boolean()
      .refine(
        val => val === true,
        'You must agree to the terms and conditions'
      ),

    agreeToBackgroundCheck: z
      .boolean()
      .refine(
        val => val === true,
        'You must consent to background verification'
      ),

    // Captcha
    hcaptchaToken: z
      .string()
      .min(1, 'Please complete the captcha verification'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type QuickTeacherRegistrationData = z.infer<
  typeof quickTeacherRegistrationSchema
>;

// Enhanced profile schema for post-registration
export const teacherProfileEnhancementSchema = z.object({
  // Professional Details
  qualifications: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  teachingMethods: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),

  // Personal Information
  personalInterests: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),

  // Professional Links
  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),

  // Detailed Availability
  minSessionLength: z.number().min(15).max(180).optional(),
  maxSessionLength: z.number().min(30).max(300).optional(),

  // Enhanced Bio
  teachingApproach: z.string().max(1000).optional(),
  whyChooseMe: z.array(z.string()).max(5).optional(),

  // Contact Preferences
  communicationPreference: z
    .enum(['Email', 'Phone', 'Text', 'Video Call'])
    .optional(),

  // Emergency Contact
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().regex(phoneRegex).optional(),
  emergencyContactRelation: z.string().max(50).optional(),
});

export type TeacherProfileEnhancementData = z.infer<
  typeof teacherProfileEnhancementSchema
>;
