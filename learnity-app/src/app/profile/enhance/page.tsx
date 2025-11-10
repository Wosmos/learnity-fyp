'use client';

/**
 * Profile Enhancement Page
 * Comprehensive student profile customization interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { ProfileEnhancementForm } from '@/components/profile/ProfileEnhancementForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PrivacySettingsForm } from '@/components/profile/PrivacySettingsForm';
import { ProfileCompletionSkeleton } from '@/components/profile/ProfileCompletionSkeleton';
import { 
  User, 
  Settings, 
  Shield, 
  ArrowLeft,
  Sparkles,
  Award,
} from 'lucide-react';

export default function ProfileEnhancePage() {
  const { user, loading } = useClientAuth();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (loading) return; // Wait for auth to be ready
    
    try {
      const data = await api.get('/api/auth/profile');
      setProfileData(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [loading, api]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user && !loading) {
      fetchProfileData();
    }
  }, [user, loading, router, fetchProfileData]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Enhance Your Profile
                </h1>
                <p className="text-sm text-gray-600">
                  Customize your learning experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Level Up Your Profile
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Enhancement Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle>Customize Your Profile</CardTitle>
                <CardDescription>
                  Add more details to personalize your learning experience and unlock features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEnhancementForm
                  initialData={profileData?.studentProfile}
                  onSuccess={fetchProfileData}
                />
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
                <AvatarUpload
                  currentAvatar={profileData?.profilePicture}
                  onUploadSuccess={fetchProfileData}
                  onDeleteSuccess={fetchProfileData}
                />
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
                <PrivacySettingsForm onSuccess={fetchProfileData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
