/**
 * Teacher Detail Content - Professional Preply-Style Design
 * Complete teacher profile with video intro, testimonials, and all details
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  Award,
  Clock,
  Globe,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  Play,
  Quote,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  subject: string | null;
  date: string;
  isVerified: boolean;
}

interface TeacherDetailProps {
  teacher: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    subjects: string[];
    experience: number;
    bio: string;
    hourlyRate: string | null;
    qualifications: string[];
    isTopRated: boolean;
    rating: string;
    reviewCount: number;
    responseTime: string;
    availability: string;
    languages: string[];
    lessonsCompleted: number;
    activeStudents: number;
    teachingStyle: string;
    specialties: string[];
    certifications: string[];
    education: string[];
    availableDays: string[];
    preferredTimes: string[];
    headline: string;
    achievements: string[];
    teachingApproach: string;
    videoIntroUrl?: string | null;
  };
}

const gradients = [
  'from-blue-600 via-purple-600 to-pink-600',
  'from-cyan-500 via-blue-600 to-purple-700',
  'from-orange-500 via-red-600 to-pink-600',
  'from-green-500 via-teal-600 to-blue-600',
  'from-purple-600 via-pink-600 to-red-600',
  'from-indigo-600 via-purple-600 to-pink-600',
];

export function TeacherDetailContent({ teacher: initialTeacher }: TeacherDetailProps) {
  const router = useRouter();
  const [teacher, setTeacher] = useState(initialTeacher);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const rating = parseFloat(teacher.rating);
  const gradient = gradients[Math.abs(teacher.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length];

  useEffect(() => {
    // Fetch complete teacher data with testimonials
    async function fetchTeacherData() {
      try {
        const response = await fetch(`/api/teachers/${teacher.id}`);
        const data = await response.json();
        if (data.success) {
          setTeacher(data.teacher);
          setTestimonials(data.teacher.testimonials || []);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherData();
  }, [teacher.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-transparent border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Teachers
          </button>
        </div>
      </div>

      {/* Hero Section with Random Gradient */}
      <div className={`bg-gradient-to-br ${gradient} text-white py-16 relative overflow-hidden`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left: Profile Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                {/* Profile Picture */}
                {teacher.profilePicture ? (
                  <img
                    src={teacher.profilePicture}
                    alt={teacher.name}
                    className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold ring-4 ring-white/30 shadow-2xl">
                    {initials}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{teacher.name}</h1>
                    {teacher.isTopRated && (
                      <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 px-3 py-1">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        Top Rated
                      </Badge>
                    )}
                  </div>

                  {teacher.headline && (
                    <p className="text-xl text-white/90 mb-4">{teacher.headline}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                      <span className="text-2xl font-bold ml-2">{rating.toFixed(1)}</span>
                      <span className="text-white/80">({teacher.reviewCount} reviews)</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-semibold">{teacher.lessonsCompleted}+ lessons</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">{teacher.activeStudents} active students</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">{teacher.experience} years exp.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Responds {teacher.responseTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{teacher.availability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{teacher.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Right: Price & CTA */}
            <div className="lg:w-80">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-6">
                  {teacher.hourlyRate && (
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-gray-900">${teacher.hourlyRate}</div>
                      <div className="text-gray-600">per hour</div>
                    </div>
                  )}
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-lg py-6">
                      Book a Lesson
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg" variant="outline" className="w-full mt-3">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Introduction */}
            {teacher.videoIntroUrl && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Play className="h-6 w-6 mr-2 text-blue-600" />
                    Video Introduction
                  </h2>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={teacher.videoIntroUrl}
                      title={`${teacher.name} Introduction`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {teacher.firstName}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
              </CardContent>
            </Card>

            {/* Teaching Approach */}
            {teacher.teachingApproach && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Teaching Approach</h2>
                  <p className="text-gray-700 leading-relaxed">{teacher.teachingApproach}</p>
                </CardContent>
              </Card>
            )}

            {/* Subjects & Specialties */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Subjects & Specialties</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Subjects Taught</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <Badge key={index} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {teacher.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="px-3 py-1">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Education & Certifications</h2>
                <div className="space-y-4">
                  {teacher.education.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Education</h3>
                      <div className="space-y-2">
                        {teacher.education.map((edu, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{edu}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.certifications.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Certifications</h3>
                      <div className="space-y-2">
                        {teacher.certifications.map((cert, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            {teacher.achievements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                    Achievements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Quote className="h-6 w-6 mr-2 text-purple-600" />
                    Student Reviews ({testimonials.length})
                  </h2>
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{testimonial.studentName}</div>
                            {testimonial.subject && (
                              <div className="text-sm text-gray-500">{testimonial.subject}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{testimonial.comment}</p>
                        {testimonial.isVerified && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lessons Completed</span>
                    <span className="font-bold text-gray-900">{teacher.lessonsCompleted}+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Students</span>
                    <span className="font-bold text-gray-900">{teacher.activeStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-bold text-gray-900">{teacher.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Teaching Style</span>
                    <span className="font-bold text-gray-900">{teacher.teachingStyle}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Languages</h3>
                </div>
                <div className="space-y-2">
                  {teacher.languages.map((language, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{language}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Availability</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Available Days</div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.availableDays.map((day, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Preferred Times</div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.preferredTimes.map((time, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Book your first lesson with {teacher.firstName} today
                </p>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
