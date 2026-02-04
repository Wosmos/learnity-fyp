'use client';

import {
  Shield,
  CheckCircle,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Globe,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeacherData } from './types';

interface TeacherSidebarProps {
  teacher: TeacherData;
}

export function TeacherSidebar({ teacher }: TeacherSidebarProps) {
  return (
    <div className='space-y-6'>
      {/* Trust Badges */}
      {teacher.trustBadges.length > 0 && (
        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Shield className='h-5 w-5 text-green-600' />
              <h3 className='text-lg font-bold text-gray-900'>
                Trust & Safety
              </h3>
            </div>
            <div className='space-y-2'>
              {teacher.trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 p-2 bg-white rounded-lg'
                >
                  <CheckCircle className='h-4 w-4 text-green-600 flex-shrink-0' />
                  <span className='text-sm text-gray-700'>{badge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className='border-2 border-blue-100'>
        <CardContent className='p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Quick Stats</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Lessons Completed</span>
              <span className='font-bold text-gray-900'>
                {teacher.lessonsCompleted}+
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Active Students</span>
              <span className='font-bold text-gray-900'>
                {teacher.activeStudents}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Response Time</span>
              <span className='font-bold text-gray-900'>
                {teacher.responseTime}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Teaching Style</span>
              <span className='font-bold text-gray-900'>
                {teacher.teachingStyle}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Globe className='h-5 w-5 text-blue-600' />
            <h3 className='text-lg font-bold text-gray-900'>Languages</h3>
          </div>
          <div className='space-y-2'>
            {teacher.languages.map((language, index) => (
              <div key={index} className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-slate-600 rounded-full'></div>
                <span className='text-gray-700'>{language}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Calendar className='h-5 w-5 text-green-600' />
            <h3 className='text-lg font-bold text-gray-900'>Availability</h3>
          </div>
          <div className='space-y-3'>
            <div>
              <div className='text-sm text-gray-500 mb-2'>Available Days</div>
              <div className='flex flex-wrap gap-2'>
                {teacher.availableDays.map((day, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className='text-sm text-gray-500 mb-2'>Preferred Times</div>
              <div className='flex flex-wrap gap-2'>
                {teacher.preferredTimes.map((time, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className='bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'>
        <CardContent className='p-6 text-center'>
          <MessageCircle className='h-12 w-12 text-blue-600 mx-auto mb-4' />
          <h3 className='text-lg font-bold text-gray-900 mb-2'>
            Ready to Start?
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            Book your first lesson with {teacher.firstName} today
          </p>
          <Link href='/auth/register/student'>
            <Button variant='gradient' className='w-full'>
              Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
