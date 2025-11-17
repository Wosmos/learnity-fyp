'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, MoreHorizontal, UserCheck, UserX, Trash2 } from 'lucide-react';
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

import {
  Shield,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  Check,
  X,
} from 'lucide-react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PENDING_TEACHER' | 'REJECTED_TEACHER';
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  profilePicture?: string;
}

interface ColumnActionsProps {
  onViewDetails: (user: User) => void;
  onUserAction: (userId: string, action: string) => void;
}

export const createColumns = ({ onViewDetails, onUserAction }: ColumnActionsProps): ColumnDef<User>[] => [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-sm">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const getRoleIcon = (role: string) => {
        switch (role) {
          case 'ADMIN': return Shield;
          case 'TEACHER': return GraduationCap;
          case 'STUDENT': return BookOpen;
          case 'PENDING_TEACHER': return GraduationCap;
          case 'REJECTED_TEACHER': return GraduationCap;
          default: return Shield;
        }
      };

      const getRoleBadgeColor = (role: string) => {
        switch (role) {
          case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
          case 'TEACHER': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200';
          case 'PENDING_TEACHER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'REJECTED_TEACHER': return 'bg-gray-100 text-gray-800 border-gray-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      };

      const RoleIcon = getRoleIcon(role);

      return (
        <Badge className={getRoleBadgeColor(role)}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col gap-1">
          {user.isActive ? (
            <Badge variant="outline" className="text-green-600 border-green-200 w-fit">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-200 w-fit">
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
          {!user.emailVerified && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 w-fit text-xs">
              Unverified
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm">
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    cell: ({ row }) => {
      const lastLogin = row.getValue('lastLoginAt') as string;
      if (!lastLogin) {
        return <span className="text-xs text-muted-foreground">Never</span>;
      }
      
      const date = new Date(lastLogin);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return <span className="text-xs text-green-600">Today</span>;
      } else if (diffInHours < 168) {
        return <span className="text-xs text-blue-600">This week</span>;
      } else {
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        );
      }
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(user)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.role === 'PENDING_TEACHER' && (
              <>
                <DropdownMenuItem 
                  onClick={() => onUserAction(user.id, 'approve-teacher')}
                  className="text-green-600"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Teacher
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onUserAction(user.id, 'reject-teacher')}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject Teacher
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {user.isActive ? (
              <DropdownMenuItem 
                onClick={() => onUserAction(user.id, 'deactivate')}
                className="text-orange-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onUserAction(user.id, 'activate')}
                className="text-green-600"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onUserAction(user.id, 'delete')}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];