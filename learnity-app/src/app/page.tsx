/**
 * Learnity Landing Page - Refactored
 * Clean, DRY implementation with reusable components
 */

'use client';

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthLoadingSpinner } from '@/components/ui/AuthLoadingSpinner';
import { useHomeAuthRedirect } from '@/hooks/useAuthRedirect';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { StepCard } from '@/components/landing/StepCard';
import { ArrowRight, CheckCircle } from 'lucide-react';
import {
  HERO_STATS,
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
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <main className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 -z-10" />

          <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 text-sm font-medium rounded-full shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Now with Advanced Security & Audit Logging
                </Badge>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                <span className="block text-gray-900 mb-2">Learn faster with</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  your best tutor
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Connect with 500+ verified expert tutors for personalized 1-on-1 lessons.
                Join study groups and accelerate your learning journey.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold">
                    Find your tutor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-8 border-t border-gray-200">
                {HERO_STATS.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  How Learnity works
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get started in three simple steps
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {HOW_IT_WORKS_STEPS.map((step) => (
                  <StepCard key={step.number} number={step.number} title={step.title} description={step.description} color={step.color as 'blue' | 'purple' | 'green'} />
                ))}
              </div>
            </div>
          </section>

          {/* Video Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    See Learnity in Action
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Watch how our platform connects students with expert tutors for personalized learning experiences
                  </p>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                  {/* Video Container */}
                  <div className="relative aspect-video">
                    {/* Placeholder for video - Replace with actual video embed */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-all cursor-pointer">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <p className="text-xl font-semibold">Watch Demo Video</p>
                        <p className="text-sm text-blue-100 mt-2">2 minutes overview</p>
                      </div>
                    </div>
                    
                    {/* YouTube Video Embed - Using correct embed URL format */}
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/rLRIB6AF2Dg?rel=0&modestbranding=1"
                      title="Learnity Platform Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
           
                  </div>

                  {/* Video Stats Overlay */}
                  {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="grid grid-cols-3 gap-4 text-white text-center">
                      <div>
                        <div className="text-2xl font-bold">10k+</div>
                        <div className="text-xs text-gray-300">Lessons Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">4.9★</div>
                        <div className="text-xs text-gray-300">Average Rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">95%</div>
                        <div className="text-xs text-gray-300">Success Rate</div>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Video Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Live Sessions</h3>
                    <p className="text-sm text-gray-600">
                      Interactive one-on-one video sessions with screen sharing
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recording Available</h3>
                    <p className="text-sm text-gray-600">
                      Review your lessons anytime with automatic recordings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">HD Quality</h3>
                    <p className="text-sm text-gray-600">
                      Crystal clear video and audio for the best learning experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Everything you need to succeed
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Comprehensive features designed for modern education
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {MAIN_FEATURES.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>
            </div>
          </section>

          {/* Guarantee Section */}
          <section className="bg-blue-50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Lessons you&apos;ll love. Guaranteed.
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Try another tutor for free if you&apos;re not satisfied with your first lesson.
                  Your success is our priority.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {GUARANTEE_FEATURES.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                        <Icon className={`h-8 w-8 ${feature.color} mx-auto mb-3`} />
                        <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Featured Teachers Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Meet Our Expert Tutors
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Learn from verified professionals passionate about teaching
                </p>
              </div>

              <div className="text-center">
                <Link href="/teachers">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    View All Tutors
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className="mb-20">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Enterprise-Grade Security & Reliability
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Built with security-first architecture and comprehensive audit logging
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {TRUST_INDICATORS.map((indicator, index) => (
                  <div key={index} className="text-center">
                    <div className={`mx-auto p-4 bg-gradient-to-br ${indicator.gradient} rounded-xl w-fit mb-4 shadow-lg`}>
                      <indicator.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{indicator.title}</h3>
                    <p className="text-gray-600 text-sm">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="relative overflow-hidden bg-blue-600 rounded-3xl px-8 py-16 md:px-16 md:py-20">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 translate-y-48"></div>
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to start learning?
                  </h2>
                  <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                    Join 1,000+ active learners and connect with expert tutors today.
                    Your learning journey starts here.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Find your tutor
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/teachers">
                      <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-2 border-white text-white hover:bg-blue-700 font-semibold transition-all duration-300">
                        Meet Our Tutors
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {[
                {
                  title: 'Platform',
                  links: [
                    { label: 'Sign In', href: '/auth/login' },
                    { label: 'Register', href: '/auth/register' },
                    { label: 'About Us', href: '/about' },
                  ],
                },
                {
                  title: 'For Students',
                  links: [
                    { label: 'Find a Tutor', href: '/teachers' },
                    { label: 'How It Works', href: '/#features' },
                    { label: 'Pricing', href: '/teachers' },
                  ],
                },
                {
                  title: 'For Teachers',
                  links: [
                    { label: 'Become a Tutor', href: '/auth/register?role=teacher' },
                    { label: 'Teacher Benefits', href: '/about' },
                    { label: 'Resources', href: '/about' },
                  ],
                },
                {
                  title: 'Company',
                  links: [
                    { label: 'About Us', href: '/about' },
                    { label: 'Our Teachers', href: '/teachers' },
                    { label: 'Contact', href: '/about' },
                  ],
                },
              ].map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm">{section.title}</h3>
                  <div className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.href}
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
