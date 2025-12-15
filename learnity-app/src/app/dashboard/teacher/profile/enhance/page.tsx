
/**
 * Teacher Profile Enhancement Page
 * Refactored for better UX, cleaner code, and complete profile management.
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
  User, BookOpen, Globe, Star, Upload, Save, X, Plus,
  MapPin, Clock, DollarSign, Video, GraduationCap, Layout, Trash2, CheckCircle, TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

// --- Types ---

interface TeacherProfileData {
  id: string;
  // User Fields
  firstName: string;
  lastName: string;
  email: string;

  // Profile - Identity
  headline?: string;
  bio?: string;
  profilePicture?: string;
  bannerImage?: string;
  videoIntroUrl?: string;
  teachingApproach?: string;

  // Profile - Expertise
  subjects: string[];
  specialties: string[];
  qualifications: string[];
  certifications: string[];
  education: string[];
  languages: string[];
  teachingMethods: string[];
  technologySkills: string[];
  achievements: string[];
  whyChooseMe: string[];
  experience: number;
  onlineExperience?: number;
  documents: string[];

  // Profile - Logistics
  hourlyRate?: number;
  phone?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  availability?: string;
  availableDays: string[];
  preferredTimes: string[];
  userId: string;
}

// --- Helper Components ---

/**
 * Reusable component for managing lists of strings (e.g., Qualifications, Specialties)
 */
