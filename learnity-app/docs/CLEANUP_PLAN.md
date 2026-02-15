# 🧹 Learnity Codebase Cleanup Plan

> Generated: 2026-02-13 | Status: Planning Phase

---

## PHASE 1: USELESS FILES & EMPTY DIRECTORIES (Safe to Delete)

### 1.1 — Empty Directories (0 files, no purpose)

| # | Path | Verdict |
|---|------|---------|
| 1 | `src/components/demo/` | ❌ **DELETE** — Empty directory |
| 2 | `src/components/teacher/` | ❌ **DELETE** — Empty, duplicate of `src/components/teachers/` |
| 3 | `src/components/test/` | ❌ **DELETE** — Empty directory |
| 4 | `src/components/wallet/` | ❌ **DELETE** — Empty directory |
| 5 | `src/lib/design-system/` | ❌ **DELETE** — Empty directory |
| 6 | `src/lib/theme/` | ❌ **DELETE** — Empty directory |
| 7 | `src/lib/server/` | ❌ **DELETE** — Empty directory |
| 8 | `src/hooks/__tests__/` | ❌ **DELETE** — Empty tests directory |
| 9 | `src/app/debug/` | ❌ **DELETE** — Empty directory |
| 10 | `src/app/theme-demo/` | ❌ **DELETE** — Empty directory |
| 11 | `scripts/` | ❌ **DELETE** — Empty directory (the .sh file inside was opened but dir is empty) |

### 1.2 — Demo / Dev-Only Files & Directories

These are development-time utilities that should not ship to production:

| # | Path | Size | Used By | Verdict |
|---|------|------|---------|---------|
| 1 | `src/app/demo/page.tsx` | 497B | Nobody — standalone demo page | ❌ **DELETE** |
| 2 | `src/app/admin/demo/page.tsx` | — | Standalone demo route | ❌ **DELETE** |
| 3 | `src/app/certificates/demo/page.tsx` | 2KB | Standalone demo route | ❌ **DELETE** |
| 4 | `src/components/dev/PerformanceMonitor.tsx` | 9.7KB | **NOT imported anywhere** | ❌ **DELETE** |
| 5 | `src/components/debug/AuthDebugInfo.tsx` | 3.9KB | Only by `auth/login/page.tsx` — debug only | ⚠️ **REVIEW** — remove from login page, then delete |

### 1.3 — Placeholder / Stub Test Files

| # | Path | Content | Verdict |
|---|------|---------|---------|
| 1 | `src/lib/services/__tests__/database.service.test.ts` | Only `expect(true).toBe(true)` — placeholder | ❌ **DELETE** — no value |

### 1.4 — Root-Level Cleanup

| # | Path | Purpose | Verdict |
|---|------|---------|---------|
| 1 | `pending_implementation.md` | Old implementation tracking doc | ❌ **DELETE** — outdated |
| 2 | `temp/` | Temporary directory | ❌ **DELETE** |
| 3 | `scripts/` (if truly empty) | Empty scripts dir | ❌ **DELETE** |

---

## PHASE 2: UNUSED CODE & FILES

### 2.1 — Unused Hooks (NOT imported anywhere outside their own file)

| # | Hook | File | Size | Imported By | Verdict |
|---|------|------|------|-------------|---------|
| 1 | `usePermissionCheck` | `hooks/usePermissionCheck.ts` | 12KB | **NOWHERE** — only self-references | ❌ **DELETE** |
| 2 | `useAuthRedirect` | `hooks/useAuthRedirect.ts` | 9.7KB | Used by ProtectedRoute, dashboard/page, login | ✅ **KEEP** — used |
| 3 | `useDeepLinking` | `hooks/useDeepLinking.ts` | 6.3KB | Only by `components/auth/index.ts` (re-exported) | ⚠️ **REVIEW** — is it used downstream? |
| 4 | `useAsyncAction` | `hooks/useAsyncAction.ts` | 1.9KB | Only by `shared/LoadingStatesExample.tsx` (example file) | ⚠️ **REVIEW** — if example is deleted, delete this too |
| 5 | `usePrefetch` | `hooks/usePrefetch.ts` | 5.3KB | By `smart-link.tsx` and `PerformanceMonitor.tsx` | ⚠️ **REVIEW** — if PerformanceMonitor is deleted and SmartLink isn't used... |

