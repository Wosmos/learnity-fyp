/**
 * Teachers Page
 * Showcases approved teachers with real data from database
 */

import { Suspense } from 'react';
import { PublicLayout } from '@/components/layout/AppLayout';
import { TeachersGrid } from '@/components/teachers/TeachersGrid';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Our Teachers | Learnity',
  description: 'Meet our verified expert tutors ready to help you achieve your learning goals',
};

export default function TeachersPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50/30 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                500+ Verified Expert Tutors
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Expert Tutors</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                All our tutors are carefully vetted, highly qualified, and passionate about helping students succeed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Find Your Tutor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register?role=teacher">
                  <Button size="lg" variant="outline">
                    Become a Tutor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-sm text-gray-600">Expert Tutors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">120+</div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">4.9</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">10k+</div>
                <div className="text-sm text-gray-600">Lessons Taught</div>
              </div>
            </div>
          </div>
        </section>

        {/* Teachers Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse our selection of highly qualified tutors across various subjects
              </p>
            </div>

            <Suspense fallback={<TeachersGridSkeleton />}>
              <TeachersGrid />
            </Suspense>
          </div>
        </section>

        {/* Why Teach With Us */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Teach With Learnity?</h2>
                <p className="text-lg text-gray-600">
                  Join our community of expert educators and make a difference
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Schedule</h3>
                  <p className="text-gray-600">
                    Set your own hours and teach when it works for you
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Growing Community</h3>
                  <p className="text-gray-600">
                    Connect with thousands of eager students worldwide
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Pay</h3>
                  <p className="text-gray-600">
                    Set your own rates and earn what you deserve
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <Link href="/auth/register?role=teacher">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Apply to Teach
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

function TeachersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
