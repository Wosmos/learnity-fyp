'use client';

/**
 * Profile Completion Banner Component
 * Displays profile completion status with gamification elements
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Trophy, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';

interface ProfileCompletionData {
  percentage: number;
  completedSections: any[];
  missingSections: any[];
  nextSteps: string[];
  rewards: any[];
}

interface FeatureUnlock {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredPercentage: number;
  unlocked: boolean;
}

interface ProfileCompletionBannerProps {
  completion: ProfileCompletionData;
  onEnhanceClick?: () => void;
}

export function ProfileCompletionBanner({ completion, onEnhanceClick }: ProfileCompletionBannerProps) {
  const features: FeatureUnlock[] = [
    {
      id: 'basic-features',
      name: 'Basic Features',
      description: 'Access to basic learning features',
      icon: <CheckCircle className="h-5 w-5" />,
      requiredPercentage: 20,
      unlocked: completion.percentage >= 20,
    },
    {
      id: 'study-groups',
      name: 'Study Groups',
      description: 'Join and create study groups',
      icon: <Star className="h-5 w-5" />,
      requiredPercentage: 40,
      unlocked: completion.percentage >= 40,
    },
    {
      id: 'personalized-recommendations',
      name: 'Personalized Recommendations',
      description: 'Get AI-powered learning recommendations',
      icon: <Sparkles className="h-5 w-5" />,
      requiredPercentage: 60,
      unlocked: completion.percentage >= 60,
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Detailed progress tracking and insights',
      icon: <Trophy className="h-5 w-5" />,
      requiredPercentage: 80,
      unlocked: completion.percentage >= 80,
    },
    {
      id: 'premium-features',
      name: 'Premium Features',
      description: 'Access to all premium platform features',
      icon: <Trophy className="h-5 w-5" />,
      requiredPercentage: 100,
      unlocked: completion.percentage >= 100,
    },
  ];

  const unlockedFeatures = features.filter(f => f.unlocked);
  const nextFeature = features.find(f => !f.unlocked);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile Completion
              </h3>
              <p className="text-sm text-gray-600">
                Complete your profile to unlock more features
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {completion.percentage}%
              </div>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={completion.percentage} 
              className="h-4 bg-gray-200"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Started</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Rewards */}
          {completion.rewards && completion.rewards.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {completion.rewards.map((reward: any) => (
                  <Badge
                    key={reward.id}
                    variant={reward.unlocked ? 'default' : 'outline'}
                    className={`${
                      reward.unlocked 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0' 
                        : 'opacity-50'
                    } transition-all`}
                  >
                    <span className="mr-1">{reward.icon}</span>
                    {reward.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Feature Unlocks */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Feature Unlocks
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    feature.unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      feature.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {feature.unlocked ? feature.icon : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm truncate">{feature.name}</h5>
                        {feature.unlocked && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {feature.unlocked ? 'Unlocked!' : `Unlock at ${feature.requiredPercentage}%`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          {completion.nextSteps && completion.nextSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Next Steps</h4>
              <ul className="space-y-1">
                {completion.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Feature Unlock */}
          {nextFeature && (
            <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-gray-900">
                      Next Unlock: {nextFeature.name}
                    </h5>
                    <p className="text-xs text-gray-600">
                      {nextFeature.requiredPercentage - completion.percentage}% away
                    </p>
                  </div>
                </div>
                {onEnhanceClick && (
                  <Button
                    onClick={onEnhanceClick}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Enhance Profile
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completion Message */}
          {completion.percentage === 100 && (
            <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h5 className="font-bold text-green-900">Profile Complete! 🎉</h5>
                  <p className="text-sm text-green-700">
                    You've unlocked all features and achievements!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
