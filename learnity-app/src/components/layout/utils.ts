import { UserRole } from '@/types/auth';
export  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.TEACHER:
        return 'Teacher';
      case UserRole.STUDENT:
        return 'Student';
      case UserRole.PENDING_TEACHER:
        return 'Pending Teacher';
      default:
        return 'User';
    }
  };

export  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.TEACHER:
        return 'bg-green-100 text-green-800';
      case UserRole.STUDENT:
        return 'bg-blue-100 text-blue-800';
      case UserRole.PENDING_TEACHER:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

export  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.TEACHER:
        return '/dashboard/teacher';
      case UserRole.STUDENT:
        return '/dashboard/student';
      case UserRole.PENDING_TEACHER:
        return '/application/status';
      default:
        return '/dashboard';
    }
  };