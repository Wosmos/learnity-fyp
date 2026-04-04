# Learnity — Improvement Roadmap

**Audited:** 2026-04-04 | **Branch:** `design-implementation` | **Codebase:** 113,556 lines / 519 files

---

## Phase 1 — Critical (Pre-Launch Blockers) — FIXED

> All 4 critical items resolved.

### 1.1 Unbounded Database Queries — FIXED

- `/api/student/progress` — paginated (take 10, max 20), uses `select` instead of full `include`, aggregate queries for overview stats
- `/api/teachers/[id]/reviews` — paginated (take 20, max 50), stats via `groupBy` instead of in-memory calculation
- `/api/admin/users` — limit capped at `Math.min(100, limit)`
- `/api/teacher/students` — was already fixed in sprint 2a (take 100 + pagination)

---

### 1.2 Database Connection Pool — FIXED

`prisma.ts` now appends `?connection_limit=20&pool_timeout=30` to DATABASE_URL if not already present.

---

### 1.3 Rate Limiting

**Problem:** Only `/api/auth/password-reset` has rate limiting. Every other endpoint is unprotected — one bad actor can exhaust the database.

**Fix:**
- Add a simple in-memory rate limiter middleware (e.g., `next-rate-limit` or custom Map-based)
- Apply to all API routes, with stricter limits on auth and mutation endpoints
- Target limits:
  - Auth endpoints: 10 req/min per IP
  - Read endpoints: 60 req/min per IP
  - Write endpoints: 30 req/min per IP

---

### 1.4 Missing Authentication on Admin Endpoint — FIXED

Both GET and PUT now use `authMiddleware` with `requiredRole: UserRole.ADMIN`. Removed the `user = null; // TODO` pattern. Simplified handler structure (no more unused `handler()` wrapper).

---

## Phase 2 — High Priority (Before 500+ Users)

> These cause unnecessary database load and poor response times.

### 2.1 Server-Side Caching

**Problem:** No caching layer exists. Every request hits the database fresh:
- Admin stats = 6 separate `COUNT(*)` queries every page load
- Leaderboard recalculated from scratch on each request
- Course catalog re-queried on every filter change

**Fix (pick one):**
- **Option A (simple):** In-memory cache with TTL using `Map` or `lru-cache`
  - Admin stats: 60s TTL
  - Leaderboard: 300s TTL
  - Course catalog: 300s TTL
- **Option B (production):** Add Redis via Upstash (serverless, free tier available)
  - Same TTLs but shared across instances
  - Also enables rate limiting (Upstash Ratelimit)

---

### 2.2 N+1 Query in Admin Stats

**Problem:** `src/lib/services/admin-stats.service.ts` runs 6 separate `prisma.user.count()` calls via `Promise.all`:
```typescript
const [totalUsers, pendingTeachers, approvedTeachers, totalStudents, newUsersThisMonth, newUsersLastMonth] = await Promise.all([...])
```
That's 6 round-trips to the database on every admin dashboard load.

**Fix:** Combine into a single `groupBy` or raw SQL aggregate:
```typescript
const counts = await prisma.user.groupBy({
  by: ['role', 'status'],
  _count: true,
});
```

---

### 2.3 Missing Database Indexes — FIXED

Added compound indexes to schema.prisma:
- `Enrollment`: `@@index([lastAccessedAt])`, `@@index([studentId, status])`
- `LessonProgress`: `@@index([studentId, completed, completedAt])`
- `Review`: `@@index([courseId, createdAt])`
- `XPActivity`: `@@index([userId, createdAt(sort: Desc)])`
- `AuditLog`: `@@index([ipAddress, eventType, success, createdAt])` (rate limiting queries)

Run `bun run db:push` to apply.

---

### 2.4 API Cache Headers

**Problem:** Only 2 of ~100 API routes set `Cache-Control` headers. Every GET response is treated as uncacheable.

