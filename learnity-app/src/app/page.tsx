/**
 * Learnity Landing Page - Server-Side Optimized
 * Fast-loading server component with prefetching and dynamic stats
 */

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { StepCard } from '@/components/landing/StepCard';
import { ArrowRight, CheckCircle } from 'lucide-react';
import {
  Hero,
  SectionHeader,
  CTA,
  FeatureGrid,
  Footer,
  VideoSection,
} from '@/components/externals';
import {
  HOW_IT_WORKS_STEPS,
  MAIN_FEATURES,
  TRUST_INDICATORS,
  GUARANTEE_FEATURES,
} from '@/lib/constants/landing-page';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';
import { PlatformStatsWithSuspense } from '@/components/shared/PlatformStats';
import { prefetchHomePageData } from '@/lib/services/prefetch.service';

// Server component - optimized for performance
export default async function Home() {
  // Prefetch all critical data in parallel during SSR
  const prefetchedData = await prefetchHomePageData();

  return (
    <>
      {/* Client component only for auth redirect logic */}
      <AuthRedirectHandler />
      
      <PublicLayout showNavigation={false}>
        <main className="min-h-screen bg-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-black pointer-events-none z-0" />
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="blob bg-slate-400/30 w-96 h-96 top-0 left-0 blur-3xl" />
            <div className="blob blob-delay-2 bg-purple-400/30 w-96 h-96 top-1/2 right-0 blur-3xl" />
            <div className="blob blob-delay-4 bg-green-400/30 w-80 h-80 bottom-0 left-1/4 blur-3xl" />
          </div>

          <main className="relative z-10">
            {/* Hero Section */}
            <Hero
              badge={{
                text: 'Now with Advanced Security & Audit Logging',
                showPulse: true,
              }}
              title={
                <>
                  <span className="block text-gray-900 mb-2">Learn faster with</span>
                  <span className="block bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    your best tutor
                  </span>
                </>
              }
              description="Connect with 500+ verified expert tutors for personalized 1-on-1 lessons. Join study groups and accelerate your learning journey."
              primaryAction={{
                label: 'Find your tutor',
                href: '/auth/register/student',
                variant: 'cta',
              }}
              stats={
                <PlatformStatsWithSuspense 
                  variant="hero" 
                  showTrends={true}
                />
              }
            />

            {/* How It Works Section */}
            <section className="bg-gray-50 py-20">
              <div className="container mx-auto px-4">
                <SectionHeader
                  title="How Learnity works"
                  description="Get started in three simple steps"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {HOW_IT_WORKS_STEPS.map((step) => (
                    <StepCard key={step.number} number={step.number} title={step.title} description={step.description} color={step.color as 'blue' | 'purple' | 'green'} />
                  ))}
                </div>
              </div>
            </section>

            {/* Video Section */}
            <VideoSection
              title="See Learnity in Action"
              description="Watch how our platform connects students with expert tutors for personalized learning experiences"
              videoId="rLRIB6AF2Dg"
              features={[
                {
                  icon: CheckCircle,
                  title: 'Live Sessions',
                  description: 'Interactive one-on-one video sessions with screen sharing',
                  bgColor: 'bg-slate-100',
                  iconColor: 'text-blue-600',
                },
                {
                  icon: CheckCircle,
                  title: 'Recording Available',
                  description: 'Review your lessons anytime with automatic recordings',
                  bgColor: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                },
                {
                  icon: CheckCircle,
                  title: 'HD Quality',
                  description: 'Crystal clear video and audio for the best learning experience',
                  bgColor: 'bg-green-100',
                  iconColor: 'text-green-600',
                },
              ]}
            />

            {/* Features Grid */}
            <section id="features" className="py-20">
              <div className="container mx-auto px-4">
                <SectionHeader
                  title="Everything you need to succeed"
                  description="Comprehensive features designed for modern education"
                />
                <div className="max-w-6xl mx-auto">
                  <FeatureGrid
                    items={MAIN_FEATURES.map((feature) => ({
                      icon: feature.icon,
                      title: feature.title,
                      description: feature.description,
                      bgColor: feature.bgColor,
                      color: feature.color,
                      content: feature.benefits && feature.benefits.length > 0 ? (
                        <ul className="space-y-3 mt-4">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      ) : undefined,
                    }))}
                    columns={3}
                    variant="default"
                  />
                </div>
              </div>
            </section>

            {/* Real-time Platform Statistics */}
            <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
              <div className="container mx-auto px-4">
                <SectionHeader
                  title="Join Our Growing Community"
                  description="Real-time statistics from our thriving learning platform"
                />
                <PlatformStatsWithSuspense 
                  variant="detailed" 
                  showTrends={true}
                  className="max-w-6xl mx-auto"
                />
              </div>
            </section>

            {/* Guarantee Section */}
            <section className="glass py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-600 rounded-full mb-6">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <SectionHeader
                    title="Lessons you'll love. Guaranteed."
                    description="Try another tutor for free if you're not satisfied with your first lesson. Your success is our priority."
                    maxWidth="2xl"
                  />
                  <div className="mt-12">
                    <FeatureGrid
                      items={GUARANTEE_FEATURES.map((feature) => ({
                        icon: feature.icon,
                        title: feature.title,
                        description: feature.description,
                        color: feature.color,
                        className: 'bg-white',
                      }))}
                      columns={3}
                      variant="minimal"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Teachers Section with Prefetched Data */}
            <section className="py-20">
              <div className="container mx-auto px-4">
                <SectionHeader
                  title="Meet Our Expert Tutors"
                  description="Learn from verified professionals passionate about teaching"
                />
                
                {/* Show preview of top teachers if data is prefetched */}
                {prefetchedData?.teachersData?.teachers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                    {prefetchedData.teachersData.teachers.slice(0, 4).map((teacher) => (
                      <div key={teacher.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {teacher.teacherProfile?.subjects?.slice(0, 2).join(', ')}
                          </p>
                          <div className="flex items-center justify-center text-sm text-yellow-600">
                            <span>★ {Number(teacher.teacherProfile?.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center">
                  <Link href="/teachers">
                    <Button size="lg" variant="cta">
                      View All Tutors
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Trust Indicators */}
            <section className="mb-20">
              <div className="glass-card p-12 rounded-2xl">
                <SectionHeader
                  title="Enterprise-Grade Security & Reliability"
                  description="Built with security-first architecture and comprehensive audit logging"
                  maxWidth="4xl"
                />
                <FeatureGrid
                  items={TRUST_INDICATORS.map((indicator) => ({
                    iconElement: (
                      <div className={`p-4 bg-linear-to-br ${indicator.gradient} rounded-xl shadow-lg`}>
                        <indicator.icon className="h-8 w-8 text-white" />
                      </div>
                    ),
                    title: indicator.title,
                    description: indicator.description,
                    className: 'bg-transparent border-0 shadow-none',
                  }))}
                  columns={4}
                  variant="minimal"
                  // showIcons={true}
                />
              </div>
            </section>

            {/* CTA Section */}
            <CTA
              title="Ready to start learning?"
              description="Join thousands of active learners and connect with expert tutors today. Your learning journey starts here."
              primaryAction={{
                label: 'Find your tutor',
                href: '/auth/register/student',
                variant: 'ctaSecondary',
              }}
              secondaryAction={{
                label: 'Meet Our Tutors',
                href: '/teachers',
                variant: 'outline',
              }}
              background="blue"
            />
          </main>

          {/* Footer */}
          <Footer
            status={{
              text: 'All Systems Operational',
              online: true,
            }}
          />
        </main>
      </PublicLayout>
    </>
  );
}

// Enable static generation with revalidation for optimal performance
export const revalidate = 300; // Revalidate every 5 minutes