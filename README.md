# Learnity

A modern learning management system built with Next.js 16, featuring role-based dashboards (student, teacher, admin), gamification, video conferencing, real-time chat, and a course builder.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Database:** PostgreSQL (Neon serverless) + Prisma ORM
- **Auth:** Firebase Auth (Client + Admin SDK) with custom claims RBAC
- **Styling:** Tailwind CSS 4 + Radix UI (shadcn/ui) + Framer Motion
- **State:** Zustand + React Hook Form + Zod validators
- **Video:** 100ms SDK
- **Chat:** GetStream Chat
- **Storage:** Vercel Blob
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) (package manager)
- PostgreSQL database (or [Neon](https://neon.tech/) account)
- Firebase project with Auth enabled
- 100ms account (video conferencing)
- GetStream account (chat)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Wosmos/learnity-fyp.git
cd learnity-fyp/learnity-app
bun install
```

### 2. Set up environment variables

Copy the example and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (use pooled endpoint) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase service account private key |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key |
| `HCAPTCHA_SECRET_KEY` | hCaptcha secret key |
| `HMS_ACCESS_KEY` | 100ms access key |
| `HMS_SECRET` | 100ms secret |
| `HMS_TEMPLATE_ID` | 100ms template ID |
| `NEXT_PUBLIC_STREAM_API_KEY` | GetStream API key |
| `STREAM_API_SECRET` | GetStream API secret |
| `STATIC_ADMIN_EMAIL` | Initial admin email |
| `STATIC_ADMIN_PASSWORD` | Initial admin password |

### 3. Set up the database

```bash
bun run db:generate    # Generate Prisma client
bun run db:push        # Push schema to database
bun run db:seed        # Seed with sample data (optional)
```

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
learnity-app/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/                # REST API endpoints (~114 routes)
│   │   ├── auth/               # Login, register, verify pages
│   │   ├── dashboard/          # Role-based dashboards (student/teacher/admin)
│   │   ├── courses/            # Course catalog & detail pages
│   │   └── ...
│   ├── components/             # React components (~190 files)
│   │   ├── ui/                 # shadcn/ui primitives (button, card, form, etc.)
│   │   ├── auth/               # Auth forms & providers
│   │   ├── layout/             # Navbars, sidebars, layouts
│   │   ├── course-builder/     # Course creation components
│   │   ├── course-player/      # Lesson viewing components
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── services/           # Business logic layer (~40 services)
│   │   ├── middleware/         # Auth middleware for API routes
│   │   ├── stores/             # Zustand state stores
│   │   ├── validators/         # Zod validation schemas
│   │   ├── cache/              # Caching utilities
│   │   └── config/             # Firebase, env validation
│   └── types/                  # TypeScript type definitions
├── prisma/
│   ├── schema.prisma           # Database schema (23 models)
│   ├── seed.ts                 # Database seeding
│   └── migrations/             # Database migrations
├── middleware.ts                # Next.js route protection
└── next.config.ts              # Next.js configuration
```

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |
| `bun run type-check` | Run TypeScript type checking |
| `bun run test` | Run tests |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push schema to database |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:studio` | Open Prisma Studio (DB GUI) |

## Key Features

- **Role-based access:** Student, Teacher, Admin, Pending Teacher roles with granular permissions
- **Course management:** Create courses with sections, lessons (YouTube), quizzes
- **Gamification:** XP system, levels, streaks, badges, quests, leaderboards
- **Video conferencing:** Scheduled and instant calls via 100ms
- **Real-time chat:** Direct messaging and group chats via GetStream
- **Wallet system:** Balance management for course payments
- **Certificate generation:** PDF certificates on course completion
- **Admin panel:** User management, teacher approvals, audit logs, security monitoring