**Fix:** Add appropriate headers to all GET endpoints:
```typescript
// Public data (courses, teachers)
headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }

// User-specific data (progress, wallet)
headers: { 'Cache-Control': 'private, max-age=60' }

// Admin data
headers: { 'Cache-Control': 'private, no-cache' }

// Mutations (POST/PUT/DELETE)
headers: { 'Cache-Control': 'no-store' }
```

---

## Phase 3 — Medium Priority (Performance & Bundle)

> These improve load times, reduce JS shipped to client, and unblock streaming.

### 3.1 Reduce "use client" Overuse

**Problem:** ~195 files marked `"use client"`. Many don't use hooks or browser APIs and could be server components — reducing JS bundle sent to client and enabling server-side rendering.

**Candidates for conversion to server components:**
- Pages that only render static content with links (e.g., hero sections, course cards)
- Layout wrappers that only compose children
- Pages that just fetch data and pass it down

**Approach:** Audit each `"use client"` file — if it doesn't use `useState`, `useEffect`, `useRouter`, event handlers, or browser APIs, convert it.

---

### 3.2 Dynamic Imports for Heavy Components

**Problem:** Zero `next/dynamic` usage. Heavy components loaded synchronously in every page bundle.

**Candidates:**
```typescript
// Course builder (~large component tree)
const CourseBuilder = dynamic(() => import('@/components/course-builder/CourseBuilderPage'), {
  ssr: false, loading: () => <LoadingSkeleton variant="form" />
});

// Video room (HMS SDK)
const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), {
  ssr: false
});

// Admin security dashboards
const SecurityDashboard = dynamic(() => import('@/components/admin/SecurityDashboard'));
const AuditLogViewer = dynamic(() => import('@/components/admin/AuditLogViewer'));
```

Also: replace barrel imports (`@/components/auth`, `@/lib/services`) with direct file imports to avoid pulling entire modules.

---

### 3.3 Server-Side Data Fetching

**Problem:** 66 uses of `useAuthenticatedFetch` (client-side useEffect + fetch) for data that could be fetched on the server, causing loading spinners and waterfall requests.

**Fix:** For pages where the data is needed on first render:
1. Convert page to server component
2. Fetch data directly with Prisma or internal service calls
3. Pass data as props to client interactive components
4. Keep `useAuthenticatedFetch` only for mutations and real-time updates

---

### 3.4 Suspense Boundaries

**Problem:** Only 22 Suspense usages in the entire app. Large pages load as a single blocking unit.

**Fix:** Wrap slow data sections with `<Suspense>` + skeleton fallbacks to enable streaming:
```tsx
<Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
  <AdminStatsSection />
</Suspense>
<Suspense fallback={<LoadingSkeleton variant="list" />}>
  <RecentActivitySection />
</Suspense>
```

---

### 3.5 Background Job Queue

**Problem:** Certificate generation, email notifications, analytics calculations all run synchronously inside request handlers. 100 concurrent certificate downloads = 100 blocking operations.

**Fix:** Add a lightweight job queue:
- **Option A:** `BullMQ` + Redis (if Redis is added in Phase 2)
- **Option B:** Vercel background functions / serverless cron
- Queue candidates: certificate PDF generation, email notifications, XP calculations, audit log writes

---

## Phase 4 — Code Quality & Cleanup

> These reduce maintenance burden and prevent bugs.

### 4.1 Consolidate Remaining Duplicate Code

| Duplication | Files | Lines Saved |
|-------------|-------|-------------|
| `ClientStudentProtection` + `ClientTeacherProtection` → merge into `ProtectedRoute.tsx` with role param | `src/components/auth/Client*Protection.tsx` | ~150 |
| Auth token extraction in 13+ API routes → use `authenticateApiRequest()` | Various `src/app/api/` routes | ~100 |
| User lookup boilerplate in 40+ routes → create `getAuthenticatedUser()` helper | Various `src/app/api/` routes | ~300 |
| Try-catch error handler in 100+ routes → use `createInternalErrorResponse()` | Various `src/app/api/` routes | ~250 |
| Form state boilerplate across 6 auth forms → extract shared form field components | `src/components/auth/*Form.tsx` | ~300 |

