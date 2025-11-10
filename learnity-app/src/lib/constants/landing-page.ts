/**
 * Landing Page Constants
 * Centralized data for landing page sections
 */

import {
  GraduationCap,
  BookOpen,
  Users,
  Star,
  Shield,
  Zap,
  Award,
  CheckCircle,
  BarChart3,
  Globe,
  Clock,
  Target,
  type LucideIcon,
} from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  bgColor: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  color: string;
}

export interface TrustIndicator {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export interface Stat {
  value: string;
  label: string;
}

// Hero Stats
export const HERO_STATS: Stat[] = [
  { value: '1,000+', label: 'Active learners' },
  { value: '500+', label: 'Expert tutors' },
  { value: '4.9', label: 'Average rating' },
];

// How It Works Steps
export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    number: 1,
    title: 'Find your tutor',
    description:
      'Browse through 500+ verified expert tutors. Filter by subject, availability, and price to find your perfect match.',
    color: 'blue',
  },
  {
    number: 2,
    title: 'Start learning',
    description:
      'Book your first lesson and begin your personalized learning journey. Flexible scheduling that fits your lifestyle.',
    color: 'purple',
  },
  {
    number: 3,
    title: 'Make progress',
    description:
      'Track your improvement with detailed analytics and achieve your learning goals faster with expert guidance.',
    color: 'green',
  },
];

// Main Features
export const MAIN_FEATURES: Feature[] = [
  {
    icon: GraduationCap,
    title: 'For Students',
    description: 'Access personalized tutoring and track your progress',
    benefits: [
      'One-on-one tutoring sessions',
      'Interactive study groups',
      'Progress tracking & analytics',
      'Mobile-optimized learning',
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: BookOpen,
    title: 'For Teachers',
    description: 'Share your expertise and grow your business',
    benefits: [
      'Flexible scheduling system',
      'Student progress monitoring',
      'Content creation tools',
      'Verified teacher profiles',
    ],
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join a vibrant learning community',
    benefits: [
      'Peer-to-peer learning',
      'Discussion forums',
      'Study group matching',
      'Achievement system',
    ],
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

// Trust Indicators
export const TRUST_INDICATORS: TrustIndicator[] = [
  {
    icon: Star,
    title: 'Verified Tutors',
    description: 'All tutors are verified with background checks and credential validation',
    gradient: 'from-yellow-400 to-yellow-500',
  },
  {
    icon: Shield,
    title: 'Advanced Security',
    description: 'Multi-factor authentication, encryption, and real-time threat monitoring',
    gradient: 'from-green-500 to-green-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance with 99.9% uptime and global CDN delivery',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Audit Logging',
    description: 'Comprehensive audit trails with real-time monitoring and analytics',
    gradient: 'from-purple-500 to-purple-600',
  },
];

// Guarantee Features
export const GUARANTEE_FEATURES = [
  {
    icon: Star,
    title: 'Verified Tutors',
    description: 'All tutors are verified with background checks',
    color: 'text-yellow-500',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Enterprise-grade security for all your data',
    color: 'text-blue-600',
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description: '4.9 average rating from thousands of students',
    color: 'text-purple-600',
  },
];

// Popular Subjects
export const POPULAR_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Computer Science',
  'Languages',
  'Business',
  'Art',
  'Music',
  'Psychology',
  'Physics',
  'Chemistry',
];

// Why Choose Us
export const WHY_CHOOSE_US = [
  {
    icon: Target,
    title: 'Personalized Learning',
    description: 'Tailored lessons that adapt to your learning style and pace',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Learn at your own pace with 24/7 access to resources',
  },
  {
    icon: Globe,
    title: 'Learn Anywhere',
    description: 'Access from any device, anywhere in the world',
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: '95% of students see improvement within 3 months',
  },
];
