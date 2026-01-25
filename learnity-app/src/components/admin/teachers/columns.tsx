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
} from 'lucide-react';
import { Clock, Mail, Calendar } from 'lucide-react';
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

export interface Teacher {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  role: 'PENDING_TEACHER' | 'TEACHER' | 'REJECTED_TEACHER';
  profilePicture?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  lastLoginAt?: string;
  bio?: string;
  expertise?: string[];
  experience?: number;
  education?: string;
  certifications?: string[];
  hourlyRate?: number;
  availability?: string;
  rating?: number;
  totalSessions?: number;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  applicationDate?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface ColumnActionsProps {
  onViewDetails: (teacher: Teacher) => void;
  onTeacherAction: (teacherId: string, action: string) => void;
}

export const createTeacherColumns = ({
  onViewDetails,
  onTeacherAction,
}: ColumnActionsProps): ColumnDef<Teacher>[] => [
  {
    accessorKey: 'teacher',
    header: 'Teacher',
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={teacher.profilePicture} />
            <AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm'>
              {teacher.firstName?.charAt(0)}
              {teacher.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <div className='font-medium text-sm'>
              {teacher.firstName} {teacher.lastName}
            </div>
            <div className='text-xs text-muted-foreground truncate flex items-center gap-1'>
              <Mail className='h-3 w-3' />
              {teacher.email}
            </div>
            {teacher.rating && (
              <div className='flex items-center gap-1 mt-1'>
                <Star className='h-3 w-3 text-yellow-500 fill-current' />
                <span className='text-xs text-gray-600'>{teacher.rating}</span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'expertise',
    header: 'Expertise',
    cell: ({ row }) => {
      const expertise = row.getValue('expertise') as string[];
      if (!expertise || expertise.length === 0) {
        return (
          <span className='text-xs text-muted-foreground'>Not specified</span>
        );
      }

      return (
        <div className='flex flex-wrap gap-1 max-w-[200px]'>
          {expertise.slice(0, 2).map((skill, index) => (
            <Badge key={index} variant='outline' className='text-xs'>
              {skill}
            </Badge>
          ))}
          {expertise.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{expertise.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'experience',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Experience
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const experience = row.getValue('experience') as number;
      if (!experience) {
        return (
          <span className='text-xs text-muted-foreground'>Not specified</span>
        );
      }

      return (
        <div className='flex items-center gap-1'>
          <Award className='h-3 w-3 text-blue-500' />
          <span className='text-sm'>{experience} years</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'hourlyRate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Rate
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rate = row.getValue('hourlyRate') as number;
      if (!rate) {
        return <span className='text-xs text-muted-foreground'>Not set</span>;
      }

      return <span className='text-sm font-medium'>${rate}/hr</span>;
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as string;

      switch (role) {
        case 'PENDING_TEACHER':
          return (
            <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
              <Clock className='h-3 w-3 mr-1' />
              Pending
            </Badge>
          );
        case 'TEACHER':
          return (
            <Badge className='bg-green-100 text-green-800 border-green-200'>
              <Check className='h-3 w-3 mr-1' />
              Approved
            </Badge>
          );
        case 'REJECTED_TEACHER':
          return (
            <Badge className='bg-red-100 text-red-800 border-red-200'>
              <X className='h-3 w-3 mr-1' />
              Rejected
            </Badge>
          );
        default:
          return <Badge variant='outline'>Unknown</Badge>;
      }
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 px-2'
        >
          Applied
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
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
      const teacher = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(teacher.id)}
            >
              Copy teacher ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(teacher)}>
              <Eye className='mr-2 h-4 w-4' />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {teacher.role === 'PENDING_TEACHER' && (
              <>
                <DropdownMenuItem
                  onClick={() => onTeacherAction(teacher.id, 'approve')}
                  className='text-green-600'
                >
                  <Check className='mr-2 h-4 w-4' />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onTeacherAction(teacher.id, 'reject')}
                  className='text-red-600'
                >
                  <X className='mr-2 h-4 w-4' />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