**Total removable: ~1,100 lines**

---

### 4.2 Remove Dead Code

| Item | Location |
|------|----------|
| 3 empty files (0 bytes) | `src/components/admin/utils.ts`, `src/components/externals/faq.tsx`, `src/components/externals/header.tsx` |
| ~500 console.log/error/warn | Across entire `src/` directory |
| Stub email methods | `src/lib/services/notification.service.ts` — all email functions are TODOs |
| `@ts-nocheck` | `src/components/admin/users/data-table.tsx` — entire file skips type checking |
| Unused test utilities | `src/lib/utils/access-control-test.utils.ts` — 13 exported functions, verify if used |

---

### 4.3 Type Safety

**Problem:** 74 `any` types scattered across the codebase, hiding potential runtime bugs.

**Priority files:**
- `src/app/api/admin/teachers/applications/[applicationId]/route.ts` — 7 instances
- `src/lib/utils/api-response.utils.ts` — 10 instances
- `src/lib/services/profile-enhancement.service.ts`

**Fix:** Replace `any` with proper types. For unknown external data, use `unknown` + type guards.

---

### 4.4 Split Monster Components

| Component | Lines | Action |
|-----------|-------|--------|
| `TeacherRegistrationForm.tsx` | 2,613 | Split into step components (PersonalInfo, Qualifications, Documents, Review) |
| `QuickTeacherRegistrationForm.tsx` | 1,171 | Extract shared fields with TeacherRegistrationForm |
| `SecurityEventsViewer.tsx` | 749 | Extract table, filters, and detail panel |
| `VideoRoom.tsx` | 689 | Extract controls, participant list, chat panel |

---

### 4.5 Standardize Service Pattern

**Problem:** Some services use class + singleton pattern, others use plain exported functions. Inconsistent across the codebase.

**Recommendation:** Pick one pattern and stick with it. Plain functions are simpler for Next.js:
```typescript
// Preferred: plain functions (tree-shakeable, no class overhead)
export async function getTeachers() { ... }
export async function approveTeacher(id: string) { ... }
```

---

## Phase 5 — Infrastructure (Production Readiness)

> Nice-to-haves that compound over time.

### 5.1 ISR / Static Generation

- Add `revalidate` to course catalog, teacher profiles, public course detail pages
- Use `generateStaticParams` for top 100 courses (currently only top 50)
- Add ISR to category pages: `revalidate = 300`

### 5.2 CDN for Images

- Configure a CDN domain for Next.js image optimization
- Add `blurDataURL` placeholders to course/teacher images
- Set explicit `sizes` prop on responsive images

### 5.3 Monitoring & Observability

- Add APM (Datadog, New Relic, or Vercel Analytics)
- Set up alerts for: response time > 2s, error rate > 1%, database connection saturation
- Add structured logging (replace remaining console.* with a logger like `pino`)

### 5.4 Load Testing

Before production launch:
```bash
# Install k6 or artillery
bun add -d @artilleryio/artillery

# Test critical endpoints at target load
# Target: 200 concurrent users sustained for 5 minutes
# Watch: response times, error rates, memory usage, DB connections
```

---

## Summary

| Phase | Items | Est. Lines Changed | Impact |
|-------|-------|--------------------|--------|
| 1 — Critical | 4 issues | ~200 lines | Prevents crashes at 50+ users |
| 2 — High | 4 issues | ~300 lines + schema changes | Handles 500+ concurrent users |
| 3 — Medium | 5 issues | ~500 lines | 3-5x faster page loads |
| 4 — Cleanup | 5 issues | -1,100 lines removed | Maintainability, fewer bugs |
| 5 — Infra | 4 issues | Config + tooling | Production-grade reliability |

**Current state:** The app will OOM or timeout at ~50-100 concurrent users. After Phase 1-2, it can handle 1,000-5,000 daily users. Phase 3-5 takes it to production quality.