'use client';

import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface ProfileTagsSectionProps {
  interests: string[];
  studyPreferences: string[];
  learningGoals: string[];
  onEnhanceProfile: () => void;
}

export function ProfileTagsSection({
  interests,
  studyPreferences,
  learningGoals,
  onEnhanceProfile
}: ProfileTagsSectionProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interests */}
        {interests.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Interests
            </h4>
            <div className="flex flex-wrap gap-2">
              {interests.slice(0, 5).map((interest, idx) => (
                <Badge key={idx} variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                  {interest}
                </Badge>
              ))}
              {interests.length > 5 && (
                <Badge variant="outline">+{interests.length - 5} more</Badge>
              )}
            </div>
          </div>
        )}

        {/* Study Preferences */}
        {studyPreferences.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-500" />
              Study Preferences
            </h4>
            <div className="flex flex-wrap gap-2">
              {studyPreferences.slice(0, 4).map((pref, idx) => (
                <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {pref}
                </Badge>
              ))}
              {studyPreferences.length > 4 && (
                <Badge variant="outline">+{studyPreferences.length - 4} more</Badge>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}