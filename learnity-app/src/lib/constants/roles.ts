/**
 * Role Constants
 * Centralized role definitions
 */

import { UserRole } from '@/types/auth';

export const ROLES = {
  STUDENT: UserRole.STUDENT,
  TEACHER: UserRole.TEACHER,
  ADMIN: UserRole.ADMIN,
  PENDING_TEACHER: UserRole.PENDING_TEACHER,
  REJECTED_TEACHER: UserRole.REJECTED_TEACHER,
} as const;

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Student',
  [UserRole.TEACHER]: 'Teacher',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.PENDING_TEACHER]: 'Pending Teacher',
  [UserRole.REJECTED_TEACHER]: 'Rejected Teacher',
} as const;

