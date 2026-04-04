import { revalidateTag } from 'next/cache';

/**
 * On-demand cache revalidation helpers.
 * Call these in API route handlers after successful mutations.
 * No TTLs anywhere — caches live forever until explicitly busted here.
 */

const IMMEDIATE = { expire: 0 };

// ─── Global caches ───────────────────────────────────────────

export function revalidateAdminStats() {
  revalidateTag('admin-stats', IMMEDIATE);
}

export function revalidateCourses() {
  revalidateTag('courses', IMMEDIATE);
}

export function revalidateCategories() {
  revalidateTag('categories', IMMEDIATE);
}

export function revalidateLeaderboard() {
  revalidateTag('leaderboard', IMMEDIATE);
}

export function revalidateStats() {
  revalidateTag('stats', IMMEDIATE);
  revalidateTag('platform-stats', IMMEDIATE);
}

// ─── Per-user caches ─────────────────────────────────────────

/** Bust all cached data for a specific user (dashboard, courses, wallet, sessions) */
export function revalidateUser(userId: string) {
  revalidateTag(`user-${userId}`, IMMEDIATE);
}

// ─── Compound helpers ────────────────────────────────────────

/** After a student action (lesson complete, enroll, etc.) */
export function revalidateStudentAction(studentId: string) {
  revalidateUser(studentId);
  revalidateLeaderboard();
  revalidateStats();
}

/** After a teacher action (publish, session, etc.) */
export function revalidateTeacherAction(teacherId: string) {
  revalidateUser(teacherId);
  revalidateCourses();
}

/** After an admin action (approve teacher, manage wallet, etc.) */
export function revalidateAdminAction() {
  revalidateAdminStats();
  revalidateStats();
}

/** Nuclear option — bust everything */
export function revalidateAll() {
  revalidateAdminStats();
  revalidateCourses();
  revalidateCategories();
  revalidateLeaderboard();
  revalidateStats();
}
