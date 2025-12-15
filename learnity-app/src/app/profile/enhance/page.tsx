'use client';

/**
 * Profile Enhancement Page
 * Comprehensive student profile customization interface
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { ProfileEnhancementForm } from '@/components/profile/ProfileEnhancementForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PrivacySettingsForm } from '@/components/profile/PrivacySettingsForm';
import {
  User,
  Shield,
  ArrowLeft,
  Sparkles,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  studentProfile?: {
    gradeLevel: string;
    subjects: string[];
    learningGoals: string[];
    interests: string[];
    studyPreferences: string[];
    bio?: string;
    profileCompletionPercentage: number;
  };
}

interface ProfileError {
  message: string;
  timestamp: number;
}

export default function ProfileEnhancePage() {
  const { user, loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<ProfileError | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Handle authentication redirection
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Only fetch when authenticated and not already loading
    if (!loadingProfile && !profileData) {
      fetchProfileData();
    }
  }, [user, authLoading, router]);

  const fetchProfileData = useCallback(async (showLoading = true) => {
    if (!user || authLoading) return;

    try {
      setIsFetching(true);
      if (showLoading) setLoadingProfile(true);

      const response = await api.get('/api/auth/profile');
      setProfileData(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError({ message: errorMessage, timestamp: Date.now() });
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoadingProfile(false);
      setIsFetching(false);
    }
  }, [user, authLoading, api]);

  // Initial fetch when component mounts and auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileData();
    }
  }, [authLoading, user]);

  // Handle back navigation with fallback
  const handleBack = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  // Show full page skeleton during initial auth loading
  if (authLoading || (loadingProfile && !profileData)) {
    return <ProfileSkeleton />;
  }

  // Handle unauthenticated state (should redirect but just in case)
  if (!user) {
    return null;
  }

  // Error state UI
  if (error && !loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Profile Loading Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error.message}</p>
            <Button
              onClick={() => fetchProfileData(true)}
              disabled={isFetching}
              className="w-full"
            >
              {isFetching ? 'Retrying...' : 'Try Again'}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Last attempt: {new Date(error.timestamp).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {profileData ? `${profileData.firstName}'s Profile` : 'Enhance Your Profile'}
                </h1>
                <p className="text-sm text-gray-600">
                  Customize your learning experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800">
                {profileData?.studentProfile?.profileCompletionPercentage || 0}% Complete
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-slate-50 data-[state=active]:text-blue-700">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Award className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Enhancement Tab */}
          <TabsContent value="profile" className="space-y-2">
            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle>Customize Your Profile</CardTitle>
                <CardDescription>
                  Add more details to personalize your learning experience and unlock features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <FormSkeleton />
                ) : (
                  <ProfileEnhancementForm
                    initialData={profileData?.studentProfile || {
                      gradeLevel: '',
                      subjects: [],
                      learningGoals: [],
                      interests: [],
                      studyPreferences: [],
                      bio: '',
                      profileCompletionPercentage: 0
                    }}
                    onSuccess={() => fetchProfileData(false)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Upload Tab */}
          <TabsContent value="avatar" className="space-y-6">
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a photo to personalize your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <AvatarSkeleton />
                ) : (
                  <AvatarUpload
                    currentAvatar={profileData?.profilePicture || ''}
                    onUploadSuccess={() => fetchProfileData(false)}
                    onDeleteSuccess={() => fetchProfileData(false)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Avatar Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photo Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Use a clear, well-lit photo of yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Face should be clearly visible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Supported formats: JPEG, PNG, WebP, GIF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Maximum file size: 5MB</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-2 border-green-100">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <FormSkeleton />
                ) : (
                  <PrivacySettingsForm onSuccess={() => fetchProfileData(false)} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Skeleton Components
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tabs List Skeleton */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-28" />
            ))}
          </div>

          {/* Card Skeleton */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-32 mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

function AvatarSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}