'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Globe,
  Edit,
  Trash2,
  UserX,
  UserCheck,
} from 'lucide-react';

interface UserDetailDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAction?: (userId: string, action: string) => void;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
  onUserAction,
}: UserDetailDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'TEACHER': return GraduationCap;
      case 'STUDENT': return BookOpen;
      default: return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'TEACHER': return 'bg-slate-100 text-blue-800 border-blue-200';
      case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = async (action: string) => {
    if (!onUserAction) return;

    setLoading(true);
    try {
      await onUserAction(user.id, action);
      if (action === 'delete') {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleBadgeColor(user.role)}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
                {user.emailVerified ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                {user.isActive ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed information and management options for this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium font-mono text-xs">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {user.lastLoginAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          {(user.phone || user.location || user.bio) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Profile Information</h3>
                <div className="space-y-3">
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{user.location}</p>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Bio</p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Role-specific Information */}
          {user.role === 'TEACHER' && user.teacherProfile && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Teacher Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.teacherProfile.subjects && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-blue-600 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {user.teacherProfile.subjects.map((subject: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.teacherProfile.hourlyRate && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Hourly Rate</p>
                      <p className="font-semibold text-green-700">
                        ${user.teacherProfile.hourlyRate}/hour
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {user.role === 'PENDING_TEACHER' && (
                <>
                  <Button
                    onClick={() => handleAction('approve-teacher')}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Teacher
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction('reject-teacher')}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Teacher
                  </Button>
                </>
              )}

              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>

              {user.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('deactivate')}
                  disabled={loading}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('activate')}
                  disabled={loading}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('reset-password')}
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Reset Password
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction('delete')}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}