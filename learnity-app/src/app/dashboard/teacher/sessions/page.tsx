'use client';

/**
 * Teacher Sessions Page
 * Placeholder for future live session/meeting functionality
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';
import {
  Video,
  ArrowLeft,
  Calendar,
  Users,
  MessageSquare,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function TeacherSessionsPage() {
  return (
    <ClientTeacherProtection>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
          {/* Header */}
          <PageHeader
            title="Live Sessions"
            subtitle="Connect with your students in real-time"
            icon={Video}
            iconGradient={{ from: 'purple-600', to: 'purple-700' }}
            actions={
              <Link href="/dashboard/teacher">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            }
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Coming Soon Card */}
            <Card className="border-0 shadow-lg mb-8">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-purple-100 rounded-full mb-6">
                  <Video className="h-16 w-16 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Live Sessions Coming Soon
                </h2>
                <p className="text-slate-600 text-center max-w-md mb-8">
                  We&apos;re working on integrating live video sessions. In the meantime, 
                  you can use external tools to connect with your students.
                </p>
              </CardContent>
            </Card>

            {/* Alternative Options */}
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              How to Connect with Students Now
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                    </div>
                    Google Meet
                  </CardTitle>
                  <CardDescription>
                    Create a Google Meet link and share it with your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm text-slate-600 space-y-2 mb-4">
                    <li>1. Go to <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">meet.google.com</a></li>
                    <li>2. Click "New meeting" → "Create a meeting for later"</li>
                    <li>3. Copy the meeting link</li>
                    <li>4. Add it to your course's WhatsApp group or contact info</li>
                  </ol>
                  <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open Google Meet
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    WhatsApp Group
                  </CardTitle>
                  <CardDescription>
                    Add a WhatsApp group link to your course for Q&A
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="text-sm text-slate-600 space-y-2 mb-4">
                    <li>1. Create a WhatsApp group for your course</li>
                    <li>2. Go to Group Info → Invite via link</li>
                    <li>3. Copy the invite link</li>
                    <li>4. Add it to your course settings</li>
                  </ol>
                  <Link href="/dashboard/teacher/courses">
                    <Button variant="outline" className="w-full gap-2">
                      <BookOpen className="h-4 w-4" />
                      Go to My Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Tips Card */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Tips for Effective Online Teaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Schedule regular Q&A sessions and announce them in your course description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Use your course's communication settings to share meeting links with enrolled students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Record your live sessions and upload them as bonus content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Respond to student questions promptly to maintain engagement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    </ClientTeacherProtection>
  );
}
