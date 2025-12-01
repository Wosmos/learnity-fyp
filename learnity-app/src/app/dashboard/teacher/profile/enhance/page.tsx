/**
 * Teacher Profile Enhancement Page
 * Dedicated profile enhancement for teachers (separate from students)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Camera, FileText, Youtube, Award, BookOpen, 
  Globe, Phone, MapPin, Clock, Star, Upload, Save,
  CheckCircle, AlertCircle, TrendingUp, Edit, Plus, X
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';

interface TeacherProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  headline?: string;
  teachingApproach?: string;
  subjects: string[];
  qualifications: string[];
  certifications: string[];
  education: string[];
  experience: number;
  hourlyRate?: number;
  profilePicture?: string;
  bannerImage?: string;
  videoIntroUrl?: string;
  documents: string[];
  linkedinUrl?: string;
  websiteUrl?: string;
  youtubeUrl?: string;
  specialties: string[];
  achievements: string[];
  personalInterests: string[];
  ageGroups: string[];
  availableDays: string[];
  preferredTimes: string[];
  timezone: string;
  languages: string[];
}

export default function TeacherProfileEnhancement() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch teacher profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/teacher/profile', {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          calculateCompletion(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  // Calculate profile completion
  const calculateCompletion = (profileData: TeacherProfileData) => {
    const fields = [
      profileData.profilePicture,
      profileData.bannerImage,
      profileData.videoIntroUrl,
      profileData.headline,
      profileData.teachingApproach,
      profileData.linkedinUrl,
      profileData.websiteUrl,
      profileData.phone,
      profileData.qualifications?.length > 0,
      profileData.certifications?.length > 0,
      profileData.education?.length > 0,
      profileData.specialties?.length > 0,
      profileData.achievements?.length > 0,
      profileData.personalInterests?.length > 0,
      profileData.documents?.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/teacher/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({ section, data })
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully",
        });
        
        // Refresh profile data
        const updatedResponse = await fetch('/api/teacher/profile', {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`
          }
        });
        
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfile(updatedData.profile);
          calculateCompletion(updatedData.profile);
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Profile</h3>
              <p className="text-gray-500">Fetching your teacher profile data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-500">Unable to load your teacher profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhance Your Profile</h1>
              <p className="text-gray-600 mt-2">
                Complete your teacher profile to attract more students
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          <Progress value={completionPercentage} className="h-3 mb-4" />
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Profile completion boosts visibility by 3x</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Complete profiles get more student inquiries</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="teaching" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teaching
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Links
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your basic profile information and bio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    placeholder="e.g., Experienced Math Teacher Specializing in Calculus"
                    value={profile.headline || ''}
                    onChange={(e) => setProfile({...profile, headline: e.target.value})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    A catchy one-line description of your expertise
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about your teaching experience and approach..."
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="teachingApproach">Teaching Approach & Philosophy</Label>
                  <Textarea
                    id="teachingApproach"
                    placeholder="Describe your teaching methodology and philosophy..."
                    value={profile.teachingApproach || ''}
                    onChange={(e) => setProfile({...profile, teachingApproach: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="25"
                      value={profile.hourlyRate || ''}
                      onChange={(e) => setProfile({...profile, hourlyRate: parseFloat(e.target.value) || undefined})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSave('basic', {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    headline: profile.headline,
                    bio: profile.bio,
                    teachingApproach: profile.teachingApproach,
                    phone: profile.phone,
                    hourlyRate: profile.hourlyRate
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Basic Information
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Introduction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Video Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label htmlFor="videoUrl">YouTube Video URL</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://youtube.com/watch?v=..."
                      value={profile.videoIntroUrl || ''}
                      onChange={(e) => setProfile({...profile, videoIntroUrl: e.target.value})}
                    />
                    <p className="text-sm text-gray-500">
                      Add a YouTube video to introduce yourself to students
                    </p>
                    <Button 
                      onClick={() => handleSave('media', { videoIntroUrl: profile.videoIntroUrl })}
                      disabled={saving}
                      className="w-full"
                    >
                      Save Video URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Certificates & Documents
                </CardTitle>
                <CardDescription>
                  Upload your teaching certificates, diplomas, and other credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-gray-500 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                  
                  {profile.documents && profile.documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
                      {profile.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Document {index + 1}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Qualifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm">{qual}</span>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Qualification
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm">{specialty}</span>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Specialty
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Teaching Tab */}
          <TabsContent value="teaching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Information</CardTitle>
                <CardDescription>
                  Details about your teaching experience and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Subjects You Teach</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Age Groups</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.ageGroups.map((group, index) => (
                        <Badge key={index} variant="outline">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Experience: {profile.experience} years</Label>
                  <Progress value={(profile.experience / 20) * 100} className="mt-2" />
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.languages.map((language, index) => (
                      <Badge key={index} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Professional Links
                </CardTitle>
                <CardDescription>
                  Add your professional social media and website links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profile.linkedinUrl || ''}
                    onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={profile.websiteUrl || ''}
                    onChange={(e) => setProfile({...profile, websiteUrl: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/c/yourchannel"
                    value={profile.youtubeUrl || ''}
                    onChange={(e) => setProfile({...profile, youtubeUrl: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={() => handleSave('links', {
                    linkedinUrl: profile.linkedinUrl,
                    websiteUrl: profile.websiteUrl,
                    youtubeUrl: profile.youtubeUrl
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Professional Links
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}