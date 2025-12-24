'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Zap } from 'lucide-react';

interface LearningGoalsSectionProps {
  learningGoals: string[];
  onEnhanceProfile: () => void;
}

export function LearningGoalsSection({ learningGoals, onEnhanceProfile }: LearningGoalsSectionProps) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-orange-500" />
        Learning Goals
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {learningGoals.slice(0, 4).map((goal, idx) => (
          <div key={idx} className="flex items-start space-x-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <span className="text-gray-700">{goal}</span>
          </div>
        ))}
      </div>
      {learningGoals.length > 4 && (
        <Button variant="link" className="mt-2 p-0 h-auto" onClick={onEnhanceProfile}>
          View all {learningGoals.length} goals →
        </Button>
      )}
    </div>
  );
}