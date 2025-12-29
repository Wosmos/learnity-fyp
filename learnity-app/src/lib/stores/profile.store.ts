/**
 * Profile State Management Store
 * Centralized store for user profile data to prevent duplicate API calls
 * This eliminates the repeated /api/auth/profile calls across components
 */

import { create } from 'zustand';

export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  studentProfile?: {
    gradeLevel: string;
    subjects: string[];
    learningGoals: string[];
    interests: string[];
    studyPreferences: string[];
    bio?: string;
    profileCompletionPercentage: number;
  };
  teacherProfile?: {
    bio?: string;
    expertise: string[];
    qualifications: string[];
  };
}

interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  setProfile: (profile: ProfileData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
  
  // Cache helpers
  isCacheValid: () => boolean;
  shouldRefetch: () => boolean;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  
  setProfile: (profile) => {
    set({ 
      profile, 
      lastFetched: Date.now(),
      error: null 
    });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  clearProfile: () => {
    set({ 
      profile: null, 
      lastFetched: null, 
      error: null 
    });
  },
  
  isCacheValid: () => {
    const { lastFetched, profile } = get();
    if (!lastFetched || !profile) return false;
    return Date.now() - lastFetched < CACHE_DURATION;
  },
  
  shouldRefetch: () => {
    const { isLoading, isCacheValid } = get();
    return !isLoading && !isCacheValid();
  },
}));

// Selectors for better performance
export const useProfile = () => useProfileStore((state) => state.profile);
export const useProfileLoading = () => useProfileStore((state) => state.isLoading);
export const useProfileError = () => useProfileStore((state) => state.error);

// Helper to get initials
export const getProfileInitials = (profile: ProfileData | null): string => {
  if (!profile) return 'U';
  const first = profile.firstName?.[0] || '';
  const last = profile.lastName?.[0] || '';
  return (first + last).toUpperCase() || 'U';
};

// Helper to get full name
export const getProfileFullName = (profile: ProfileData | null): string => {
  if (!profile) return 'User';
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';
};
