/**
 * Client-Side Authentication Hook
 * Provides authentication state without Firebase Admin SDK imports
 */

'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { UserRole, CustomClaims } from '@/types/auth';

export interface ClientAuthState {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  claims: CustomClaims | null;
}

export function useClientAuth(): ClientAuthState {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claims, setClaims] = useState<CustomClaims | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get the user's custom claims to check role
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const firebaseClaims = idTokenResult.claims;
          
          const customClaims: CustomClaims = {
            role: (firebaseClaims.role as UserRole) || UserRole.STUDENT,
            permissions: (firebaseClaims.permissions as string[]) || [],
            profileComplete: firebaseClaims.profileComplete || false,
            emailVerified: firebaseUser.emailVerified || false,
            profileId: firebaseClaims.profileId as string,
            lastLoginAt: firebaseClaims.lastLoginAt as string
          };
          
          setClaims(customClaims);
          setIsAdmin(customClaims.role === UserRole.ADMIN);
        } catch (error) {
          console.error('Error getting user claims:', error);
          setClaims(null);
          setIsAdmin(false);
        }
      } else {
        setClaims(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    claims
  };
}