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

// Type exports for form data
export type StudentRegistrationData = z.infer<typeof studentRegistrationSchema>;
export type TeacherRegistrationData = z.infer<typeof teacherRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type StaticAdminLoginData = z.infer<typeof staticAdminLoginSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type StudentProfileEnhancementData = z.infer<typeof studentProfileEnhancementSchema>;
export type TeacherApplicationUpdateData = z.infer<typeof teacherApplicationUpdateSchema>;
export type TeacherApprovalData = z.infer<typeof teacherApprovalSchema>;
export type UserRoleUpdateData = z.infer<typeof userRoleUpdateSchema>;