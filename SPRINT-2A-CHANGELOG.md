# Sprint 2A — Design System, Cleanup & Backend Hardening

**Branch:** `design-implementation`
**Date:** 2026-04-03
**Commits:** 8

---

## 1. Design System & Theming

- Added CSS design tokens (`--background`, `--foreground`, `--muted-foreground`, `--border`, etc.) to `globals.css`
- Retuned all `.dark` CSS variables — darker background, more saturated primary, better card contrast, solid borders instead of transparent
- Added dark mode glass-card styles (`.dark .glass-card`)
- Integrated `next-themes` for theme switching with `AppProviders`
- Created `ThemeToggle` component (compact + full variants, cycles light/dark/system)
- Placed theme toggle in `DashboardNavbar` and `DashboardSidebar` (next to logout)
- Fixed OS theme overriding `defaultTheme` by disabling `enableSystem`
- Uncommented `@import url('./animations.css') layer(animations)` — animations were broken before
- Created `typography.tsx` component with CVA variants (h1–h4, body, body-sm, caption, overline)

## 2. Component Library Cleanup

- **Button:** Removed 8 unused variants (`onyx`, `morphic`, `shadow`, `void`, `crystal`, `cyber`, `organic`, `holographic`, `ctaSecondary`) and personality sizes, kept only what's used (`nova`, `minimal`, `cta`, `gradient`)
- **Stats Card:** Renamed variants `onyx`/`glass`/`snow` → `default`/`elevated`/`subtle`, removed onyx glow overlay, migrated to semantic tokens (`bg-card`, `ring-border`)
- Created `PageShell` layout wrapper component (configurable max-width, padding)
- Created `ErrorBoundaryContent` shared component
- Created `LoadingSkeleton` with 5 variants (dashboard, list, detail, form, grid)

## 3. Loading & Error States

- Added route-specific `loading.tsx` for: auth, courses, admin dashboard, student dashboard, teacher dashboard
- Replaced generic spinners with contextual skeletons
- Added `error.tsx` error boundaries for: root, auth, courses, admin, student, teacher

## 4. Layout Unification

- Created `AdminSidebarUnified.tsx`
- Removed `<AdminLayout>` wrapper from all admin pages (analytics, settings, teachers, users, admin dashboard) — layout now handled at route level via `<>` fragments
- Unified admin layout with shared sidebar and navbar in `dashboard/admin/layout.tsx`
- Removed `<Breadcrumbs />` from `StudentLayoutClient` and `TeacherLayoutClient`
- Removed inline HTML comments from layout clients
- Expanded `NavbarRole` type to include `'admin'`

## 5. Dark Mode Color Migration

Migrated hardcoded colors to semantic tokens across all pages:

- `text-gray-900` → `text-foreground`
- `text-gray-500`/`text-gray-600` → `text-muted-foreground`
- `bg-gray-50`/`bg-slate-50` → `bg-background`/`bg-muted`
- `border-gray-200`/`border-slate-200` → `border-border`
- `bg-white` → `bg-card`
- `hover:bg-slate-100` → `hover:bg-muted`

Affected pages: admin analytics, settings, teachers, users, wallet, student achievements, courses, progress, wallet, teacher dashboard, welcome, profile enhance, course cards, course filters, student components (Header, MainSection, ProfileCard, EnrolledCourseCard), TeacherDetailContent, DashboardNavbar, DashboardSidebar, AppLayout.

## 6. Performance

- **Mobile drawer:** Changed from `spring` animation (damping/stiffness = GPU-heavy) to `tween` with 0.2s ease-out; swapped `backdrop-blur-sm` overlay to simple `bg-black/30` (no blur = no repaint lag)
- **Main content:** Removed `motion.div` fade-in wrapper around `{children}` in AppLayout — children now render instantly
- **`<img>` → `<Image>`:** Converted raw `<img>` tags to Next.js `<Image>` in login page, `AuthLoadingSpinner`, `DashboardSidebar`, `AppLayout`

## 7. Backend Race Condition Fixes

- **Wallet service:** `debit()` and `withdraw()` now read wallet inside `$transaction` — prevents concurrent requests from double-spending
- **Enrollment service:** Collapsed duplicate-enrollment check + payment + create into a single `$transaction` — prevents double-enrollments and double-charges
- **Certificate service:** Moved "certificate already exists" check inside `$transaction` — prevents race condition duplicates

## 8. Query Optimizations

