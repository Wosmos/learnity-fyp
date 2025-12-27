/**
 * Learnity Landing Page - Server-Side Optimized
 * Fast-loading server component with prefetching and dynamic stats
 */

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { StepCard } from '@/components/landing/StepCard';
import { ArrowRight, ArrowUpRight, CheckCircle, Star } from 'lucide-react';
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
  VIDEO_SECTION,
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
                  title="How Learnity"
                  highlightWord='works'
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
            {VIDEO_SECTION.map((section, index) => (
                <VideoSection key={index} {...section} />
              ))}

            {/* Features Grid */}
            <section id="features" className="py-20">
              <div className="container mx-auto px-4">
                <SectionHeader
                  title="Everything you need to"
                  highlightWord='succeed'
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
                              <CheckCircle className="h-5 w-5 text-slate-950 mr-3 mt-0.5 shrink-0" />
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
                  title="Join Our Growing"
                  highlightWord='Community'
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
                  <SectionHeader
                    title="Lessons you'll love."
                    highlightWord='Guaranteed'
                    description="Try another tutor for free if you're not satisfied with your first lesson. Your success is our priority."
                    maxWidth="2xl"
                  />
                  <div >
                    <FeatureGrid
                      items={GUARANTEE_FEATURES.map((feature) => ({
                        icon: feature.icon,
                        title: feature.title,
                        description: feature.description,
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
                  title="Meet Our Expert"
                  highlightWord='Tutors'
                  description="Learn from verified professionals passionate about teaching"
                />

                {/* Show preview of top teachers if data is prefetched */}
                {prefetchedData?.teachersData?.teachers && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-20 px-4">
                    {prefetchedData.teachersData.teachers.slice(0, 4).map((teacher) => {
                      const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
                      const isElite = Number(teacher.teacherProfile?.rating || 0) >= 4.8;

                      return (
                        <div
                          key={teacher.id}
                          className="group relative h-full bg-white rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-slate-900 overflow-hidden"
                        >
                          {/* Subtle Background Accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -z-10 group-hover:bg-indigo-50/50 transition-colors" />

                          <div className="flex flex-col h-full">
                            {/* Top Row: Avatar & Rating */}
                            <div className="flex justify-between items-start mb-6">
                              <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-black italic tracking-tighter ring-4 ring-white shadow-lg overflow-hidden">
                                  {teacher.teacherProfile?.profilePicture ? (
                                    <img src={teacher.teacherProfile.profilePicture} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                  ) : initials}
                                </div>
                                {isElite && (
                                  <div className="absolute -top-2 -left-2 bg-amber-400 p-1 rounded-lg shadow-md transform -rotate-12">
                                    <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-slate-900 font-black italic">
                                  <span className="text-lg">{Number(teacher.teacherProfile?.rating || 0).toFixed(1)}</span>
                                  <Star className="w-3 h-3 fill-current text-amber-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Global Rank</p>
                              </div>
                            </div>

                            {/* Name & Headline */}
                            <div className="flex justify-between items-center">
                              <div className="">
                                <h3 className="font-black text-slate-900 uppercase italic tracking-tighter text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                  {teacher.firstName} <br /> {teacher.lastName}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                  {teacher.teacherProfile?.subjects?.[0] || 'Expert Educator'}
                                </p>

                              </div>

                              {/* left Data Bar */}
                              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-black text-slate-900 italic">
                                    ${teacher.teacherProfile?.hourlyRate?.toString() ?? "0"}
                                  </p>

                                  <p className="text-[8px] font-bold text-slate-300 uppercase">Per Month</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shine Animation Overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-center ">
                  <Link href="/teachers" className="inline-block group ">
                    <button className="h-14 px-10 border border-slate-200 hover:border-slate-950 rounded-full flex items-center gap-4 transition-all duration-300 active:scale-95 bg-white hover:bg-slate-950 group-hover:cursor-pointer">

                      {/* Label - Swaps color on hover */}
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-white transition-colors duration-300 group-hover:cursor-pointer">
                        View All Tutors
                      </span>

                      {/* Icon - Circular frame that scales and colors */}
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 group-hover:bg-white/10 transition-all duration-300">
                        <ArrowRight className="h-3.5 w-3.5 text-slate-900 group-hover:text-slate-950 transition-transform group-hover:translate-x-0.5" />
                      </div>

                    </button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Trust Indicators */}
            {/* <section className="mb-20">
              <div className="glass-card p-12 rounded-2xl">
                <SectionHeader
                  title="Enterprise-Grade"
                  highlightWord='Security & Reliability'
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
                />
              </div>
            </section> */}

            {/* CTA Section */}
            <CTA
              title="Ready to start learning?"
              description="Join thousands of active learners and connect with expert tutors today. Your learning journey starts here."
              primaryAction={{
                label: 'Find your tutor',
                href: '/teachers',
                variant: 'ctaSecondary',
              }}
              secondaryAction={{
                label: 'Become a Tutors',
                href: '/auth/register/teacher',
                variant: 'outline',
              }}
            />
          </main>
        </main>
      </PublicLayout>
    </>
  );
}

// Enable static generation with revalidation for optimal performance
export const revalidate = 300; // Revalidate every 5 minutes