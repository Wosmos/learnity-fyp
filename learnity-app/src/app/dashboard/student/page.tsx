'use client';

/**
 * Student Dashboard
 * Enhanced dashboard with real profile data and modern UI
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { MetricCard } from '@/components/ui/stats-card';
import Header from '@/components/students/Header';
import { EliteProfileCard } from '@/components/students/ProfileCard';
import { motion } from 'framer-motion';
import Footer from '@/components/students/Footer';
import SideBar from '@/components/students/SideBar';
import MainSection from '@/components/students/MainSection';
import { DashboardSkeleton } from '@/components/students/DashboardSkeleton';

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

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [completion, setCompletion] = useState<CompletionData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCompletion, setLoadingCompletion] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('[fetchProfileData] Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [api]);

  // Fetch completion data
  const fetchCompletionData = useCallback(async () => {
    try {
      const response = await api.get('/api/profile/enhance');
      setCompletion(response.data);
    } catch (error) {
      console.error('Failed to fetch completion data:', error);
    } finally {
      setLoadingCompletion(false);
    }
  }, [api]);

  // Fetch dashboard stats (enrollments + gamification)
  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch enrollments for course stats
      const enrollmentsRes = await api.get('/api/enrollments?limit=100');
      const enrollments = enrollmentsRes.data?.enrollments || [];
      
      const enrolledCourses = enrollments.filter((e: { status: string }) => e.status !== 'UNENROLLED').length;
      const completedCourses = enrollments.filter((e: { status: string }) => e.status === 'COMPLETED').length;
      const activeEnrollments = enrollments.filter((e: { status: string; progress: number }) => e.status === 'ACTIVE' && e.progress < 100);
      const averageProgress = activeEnrollments.length > 0
        ? Math.round(activeEnrollments.reduce((sum: number, e: { progress: number }) => sum + e.progress, 0) / activeEnrollments.length)
        : 0;

      // Try to fetch gamification progress
      let badgeCount = 0;
      let totalWatchTime = 0;
      try {
        const gamificationRes = await api.get('/api/gamification/progress');
        if (gamificationRes.data) {
          badgeCount = gamificationRes.data.badges?.length || 0;
        }
      } catch {
        // Gamification API might not exist yet
      }

      // Calculate total watch time from lesson progress (estimate)
      totalWatchTime = enrollments.reduce((sum: number, e: { course?: { totalDuration?: number }; progress: number }) => {
        const courseDuration = e.course?.totalDuration || 0;
        return sum + Math.round((courseDuration * e.progress) / 100);
      }, 0);

      setStats({
        enrolledCourses,
        completedCourses,
        totalWatchTime,
        badgeCount,
        averageProgress,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [api]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileData();
      fetchCompletionData();
      fetchDashboardStats();
    }
  }, [user, authLoading, fetchProfileData, fetchCompletionData, fetchDashboardStats]);

  const handleEnhanceProfile = () => {
    router.push('/dashboard/student/profile/enhance');
  };

  const getInitials = () => {
    if (profileData) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST';
  };

  // Format watch time
  const formatWatchTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Build metric data from real stats
  const metricData = [
    {
      title: "Courses Enrolled",
      value: loadingStats ? "..." : String(stats?.enrolledCourses || 0),
      trendValue: stats?.completedCourses ? `${stats.completedCourses} done` : "",
      trendLabel: "completed",
      icon: BookOpen,
    },
    {
      title: "Study Time",
      value: loadingStats ? "..." : formatWatchTime(stats?.totalWatchTime || 0),
      trendValue: "",
      trendLabel: "total watched",
      icon: Clock,
    },
    {
      title: "Achievements",
      value: loadingStats ? "..." : String(stats?.badgeCount || 0),
      trendValue: "",
      trendLabel: "badges earned",
      icon: Award,
    },
    {
      title: "Avg Progress",
      value: loadingStats ? "..." : `${stats?.averageProgress || 0}%`,
      trendValue: "",
      trendLabel: "across courses",
      isTrendUp: (stats?.averageProgress || 0) > 50,
      icon: TrendingUp,
    }
  ];

  if (authLoading || loadingProfile) {
    return (
      <DashboardSkeleton />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. FIXED TOP HEADER */}
      <Header profileData={profileData} getInitials={getInitials} />

      {/* 2. MAIN APP CONTAINER (Centered & Max-Width) */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
        
        {/* BANNERS SECTION (Conditional Spacing) */}
        {!loadingCompletion && completion && completion.percentage < 100 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <ProfileCompletionBanner
              completion={completion}
              onEnhanceClick={handleEnhanceProfile}
            />
          </motion.div>
        )}

        {/* 3. PERFORMANCE METRICS (Aligned Grid) */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {metricData.map((metric, index) => (
              <MetricCard
                key={index}
                variant="secondary"
                title={metric.title}
                value={metric.value}
                trendValue={metric.trendValue}
                trendLabel={metric.trendLabel}
                isTrendUp={metric.isTrendUp}
                icon={metric.icon}
              />
            ))}
          </div>
        </section>

        {/* 4. IDENTITY HUB (Elite Profile Card) */}
        <section>
          {profileData && <EliteProfileCard   profileData={profileData} />}
        </section>

        {/* 5. DUAL-COLUMN OPERATIONAL GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          
          {/* MAIN COLUMN (8 Units) */}
          <div className="xl:col-span-8 space-y-10">
            <div className="hidden md:flex items-center gap-2 px-1">
              <div className="h-4 w-1 bg-indigo-600 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Learning Operations</h2>
            </div>
            <MainSection />
          </div>

          {/* SIDEBAR COLUMN (4 Units) */}
          <aside className="xl:col-span-4 space-y-10 sticky top-24">
            <div className="hidden md:flex items-center gap-2 px-1">
              <div className="h-4 w-1 bg-purple-600 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Intelligence & Social</h2>
            </div>
            <SideBar />
          </aside>
          
        </div>
        <Footer />
      </main>
    </div>
  );
}
