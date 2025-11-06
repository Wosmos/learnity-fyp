/**
 * Tests for useAuthRedirect hook
 */

import { renderHook } from '@testing-library/react';
import { useAuthRedirect } from '../useAuthRedirect';
import { UserRole } from '@/types/auth';

// Mock the dependencies
jest.mock('../useClientAuth', () => ({
  useClientAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  })),
  useSearchParams: jest.fn(() => new URLSearchParams())
}));

jest.mock('@/lib/utils/auth-redirect.utils', () => ({
  getPostAuthRedirect: jest.fn(),
  getRedirectFromUrl: jest.fn(),
  hasRouteAccess: jest.fn(),
  requiresAuthentication: jest.fn()
}));

describe('useAuthRedirect', () => {
  const mockUseClientAuth = require('../useClientAuth').useClientAuth;
  const mockUseRouter = require('next/navigation').useRouter;
  const mockUtils = require('@/lib/utils/auth-redirect.utils');

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: jest.fn()
    });
  });

  it('should return loading state when authentication is loading', () => {
    mockUseClientAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      claims: null
    });

    const { result } = renderHook(() => useAuthRedirect());

    expect(result.current.isRedirecting).toBe(true);
    expect(result.current.shouldShowContent).toBe(false);
  });

  it('should show content for unauthenticated users', () => {
    mockUseClientAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      claims: null
    });

    mockUtils.requiresAuthentication.mockReturnValue(false);

    const { result } = renderHook(() => useAuthRedirect());

    expect(result.current.isRedirecting).toBe(false);
    expect(result.current.shouldShowContent).toBe(true);
  });

  it('should calculate redirect path for authenticated users', () => {
    const mockUser = { uid: 'test-uid' };
    const mockClaims = { role: UserRole.STUDENT, profileComplete: true };

    mockUseClientAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      claims: mockClaims
    });

    mockUtils.getPostAuthRedirect.mockReturnValue('/dashboard/student');

    const { result } = renderHook(() => useAuthRedirect());

    expect(mockUtils.getPostAuthRedirect).toHaveBeenCalledWith({
      role: UserRole.STUDENT,
      claims: mockClaims,
      defaultRoute: '/dashboard'
    });
  });
});