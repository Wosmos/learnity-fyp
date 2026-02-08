import { BookOpen, Brain, Flame, Star, Target } from "lucide-react";

export const questTypeIcons: Record<string, React.ReactNode> = {
  LESSON_COMPLETION: <BookOpen className='h-4 w-4' />,
  QUIZ_COMPLETION: <Brain className='h-4 w-4' />,
  COURSE_ENROLLMENT: <Target className='h-4 w-4' />,
  LOGIN_STREAK: <Flame className='h-4 w-4' />,
  REVIEW_SUBMISSION: <Star className='h-4 w-4' />,
};

export const frequencyColors: Record<string, string> = {
  DAILY: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  WEEKLY: 'bg-blue-50 text-blue-600 border-blue-200',
  MONTHLY: 'bg-purple-50 text-purple-600 border-purple-200',
  ONE_TIME: 'bg-amber-50 text-amber-600 border-amber-200',
};

export const frequencyLabels: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  ONE_TIME: 'One-Time',
};