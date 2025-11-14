import { z } from 'zod';
import { UserRole, ApplicationStatus } from '@/types/auth';

// Registration Schemas
export const studentRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  
  gradeLevel: z.string()
    .min(1, 'Please select your grade level'),
  
  subjects: z.array(z.string())
    .min(1, 'Please select at least one subject of interest')
    .max(10, 'Please select no more than 10 subjects'),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  
  hcaptchaToken: z.string()
    .min(1, 'Please complete the captcha verification')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const teacherRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  
  qualifications: z.array(z.string())
    .min(1, 'Please provide at least one qualification')
    .max(10, 'Please provide no more than 10 qualifications'),
  
  subjects: z.array(z.string())
    .min(1, 'Please select at least one subject you can teach')
    .max(15, 'Please select no more than 15 subjects'),
  
  experience: z.number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must be less than 1000 characters'),
  
  hourlyRate: z.number()
    .min(5, 'Hourly rate must be at least $5')
    .max(500, 'Hourly rate cannot exceed $500')
    .optional(),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  
  hcaptchaToken: z.string()
    .min(1, 'Please complete the captcha verification')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional(),
  
  hcaptchaToken: z.string().optional() // Only required for suspicious activity
});

// Static Admin Login Schema
export const staticAdminLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  hcaptchaToken: z.string()
    .min(1, 'Please complete the captcha verification')
});

// Password Reset Schemas
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  hcaptchaToken: z.string()
    .min(1, 'Please complete the captcha verification')
});

export const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  
  token: z.string()
    .min(1, 'Reset token is required')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Profile Enhancement Schemas
export const studentProfileEnhancementSchema = z.object({
  learningGoals: z.array(z.string())
    .max(10, 'Please select no more than 10 learning goals')
    .optional(),
  
  interests: z.array(z.string())
    .max(15, 'Please select no more than 15 interests')
    .optional(),
  
  studyPreferences: z.array(z.string())
    .max(10, 'Please select no more than 10 study preferences')
    .optional(),
  
  profilePicture: z.string()
    .url('Profile picture must be a valid URL')
    .optional()
});

export const teacherApplicationUpdateSchema = z.object({
  qualifications: z.array(z.string())
    .min(1, 'Please provide at least one qualification')
    .max(10, 'Please provide no more than 10 qualifications'),
  
  subjects: z.array(z.string())
    .min(1, 'Please select at least one subject you can teach')
    .max(15, 'Please select no more than 15 subjects'),
  
  experience: z.number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must be less than 1000 characters'),
  
  hourlyRate: z.number()
    .min(5, 'Hourly rate must be at least $5')
    .max(500, 'Hourly rate cannot exceed $500')
    .optional()
});

// Admin Schemas
export const teacherApprovalSchema = z.object({
  applicationId: z.string()
    .min(1, 'Application ID is required'),
  
  decision: z.enum(['APPROVED', 'REJECTED']),
  
  rejectionReason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must be less than 500 characters')
    .optional()
}).refine(data => {
  if (data.decision === 'REJECTED' && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when rejecting an application",
  path: ["rejectionReason"]
});

export const userRoleUpdateSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
  
  newRole: z.nativeEnum(UserRole),
  
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters')
});

