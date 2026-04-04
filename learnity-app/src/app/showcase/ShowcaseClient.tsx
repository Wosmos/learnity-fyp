'use client';

import { useState } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Shield,
  Star,
  Clock,
  Search,
  FileText,
  UserCheck,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Play,
  Trophy,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { AsyncButton } from '@/components/ui/async-button';

// Domain Components
import { MetricCard } from '@/components/ui/stats-card';
import { CourseCard } from '@/components/courses/CourseCard';
import { StarRating } from '@/components/courses/StarRating';
import { SearchInput } from '@/components/courses/SearchInput';
import { ProgressBar, CourseProgressBar } from '@/components/courses/ProgressBar';
import { XPBadge, XPGain, LevelBadge, XPProgress } from '@/components/courses/XPBadge';
import { StreakCounter, StreakDisplay } from '@/components/courses/StreakCounter';
import { TeacherCard } from '@/components/teachers/TeacherCard';
import { CompactPagination } from '@/components/shared/CompactPagination';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { QuestionCard } from '@/components/quiz/QuestionCard';

// ═══════════════════════════════════════════
// SHOWCASE HELPER COMPONENTS
// ═══════════════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="grid grid-cols-1 gap-6">{children}</div>
    </div>
  );
}

function Showcase({
  name,
  file,
  usedIn,
  children,
  fullWidth,
}: {
  name: string;
  file: string;
  usedIn: string[];
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-foreground">{name}</h3>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{file}</p>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {usedIn.length} usage{usedIn.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <div className={fullWidth ? 'p-0' : 'p-6 overflow-x-auto'}>{children}</div>
      <div className="bg-muted/30 px-4 py-2 border-t border-border">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold">Used in: </span>
          {usedIn.join(' · ')}
        </p>
      </div>
    </div>
  );
}

