'use client';

import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Check,
  X,
  MapPin,
  Phone,
  GraduationCap,
  Award,
  Star,
  BookOpen,
  DollarSign,
  FileText,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { Teacher } from './columns';

interface TeacherDetailDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherAction?: (teacherId: string, action: string) => void;
}

export function TeacherDetailDialog({
  teacher,
  open,
  onOpenChange,
  onTeacherAction,
}: TeacherDetailDialogProps) {
  const [loading, setLoading] = useState(false);

  const highlightCards = useMemo(() => {
    if (!teacher) return [];

    const cards: { icon: LucideIcon; label: string; value: string; accent: string }[] = [];
    const addCard = (condition: boolean, card: { icon: LucideIcon; label: string; value: string; accent: string }) => {
      if (condition) cards.push(card);
    };

    addCard(
      teacher.experience !== undefined && teacher.experience !== null,
      {
        icon: Award,
        label: 'Experience',
        value: `${teacher.experience} yrs`,
        accent: 'from-blue-50 to-blue-100 text-blue-700 border-blue-100'
      }
    );

    addCard(
      teacher.hourlyRate !== undefined && teacher.hourlyRate !== null,
      {
        icon: DollarSign,
        label: 'Hourly Rate',
        value: `$${teacher.hourlyRate}/hr`,
        accent: 'from-green-50 to-green-100 text-green-700 border-green-100'
      }
    );

    addCard(
      teacher.totalSessions !== undefined && teacher.totalSessions !== null,
      {
        icon: BookOpen,
        label: 'Sessions',
        value: `${teacher.totalSessions}`,
        accent: 'from-purple-50 to-purple-100 text-purple-700 border-purple-100'
      }
    );

    addCard(
      teacher.rating !== undefined && teacher.rating !== null,
      {
        icon: Star,
        label: 'Rating',
        value: `${teacher.rating}/5`,
        accent: 'from-amber-50 to-amber-100 text-amber-700 border-amber-100'
      }
    );

    return cards;
  }, [teacher]);

  if (!teacher) return null;

  const formatDate = (value?: string | null, config: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleDateString('en-US', config);
  };

  const applicationStatus = teacher.applicationStatus
    ? teacher.applicationStatus.replace('_', ' ').toLowerCase()
    : teacher.role === 'TEACHER'
      ? 'approved'
      : teacher.role === 'REJECTED_TEACHER'
        ? 'rejected'
        : 'pending review';

  const getStatusBadge = (role: string) => {
    switch (role) {
      case 'PENDING_TEACHER':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'TEACHER':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED_TEACHER':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAction = async (action: string) => {
    if (!onTeacherAction) return;
    
    setLoading(true);
    try {
      await onTeacherAction(teacher.id, action);
      if (action === 'approve' || action === 'reject') {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden border-0 p-0 shadow-2xl">
        <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-white via-gray-50 to-white">
          <div className="border-b bg-white/80 px-6 py-5">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex flex-wrap items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={teacher.profilePicture} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold leading-tight">
                    {teacher.firstName} {teacher.lastName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    {getStatusBadge(teacher.role)}
                    <span className="text-muted-foreground">Joined {formatDate(teacher.createdAt)}</span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription>
                Teacher application and profile details
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {highlightCards.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {highlightCards.map(({ icon: Icon, label, value, accent }) => (
                    <div
                      key={label}
                      className={`rounded-2xl border bg-linear-to-br ${accent} p-4 shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                          <p className="mt-2 text-xl font-semibold">{value}</p>
                        </div>
                        <Icon className="h-5 w-5 text-current" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                {/* Main Content */}
                <div className="space-y-5">
                  <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Contact Information</h3>
                      {teacher.emailVerified ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700">Unverified</Badge>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                          <p className="font-medium">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Applied</p>
                          <p className="font-medium">
                            {formatDate(teacher.createdAt)}
                          </p>
                        </div>
                      </div>

                      {teacher.phone && (
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                            <p className="font-medium">{teacher.phone}</p>
                          </div>
                        </div>
                      )}

                      {teacher.location && (
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Location</p>
                            <p className="font-medium">{teacher.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {teacher.bio && (
                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold">About</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700">{teacher.bio}</p>
                    </section>
                  )}

                  {teacher.expertise && teacher.expertise.length > 0 && (
                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold">Expertise & Subjects</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {teacher.expertise.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">Profile Insights</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Application Status</p>
                        <p className="mt-1 text-sm font-medium capitalize">{applicationStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Application Date</p>
                        <p className="mt-1 text-sm font-medium">{formatDate(teacher.applicationDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Login</p>
                        <p className="mt-1 text-sm font-medium">
                          {teacher.lastLoginAt ? formatDate(teacher.lastLoginAt, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Availability</p>
                        <p className="mt-1 text-sm font-medium">{teacher.availability ?? 'Not specified'}</p>
                      </div>
                    </div>
                  </section>

                  {(teacher.education || (teacher.certifications && teacher.certifications.length > 0)) && (
                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold">Education & Certifications</h3>
                      <div className="mt-4 space-y-4">
                        {teacher.education && (
                          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-3">
                            <GraduationCap className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-blue-700">Education</p>
                              <p className="text-sm text-blue-900">{teacher.education}</p>
                            </div>
                          </div>
                        )}

                        {teacher.certifications && teacher.certifications.length > 0 && (
                          <div className="flex items-start gap-3 rounded-xl bg-green-50 p-3">
                            <Award className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-700">Certifications</p>
                              <ul className="mt-1 space-y-1 text-sm text-green-900">
                                {teacher.certifications.map((cert: string, index: number) => (
                                  <li key={index}>• {cert}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                  <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">Application Summary</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Submitted on {formatDate(teacher.applicationDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span>Current status: <span className="capitalize">{applicationStatus}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>{teacher.reviewedAt ? `Reviewed on ${formatDate(teacher.reviewedAt)}` : 'Awaiting review'}</span>
                      </div>
                      {teacher.reviewedBy && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Reviewed by {teacher.reviewedBy}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">Actions</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review the application and manage teacher access
                    </p>
                    <div className="mt-4 space-y-2">
                      {teacher.role === 'PENDING_TEACHER' && (
                        <>
                          <Button
                            onClick={() => handleAction('approve')}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve Application
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleAction('reject')}
                            disabled={loading}
                            className="w-full"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject Application
                          </Button>
                        </>
                      )}

                      <Button variant="outline" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>

                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </Button>
                    </div>
                  </section>

                  {teacher.reviewedAt && (
                    <section className="rounded-2xl border bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold">Application Timeline</h3>
                      <div className="mt-4 space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Applied on {formatDate(teacher.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Reviewed on {formatDate(teacher.reviewedAt)}</span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}