// Enhanced Teacher Registration Schema
export const enhancedTeacherRegistrationSchema = z.object({
  // Basic Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  
  // Contact Information
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .optional(),
  
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters')
    .optional(),
  
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be less than 50 characters'),
  
  zipCode: z.string()
    .min(3, 'ZIP code must be at least 3 characters')
    .max(10, 'ZIP code must be less than 10 characters')
    .optional(),
  
  // Personal Information
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 80;
    }, 'You must be between 18 and 80 years old')
    .optional(),
  
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say'])
    .optional(),
  
  // Professional Information
  qualifications: z.array(z.string())
    .min(1, 'Please provide at least one qualification')
    .max(10, 'Please provide no more than 10 qualifications'),
  
  subjects: z.array(z.string())
    .min(1, 'Please select at least one subject you can teach')
    .max(15, 'Please select no more than 15 subjects'),
  
  experience: z.number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  
  onlineExperience: z.number()
    .min(0, 'Online experience cannot be negative')
    .max(30, 'Online experience cannot exceed 30 years')
    .optional(),
  
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio must be less than 2000 characters'),
  
  headline: z.string()
    .min(10, 'Headline must be at least 10 characters')
    .max(100, 'Headline must be less than 100 characters')
    .optional(),
  
  teachingApproach: z.string()
    .min(50, 'Teaching approach must be at least 50 characters')
    .max(1000, 'Teaching approach must be less than 1000 characters')
    .optional(),
  
  hourlyRate: z.number()
    .min(5, 'Hourly rate must be at least $5')
    .max(500, 'Hourly rate cannot exceed $500')
    .optional(),
  
  // Teaching Details
  teachingMethods: z.array(z.string())
    .max(10, 'Please select no more than 10 teaching methods')
    .optional(),
  
  ageGroups: z.array(z.string())
    .min(1, 'Please select at least one age group')
    .max(8, 'Please select no more than 8 age groups'),
  
  lessonTypes: z.array(z.string())
    .min(1, 'Please select at least one lesson type')
    .max(5, 'Please select no more than 5 lesson types'),
  
  technologySkills: z.array(z.string())
    .max(15, 'Please select no more than 15 technology skills')
    .optional(),
  
  // Availability
  availableDays: z.array(z.string())
    .min(1, 'Please select at least one available day')
    .max(7, 'Cannot select more than 7 days'),
  
  preferredTimes: z.array(z.string())
    .min(1, 'Please select at least one preferred time')
    .max(8, 'Please select no more than 8 time slots'),
  
  timezone: z.string()
    .min(1, 'Please select your timezone'),
  
  minSessionLength: z.number()
    .min(15, 'Minimum session length must be at least 15 minutes')
    .max(180, 'Minimum session length cannot exceed 180 minutes')
    .optional(),
  
  maxSessionLength: z.number()
    .min(30, 'Maximum session length must be at least 30 minutes')
    .max(300, 'Maximum session length cannot exceed 300 minutes')
    .optional(),
  
  // Languages
  languages: z.array(z.string())
    .min(1, 'Please select at least one language')
    .max(10, 'Please select no more than 10 languages'),
  
  // Education & Certifications
  education: z.array(z.string())
    .min(1, 'Please provide at least one education credential')
    .max(10, 'Please provide no more than 10 education credentials'),
  
  certifications: z.array(z.string())
    .max(15, 'Please provide no more than 15 certifications')
    .optional(),
  
  specialties: z.array(z.string())
    .max(10, 'Please select no more than 10 specialties')
    .optional(),
  
  achievements: z.array(z.string())
    .max(10, 'Please provide no more than 10 achievements')
    .optional(),
  
  // Personal Interests
  personalInterests: z.array(z.string())
    .max(15, 'Please select no more than 15 interests')
    .optional(),
  
  hobbies: z.array(z.string())
    .max(15, 'Please select no more than 15 hobbies')
    .optional(),
  
  // Social Media & Professional Links
  linkedinUrl: z.string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  
  websiteUrl: z.string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  
  youtubeUrl: z.string()
    .url('Please enter a valid YouTube URL')
    .optional()
    .or(z.literal('')),
  
  // Emergency Contact
  emergencyContactName: z.string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .max(100, 'Emergency contact name must be less than 100 characters')
    .optional(),
  
  emergencyContactPhone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
  
  emergencyContactRelation: z.string()
    .min(2, 'Relation must be at least 2 characters')
    .max(50, 'Relation must be less than 50 characters')
    .optional(),
  
  // Preferences
  communicationPreference: z.enum(['Email', 'Phone', 'Text', 'Video Call'])
    .optional(),
  
  // Why Choose Me
  whyChooseMe: z.array(z.string())
    .max(5, 'Please provide no more than 5 key differentiators')
    .optional(),
  
  // Agreement and Verification
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  
  agreeToBackgroundCheck: z.boolean()
    .refine(val => val === true, 'You must agree to background check'),
  
  hcaptchaToken: z.string()
    .min(1, 'Please complete the captcha verification')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine(data => {
  if (data.minSessionLength && data.maxSessionLength) {
    return data.minSessionLength <= data.maxSessionLength;
  }
  return true;
}, {
  message: "Minimum session length cannot be greater than maximum session length",
  path: ["maxSessionLength"]
});

// Type exports for form data
export type StudentRegistrationData = z.infer<typeof studentRegistrationSchema>;
export type TeacherRegistrationData = z.infer<typeof teacherRegistrationSchema>;
export type EnhancedTeacherRegistrationData = z.infer<typeof enhancedTeacherRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type StaticAdminLoginData = z.infer<typeof staticAdminLoginSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type StudentProfileEnhancementData = z.infer<typeof studentProfileEnhancementSchema>;
export type TeacherApplicationUpdateData = z.infer<typeof teacherApplicationUpdateSchema>;
export type TeacherApprovalData = z.infer<typeof teacherApprovalSchema>;
export type UserRoleUpdateData = z.infer<typeof userRoleUpdateSchema>;