### 2.2 — Unused UI Components

| # | Component | File | Size | Imported By | Verdict |
|---|-----------|------|------|-------------|---------|
| 1 | `animated-background.tsx` | `ui/animated-background.tsx` | 4.6KB | **NOWHERE** | ❌ **DELETE** |
| 2 | `animated-background-new.tsx` | `ui/animated-background-new.tsx` | 1.9KB | **NOWHERE** | ❌ **DELETE** |
| 3 | `helper-text.tsx` | `ui/helper-text.tsx` | 697B | **NOWHERE** | ❌ **DELETE** |
| 4 | `AuthLoadingSpinner.tsx` | `ui/AuthLoadingSpinner.tsx` | 4.1KB | **NOWHERE** | ❌ **DELETE** |
| 5 | `logo.tsx` | `ui/logo.tsx` | 2.7KB | **NOWHERE** | ❌ **DELETE** |
| 6 | `smart-link.tsx` | `ui/smart-link.tsx` | 6.3KB | **NOWHERE** (no `from '@/components/ui/smart-link'`) | ❌ **DELETE** |

### 2.3 — Unused Shared Components

| # | Component | File | Size | Imported By | Verdict |
|---|-----------|------|------|-------------|---------|
| 1 | `LoadingStatesExample.tsx` | `shared/LoadingStatesExample.tsx` | 12KB | **NOWHERE** — it's a reference file | ❌ **DELETE** |

### 2.4 — Unused Auth Components

| # | Component | File | Size | Imported By | Verdict |
|---|-----------|------|------|-------------|---------|
| 1 | `PermissionBasedForm.tsx` | `auth/PermissionBasedForm.tsx` | 13.5KB | **NOWHERE** (only re-exported by index.ts but not consumed) | ❌ **DELETE** |
| 2 | `ConditionalRenderer.tsx` | `auth/ConditionalRenderer.tsx` | 10.3KB | **NOWHERE** (only self-defined) | ❌ **DELETE** |
| 3 | `AdminProtectedRoute.tsx` | `auth/AdminProtectedRoute.tsx` | 3.7KB | **NOWHERE** (only self-defined) | ❌ **DELETE** — replaced by `ClientAdminProtection.tsx` |

### 2.5 — Unused Lib Files

| # | File | Size | Imported By | Verdict |
|---|------|------|-------------|---------|
| 1 | `lib/design-tokens.ts` | 5.3KB | **NOWHERE** | ❌ **DELETE** |
| 2 | `lib/utils/access-control-test.utils.ts` | 8.7KB | **NOWHERE** | ❌ **DELETE** — test utility not used |

---

## PHASE 3: DUPLICATE / OVERLAPPING CODE

### 3.1 — Duplicate Auth Hooks Pattern

The project has redundant auth abstractions piled on top of each other:

```
useAuth.ts  →  re-exports from useAuth.unified.ts
useAuth.unified.ts  →  the actual implementation
useClientAuth.ts  →  also re-exports from useAuth.ts
useAuthService.ts  →  another auth hook layer
useAuthRedirect.ts  →  redirecting logic
```

**Problem:** 5 different auth hooks create confusion.

| File | Purpose | Verdict |
|------|---------|---------|
| `useAuth.ts` | Pure re-export barrel of `useAuth.unified.ts` | ⚠️ **CONSOLIDATE** — Consider merging into one file |
| `useAuth.unified.ts` | Actual auth logic | ✅ **KEEP** — primary implementation |
| `useClientAuth.ts` | Re-exports from `useAuth.ts` | ⚠️ **CONSOLIDATE** — redirect imports to unified |
| `useAuthService.ts` | Service-based auth operations | ✅ **KEEP** — different purpose (auth actions) |
| `useAuthRedirect.ts` | Redirect utilities | ✅ **KEEP** — used by ProtectedRoute, login |

**Recommendation:** Merge `useAuth.ts` + `useClientAuth.ts` into `useAuth.unified.ts` and update all imports.

### 3.2 — Duplicate Firebase Initialization

```
lib/config/firebase.ts       → Client-side Firebase init
lib/config/firebase-admin.ts  → Server-side Firebase Admin init  
lib/firebase/index.ts         → Another Firebase re-export
lib/firebase/admin.ts         → Another Firebase Admin re-export
```

