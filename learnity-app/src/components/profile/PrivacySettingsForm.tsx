'use client';

/**
 * Privacy Settings Form Component
 * Allows students to control their profile visibility and privacy
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Eye, EyeOff, Mail, Target, Heart, TrendingUp, MessageSquare } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showEmail: boolean;
  showLearningGoals: boolean;
  showInterests: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}

interface PrivacySettingsFormProps {
  onSuccess?: () => void;
}

export function PrivacySettingsForm({ onSuccess }: PrivacySettingsFormProps) {
  const { toast } = useToast();
  const { loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showLearningGoals: true,
    showInterests: true,
    showProgress: true,
    allowMessages: true,
  });

  const fetchPrivacySettings = useCallback(async () => {
    if (authLoading) return; // Don't fetch if auth is still loading

    try {
      const data = await api.get('/api/profile/privacy');
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error);
    }
  }, [api, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchPrivacySettings();
    }
  }, [fetchPrivacySettings, authLoading]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile/privacy', settings);

      toast({
        title: 'Privacy Settings Updated',
        description: 'Your privacy preferences have been saved successfully!',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update privacy settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof PrivacySettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Who can view your profile?</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(value: any) =>
                setSettings({ ...settings, profileVisibility: value })
              }
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-gray-500">Anyone can view your profile</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="FRIENDS">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Friends Only</div>
                      <div className="text-xs text-gray-500">Only your friends can view</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="PRIVATE">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-gray-500">Only you can view your profile</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Information Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            Information Visibility
          </CardTitle>
          <CardDescription>
            Choose what information to display on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show Email */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSetting('showEmail')}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">Show Email Address</div>
                <div className="text-sm text-gray-500">Display your email on your profile</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.showEmail ? 'bg-slate-600' : 'bg-gray-300'
              } relative`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showEmail ? 'transform translate-x-6' : ''
                }`} />
            </div>
          </div>

          {/* Show Learning Goals */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSetting('showLearningGoals')}
          >
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">Show Learning Goals</div>
                <div className="text-sm text-gray-500">Display your learning objectives</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.showLearningGoals ? 'bg-slate-600' : 'bg-gray-300'
              } relative`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showLearningGoals ? 'transform translate-x-6' : ''
                }`} />
            </div>
          </div>

          {/* Show Interests */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSetting('showInterests')}
          >
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">Show Personal Interests</div>
                <div className="text-sm text-gray-500">Display your hobbies and interests</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.showInterests ? 'bg-slate-600' : 'bg-gray-300'
              } relative`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showInterests ? 'transform translate-x-6' : ''
                }`} />
            </div>
          </div>

          {/* Show Progress */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSetting('showProgress')}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">Show Learning Progress</div>
                <div className="text-sm text-gray-500">Display your achievements and progress</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.showProgress ? 'bg-slate-600' : 'bg-gray-300'
              } relative`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showProgress ? 'transform translate-x-6' : ''
                }`} />
            </div>
          </div>

          {/* Allow Messages */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSetting('allowMessages')}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">Allow Messages</div>
                <div className="text-sm text-gray-500">Let others send you messages</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${settings.allowMessages ? 'bg-slate-600' : 'bg-gray-300'
              } relative`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.allowMessages ? 'transform translate-x-6' : ''
                }`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <LoadingButton
          onClick={handleSubmit}
          isLoading={loading}
          loadingText="Saving Privacy Settings..."
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600"
        >
          Save Privacy Settings
        </LoadingButton>
      </div>
    </div>
  );
}
