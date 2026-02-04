    'use client';

    import { useState } from 'react';
    import {
    Mail,
    Calendar,
    Check,
    X,
    MapPin,
    Phone,
    GraduationCap,
    Award,
    Star,
    DollarSign,
    User,
    ExternalLink,
    ShieldAlert,
    Clock,
    } from 'lucide-react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Separator } from '@/components/ui/separator';
    import { cn } from '@/lib/utils';
    import { useToast } from '@/hooks/use-toast';
    import type { UnifiedUser } from '../users/unified-columns';
    import Link from 'next/link';

    interface TeacherDetailDialogProps {
    teacher: UnifiedUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTeacherAction?: (userId: string, action: string) => void;
    }

    export function TeacherDetailDialog({
    teacher: user,
    open,
    onOpenChange,
    onTeacherAction,
    }: TeacherDetailDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!user) return null;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        });
    };

    const handleAction = async (action: string) => {
        if (!onTeacherAction) return;
        setLoading(true);
        try {
        await onTeacherAction(user.id, action);
        if (['approve', 'reject', 'deactivate', 'activate'].includes(action)) {
            onOpenChange(false);
        }
        } finally {
        setLoading(false);
        }
    };

    const isTeacher = user.role.includes('TEACHER');
    const isStudent = user.role === 'STUDENT';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white rounded-xl">
            <DialogHeader className="p-6 pb-2">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xl">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <DialogTitle className="text-xl font-bold text-slate-900 truncate">
                            {user.firstName} {user.lastName}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.isActive !== false ? "success" : "destructive"} className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-wider">
                                {user.isActive !== false ? 'Active' : 'Suspended'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-wider border-slate-200 text-slate-500">
                                {user.role?.replace('_', ' ') || 'User'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <div className="p-6 pt-2 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Role Specific Content */}
                {isTeacher && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Hourly Rate</p>
                                <p className="text-lg font-bold text-indigo-700">${user.hourlyRate || 0}/hr</p>
                            </div>
                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Rating</p>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <p className="text-lg font-bold text-amber-700">{user.rating || 'New'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {user.expertise && user.expertise.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expertise</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.expertise.map(skill => (
                                        <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 py-0.5 text-[11px]">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button asChild variant="outline" className="w-full justify-between group hover:border-indigo-200 hover:bg-indigo-50/30">
                            <Link href={`/teachers/${user.id}`}>
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-indigo-500" />
                                    View Full Public Profile
                                </span>
                                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-indigo-400" />
                            </Link>
                        </Button>
                    </div>
                )}

                {isStudent && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Academic Status</p>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <p className="text-lg font-bold text-blue-700">{user.studentData?.gradeLevel || 'Student'}</p>
                        </div>
                    </div>
                )}

                {/* Admin Actions */}
                <div className="pt-2">
                    {user.role === 'PENDING_TEACHER' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                onClick={() => handleAction('approve')} 
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50 border-none"
                            >
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                                onClick={() => handleAction('reject')} 
                                disabled={loading}
                                variant="outline"
                                className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                            >
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            onClick={() => handleAction(user.isActive !== false ? 'deactivate' : 'activate')} 
                            disabled={loading}
                            variant={user.isActive !== false ? "outline" : "default"}
                            className={cn(
                                "w-full font-bold uppercase tracking-tight",
                                user.isActive !== false 
                                    ? "border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200" 
                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 text-white border-none"
                            )}
                        >
                            {user.isActive !== false ? (
                                <><ShieldAlert className="mr-2 h-4 w-4" /> Suspend Access</>
                            ) : (
                                <><Check className="mr-2 h-4 w-4" /> Restore Access</>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </DialogContent>
        </Dialog>
    );
    }
