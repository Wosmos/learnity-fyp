/**
 * About Page
 * Information about Learnity platform
 */

'use client';

import { PublicLayout } from '@/components/layout/AppLayout';
import {
  GraduationCap,
  Target,
  Shield,
  Award,
  Zap,
  Heart,
  CheckCircle,
  Globe,
} from 'lucide-react';
import {
  Hero,
  SectionHeader,
  CTA,
  FeatureGrid,
  Footer,
  Stats,
  About as AboutSection,
} from '@/components/externals';

const VALUES = [
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in education and user experience',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Passionate about making quality education accessible to everyone',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Making learning accessible anytime, anywhere',
  },
];

const FEATURES = [
  'Verified expert tutors',
  'Flexible scheduling',
  'Progress tracking',
  'Secure payments',
  'Mobile learning',
  '24/7 support',
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-black pointer-events-none z-0" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="blob bg-purple-400/30 w-96 h-96 top-0 right-0 blur-3xl" />
          <div className="blob blob-delay-2 bg-slate-400/30 w-96 h-96 bottom-0 left-0 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <Hero
            title={
              <>
                About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learnity</span>
              </>
            }
            description="We're on a mission to make quality education accessible to everyone, connecting passionate learners with expert tutors worldwide."
            background="gradient"
          />

          {/* Mission Section */}
          <AboutSection
            left={{
              title: 'Our Mission',
              content: `At Learnity, we believe that everyone deserves access to quality education. 
Our platform connects students with verified expert tutors, making personalized 
learning accessible, affordable, and effective.

We're building more than just a tutoring platform – we're creating a global 
community of learners and educators dedicated to growth, excellence, and 
lifelong learning.`,
            }}
            right={{
              title: 'Our Vision',
              content: `To become the world's most trusted and effective learning platform, 
empowering millions of students to achieve their educational goals 
through personalized, expert-led instruction.`,
              icon: GraduationCap,
              gradient: true,
            }}
            layout="two-column"
          />

          {/* Platform Statistics */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <Stats useClient={true} />
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Our Values"
                  description="The principles that guide everything we do"
                />
                <FeatureGrid
                  items={VALUES.map((value) => ({
                    icon: value.icon,
                    title: value.title,
                    description: value.description,
                    bgColor: 'bg-slate-100',
                    color: 'text-blue-600',
                  }))}
                  columns={3}
                  variant="steps"
                />
              </div>
            </div>
          </section>

          {/* What We Offer */}
          <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <SectionHeader
                  title="What We Offer"
                  description="Everything you need for successful learning"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <SectionHeader
                  title="Why Choose Learnity?"
                />
                <FeatureGrid
                  items={[
                    {
                      icon: Award,
                      title: 'Verified Tutors',
                      description: 'All tutors undergo rigorous verification including background checks and credential validation.',
                      bgColor: 'bg-yellow-100',
                      color: 'text-yellow-600',
                    },
                    {
                      icon: Shield,
                      title: 'Secure Platform',
                      description: 'Enterprise-grade security with encryption, secure payments, and comprehensive audit logging.',
                      bgColor: 'bg-slate-100',
                      color: 'text-blue-600',
                    },
                    {
                      icon: Zap,
                      title: 'Proven Results',
                      description: '95% of students see improvement within 3 months. 4.9 average rating from thousands of satisfied learners.',
                      bgColor: 'bg-green-100',
                      color: 'text-green-600',
                    },
                  ]}
                  columns={3}
                  variant="elevated"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <CTA
            title="Ready to Start Learning?"
            description="Join thousands of students already learning with Learnity"
            primaryAction={{
              label: 'Get Started',
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

          {/* Footer */}
          <Footer
            status={{
              text: 'All Systems Operational',
              online: true,
            }}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
