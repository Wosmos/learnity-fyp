/**
 * Route Protection Tests
 * Tests for verifying dashboard route protection and role-based access control
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { UserRole } from '@/types/auth';
import { ClientStudentProtection } from '../ClientStudentProtection';
import { ClientTeacherProtection } from '../ClientTeacherProtection';
import { ClientAdminProtection } from '../ClientAdminProtection';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase config
jest.mock('@/lib/config/firebase', () => ({
  auth: {},
}));

// Mock audit logger
jest.mock('@/lib/services/audit-logger.service', () => ({
  auditLogger: {
    logDashboardAccess: jest.fn(),
    logUnauthorizedAccess: jest.fn(),
  },
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  getIdTokenResult: jest.fn(),
};

describe('Route Protection Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Student Dashboard Protection', () => {
    it('should allow access for students', async () => {
      // Mock student user
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.STUDENT },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn(); // unsubscribe function
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByTestId('student-content')).toBeInTheDocument();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should redirect teachers to teacher dashboard', async () => {
      // Mock teacher user
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      // Wait for redirect timeout
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/teacher');
      }, { timeout: 3000 });
    });

    it('should redirect admins to admin panel', async () => {
      // Mock admin user
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.ADMIN },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      }, { timeout: 3000 });
    });

    it('should redirect pending teachers to application status', async () => {
      // Mock pending teacher user
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.PENDING_TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/application/status');
      }, { timeout: 3000 });
    });

    it('should redirect unauthenticated users to login', async () => {
      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(null); // No user
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login?redirect=/dashboard/student');
      }, { timeout: 3000 });
    });
  });

  describe('Teacher Dashboard Protection', () => {
    it('should allow access for teachers', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientTeacherProtection>
          <div data-testid="teacher-content">Teacher Dashboard</div>
        </ClientTeacherProtection>
      );

      await waitFor(() => {
        expect(screen.getByTestId('teacher-content')).toBeInTheDocument();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should allow access for admins', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.ADMIN },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientTeacherProtection>
          <div data-testid="teacher-content">Teacher Dashboard</div>
        </ClientTeacherProtection>
      );

      await waitFor(() => {
        expect(screen.getByTestId('teacher-content')).toBeInTheDocument();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should redirect students to student dashboard', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.STUDENT },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientTeacherProtection>
          <div data-testid="teacher-content">Teacher Dashboard</div>
        </ClientTeacherProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/student');
      }, { timeout: 3000 });
    });

    it('should redirect pending teachers to application status', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.PENDING_TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientTeacherProtection>
          <div data-testid="teacher-content">Teacher Dashboard</div>
        </ClientTeacherProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/application/status');
      }, { timeout: 3000 });
    });
  });

  describe('Admin Panel Protection', () => {
    it('should allow access for admins only', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.ADMIN },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientAdminProtection>
          <div data-testid="admin-content">Admin Panel</div>
        </ClientAdminProtection>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should deny access to students', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.STUDENT },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientAdminProtection>
          <div data-testid="admin-content">Admin Panel</div>
        </ClientAdminProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      }, { timeout: 3000 });
    });

    it('should deny access to teachers', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientAdminProtection>
          <div data-testid="admin-content">Admin Panel</div>
        </ClientAdminProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      }, { timeout: 3000 });
    });

    it('should deny access to pending teachers', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: { role: UserRole.PENDING_TEACHER },
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientAdminProtection>
          <div data-testid="admin-content">Admin Panel</div>
        </ClientAdminProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle token verification errors gracefully', async () => {
      mockUser.getIdTokenResult.mockRejectedValue(new Error('Token verification failed'));

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      }, { timeout: 3000 });
    });

    it('should handle missing role claims', async () => {
      mockUser.getIdTokenResult.mockResolvedValue({
        claims: {}, // No role claim
      });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      render(
        <ClientStudentProtection>
          <div data-testid="student-content">Student Dashboard</div>
        </ClientStudentProtection>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      }, { timeout: 3000 });
    });
  });
});