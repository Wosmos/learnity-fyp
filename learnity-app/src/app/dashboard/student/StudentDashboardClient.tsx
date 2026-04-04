'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, TrendingUp, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { MetricCard } from '@/components/ui/stats-card';
import Header from '@/components/students/Header';
import { EliteProfileCard } from '@/components/students/ProfileCard';
import Footer from '@/components/students/Footer';
import SideBar from '@/components/students/SideBar';
import MainSection from '@/components/students/MainSection';

interface StudentProfile {
  gradeLevel: string;
  subjects: string[];
  learningGoals: string[];
  interests: string[];
  studyPreferences: string[];
  bio?: string;
  profileCompletionPercentage: number;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
}

interface CompletionData {
  percentage: number;
  completedSections: Array<{ id: string; name: string }>;
  missingSections: Array<{ id: string; name: string }>;
  nextSteps: string[];
  rewards: Array<{ id: string; name: string }>;
}

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  totalWatchTime: number;
  badgeCount: number;
  averageProgress: number;
}

interface Props {
  profileData: ProfileData | null;
  stats: DashboardStats;
  completion: CompletionData;
}

export function StudentDashboardClient({ profileData, stats, completion }: Props) {
  const router = useRouter();

  const handleEnhanceProfile = () => {
    router.push('/dashboard/student/profile/enhance');
  };

  const getInitials = () => {
    if (profileData) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return 'ST';
  };

  // Format watch time
  const formatWatchTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const metricData = [
    {
      title: 'Courses Enrolled',
      value: String(stats.enrolledCourses),
      trendValue: stats.completedCourses ? `${stats.completedCourses} done` : '',
      icon: BookOpen,
    },
    {
      title: 'Study Time',
      value: formatWatchTime(stats.totalWatchTime),
      trendValue: '',
      icon: Clock,
    },
    {
      title: 'Achievements',
      value: String(stats.badgeCount),
      trendValue: '',
      icon: Award,
    },
    {
      title: 'Avg Progress',
      value: `${stats.averageProgress}%`,
      trendValue: '',
      isTrendUp: stats.averageProgress > 50,
      icon: TrendingUp,
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      {/* 1. FIXED TOP HEADER */}
      <Header profileData={profileData} getInitials={getInitials} />

      {/* 2. MAIN APP CONTAINER (Centered & Max-Width) */}
      <main className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10'>
        {/* BANNERS SECTION (Conditional Spacing) */}
        {completion.percentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProfileCompletionBanner
              completion={completion}
              onEnhanceClick={handleEnhanceProfile}
            />
          </motion.div>
        )}

        {/* 3. PERFORMANCE METRICS (Aligned Grid) */}
        <section>
          <div className='grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6'>
            {metricData.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                trendValue={metric.trendValue}
                isTrendUp={metric.isTrendUp}
                icon={metric.icon}
              />
            ))}
          </div>
        </section>

        {/* 4. IDENTITY HUB (Elite Profile Card) */}
        <section>
          {profileData && <EliteProfileCard profileData={profileData} />}
        </section>

        {/* 5. DUAL-COLUMN OPERATIONAL GRID */}
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-10 items-start'>
          {/* MAIN COLUMN (8 Units) */}
          <div className='xl:col-span-8 space-y-10'>
            <div className='hidden md:flex items-center gap-2 px-1'>
              <div className='h-4 w-1 bg-indigo-600 rounded-full' />
              <h2 className='text-sm font-black uppercase tracking-widest text-muted-foreground'>
                Learning Operations
              </h2>
            </div>
            <MainSection />
          </div>

          {/* SIDEBAR COLUMN (4 Units) */}
          <aside className='xl:col-span-4 space-y-10 sticky top-24'>
            <div className='hidden md:flex items-center gap-2 px-1'>
              <div className='h-4 w-1 bg-purple-600 rounded-full' />
              <h2 className='text-sm font-black uppercase tracking-widest text-muted-foreground'>
                Intelligence & Social
              </h2>
            </div>
            <SideBar />
          </aside>
        </div>
        <Footer />
      </main>
    </div>
  );
}
