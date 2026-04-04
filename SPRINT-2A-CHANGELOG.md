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
