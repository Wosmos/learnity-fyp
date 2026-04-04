import { revalidateTag } from 'next/cache';

/**
 * Revalidate cache tags after mutations.
 * Call these in API route handlers after successful writes.
 */

export function revalidateAdminStats() {
  revalidateTag('admin-stats');
}

export function revalidateCourses() {
  revalidateTag('courses');
}

export function revalidateCategories() {
  revalidateTag('categories');
}

export function revalidateLeaderboard() {
  revalidateTag('leaderboard');
}

/** Revalidate everything — use sparingly */
export function revalidateAll() {
  revalidateTag('admin-stats');
  revalidateTag('courses');
  revalidateTag('categories');
  revalidateTag('leaderboard');
}
