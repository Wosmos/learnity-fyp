/**
 * About Page
 * Information about Learnity platform
 */

import { PublicLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  Target,
  Users,
  Shield,
  Award,
  Globe,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Learnity',
  description: 'Learn about Learnity - connecting students with expert tutors worldwide',
};

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
    icon: Shield,
    title: 'Trust',
    description: 'Building trust through verified tutors and secure platform',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Making learning accessible anytime, anywhere',
  },
];

const TEAM_STATS = [
  { value: '2024', label: 'Founded' },
  { value: '500+', label: 'Tutors' },
  { value: '1,000+', label: 'Students' },
  { value: '120+', label: 'Subjects' },
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
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50/30 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learnity</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're on a mission to make quality education accessible to everyone, 
                connecting passionate learners with expert tutors worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                    At Learnity, we believe that everyone deserves access to quality education. 
                    Our platform connects students with verified expert tutors, making personalized 
                    learning accessible, affordable, and effective.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We're building more than just a tutoring platform – we're creating a global 
                    community of learners and educators dedicated to growth, excellence, and 
                    lifelong learning.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <GraduationCap className="h-16 w-16 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-blue-50 leading-relaxed">
                    To become the world's most trusted and effective learning platform, 
                    empowering millions of students to achieve their educational goals 
                    through personalized, expert-led instruction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {TEAM_STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
                <p className="text-lg text-gray-600">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {VALUES.map((value, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-7 w-7 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
                <p className="text-lg text-gray-600">
                  Everything you need for successful learning
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center bg-white rounded-lg p-4 shadow-sm">
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
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Learnity?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Tutors</h3>
                    <p className="text-gray-600">
                      All tutors undergo rigorous verification including background checks 
                      and credential validation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Platform</h3>
                    <p className="text-gray-600">
                      Enterprise-grade security with encryption, secure payments, and 
                      comprehensive audit logging.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Results</h3>
                    <p className="text-gray-600">
                      95% of students see improvement within 3 months. 4.9 average rating 
                      from thousands of satisfied learners.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl px-8 py-16 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of students already learning with Learnity
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/teachers">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                    Meet Our Tutors
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
