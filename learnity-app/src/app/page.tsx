/**
 * Learnity Landing Page - Refactored
 * Clean, DRY implementation with reusable components
 */

'use client';

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { AuthLoadingSpinner } from '@/components/ui/AuthLoadingSpinner';
import { useHomeAuthRedirect } from '@/hooks/useAuthRedirect';
import { StepCard } from '@/components/landing/StepCard';
import { ArrowRight, CheckCircle } from 'lucide-react';
import {
  Hero,
  SectionHeader,
  CTA,
  FeatureGrid,
  Footer,
  Stats,
  VideoSection,
} from '@/components/externals';
import {
  HOW_IT_WORKS_STEPS,
  MAIN_FEATURES,
  TRUST_INDICATORS,
  GUARANTEE_FEATURES,
} from '@/lib/constants/landing-page';

export default function Home() {
  const { isRedirecting, shouldShowContent, error } = useHomeAuthRedirect();

  // Loading states
  if (isRedirecting || (!shouldShowContent && !error)) {
    return (
      <PublicLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <AuthLoadingSpinner
            message={isRedirecting ? 'Redirecting to your dashboard...' : 'Loading...'}
            showLogo={true}
            size="lg"
          />
        </div>
      </PublicLayout>
    );
  }

  // Error handling with retry
  if (error && error.includes('Retrying')) {
    return (
      <PublicLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <AuthLoadingSpinner message={error} showLogo={true} size="lg" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen bg-white relative overflow-hidden">
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
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
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
            secondaryAction={{
              label: 'Sign In',
              href: '/auth/login',
              variant: 'outline',
            }}
            stats={<Stats useClient={true} />}
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

          {/* Featured Teachers Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <SectionHeader
                title="Meet Our Expert Tutors"
                description="Learn from verified professionals passionate about teaching"
              />
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
                    <div className={`p-4 bg-gradient-to-br ${indicator.gradient} rounded-xl shadow-lg`}>
                      <indicator.icon className="h-8 w-8 text-white" />
                    </div>
                  ),
                  title: indicator.title,
                  description: indicator.description,
                  className: 'bg-transparent border-0 shadow-none',
                }))}
                columns={4}
                variant="minimal"
                showIcons={true}
              />
            </div>
          </section>

          {/* CTA Section */}
          <CTA
            title="Ready to start learning?"
            description="Join 1,000+ active learners and connect with expert tutors today. Your learning journey starts here."
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
      </div>
    </PublicLayout>
  );
}
