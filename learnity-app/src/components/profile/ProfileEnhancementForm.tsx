'use client';

/**
 * Profile Enhancement Form Component
 * Comprehensive form for students to customize their profile
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Target,
  Heart,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  X,
  FileText,
} from 'lucide-react';

// Validation schema
const profileEnhancementSchema = z.object({
  learningGoals: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  studyPreferences: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  gradeLevel: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

type ProfileEnhancementData = z.infer<typeof profileEnhancementSchema>;

interface ProfileEnhancementFormProps {
  initialData?: Partial<ProfileEnhancementData>;
  onSuccess?: () => void;
}

export function ProfileEnhancementForm({ initialData, onSuccess }: ProfileEnhancementFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState<any>(null);

  // Form state
  const [learningGoals, setLearningGoals] = useState<string[]>(initialData?.learningGoals || []);
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [studyPreferences, setStudyPreferences] = useState<string[]>(initialData?.studyPreferences || []);
  const [subjects, setSubjects] = useState<string[]>(initialData?.subjects || []);
  const [bio, setBio] = useState<string>(initialData?.bio || '');

  // Input states for adding new items
  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Predefined options
  const subjectOptions = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
    'Music', 'Physical Education', 'Languages', 'Business', 'Psychology',
  ];

  const studyPreferenceOptions = [
    'Visual Learning', 'Auditory Learning', 'Hands-on Practice',
    'Group Study', 'Solo Study', 'Morning Study', 'Evening Study',
    'Short Sessions', 'Long Sessions', 'Interactive Content',
  ];

  // Fetch completion data on mount
  useEffect(() => {
    fetchCompletionData();
  }, []);

  const fetchCompletionData = async () => {
    try {
      const response = await fetch('/api/profile/enhance');
      if (response.ok) {
        const data = await response.json();
        setCompletion(data.completion);
      }
    } catch (error) {
      console.error('Failed to fetch completion data:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile/enhance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningGoals,
          interests,
          studyPreferences,
          subjects,
          bio: bio.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setCompletion(data.completion);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been enhanced successfully!',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addLearningGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeLearningGoal = (goal: string) => {
    setLearningGoals(learningGoals.filter(g => g !== goal));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const toggleSubject = (subject: string) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const toggleStudyPreference = (preference: string) => {
    if (studyPreferences.includes(preference)) {
      setStudyPreferences(studyPreferences.filter(p => p !== preference));
    } else {
      setStudyPreferences([...studyPreferences, preference]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Progress */}
      {completion && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Profile Completion
                </CardTitle>
                <CardDescription>
                  {completion.percentage}% complete
                </CardDescription>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {completion.percentage}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completion.percentage} className="h-3 mb-4" />
            
            {/* Rewards */}
            {completion.rewards && completion.rewards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {completion.rewards.map((reward: any) => (
                  <Badge
                    key={reward.id}
                    variant={reward.unlocked ? 'default' : 'outline'}
                    className={reward.unlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : ''}
                  >
                    <span className="mr-1">{reward.icon}</span>
                    {reward.title}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Learning Goals
          </CardTitle>
          <CardDescription>
            What do you want to achieve in your learning journey?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a learning goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLearningGoal()}
            />
            <Button onClick={addLearningGoal} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {learningGoals.map((goal) => (
              <Badge key={goal} variant="secondary" className="gap-1">
                {goal}
                <button
                  onClick={() => removeLearningGoal(goal)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Subject Interests
          </CardTitle>
          <CardDescription>
            Select the subjects you're interested in learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((subject) => (
              <Badge
                key={subject}
                variant={subjects.includes(subject) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => toggleSubject(subject)}
              >
                {subjects.includes(subject) && <CheckCircle className="h-3 w-3 mr-1" />}
                {subject}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Personal Interests
          </CardTitle>
          <CardDescription>
            Share your hobbies and interests outside of academics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInterest()}
            />
            <Button onClick={addInterest} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="gap-1">
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Study Preferences
          </CardTitle>
          <CardDescription>
            How do you prefer to learn and study?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {studyPreferenceOptions.map((preference) => (
              <Badge
                key={preference}
                variant={studyPreferences.includes(preference) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => toggleStudyPreference(preference)}
              >
                {studyPreferences.includes(preference) && <CheckCircle className="h-3 w-3 mr-1" />}
                {preference}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Personal Bio
          </CardTitle>
          <CardDescription>
            Tell us about yourself (max 500 characters)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            placeholder="Share a bit about yourself, your learning journey, goals, or anything you'd like others to know..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">
              {bio.length}/500 characters
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