**Problem:** Firebase config exists in 2 places (`config/` and `firebase/`).

| File | Imported By Count | Verdict |
|------|-------------------|---------|
| `lib/config/firebase.ts` | ~20+ files | ✅ **KEEP** — primary |
| `lib/config/firebase-admin.ts` | ~20+ files | ✅ **KEEP** — primary |
| `lib/firebase/index.ts` | 0 files (everything uses `config/firebase` directly) | ❌ **DELETE** |
| `lib/firebase/admin.ts` | ~5 files use `lib/firebase/admin` | ⚠️ **REDIRECT** imports to `config/firebase-admin`, then delete |

### 3.3 — Duplicate Protection Components

```
components/auth/AdminProtectedRoute.tsx      → Server-side admin protection
components/auth/ClientAdminProtection.tsx     → Client-side admin protection
components/auth/ClientStudentProtection.tsx   → Client-side student protection
components/auth/ClientTeacherProtection.tsx   → Client-side teacher protection
components/auth/ProtectedRoute.tsx            → Generic protected route
components/auth/PermissionGate.tsx            → Permission-based gate
components/auth/ConditionalRenderer.tsx       → Conditional rendering
components/auth/PermissionBasedForm.tsx       → Permission-based form
```

**Problem:** 8 different protection/gating components, many unused.

| Component | Used? | Verdict |
|-----------|-------|---------|
| `AdminProtectedRoute.tsx` | ❌ Not used | ❌ **DELETE** |
| `ClientAdminProtection.tsx` | ✅ Used | ✅ **KEEP** |
| `ClientStudentProtection.tsx` | ✅ Used | ✅ **KEEP** |
| `ClientTeacherProtection.tsx` | ✅ Used | ✅ **KEEP** |
| `ProtectedRoute.tsx` | ✅ Used | ✅ **KEEP** |
| `PermissionGate.tsx` | Only imported by `PermissionBasedForm` | ⚠️ If PermissionBasedForm is deleted, this is only used in index.ts re-export |
| `ConditionalRenderer.tsx` | ❌ Not used | ❌ **DELETE** |
| `PermissionBasedForm.tsx` | ❌ Not used | ❌ **DELETE** |

### 3.4 — Overlapping Services

| Service A | Service B | Overlap | Verdict |
|-----------|-----------|---------|---------|
| `teacher-management.service.ts` | `user-management.service.ts` | Both manage user/teacher data | ✅ Both used by different routes — **KEEP both** |
| `teacher-session.service.ts` | `tutoring-session.service.ts` | Very similar naming | ✅ Different purposes — **KEEP both** |
| `notification.service.ts` | `push-notification.service.ts` | Both handle notifications | ✅ Different channels (email vs push) — **KEEP both** |
| `audit.service.ts` (31KB) | `audit-logger.service.ts` (7KB) | Both audit logging | ⚠️ **REVIEW** — potential merge |

---

## PHASE 4: DOCUMENTATION CLEANUP

### 4.1 — `docs/` Directory (35 files, many outdated)

Many of these are implementation plans that are now complete. Consider archiving:

