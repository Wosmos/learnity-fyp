'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Check,
  X,
  Star,
  Award,
  Clock,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UnifiedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profilePicture?: string;
  bio?: string;
  expertise?: string[];
  experience?: number;
  hourlyRate?: string;
  rating?: number;
  totalSessions?: number;
  applicationStatus?: string;
  submittedAt?: string;
  studentData?: {
    gradeLevel: string;
  };
}

interface ColumnActionsProps {
  onViewDetails: (user: UnifiedUser) => void;
  onUserAction: (userId: string, action: string) => void;
  activeRole?: string;
}

export const createUnifiedColumns = ({
  onViewDetails,
  onUserAction,
  activeRole,
}: ColumnActionsProps): ColumnDef<UnifiedUser>[] => [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm'>
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <div className='font-medium text-sm'>
              {user.firstName} {user.lastName}
            </div>
            <div className='text-xs text-muted-foreground truncate flex items-center gap-1'>
              <Mail className='h-3 w-3' />
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const user = row.original;

      switch (role) {
        case 'ADMIN':
          return (
            <Badge className='bg-red-100 text-red-800 border-red-200'>
              <Shield className='h-3 w-3 mr-1' />
              Admin
            </Badge>
          );
        case 'TEACHER':
          return (
            <Badge className='bg-green-100 text-green-800 border-green-200'>
              <Award className='h-3 w-3 mr-1' />
              Teacher
            </Badge>
          );
        case 'PENDING_TEACHER':
          return (
            <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
              <Clock className='h-3 w-3 mr-1' />
              Pending
            </Badge>
          );
        case 'STUDENT':
          return (
            <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
              <GraduationCap className='h-3 w-3 mr-1' />
              Student{' '}
              {user.studentData?.gradeLevel &&
                `(${user.studentData.gradeLevel})`}
            </Badge>
          );
        default:
          return <Badge variant='outline'>{role}</Badge>;
      }
    },
  },
  // Role-specific column for Teachers
  ...(activeRole === 'teacher' || activeRole === 'pending_teacher'
    ? [
        {
          accessorKey: 'stats',
          header: 'Rate & Rating',
          cell: ({ row }: { row: any }) => {
            const user = row.original;
            return (
              <div className='flex flex-col gap-1'>
                {user.hourlyRate && (
                  <span className='text-xs font-medium text-slate-700'>
                    ${user.hourlyRate}/hr
                  </span>
                )}
                {user.rating !== undefined && (
                  <div className='flex items-center gap-1'>
                    <Star className='h-3 w-3 text-yellow-500 fill-current' />
                    <span className='text-xs text-slate-600'>
                      {user.rating}
                    </span>
                  </div>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: 'experience',
          header: 'Experience',
          cell: ({ row }: { row: any }) => (
            <span className='text-xs text-slate-600'>
              {row.original.experience || 0} years
            </span>
          ),
        },
      ]
    : []),

  // Role-specific column for Students
  ...(activeRole === 'student'
    ? [
        {
          accessorKey: 'gradeLevel',
          header: 'Grade',
          cell: ({ row }: { row: any }) => (
            <Badge variant='outline' className='text-blue-700 bg-blue-50'>
              {row.original.studentData?.gradeLevel || 'N/A'}
            </Badge>
          ),
        },
      ]
    : []),

  // Default Stats column when viewing All
  ...(activeRole === 'all' || !activeRole
    ? [
        {
          accessorKey: 'stats',
          header: 'Stats',
          cell: ({ row }: { row: any }) => {
            const user = row.original;
            if (user.role.includes('TEACHER')) {
              return (
                <span className='text-xs font-medium'>
                  ${user.hourlyRate}/hr • {user.rating} ★
                </span>
              );
            }
            if (user.role === 'STUDENT') {
              return (
                <span className='text-xs text-muted-foreground uppercase tracking-wider font-semibold'>
                  {user.studentData?.gradeLevel || 'Student'}
                </span>
              );
            }
            return null;
          },
        },
      ]
    : []),
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-8 px-2'
      >
        Joined
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className='text-sm flex items-center gap-1'>
          <Calendar className='h-3 w-3 text-gray-400' />
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            {user.role.includes('TEACHER') && (
              <DropdownMenuItem asChild>
                <Link href={`/teachers/${user.id}`}>
                  <UserIcon className='mr-2 h-4 w-4' />
                  View Public Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {user.role === 'PENDING_TEACHER' && (
              <>
                <DropdownMenuItem
                  onClick={() => onUserAction(user.id, 'approve')}
                  className='text-green-600'
                >
                  <Check className='mr-2 h-4 w-4' />
                  Approve Teacher
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUserAction(user.id, 'reject')}
                  className='text-red-600'
                >
                  <X className='mr-2 h-4 w-4' />
                  Reject Application
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() =>
                onUserAction(user.id, user.isActive ? 'deactivate' : 'activate')
              }
              className={user.isActive ? 'text-red-600' : 'text-green-600'}
            >
              {user.isActive ? (
                <X className='mr-2 h-4 w-4' />
              ) : (
                <Check className='mr-2 h-4 w-4' />
              )}
              {user.isActive ? 'Suspend User' : 'Activate User'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