- **Certificate N+1 fix:** Replaced per-quiz `findFirst` loop with single `findMany` + `distinct: ['quizId']`
- **Teacher courses API:** Added `take: 100` limit to prevent unbounded reads
- **Teacher students API:** Added `take: 100` on nested course queries

## 9. API Pagination

- `/api/teacher/students` — added server-side pagination (page, limit, totalPages, hasMore)
- `/api/admin/wallet` — added `skip`/`take` with `Promise.all` count query

## 10. Gamification & Data Integrity

- Added `@@unique([userId, sourceId, reason])` constraint on `XPActivity` in Prisma schema
- Added idempotency check in `awardXP` — returns `xpAwarded: 0` if XP already awarded for same source+reason combo

## 11. Prisma Singleton Migration

Killed `new PrismaClient()` in every service — all now use the shared singleton from `@/lib/prisma`:

- `AuditService`
- `DatabaseService`
- `ProfileEnhancementService`
- `RoleManagerService`
- `SecurityService`
- `SessionManagerService`

Removed `disconnect()` methods from `DatabaseService` and `FirebaseSyncService`. Removed all `finally { await databaseService.disconnect() }` blocks from API routes (login, password-reset, sync-profile, verify-email). Simplified `SessionManagerService` constructor (removed `prisma` parameter).

Updated all imports across ~15 files from `@/lib/config/database` → `@/lib/prisma`. Deleted `lib/config/database.ts` entirely.

## 12. Console Log Cleanup

Stripped all `console.log`/`console.warn`/`console.error` from:

- `useAuth.unified.ts`
- `firebase.ts` (config)
- `auth.middleware.ts`
- `cache/index.ts`
- `firebase-sync.service.ts`
- `database.service.ts`
- `teachers/[id]/page.tsx`

## 13. Dead Code Removal

### Pages deleted
- `admin-setup`, `admin/demo`, `admin/test`, `admin/auth-test`, `certificates/demo`, `demo`

### API routes deleted
- `promote-admin` (dev-only endpoint)
- `admin/demo/generate-event`

### Components deleted
- `AdminDemoClient`
- `LoadingStatesExample`

### Tests deleted (placeholder/mock-only)
- `database.service.test.ts`
- `quiz.service.test.ts`
- `session-manager.service.test.ts`
- `device-fingerprint.test.ts`

### Docs deleted (30+ files)
- `DECISION_GUIDE.md`, `FINAL_STATUS.md`, `GAMIFICATION_IMPLEMENTATION.md`, `GAMIFICATION_SEED_GUIDE.md`, `GAMIFICATION_STRATEGY.md`, `IMPLEMENTATION_COMPLETE_SUMMARY.md`, `NEXT_MOVE_SUMMARY.md`, `STRATEGIC_ANALYSIS_THEMED_GAMES.md`, `TEACHER_SESSIONS_COMPLETE_STATUS.md`, `TEACHER_SESSIONS_SUMMARY.md`
- Entire `docs/` folder (AUTH_FIX_DOCUMENTATION, AUTH_ROUTING_FIXES, CATEGORY_DROPDOWN_FIX, COMPREHENSIVE_SEED_SUMMARY, COURSE_BUILDER_AUTH_FIX, COURSE_BUILDER_RESTORE_FIX, CRITICAL_FIXES_NEEDED, DATABASE_SAMPLE_DATA, FIXES_APPLIED_SUMMARY, IMPLEMENTATION_SUMMARY, LEARNING_MODULE_FLOW, PAGEHEADER_COMPLETE, PAGEHEADER_REPLACEMENT_GUIDE, PERFORMANCE_ISSUES_IDENTIFICATION, PERFORMANCE_OPTIMIZATION_COMPLETE, PERFORMANCE_OPTIMIZATION_COMPLETED, PERFORMANCE_OPTIMIZATION_IMPLEMENTATION, PERFORMANCE_TEST_RESULTS, PROJECT_STATUS, SIDEBAR_REFACTORING_COMPLETE, TESTING_GUIDE, YOUTUBE_LINK_AND_THUMBNAIL_FIX, issues.json, test.html)

### Dead code removed
- Biometric auth code from `LoginForm` (`handleBiometricLogin`, `biometricAvailable` state, `checkBiometric` effect, `Fingerprint` import)
- `database.ts` config file

## 14. Dependencies

- Added: `next-themes`
- Removed: `three`, `@types/three`

## 15. Other