| # | File | Size | Verdict |
|---|------|------|---------|
| 1 | `EXECUTION_PLAN.md` | 15KB | ⚠️ **ARCHIVE** — historical |
| 2 | `ADMIN_DASHBOARD_IMPLEMENTATION.md` | 10KB | ⚠️ **ARCHIVE** — completed |
| 3 | `ADMIN_IMPROVEMENTS_SUMMARY.md` | 5KB | ⚠️ **ARCHIVE** — completed |
| 4 | `ADMIN_LOADING_OPTIMIZATION.md` | 13KB | ⚠️ **ARCHIVE** — completed |
| 5 | `ADMIN_LOADING_OPTIMIZATION_CHANGES.md` | 9KB | ⚠️ **ARCHIVE** — completed |
| 6 | `LOADING_STATES_IMPLEMENTATION_GUIDE.md` | 10KB | ⚠️ **ARCHIVE** |
| 7 | `LOADING_STATES_MIGRATION_CHECKLIST.md` | 7KB | ⚠️ **ARCHIVE** |
| 8 | `LOADING_STATES_QUICK_REFERENCE.md` | 3KB | ⚠️ **ARCHIVE** |
| 9 | `LOADING_STATES_README.md` | 6KB | ⚠️ **ARCHIVE** |
| 10 | `LOADING_STATES_SUMMARY.md` | 10KB | ⚠️ **ARCHIVE** |
| 11 | `COMPLETE_REDIRECT_FIXES.md` | 6KB | ⚠️ **ARCHIVE** — completed |
| 12 | `COMPONENT_REFACTORING_SUMMARY.md` | 8KB | ⚠️ **ARCHIVE** |
| 13 | `REGISTRATION_REDIRECT_FIXES.md` | 4KB | ⚠️ **ARCHIVE** |
| 14 | `TOAST_ERROR_FIX.md` | 8KB | ⚠️ **ARCHIVE** |
| 15 | `SEO_AND_UI_IMPROVEMENTS.md` | 10KB | ⚠️ **ARCHIVE** |
| 16 | `TEACHER_PAGE_ENHANCEMENTS.md` | 4KB | ⚠️ **ARCHIVE** |
| 17 | `TEACHER_REGISTRATION_STATUS.md` | 3KB | ⚠️ **ARCHIVE** |
| 18 | `CODE_QUALITY_AND_ISSUES_AUDIT.md` | 17KB | ⚠️ **ARCHIVE** |
| 19 | `authentication-flow.md` | 98B | ❌ **DELETE** — only 98 bytes, likely empty/placeholder |
| 20 | `text.md` | 957B | ❌ **DELETE** — unclear purpose |
| 21 | `STUDENT_PROGRESS_ACHIEVEMENTS_PLAN.md` | 3KB | ⚠️ **ARCHIVE** |
| 22 | `PERFORMANCE_OPTIMIZATION_PLAN.md` | 5KB | ⚠️ **ARCHIVE** |

**Recommendation:** Keep only essential docs:
- `FIREBASE_SETUP_GUIDE.md` ✅
- `FIREBASE_ADMIN_SETUP.md` ✅
- `INFRASTRUCTURE_SETUP.md` ✅
- `HOW_TO_RUN_SEED.md` ✅
- `REGISTRATION_AND_LOGIN_GUIDE.md` ✅
- `VERCEL_BLOB_SETUP_GUIDE.md` ✅
- `DOCUMENTATION_SYSTEM.md` ✅
- `SIMPLIFIED_TEACHER_REGISTRATION_IMPLEMENTATION.md` ✅
- `chat-rooms-implementation.md` ✅
- `CERTIFICATE_PAGE_IMPLEMENTATION.md` ✅
- `test-auth-flow.md` ✅
- Session implementation docs ✅

---

## SUMMARY SCORECARD

| Category | Items Found | Action |
|----------|------------|--------|
| 🗑️ Empty directories | **11** | Delete all |
| 🗑️ Demo/Dev files | **5** | Delete all |
| 🗑️ Unused hooks | **1-3** | Delete confirmed, review others |
| 🗑️ Unused UI components | **6** | Delete all |
| 🗑️ Unused auth components | **3** | Delete all |
| 🗑️ Unused lib files | **2** | Delete all |
| 🗑️ Placeholder test files | **1** | Delete |
| 🗑️ Root-level junk | **2-3** | Delete |
| 🔀 Auth hook consolidation | **2 merges** | Consolidate |
| 🔀 Firebase config duplication | **2 files** | Redirect + delete |
| 📦 Docs to archive | **~20 files** | Archive or delete |
| **Total files to remove** | **~35-45 files** | — |

---

## RECOMMENDED EXECUTION ORDER

```
Step 1: Delete empty directories (11 dirs)          — ZERO risk
Step 2: Delete demo/dev files (5 files)              — ZERO risk  
Step 3: Delete unused UI components (6 files)        — LOW risk
Step 4: Delete unused auth components (3 files)      — LOW risk (update index.ts exports)
Step 5: Delete unused hooks (1-3 files)              — LOW risk
Step 6: Delete unused lib files (2 files)            — LOW risk
Step 7: Delete placeholder tests (1 file)            — ZERO risk
Step 8: Consolidate auth hooks                       — MEDIUM risk (update imports)
Step 9: Consolidate Firebase config                  — MEDIUM risk (update imports)
Step 10: Archive/clean docs                          — ZERO risk
Step 11: Clean root-level files                      — ZERO risk
```

> ⚠️ After each step, run `npm run build` to verify nothing breaks.
