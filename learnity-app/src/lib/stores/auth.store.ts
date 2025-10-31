/**
 * Authentication State Management Store
 * Zustand store for managing authentication state across the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  UserRole, 
  CustomClaims, 
  UserProfile, 
  AuthError,
  AuthErrorCode 
} from '@/types/auth';

export interface AuthState {
  // Core authentication state
  user: FirebaseUser | null;
  claims: CustomClaims | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  
  // Registration state
  registrationStep: 'role-selection' | 'form' | 'verification' | 'complete';
  selectedRole: UserRole | null;
  
  // Session state
  sessionExpiry: Date | null;
  lastActivity: Date | null;
}

export interface AuthActions {
  // Authentication actions
  setUser: (user: FirebaseUser | null) => void;
  setClaims: (claims: CustomClaims | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AuthError | null) => void;
  
  // Registration actions
  setRegistrationStep: (step: AuthState['registrationStep']) => void;
  setSelectedRole: (role: UserRole | null) => void;
  
  // Session actions
  updateLastActivity: () => void;
  setSessionExpiry: (expiry: Date | null) => void;
  
  // Utility actions
  clearAuth: () => void;
  reset: () => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  claims: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  registrationStep: 'role-selection',
  selectedRole: null,
  sessionExpiry: null,
  lastActivity: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Authentication actions
      setUser: (user) => {
        set((state) => ({
          user,
          isAuthenticated: !!user,
          lastActivity: user ? new Date() : null,
        }));
      },
      
      setClaims: (claims) => {
        set({ claims });
      },
      
      setProfile: (profile) => {
        set({ profile });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      // Registration actions
      setRegistrationStep: (registrationStep) => {
        set({ registrationStep });
      },
      
      setSelectedRole: (selectedRole) => {
        set({ selectedRole });
      },
      
      // Session actions
      updateLastActivity: () => {
        set({ lastActivity: new Date() });
      },
      
      setSessionExpiry: (sessionExpiry) => {
        set({ sessionExpiry });
      },
      
      // Utility actions
      clearAuth: () => {
        set({
          user: null,
          claims: null,
          profile: null,
          isAuthenticated: false,
          error: null,
          sessionExpiry: null,
          lastActivity: null,
        });
      },
      
      reset: () => {
        set(initialState);
      },
      
      // Permission helpers
      hasPermission: (permission) => {
        const { claims } = get();
        return claims?.permissions?.includes(permission as any) || false;
      },
      
      hasRole: (role) => {
        const { claims } = get();
        return claims?.role === role;
      },
      
      hasAnyRole: (roles) => {
        const { claims } = get();
        return roles.includes(claims?.role as UserRole);
      },
    }),
    {
      name: 'learnity-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        registrationStep: state.registrationStep,
        selectedRole: state.selectedRole,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Selectors for better performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthClaims = () => useAuthStore((state) => state.claims);
export const useAuthProfile = () => useAuthStore((state) => state.profile);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useRegistrationStep = () => useAuthStore((state) => state.registrationStep);
export const useSelectedRole = () => useAuthStore((state) => state.selectedRole);

// Permission selectors
export const useHasPermission = (permission: string) => 
  useAuthStore((state) => state.hasPermission(permission));
export const useHasRole = (role: UserRole) => 
  useAuthStore((state) => state.hasRole(role));
export const useHasAnyRole = (roles: UserRole[]) => 
  useAuthStore((state) => state.hasAnyRole(roles));

// Role-specific selectors
export const useIsAdmin = () => useHasRole(UserRole.ADMIN);
export const useIsTeacher = () => useHasRole(UserRole.TEACHER);
export const useIsStudent = () => useHasRole(UserRole.STUDENT);
export const useIsPendingTeacher = () => useHasRole(UserRole.PENDING_TEACHER);