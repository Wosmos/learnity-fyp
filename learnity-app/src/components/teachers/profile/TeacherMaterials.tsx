'use client';

import { GraduationCap, Clock, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeacherData } from './types';

interface TeacherMaterialsProps {
  teacher: TeacherData;
}

export function TeacherMaterials({ teacher }: TeacherMaterialsProps) {
  return (
    <div className='space-y-6'>
      {/* Sample Lessons */}
      {teacher.sampleLessons && teacher.sampleLessons.length > 0 && (
        <Card>
          <CardContent className='p-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
              <GraduationCap className='h-6 w-6 mr-2 text-purple-600' />
              Sample Lessons
            </h2>
            <div className='space-y-4'>
              {teacher.sampleLessons.map((lesson, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-bold text-lg text-gray-900 mb-1'>
                        {lesson.title}
                      </h3>
                      <p className='text-gray-600 text-sm'>
                        {lesson.description}
                      </p>
                    </div>
                    <Badge variant='outline' className='ml-3 whitespace-nowrap'>
                      {lesson.level}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>{lesson.duration}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <BookOpen className='h-4 w-4' />
                      <span>{lesson.topics.length} topics</span>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {lesson.topics.map((topic, idx) => (
                      <Badge key={idx} variant='secondary' className='text-xs'>
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Stories */}
      {teacher.successStories && teacher.successStories.length > 0 && (
        <Card className='bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'>
          <CardContent className='p-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
              <Award className='h-6 w-6 mr-2 text-green-600' />
              Student Success Stories
            </h2>
            <div className='space-y-4'>
              {teacher.successStories.map((story, index) => (
                <div key={index} className='bg-white rounded-lg p-5 shadow-sm'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0'>
                      {story.studentName.charAt(0)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3 className='font-bold text-gray-900'>
                            {story.studentName}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {story.subject}
                          </p>
                        </div>
                      </div>
                      <div className='bg-green-100 border-l-4 border-green-500 p-3 rounded mb-2'>
                        <p className='font-semibold text-green-900 text-sm'>
                          {story.achievement}
                        </p>
                      </div>
                      <p className='text-gray-700 italic'>
                        &ldquo;{story.testimonial}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