const ListManager = ({
  title,
  items = [],
  onUpdate,
  placeholder = "Add new item...",
  icon: Icon = Star
}: {
  title: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  placeholder?: string;
  icon?: any;
}) => {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim()) {
      onUpdate([...items, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-base font-medium text-slate-700">
        <Icon className="h-4 w-4 text-blue-500" /> {title}
      </Label>
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button onClick={handleAdd} type="button" size="sm" variant="secondary">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-slate-50 rounded-md border border-slate-100">
        {items.length === 0 && (
          <span className="text-sm text-slate-400 italic">No items added yet.</span>
        )}
        {items.map((item, idx) => (
          <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm gap-2 bg-white border-slate-200 hover:bg-slate-100 transition-colors">
            {item}
            <button onClick={() => handleRemove(idx)} className="hover:text-red-500 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// --- Constants ---

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = [
  'Early Morning (6am-9am)',
  'Morning (9am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-9pm)',
  'Late Night (9pm-12am)'
];

// --- Helper Components ---

/**
 * YouTube Video Preview Helper
 */
const VideoPreview = ({ url }: { url?: string }) => {
  if (!url) return (
    <div className="aspect-video bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
      <Video className="h-10 w-10 mb-2 opacity-50" />
      <span className="text-sm">No video added</span>
    </div>
  );

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  if (!videoId) return (
    <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center text-red-400 border border-red-100">
      <span className="text-sm">Invalid YouTube URL</span>
    </div>
  );

  return (
    <div className="aspect-video rounded-lg overflow-hidden relative group bg-black shadow-sm border">
      <img
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt="Video thumbnail"
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Video className="h-5 w-5 text-red-600 fill-current ml-1" />
        </div>
      </div>
    </div>
  );
};

/**
 * Multi-Select Pill/Badge Selector
 */
const ItemSelector = ({
  title,
  options,
  selected = [],
  onUpdate,
  icon: Icon
}: {
  title: string;
  options: string[];
  selected: string[];
  onUpdate: (items: string[]) => void;
  icon?: any;
}) => {
  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onUpdate(selected.filter(i => i !== item));
    } else {
      onUpdate([...selected, item]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-base font-medium text-slate-700">
        {Icon && <Icon className="h-4 w-4 text-blue-500" />} {title}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(item)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                ${isSelected
                  ? 'bg-slate-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
              `}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};


// --- Main Page Component ---

export default function TeacherProfileEnhancement() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Document uploading
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/teacher/profile', {
          headers: { 'Authorization': `Bearer ${await user.getIdToken()}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure arrays are initialized
          const safeProfile = {
            ...data.profile,
            subjects: data.profile.subjects || [],
            specialties: data.profile.specialties || [],
            qualifications: data.profile.qualifications || [],
            certifications: data.profile.certifications || [],
            education: data.profile.education || [],
            languages: data.profile.languages || [],
            teachingMethods: data.profile.teachingMethods || [],
            technologySkills: data.profile.technologySkills || [],
            documents: data.profile.documents || [],
            achievements: data.profile.achievements || [],
            whyChooseMe: data.profile.whyChooseMe || [],
            availableDays: data.profile.availableDays || [],
            preferredTimes: data.profile.preferredTimes || [],
            userId: data.profile.userId,
          };
          setProfile(safeProfile);
          calculateCompletion(safeProfile);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  // Logic
  const calculateCompletion = (data: TeacherProfileData) => {
    // Weighted fields
    const sections = [
      { weight: 10, complete: !!data.profilePicture },
      { weight: 10, complete: !!data.bio && data.bio.length > 50 },
      { weight: 10, complete: !!data.headline },
      { weight: 20, complete: data.subjects.length > 0 },
      { weight: 10, complete: data.qualifications.length > 0 || data.education.length > 0 },
      { weight: 10, complete: !!data.hourlyRate },
      { weight: 10, complete: !!data.teachingApproach },
      { weight: 10, complete: data.languages.length > 0 },
      { weight: 10, complete: !!data.videoIntroUrl || !!data.linkedinUrl }
    ];

    const score = sections.reduce((acc, curr) => acc + (curr.complete ? curr.weight : 0), 0);
    setCompletionPercentage(Math.min(100, score));
  };

  const handleSave = async (sectionName: string, dataToSave: Partial<TeacherProfileData>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({ section: sectionName, data: dataToSave })
      });

      if (!response.ok) throw new Error('Update failed');

      toast({ title: "Saved!", description: "Your profile has been updated." });

      // Update local state deeply
      if (profile) {
        const newProfile = { ...profile, ...dataToSave };
        setProfile(newProfile);
        calculateCompletion(newProfile);
      }

    } catch (error) {
      toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/teacher/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await user.getIdToken()}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      if (profile) {
        const newProfile = { ...profile, documents: data.documents };
        setProfile(newProfile);
        calculateCompletion(newProfile);
        toast({ title: "Success", description: "Document uploaded" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Upload to server failed", variant: "destructive" });
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (url: string) => {
    if (!profile || !user) return;
    try {
      // Optimistic update
      const newDocs = profile.documents.filter(d => d !== url);
      setProfile({ ...profile, documents: newDocs });

      await fetch('/api/teacher/documents', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ url })
      });
      toast({ title: "Removed", description: "Document deleted" });
    } catch (e) {
      // Revert if failed (simplified for now)
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div><div className="h-4 w-48 bg-slate-200 rounded"></div></div></div>;
  }

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-[1600px] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
            <p className="text-sm text-slate-500">Update your teacher presence</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-700">{completionPercentage}% Completed</div>
              <Progress value={completionPercentage} className="w-32 h-2 mt-1" />
            </div>
            <Button onClick={() => window.open(`/teachers/${profile.userId}`, '_blank')} variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" /> View Public
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-[1600px] space-y-6">

        <Tabs defaultValue="identity" className="space-y-6">

          <TabsList className="grid w-full grid-cols-3 h-12 bg-white border shadow-sm">
            <TabsTrigger value="identity" className="data-[state=active]:bg-slate-100 font-medium">
              <User className="h-4 w-4 mr-2" /> Identity & Brand
            </TabsTrigger>
            <TabsTrigger value="expertise" className="data-[state=active]:bg-slate-100 font-medium">
              <GraduationCap className="h-4 w-4 mr-2" /> Expertise & Docs
            </TabsTrigger>
            <TabsTrigger value="logistics" className="data-[state=active]:bg-slate-100 font-medium">
              <Layout className="h-4 w-4 mr-2" /> Logistics & Info
            </TabsTrigger>
          </TabsList>

          {/* === TAB 1: IDENTITY === */}
          <TabsContent value="identity" className="space-y-6 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Left: Avatar & Media */}
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Profile Image</CardTitle></CardHeader>
                  <CardContent className="flex justify-center pb-6">
                    <AvatarUpload
                      currentAvatar={profile.profilePicture}
                      onUploadSuccess={(url) => {
                        setProfile({ ...profile, profilePicture: url });
                        handleSave('identity', { profilePicture: url });
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Intro Video</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <VideoPreview url={profile.videoIntroUrl} />
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input
                        placeholder="https://youtube.com/..."
                        value={profile.videoIntroUrl || ''}
                        onChange={(e) => setProfile({ ...profile, videoIntroUrl: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Provide a YouTube link. We'll automatically show the thumbnail on your profile.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Personal Info */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Your main identification on the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Professional Headline</Label>
                      <Input
                        placeholder="e.g. Senior Math Tutor with 5 years experience"
                        value={profile.headline || ''}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>About Me (Bio)</Label>
                      <Textarea
                        className="h-32"
                        placeholder="Tell your story..."
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      />
                    </div>
                    <ListManager
                      title="Why Choose Me?"
                      items={profile.whyChooseMe}
                      onUpdate={(items) => setProfile({ ...profile, whyChooseMe: items })}
                      placeholder="e.g. 10 years experience, Patient..."
                      icon={Star}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Teaching Approach</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Philosophy</Label>
                      <Textarea
                        placeholder="How do you help students learn best?"
                        className="h-44"
                        value={profile.teachingApproach || ''}
                        onChange={(e) => setProfile({ ...profile, teachingApproach: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('identity', {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    headline: profile.headline,
                    bio: profile.bio,
                    videoIntroUrl: profile.videoIntroUrl,
                    teachingApproach: profile.teachingApproach,
                    whyChooseMe: profile.whyChooseMe
                  })} disabled={saving} className="bg-slate-600 hover:bg-slate-700">
                    {saving ? 'Saving...' : 'Save Identity Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* === TAB 2: EXPERTISE === */}
          <TabsContent value="expertise" className="space-y-6 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Skills & Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Subjects</CardTitle>
                  <CardDescription>What do you teach?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ListManager
                    title="Subjects"
                    items={profile.subjects}
                    onUpdate={(items) => setProfile({ ...profile, subjects: items })}
                    placeholder="e.g. Mathematics, Physics..."
                    icon={BookOpen}
                  />
                  <ListManager
                    title="Specialties"
                    items={profile.specialties}
                    onUpdate={(items) => setProfile({ ...profile, specialties: items })}
                    placeholder="e.g. Algebra, Calculus, SAT Prep..."
                    icon={Star}
                  />
                  <ListManager
                    title="Languages Spoken"
                    items={profile.languages}
                    onUpdate={(items) => setProfile({ ...profile, languages: items })}
                    placeholder="e.g. English, Spanish..."
                    icon={Globe}
                  />
                </CardContent>
              </Card>

              {/* Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle>Credentials</CardTitle>
                  <CardDescription>Verify your expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Years Exp.</Label>
                      <Input type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Online Exp. (Yrs)</Label>
                      <Input type="number" value={profile.onlineExperience || 0} onChange={(e) => setProfile({ ...profile, onlineExperience: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <ListManager
                    title="Education & Degrees"
                    items={profile.education}
                    onUpdate={(items) => setProfile({ ...profile, education: items })}
                    placeholder="e.g. BSc Computer Science - MIT"
                    icon={GraduationCap}
                  />
                  <ListManager
                    title="Certifications"
                    items={profile.certifications}
                    onUpdate={(items) => setProfile({ ...profile, certifications: items })}
                    placeholder="e.g. Certified React Developer"
                    icon={AwardIcon}
                  />
                  <ListManager
                    title="Key Achievements"
                    items={profile.achievements}
                    onUpdate={(items) => setProfile({ ...profile, achievements: items })}
                    placeholder="e.g. Helped 100+ students pass SAT"
                    icon={TrendingUp}
                  />
                </CardContent>
              </Card>

              {/* Documents (Full Width) */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Verification Documents</CardTitle>
                  <CardDescription>Upload certificates, degrees, or IDs (Private to Admin)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => docInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <div className="text-sm font-medium text-slate-900">Click to Upload Document</div>
                    <div className="text-xs text-slate-500 mt-1">PDF, DOCX accepted</div>
                    <input ref={docInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} />
                  </div>

                  {profile.documents.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm truncate">Document {idx + 1}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave('expertise', {
                subjects: profile.subjects,
                specialties: profile.specialties,
                languages: profile.languages,
                education: profile.education,
                certifications: profile.certifications,
                achievements: profile.achievements,
                experience: profile.experience,
                onlineExperience: profile.onlineExperience
              })} disabled={saving} className="bg-slate-600 hover:bg-slate-700">
                {saving ? 'Saving...' : 'Save Expertise Changes'}
              </Button>
            </div>
          </TabsContent>

          {/* === TAB 3: LOGISTICS === */}
          <TabsContent value="logistics" className="space-y-6 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Card>
                <CardHeader><CardTitle>Pricing & Location</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Hourly Rate (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                      <Input className="pl-7" type="number" value={profile.hourlyRate || ''} onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timezone</Label>
                    <Input placeholder="e.g. EST, GMT+5" value={profile.timezone || ''} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> City & Country</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="City" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                      <Input placeholder="Country" value={profile.country || ''} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Social & Contact</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input placeholder="linkedin.com/in/..." value={profile.linkedinUrl || ''} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website / Portfolio</Label>
                    <Input placeholder="https://..." value={profile.websiteUrl || ''} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone (Private)</Label>
                    <Input placeholder="+1..." value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Availability Note</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ItemSelector
                      title="Available Days"
                      options={DAYS_OF_WEEK}
                      selected={profile.availableDays}
                      onUpdate={(items) => setProfile({ ...profile, availableDays: items })}
                      icon={Clock}
                    />
                    <ItemSelector
                      title="Preferred Times"
                      options={TIME_SLOTS}
                      selected={profile.preferredTimes}
                      onUpdate={(items) => setProfile({ ...profile, preferredTimes: items })}
                      icon={Clock}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Detailed Schedule / Notes</Label>
                    <Textarea
                      placeholder="Describe when you are usually available (e.g., 'Weekends and evenings only')"
                      value={profile.availability || ''}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => handleSave('logistics', {
                hourlyRate: profile.hourlyRate,
                timezone: profile.timezone,
                city: profile.city,
                country: profile.country,
                linkedinUrl: profile.linkedinUrl,
                websiteUrl: profile.websiteUrl,
                phone: profile.phone,
                availability: profile.availability,
                availableDays: profile.availableDays,
                preferredTimes: profile.preferredTimes
              })} disabled={saving} className="bg-slate-600 hover:bg-slate-700">
                {saving ? 'Saving...' : 'Save Logistics Changes'}
              </Button>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

// Simple Icon wrapper to avoid 'lucide-react' named import issues if any
const AwardIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)