'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    GraduationCap,
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    Star,
    Clock,
    Target,
    Award,
    Play,
    MessageCircle,
    Heart,
    Edit,
    Mail,
    CheckCircle2,
    Zap,
    Brain,
    Rocket
} from 'lucide-react';
import Link from 'next/link';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { MetricCard } from '@/components/ui/stats-card';

import { LearningGoalsSection } from './LearningGoalsSection';
import { ProfileTagsSection } from './ProfileSection';

interface StudentProfile {
    gradeLevel: string;
    subjects: string[];
    learningGoals: string[];
    interests: string[];
    studyPreferences: string[];
    bio?: string;
    profileCompletionPercentage: number;
}

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    studentProfile?: StudentProfile;
}

interface DashboardClientProps {
    profileData: ProfileData;
    completion: any;
}

export function DashboardClient({ profileData, completion }: DashboardClientProps) {
    const router = useRouter();

    const handleEnhanceProfile = () => {
        router.push('/profile/enhance');
    };

    const getInitials = () => {
        return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    };

    const userName = profileData?.firstName || 'Student';
    const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : 'Student';

    const metricData = [
        {
            title: "Courses Enrolled",
            value: "12",
            trendValue: "+2",
            trendLabel: "this month",
            icon: BookOpen,
        },
        {
            title: "Study Time",
            value: "24h",
            trendValue: "+6h",
            trendLabel: "this week",
            icon: Clock,
        },
        {
            title: "Achievements",
            value: "8",
            trendValue: "+3",
            trendLabel: "unlocked",
            icon: Award,
        },
        {
            title: "Overall Progress",
            value: "88%",
            trendValue: "+12%",
            trendLabel: "vs last month",
            isTrendUp: true,
            icon: TrendingUp,
        }
    ];

    return (
        <div className="flex-1 bg-slate-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                <div className="px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {userName}! 👋
                            </h1>
                            <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Badge className="bg-slate-100 text-blue-800">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Student
                            </Badge>
                            <Badge variant="outline">
                                Level 2 Learner
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-6 lg:px-8 py-8">
                {/* Profile Completion Banner */}
                {completion && completion.percentage < 100 && (
                    <div className="mb-8">
                        <ProfileCompletionBanner
                            completion={completion}
                            onEnhanceClick={handleEnhanceProfile}
                        />
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {metricData.map((metric, index) => (
                        <MetricCard
                            key={index}
                            variant="secondary"
                            title={metric.title}
                            value={metric.value}
                            trendValue={metric.trendValue}
                            trendLabel={metric.trendLabel}
                            isTrendUp={metric.isTrendUp}
                            icon={metric.icon}
                        />
                    ))}
                </div>

                {/* Profile Overview Section */}
                <div className="mb-8">
                    <Card className="border-2 border-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-32"></div>
                        <CardContent className="relative pt-0 pb-6">
                            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                                {/* Avatar */}
                                <div className="-mt-16 mb-4 md:mb-0">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                        <AvatarImage src={profileData.profilePicture || ''} alt={fullName} />
                                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                {fullName}
                                                {profileData.emailVerified && (
                                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                                )}
                                            </h2>
                                            <p className="text-gray-600 flex items-center gap-2 mt-1">
                                                <Mail className="h-4 w-4" />
                                                {profileData.email}
                                            </p>
                                        </div>
                                        <Button onClick={handleEnhanceProfile} className="mt-4 md:mt-0">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </div>

                                    {/* Profile Stats Bar */}
                                    {profileData.studentProfile && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                                <span className="text-sm font-bold text-blue-600">
                                                    {profileData.studentProfile.profileCompletionPercentage}%
                                                </span>
                                            </div>
                                            <Progress value={profileData.studentProfile.profileCompletionPercentage} className="h-2" />
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {profileData.studentProfile?.bio && (
                                        <p className="text-gray-700 mb-4 italic">&ldquo;{profileData.studentProfile.bio}&rdquo;</p>
                                    )}

                                    {/* Quick Info Grid */}
                                    {profileData.studentProfile && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Grade Level</p>
                                                    <p className="font-semibold text-gray-900">{profileData.studentProfile.gradeLevel}</p>
                                                </div>
                                            </div>

                                            {profileData.studentProfile.subjects.length > 0 && (
                                                <div className="flex items-start space-x-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Subjects</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {profileData.studentProfile.subjects.length} Selected
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {profileData.studentProfile.learningGoals.length > 0 && (
                                                <div className="flex items-start space-x-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Target className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Goals</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {profileData.studentProfile.learningGoals.length} Active
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CHILD COMPONENT: Tags + Goals */}
                            {profileData.studentProfile && (
                                <ProfileTagsSection
                                    interests={profileData.studentProfile.interests}
                                    studyPreferences={profileData.studentProfile.studyPreferences}
                                    learningGoals={profileData.studentProfile.learningGoals}
                                    onEnhanceProfile={handleEnhanceProfile}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rest of Dashboard (Unchanged) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Play className="h-5 w-5" />
                                    <span>Continue Learning</span>
                                </CardTitle>
                                <CardDescription>Pick up where you left off</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium">Advanced Mathematics</h4>
                                            <p className="text-sm text-gray-600">Chapter 5: Calculus Fundamentals</p>
                                        </div>
                                        <Badge variant="outline">75% Complete</Badge>
                                    </div>
                                    <Progress value={75} className="mb-3" />
                                    <Button size="sm">Continue Lesson</Button>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium">Computer Science Basics</h4>
                                            <p className="text-sm text-gray-600">Module 3: Data Structures</p>
                                        </div>
                                        <Badge variant="outline">45% Complete</Badge>
                                    </div>
                                    <Progress value={45} className="mb-3" />
                                    <Button size="sm">Continue Lesson</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Upcoming Sessions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Math Tutoring with Sarah</h4>
                                        <p className="text-sm text-gray-600">Today at 3:00 PM</p>
                                    </div>
                                    <Button size="sm" variant="outline">Join</Button>
                                </div>
                                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">Study Group: Physics</h4>
                                        <p className="text-sm text-gray-600">Tomorrow at 7:00 PM</p>
                                    </div>
                                    <Button size="sm" variant="outline">Join</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/courses">
                                    <Button className="w-full justify-start">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Browse Courses
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student/courses">
                                    <Button variant="outline" className="w-full justify-start">
                                        <GraduationCap className="h-4 w-4 mr-2" />
                                        My Courses
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="h-4 w-4 mr-2" />
                                    Find Study Groups
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Tutoring
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Ask Questions
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Award className="h-5 w-5" />
                                    <span>Recent Achievements</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Star className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Math Master</p>
                                        <p className="text-xs text-gray-600">Completed 10 math lessons</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <Target className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Goal Achiever</p>
                                        <p className="text-xs text-gray-600">Reached weekly study goal</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Team Player</p>
                                        <p className="text-xs text-gray-600">Joined 5 study groups</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Study Streak</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MetricCard
                                    title="Current Streak"
                                    value="7"
                                    trendValue="🔥"
                                    trendLabel="Days in a row!"
                                    icon={Zap}
                                />
                                <div className="flex justify-center space-x-1 mt-4">
                                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                        <div key={day} className="w-6 h-6 bg-orange-500 rounded-full"></div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}