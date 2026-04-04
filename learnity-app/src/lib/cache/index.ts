/**
 * Caching utilities for Learnity
 *
 * All caches use on-demand revalidation (no TTLs).
 * Import cached data functions from here or directly from './server-cache'.
 * Import revalidation helpers from here or directly from './revalidate'.
 */

export {
  // Global caches
  getCachedAdminStats,
  getCachedCourses,
  getCachedCategories,
  getCachedLeaderboard,
  // Per-user caches
  getCachedStudentDashboard,
  getCachedStudentCourses,
  getCachedUserWallet,
  getCachedStudentSessions,
  getCachedTeacherDashboard,
  getCachedTeacherSessions,
} from './server-cache';

export {
  revalidateAdminStats,
  revalidateCourses,
  revalidateCategories,
  revalidateLeaderboard,
  revalidateStats,
  revalidateUser,
  revalidateStudentAction,
  revalidateTeacherAction,
  revalidateAdminAction,
  revalidateAll,
} from './revalidate';