function ReferenceCard({
  name,
  file,
  usedIn,
  description,
  reason,
}: {
  name: string;
  file: string;
  usedIn: string[];
  description: string;
  reason: string;
}) {
  return (
    <div className="border border-dashed border-border rounded-xl overflow-hidden bg-muted/20">
      <div className="px-4 py-3 border-b border-border/50 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-foreground">{name}</h3>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{file}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">Reference</Badge>
      </div>
      <div className="px-4 py-3 space-y-1">
        <p className="text-sm text-foreground">{description}</p>
        <p className="text-[11px] text-muted-foreground italic">{reason}</p>
      </div>
      <div className="bg-muted/30 px-4 py-2 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold">Used in: </span>
          {usedIn.join(' · ')}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN SHOWCASE COMPONENT
// ═══════════════════════════════════════════

export default function ShowcaseClient() {
  // State for interactive demos
  const [searchValue, setSearchValue] = useState('');
  const [ratingValue, setRatingValue] = useState(3.5);
  const [currentPage, setCurrentPage] = useState(2);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [skeletonVariant, setSkeletonVariant] = useState<'dashboard' | 'list' | 'detail' | 'form' | 'grid'>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Component Showcase
              </h1>
              <p className="text-muted-foreground mt-1">
                Every component in the Learnity codebase — organized by role, with usage locations.
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">200+ components</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">519 files</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">113K lines</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="student" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="shared">Shared UI</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════ */}
          {/* SHARED UI TAB */}
          {/* ══════════════════════════════════════════════ */}
          <TabsContent value="shared" className="space-y-10">

            {/* Typography */}
            <Section title="Typography">
              <Showcase
                name="Typography"
                file="components/ui/typography.tsx"
                usedIn={['Global — used across all pages for consistent text styling']}
              >
                <div className="space-y-3">
                  <Typography variant="h1">Heading 1 — Bold & Large</Typography>
                  <Typography variant="h2">Heading 2 — Section Title</Typography>
                  <Typography variant="h3">Heading 3 — Card Title</Typography>
                  <Typography variant="h4">Heading 4 — Subsection</Typography>
                  <Typography variant="body">Body — Regular paragraph text for content.</Typography>
                  <Typography variant="body-sm">Body Small — Secondary/muted descriptions.</Typography>
                  <Typography variant="caption">Caption — Timestamps, metadata</Typography>
                  <Typography variant="overline">Overline — Labels & Categories</Typography>
                </div>
              </Showcase>
            </Section>

            {/* Buttons */}
            <Section title="Buttons">
              <Showcase
                name="Button Variants"
                file="components/ui/button.tsx"
                usedIn={['Every page — primary actions, navigation, forms']}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="cta">CTA</Button>
                    <Button variant="gradient">Gradient</Button>
                    <Button variant="nova">Nova</Button>
                    <Button variant="minimal">Minimal</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Search /></Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </Showcase>

              <Showcase
                name="AsyncButton"
                file="components/ui/async-button.tsx"
                usedIn={['Teacher dashboard', 'Forms with async submit']}
              >
                <div className="flex gap-3">
                  <AsyncButton onClick={async () => await new Promise(r => setTimeout(r, 2000))}>
                    Click me (async)
                  </AsyncButton>
                  <AsyncButton isLoading loadingText="Saving...">
                    Save
                  </AsyncButton>
                </div>
              </Showcase>
            </Section>

            {/* Badges */}
            <Section title="Badges">
              <Showcase
                name="Badge"
                file="components/ui/badge.tsx"
                usedIn={['Course cards', 'Teacher cards', 'Admin tables', 'Status indicators']}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </Showcase>
            </Section>

            {/* MetricCard */}
            <Section title="Stats / Metric Cards">
              <Showcase
                name="MetricCard"
                file="components/ui/stats-card.tsx"
                usedIn={[
                  'Admin dashboard (7x)',
                  'Student dashboard',
                  'Student courses (3x)',
                  'Student progress',
                  'Teacher dashboard (3x)',
                  'Teacher wallet (4x)',
                  'Teacher applications (4x)',
                  'Security dashboard (4x)',
                  'Security events (4x)',
                  'Landing page stats',
                  'Platform stats',
                ]}
              >
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">With trend (admin/analytics)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MetricCard
                      title="Total Users"
                      value="2,450"
                      trendValue="+12%"
                      isTrendUp
                      variant="default"
                      icon={Users}
                    />
                    <MetricCard
                      title="Revenue"
                      value="$18.5K"
                      trendValue="-3%"
                      isTrendUp={false}
                      variant="elevated"
                      icon={DollarSign}
                    />
                    <MetricCard
                      title="Active Courses"
                      value="147"
                      trendValue="+15"
                      isTrendUp
                      variant="subtle"
                      icon={BookOpen}
                    />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6">With subtitle (dashboards/wallet)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <MetricCard title="Balance" value="PKR 1,250" subtitle="Ready to withdraw" icon={Wallet} />
                    <MetricCard title="Total Students" value="156" subtitle="Across all courses" icon={Users} />
                    <MetricCard title="Pending" value="5" subtitle="Awaiting review" icon={Clock} />
                    <MetricCard title="Completed" value="12" subtitle="Finished modules" icon={Trophy} />
                  </div>
                </div>
              </Showcase>
            </Section>

            {/* Progress */}
            <Section title="Progress Indicators">
              <Showcase
                name="ProgressBar"
                file="components/courses/ProgressBar.tsx"
                usedIn={['Student courses', 'Course player sidebar', 'Student progress page']}
              >
                <div className="space-y-4 max-w-md">
                  <ProgressBar value={75} size="sm" variant="default" showPercentage percentagePosition="right" />
                  <ProgressBar value={45} size="md" variant="success" showPercentage percentagePosition="right" />
                  <ProgressBar value={20} size="lg" variant="gradient" showPercentage percentagePosition="right" />
                  <ProgressBar value={90} size="md" variant="warning" showPercentage percentagePosition="right" />
                </div>
              </Showcase>

              <Showcase
                name="CourseProgressBar"
                file="components/courses/ProgressBar.tsx"
                usedIn={['EnrolledCourseCard', 'Course player', 'Student courses list']}
              >
                <div className="space-y-4 max-w-md">
                  <CourseProgressBar completedLessons={7} totalLessons={12} showLabel />
                  <CourseProgressBar completedLessons={12} totalLessons={12} showLabel />
                  <CourseProgressBar completedLessons={0} totalLessons={8} showLabel />
                </div>
              </Showcase>

              <Showcase
                name="Progress (shadcn)"
                file="components/ui/progress.tsx"
                usedIn={['XP progress bars', 'Welcome page profile completion']}
              >
                <div className="space-y-3 max-w-md">
                  <Progress value={33} />
                  <Progress value={66} />
                  <Progress value={100} />
                </div>
              </Showcase>
            </Section>

            {/* Star Rating */}
            <Section title="Ratings">
              <Showcase
                name="StarRating"
                file="components/courses/StarRating.tsx"
                usedIn={['Course detail page', 'Review form', 'Course card', 'Teacher detail']}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Readonly:</span>
                    <StarRating value={4.5} readonly showValue size="md" count={128} showCount />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Interactive:</span>
                    <StarRating value={ratingValue} onChange={setRatingValue} showValue size="lg" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">Sizes:</span>
                    <StarRating value={3} readonly size="sm" />
                    <StarRating value={3} readonly size="md" />
                    <StarRating value={3} readonly size="lg" />
                  </div>
                </div>
              </Showcase>
            </Section>

            {/* Search */}
            <Section title="Search & Pagination">
              <Showcase
                name="SearchInput"
                file="components/courses/SearchInput.tsx"
                usedIn={['Course catalog', 'Admin user management', 'Admin teacher management']}
              >
                <div className="max-w-md">
                  <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search courses, teachers..."
                  />
                </div>
              </Showcase>

              <Showcase
                name="CompactPagination"
                file="components/shared/CompactPagination.tsx"
                usedIn={['Admin users table', 'Teacher students list', 'Course catalog']}
              >
                <CompactPagination
                  currentPage={currentPage}
                  totalPages={8}
                  onPageChange={setCurrentPage}
                />
              </Showcase>
            </Section>

            {/* Page Header */}
            <Section title="Layout Components">
              <Showcase
                name="PageHeader"
                file="components/layout/PageHeader.tsx"
                usedIn={[
                  'Teacher dashboard', 'Teacher courses', 'Teacher wallet',
                  'Student sessions', 'Student courses', 'Admin pages',
                ]}
              >
                <PageHeader
                  title="Course Management"
                  subtitle="Manage your courses and track student progress"
                  icon={BookOpen}
                  iconGradient={{ from: 'from-blue-500', to: 'to-indigo-500' }}
                  actions={<Button size="sm">Create Course</Button>}
                />
              </Showcase>

              <Showcase
                name="ThemeToggle"
                file="components/shared/ThemeToggle.tsx"
                usedIn={['DashboardNavbar', 'DashboardSidebar']}
              >
                <div className="flex items-center gap-4">
                  <ThemeToggle compact />
                  <ThemeToggle />
                </div>
              </Showcase>
            </Section>

            {/* Skeletons */}
            <Section title="Loading Skeletons">
              <Showcase
                name="LoadingSkeleton"
                file="components/shared/LoadingSkeleton.tsx"
                usedIn={[
                  'loading.tsx (auth)', 'loading.tsx (courses)',
                  'loading.tsx (admin)', 'loading.tsx (student)',
                  'loading.tsx (teacher)',
                ]}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['dashboard', 'list', 'detail', 'form', 'grid'] as const).map(v => (
                      <Button
                        key={v}
                        size="sm"
                        variant={skeletonVariant === v ? 'default' : 'outline'}
                        onClick={() => setSkeletonVariant(v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <LoadingSkeleton variant={skeletonVariant} className="min-h-[30vh]" />
                  </div>
                </div>
              </Showcase>

              <Showcase
                name="Skeleton (base)"
                file="components/ui/skeleton.tsx"
                usedIn={['LoadingSkeleton variants', 'Inline loading states across all pages']}
              >
                <div className="space-y-3 max-w-sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </Showcase>
            </Section>

            {/* Cards */}
            <Section title="Card (Base)">
              <Showcase
                name="Card"
                file="components/ui/card.tsx"
                usedIn={['Every page — the primary container for content sections']}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>A brief description of this card&apos;s content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Card body content goes here.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Highlighted Card
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Used for featured or active items.</p>
                    </CardContent>
                  </Card>
                </div>
              </Showcase>
            </Section>

          </TabsContent>

          {/* ══════════════════════════════════════════════ */}
          {/* STUDENT TAB */}
          {/* ══════════════════════════════════════════════ */}
          <TabsContent value="student" className="space-y-10">

            {/* Course Cards */}
            <Section title="Course Discovery">
              <Showcase
                name="CourseCard"
                file="components/courses/CourseCard.tsx"
                usedIn={['Course catalog (/courses)', 'Teacher course listings']}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CourseCard
                    id="course-1"
                    title="Introduction to Web Development"
                    description="Learn HTML, CSS, and JavaScript from scratch with hands-on projects."
                    teacherName="Dr. Sarah Ahmed"
                    rating={4.7}
                    reviewCount={128}
                    enrollmentCount={1500}
                    difficulty="BEGINNER"
                    totalDuration={45000}
                    lessonCount={24}
                    price={49.99}
                    href="#"
                    category={{ id: '1', name: 'Web Development' }}
                  />
                  <CourseCard
                    id="course-2"
                    title="Advanced React Patterns"
                    description="Master hooks, context, suspense, and server components."
                    teacherName="Ali Hassan"
                    rating={4.9}
                    reviewCount={85}
                    enrollmentCount={620}
                    difficulty="ADVANCED"
                    totalDuration={32000}
                    lessonCount={18}
                    isFree
                    href="#"
                    category={{ id: '2', name: 'Frontend' }}
                  />
                  <CourseCard
                    id="course-3"
                    title="Database Design & SQL"
                    description="Relational databases, normalization, queries and optimization."
                    teacherName="Fatima Khan"
                    rating={4.3}
                    reviewCount={42}
                    enrollmentCount={340}
                    difficulty="INTERMEDIATE"
                    totalDuration={28000}
                    lessonCount={15}
                    price={29.99}
                    href="#"
                    category={{ id: '3', name: 'Backend' }}
                  />
                </div>
              </Showcase>

              <Showcase
                name="SearchInput"
                file="components/courses/SearchInput.tsx"
                usedIn={['Course catalog filters']}
              >
                <div className="max-w-md">
                  <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search by title, teacher, or topic..."
                  />
                </div>
              </Showcase>

              <ReferenceCard
                name="CourseFilters"
                file="components/courses/CourseFilters.tsx"
                usedIn={['Course catalog page (/courses)']}
                description="Category dropdown, difficulty filter, price range, sort options. Controlled component with onFiltersChange callback."
                reason="Requires categories array from API and filter state management."
              />

              <ReferenceCard
                name="ReviewForm + ReviewsList"
                file="components/courses/ReviewForm.tsx · ReviewsList.tsx"
                usedIn={['Course detail page (/courses/[courseId])']}
                description="ReviewForm: Star rating + text input for course reviews. ReviewsList: Paginated list of reviews with avatars and ratings."
                reason="Requires courseId, authentication context, and API calls."
              />
            </Section>

            {/* Gamification */}
            <Section title="Gamification & Progress">
              <Showcase
                name="XPBadge + XPGain + LevelBadge"
                file="components/courses/XPBadge.tsx"
                usedIn={['Student achievements', 'Student progress', 'Quiz results', 'Lesson complete dialog']}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <XPBadge xp={1250} variant="default" />
                    <XPBadge xp={1250} variant="gradient" />
                    <XPBadge xp={1250} variant="solid" />
                    <XPBadge xp={1250} variant="outline" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <XPBadge xp={500} size="sm" showLabel />
                    <XPBadge xp={1250} size="md" showLabel />
                    <XPBadge xp={5000} size="lg" showLabel />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <XPGain amount={25} reason="Lesson completed" />
                    <XPGain amount={100} reason="Quiz passed" size="lg" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <LevelBadge level={1} size="sm" />
                    <LevelBadge level={5} size="md" />
                    <LevelBadge level={12} size="lg" />
                  </div>
                </div>
              </Showcase>

              <Showcase
                name="XPProgress"
                file="components/courses/XPBadge.tsx"
                usedIn={['Student achievements page', 'Student progress page']}
              >
                <div className="max-w-md space-y-4">
                  <XPProgress currentXP={750} currentLevel={3} xpToNextLevel={250} showLabels />
                  <XPProgress currentXP={50} currentLevel={1} xpToNextLevel={950} size="sm" />
                </div>
              </Showcase>

              <Showcase
                name="StreakCounter + StreakDisplay"
                file="components/courses/StreakCounter.tsx"
                usedIn={['Student achievements', 'Student dashboard', 'Lesson complete dialog']}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StreakCounter streak={3} variant="default" showLabel />
                    <StreakCounter streak={7} variant="fire" showLabel />
                    <StreakCounter streak={30} variant="solid" showLabel />
                    <StreakCounter streak={14} variant="outline" showLabel />
                  </div>
                  <div className="max-w-xs">
                    <StreakDisplay
                      currentStreak={14}
                      longestStreak={21}
                      lastActivityAt={new Date()}
                    />
                  </div>
                </div>
              </Showcase>

              <ReferenceCard
                name="Leaderboard"
                file="components/gamification/Leaderboard.tsx"
                usedIn={['Student achievements page']}
                description="XP rankings table with avatars, level badges, and current user highlight. Supports global and per-course leaderboards."
                reason="Fetches leaderboard data from /api/gamification/leaderboard."
              />

              <ReferenceCard
                name="QuestTracker"
                file="components/gamification/QuestTracker.tsx"
                usedIn={['Student achievements page']}
                description="Displays active quests/challenges with progress bars and completion status."
                reason="Requires quest data from gamification API."
              />
            </Section>

            {/* Quiz */}
            <Section title="Quiz Components">
              <Showcase
                name="QuestionCard"
                file="components/quiz/QuestionCard.tsx"
                usedIn={['Quiz page (/courses/[courseId]/quiz/[quizId])']}
              >
                <div className="max-w-2xl">
                  <QuestionCard
                    questionId="q1"
                    questionNumber={3}
                    question="Which hook is used for side effects in React?"
                    options={['useState', 'useEffect', 'useContext', 'useReducer']}
                    selectedOption={selectedOption}
                    showFeedback={showFeedback}
                    correctOptionIndex={1}
                    explanation="useEffect is designed to handle side effects like API calls, subscriptions, and DOM mutations."
                    isLastQuestion={false}
                    onSelectOption={(i) => {
                      setSelectedOption(i);
                      setShowFeedback(true);
                    }}
                    onNext={() => {
                      setSelectedOption(null);
                      setShowFeedback(false);
                    }}
                  />
                </div>
              </Showcase>

              <ReferenceCard
                name="QuizResultsPage"
                file="components/quiz/QuizResultsPage.tsx"
                usedIn={['Quiz page (after submission)']}
                description="Score display with pass/fail status, per-question breakdown, XP earned, and retake/continue actions."
                reason="Requires full quiz submission result data."
              />
            </Section>

            {/* Dashboard components */}
            <Section title="Student Dashboard Components">
              <ReferenceCard
                name="EnrolledCourseCard"
                file="components/students/EnrolledCourseCard.tsx"
                usedIn={['Student dashboard', 'Student courses page']}
                description="Displays enrolled course with progress bar, last accessed date, and continue button. Uses CourseProgressBar internally."
                reason="Requires enrollment object with nested course data."
              />

              <ReferenceCard
                name="ProfileCard / EliteProfileCard"
                file="components/students/ProfileCard.tsx"
                usedIn={['Student dashboard sidebar']}
                description="Student profile card with avatar, name, level badge, XP, streak, and quick stats grid."
                reason="Requires profile data from auth context + gamification stats."
              />

              <ReferenceCard
                name="CertificatePage"
                file="components/courses/CertificatePage.tsx"
                usedIn={['Certificate view/download page']}
                description="Printable certificate with student name, course name, completion date, and instructor signature."
                reason="Requires certificate data from API."
              />

              <ReferenceCard
                name="LoginForm"
                file="components/auth/LoginForm.tsx"
                usedIn={['/auth/login']}
                description="Email/password login form with hCaptcha, password visibility toggle, and forgot password link."
                reason="Requires Firebase auth context and form submission handlers."
              />

              <ReferenceCard
                name="StudentRegistrationForm"
                file="components/auth/StudentRegistrationForm.tsx"
                usedIn={['/auth/register/student']}
                description="Multi-field registration form with email, password, name, hCaptcha. Uses react-hook-form + zod."
                reason="Requires Firebase auth context and API endpoints."
              />

              <ReferenceCard
                name="LessonSidebar + YouTubePlayer"
                file="components/course-player/LessonSidebar.tsx · YouTubePlayer.tsx"
                usedIn={['Course learning page (/dashboard/student/courses/[id]/learn)']}
                description="LessonSidebar: Collapsible section/lesson list with completion status. YouTubePlayer: Embedded player with progress tracking and resume support."
                reason="Requires course sections/lessons data and player state management."
              />

              <ReferenceCard
                name="CourseChat + DirectMessages"
                file="components/chat/CourseChat.tsx · DirectMessages.tsx"
                usedIn={['Course community page', 'Messages page']}
                description="Real-time chat components powered by Stream Chat SDK. Course-specific and direct messaging channels."
                reason="Requires Stream Chat provider and authentication token."
              />
            </Section>
          </TabsContent>

          {/* ══════════════════════════════════════════════ */}
          {/* TEACHER TAB */}
          {/* ══════════════════════════════════════════════ */}
          <TabsContent value="teacher" className="space-y-10">

            <Section title="Teacher Discovery (Public)">
              <Showcase
                name="TeacherCard"
                file="components/teachers/TeacherCard.tsx"
                usedIn={['Teachers page (/teachers)', 'Student teacher discovery']}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TeacherCard teacher={{
                    id: 't1',
                    name: 'Dr. Sarah Ahmed',
                    firstName: 'Sarah',
                    lastName: 'Ahmed',
                    profilePicture: null,
                    subjects: ['Web Development', 'JavaScript', 'React'],
                    experience: 7,
                    bio: 'Senior full-stack developer with 7 years of teaching experience. Passionate about making complex concepts simple.',
                    hourlyRate: '25',
                    rating: '4.9',
                    reviewCount: 142,
                    lessonsCompleted: 580,
                  }} />
                  <TeacherCard teacher={{
                    id: 't2',
                    name: 'Ali Hassan',
                    firstName: 'Ali',
                    lastName: 'Hassan',
                    profilePicture: null,
                    subjects: ['Python', 'Machine Learning'],
                    experience: 3,
                    bio: 'ML engineer at a leading AI startup. Teaching data science part-time.',
                    hourlyRate: '30',
                    rating: '4.6',
                    reviewCount: 38,
                    lessonsCompleted: 120,
                  }} />
                  <TeacherCard teacher={{
                    id: 't3',
                    name: 'Fatima Khan',
                    firstName: 'Fatima',
                    lastName: 'Khan',
                    profilePicture: null,
                    subjects: ['Database Design', 'SQL', 'System Design'],
                    experience: 10,
                    bio: 'Database architect with a decade of enterprise experience.',
                    hourlyRate: null,
                    rating: '4.8',
                    reviewCount: 95,
                    lessonsCompleted: 340,
                  }} />
                </div>
              </Showcase>

              <ReferenceCard
                name="TeachersGrid"
                file="components/teachers/TeachersGrid.tsx"
                usedIn={['/teachers']}
                description="Grid container for TeacherCards with search, subject filter, price/rating filters."
                reason="Requires server-fetched initial teacher data."
              />

              <ReferenceCard
                name="TeacherDetailContent"
                file="components/teachers/TeacherDetailContent.tsx"
                usedIn={['/teachers/[id]']}
                description="Full teacher profile: hero banner, about, education, courses, reviews tabs."
                reason="Fetches teacher data via API using teacherId prop."
              />

              <ReferenceCard
                name="TeacherHero"
                file="components/teachers/profile/TeacherHero.tsx"
                usedIn={['/teachers/[id]']}
                description="Large hero banner with teacher avatar, name, rating, subjects, and action buttons."
                reason="Requires teacher profile data object."
              />
            </Section>

            <Section title="Teacher Dashboard Components">
              <ReferenceCard
                name="CourseBuilderPage"
                file="components/course-builder/CourseBuilderPage.tsx"
                usedIn={['/dashboard/teacher/courses/new', '/dashboard/teacher/courses/[id]/edit']}
                description="Full course creation wizard: basic info form, section manager, lesson manager, quiz builder, preview, and publish dialog."
                reason="Complex multi-step form with state management (CourseBuilderContext)."
              />

              <ReferenceCard
                name="BookSessionModal"
                file="components/teachers/BookSessionModal.tsx"
                usedIn={['/teachers/[id] (student view)']}
                description="Modal for booking a tutoring session with a teacher. Date/time picker and payment flow."
                reason="Requires auth context and teacher availability API."
              />

              <ReferenceCard
                name="VideoRoom"
                file="components/video/VideoRoom.tsx"
                usedIn={['Course community pages (student & teacher)']}
                description="100ms-powered video conferencing room with controls, participant list, and chat panel. 689 lines."
                reason="Requires 100ms SDK provider and room code."
              />

              <ReferenceCard
                name="SessionCalendar + UpcomingSessionsWidget"
                file="components/teacher-sessions/SessionCalendar.tsx · UpcomingSessionsWidget.tsx"
                usedIn={['Teacher sessions page', 'Student sessions page']}
                description="Calendar view of scheduled sessions and a widget showing upcoming sessions with join buttons."
                reason="Requires session data from API."
              />

              <ReferenceCard
                name="TeacherRegistrationForm"
                file="components/auth/TeacherRegistrationForm.tsx (2,613 lines)"
                usedIn={['/auth/register/teacher']}
                description="Multi-step registration wizard: personal info, qualifications, documents, subjects. The largest component in the codebase."
                reason="Requires Firebase auth + complex form state. Candidate for splitting into sub-components."
              />
            </Section>
          </TabsContent>

          {/* ══════════════════════════════════════════════ */}
          {/* ADMIN TAB */}
          {/* ══════════════════════════════════════════════ */}
          <TabsContent value="admin" className="space-y-10">

            <Section title="Admin Dashboard Stats">
              <Showcase
                name="MetricCard (Admin context)"
                file="components/ui/stats-card.tsx"
                usedIn={['Admin dashboard (/admin) — 7 metric cards']}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard title="Total Users" value="2,450" trendValue="+12%" isTrendUp icon={Users} />
                  <MetricCard title="Students" value="1,890" trendValue="+8%" isTrendUp icon={GraduationCap} />
                  <MetricCard title="Teachers" value="142" trendValue="+3" isTrendUp icon={UserCheck} />
                  <MetricCard title="Courses" value="287" trendValue="+15" isTrendUp icon={BookOpen} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <MetricCard title="Revenue" value="$24.5K" trendValue="+18%" isTrendUp icon={DollarSign} variant="elevated" />
                  <MetricCard title="Completion" value="67%" trendValue="-2%" isTrendUp={false} icon={CheckCircle} variant="elevated" />
                  <MetricCard title="Avg Rating" value="4.6" trendValue="+0.1" isTrendUp icon={Star} variant="elevated" />
                </div>
              </Showcase>

            </Section>

            <Section title="Security & Audit">
              <ReferenceCard
                name="SecurityDashboard"
                file="components/admin/SecurityDashboard.tsx"
                usedIn={['/admin/security']}
                description="Overview dashboard with 4 MetricCards (active sessions, failed logins, security alerts, response time), recent activity list, and threat indicators."
                reason="Fetches data via useAuthenticatedFetch from multiple security API endpoints."
              />

              <ReferenceCard
                name="AuditLogViewer"
                file="components/admin/AuditLogViewer.tsx"
                usedIn={['/admin/security (audit logs tab)']}
                description="Filterable, paginated table of audit log entries. Columns: timestamp, user, event type, IP, status, details."
                reason="Fetches paginated data from /api/admin/audit-logs."
              />

              <ReferenceCard
                name="SecurityEventsViewer"
                file="components/admin/SecurityEventsViewer.tsx (749 lines)"
                usedIn={['/admin/security (security events tab)']}
                description="Filterable list of security events: failed logins, suspicious activity, rate limit hits. Includes 4 inline stat cards and event detail expansion."
                reason="Fetches data from /api/admin/security-events. Large component — candidate for splitting."
              />
            </Section>

            <Section title="User & Teacher Management">
              <ReferenceCard
                name="UserManagementClient"
                file="components/admin/users/UserManagementClient.tsx"
                usedIn={['/admin/people (users tab)']}
                description="Full user management: search, filter by role/status, sortable table, user detail dialog, role change actions."
                reason="Fetches user list from /api/admin/users with pagination."
              />

              <ReferenceCard
                name="UserDetailDialog"
                file="components/admin/users/user-detail-dialog.tsx"
                usedIn={['UserManagementClient (on row click)']}
                description="Dialog showing full user profile: avatar, email, role, join date, activity stats, and admin actions (suspend, change role)."
                reason="Fetches individual user data. Nearly identical to TeacherDetailDialog — dedup candidate."
              />

              <ReferenceCard
                name="TeacherManagementClient"
                file="components/admin/teachers/TeacherManagementClient.tsx"
                usedIn={['/admin/people (applications tab)']}
                description="Teacher application management: pending/approved/rejected filters, application review, approve/reject actions."
                reason="Fetches teacher data from /api/admin/teachers."
              />

              <ReferenceCard
                name="TeacherDetailDialog"
                file="components/admin/teachers/teacher-detail-dialog.tsx"
                usedIn={['TeacherManagementClient (on row click)']}
                description="Dialog showing teacher profile, qualifications, application status, and admin approve/reject buttons."
                reason="Nearly identical structure to UserDetailDialog — strong dedup candidate."
              />

              <ReferenceCard
                name="DataTable"
                file="components/admin/users/data-table.tsx"
                usedIn={['UserManagementClient (previously, may be unused now)']}
                description="Generic TanStack Table wrapper with sorting, filtering, pagination. NOTE: Has @ts-nocheck — type safety disabled."
                reason="Depends on TanStack Table column definitions."
              />
            </Section>
          </TabsContent>

        </Tabs>

        {/* ── Footer ── */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Learnity Component Showcase — {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All stat cards consolidated into MetricCard. One component, consistent design, dark mode support everywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