- **README.md** — complete rewrite from draft "7-day plan" to professional docs (tech stack, env variables table, project structure, available scripts, key features)
- **`.gitignore`** — fixed duplicate `project-doc/` entry
- **Landing page** — changed pricing label from "Per Month" to "Per Hour"
- **`prefetch.service.ts`** — updated all dynamic imports to `@/lib/prisma`
- **Theme toggle border** — added visible border for better contrast

---

**Net impact:** ~1,550 lines added, ~11,500 lines deleted. 152 files changed.

---

## Phase 1 — Scalability Critical Fixes (2026-04-04)

### Database Connection Pool
- `prisma.ts` now appends `connection_limit=20&pool_timeout=30` to DATABASE_URL (was default ~4 connections)

### Security: Missing Auth Fixed
- `/api/admin/teachers/applications/[applicationId]` — GET and PUT now require admin auth via `authMiddleware`. Removed `user = null; // TODO` pattern.

### Unbounded Query Fixes
- `/api/student/progress` — paginated enrollments (take 10, max 20), `select` instead of deep `include`, aggregate queries for overview stats instead of in-memory calculation on all data
- `/api/teachers/[id]/reviews` — paginated (take 20, max 50), stats via `groupBy` aggregate instead of loading all reviews into memory
- `/api/admin/users` — limit param capped at `Math.min(100, limit)` with floor validation

### Database Indexes
- `Enrollment`: compound `@@index([studentId, status])`, `@@index([lastAccessedAt])`
- `LessonProgress`: compound `@@index([studentId, completed, completedAt])`
- `Review`: compound `@@index([courseId, createdAt])`
- `XPActivity`: compound `@@index([userId, createdAt(sort: Desc)])`
- `AuditLog`: compound `@@index([ipAddress, eventType, success, createdAt])` for rate limiting queries

### Dead Code Cleanup
- Deleted `/admin/analytics` page (100% hardcoded mock data, no API)
- Deleted `/admin/settings` page (form with no persistence, no API)
- Deleted 3 empty files: `admin/utils.ts`, `externals/faq.tsx`, `externals/header.tsx`
- Removed analytics/settings from admin sidebar nav
- Removed `BarChart3` unused import from DashboardSidebar

### Server Component Migration (use client reduction)
- Created `src/lib/auth/server.ts` — `getServerUser()` utility using React `cache()`, reads session cookie, verifies with Firebase Admin SDK, returns DB user. Foundation for all server component pages.
- Converted `not-found.tsx` to server component (zero hooks, pure CSS)
- Converted `student/courses/page.tsx` from client → server component:
  - Data fetched directly with Prisma (no API round-trip, no loading spinner)
  - Interactive UI (tabs, navigation) extracted to `StudentCoursesClient.tsx`
  - Pattern: server component fetches → passes data as props → client handles interactivity
- Converted `student/page.tsx` (main dashboard) — profile, enrollment stats, badges fetched server-side via Prisma
- Converted `student/wallet/page.tsx` — wallet balance + transactions fetched server-side
- Converted `student/sessions/page.tsx` — tutoring sessions fetched server-side
- Deleted `scripts/` folder (5 unused dev scripts)
- Achievements + progress pages deferred (complex gamification service dependencies)
- Converted 5 teacher pages: dashboard, courses, wallet, sessions, students

### Admin Panel Rebuild
- Merged 3 separate pages into tab-based pages:
  - `/admin/people` — Users tab + Teacher Applications tab (replaced /admin/users + /admin/teachers)
  - `/admin/content` — Courses + Categories + Reviews tabs (NEW — courses management, category listing, review moderation)
  - `/admin/finances` — Deposit Queue + Transactions tabs (replaced /admin/wallet, added deposit approval workflow)
  - `/admin/engagement` — Gamification (leaderboard + badges) + Sessions + Certificates tabs (NEW)
- All admin pages are server components with Prisma data fetching
- Admin sidebar: Overview, People, Content, Finances, Engagement, Security
- All admin pages are server components (Prisma data fetch, no API round-trips)

### TypeScript & Build Fixes
- Fixed all 63 TypeScript errors across 18 files
- requireServerUser() returns NonNullable type
- Prisma query field corrections (lessonCount scalar, sections count)
- AuthErrorCode enum value fixes
- Type alignment between server and client components
- Deleted dead docs route (/docs/[slug]) + docs.ts + markdown.css (-872 lines)
- Build compiles clean (static generation needs DB = expected for deploy)

### Admin Setup
- Created `scripts/create-admin.ts` for bootstrapping admin user in Firebase + DB
