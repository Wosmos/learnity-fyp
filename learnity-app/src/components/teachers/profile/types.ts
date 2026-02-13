export interface Testimonial {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  subject: string | null;
  date: string;
  isVerified: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SampleLesson {
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
}

export interface SuccessStory {
  studentName: string;
  achievement: string;
  subject: string;
  testimonial: string;
}

export interface TeacherData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  subjects: string[];
  experience: number;
  bio: string;
  hourlyRate: string | null;
  qualifications: string[];
  isTopRated: boolean;
  rating: string;
  reviewCount: number;
  responseTime: string;
  availability: string;
  languages: string[];
  lessonsCompleted: number;
  activeStudents: number;
  teachingStyle: string;
  specialties: string[];
  certifications: string[];
  education: string[];
  availableDays: string[];
  preferredTimes: string[];
  headline: string;
  achievements: string[];
  teachingApproach: string;
  videoIntroUrl?: string | null;
  trustBadges: string[];
  faqs: FAQ[] | null;
  sampleLessons: SampleLesson[] | null;
  successStories: SuccessStory[] | null;
  whyChooseMe: string[];
  bannerImage?: string | null;
  city?: string | null;
  country?: string | null;
  teachingMethods?: string[];
  ageGroups?: string[];
  personalInterests?: string[];
  hobbies?: string[];
  socialLinks?: {
    linkedin?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    website?: string | null;
    youtube?: string | null;
  };
}
