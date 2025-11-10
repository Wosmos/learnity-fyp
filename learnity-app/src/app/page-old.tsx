/**
 * Learnity Landing Page
 * Enhanced main entry point with comprehensive navigation and features
 * Now includes authentication-aware logic for automatic redirects
 */

'use client';

import Link from "next/link";
import { PublicLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { AuthLoadingSpinner } from "@/components/ui/AuthLoadingSpinner";
import { useHomeAuthRedirect } from "@/hooks/useAuthRedirect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Users,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Settings,
  FileText,
  AlertTriangle,
  BarChart3,
  Play,
  Lock,
  Eye,
  UserCheck,
  Globe,
  Award,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  // Use authentication redirect hook for home page
  const { isRedirecting, shouldShowContent, error } = useHomeAuthRedirect();

  // Show loading state while checking authentication or redirecting
  if (isRedirecting) {
    return (
      <PublicLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <AuthLoadingSpinner 
            message="Redirecting to your dashboard..."
            showLogo={true}
            size="lg"
          />
        </div>
      </PublicLayout>
    );
  }

  // Handle error states gracefully
  if (error) {
    // For retry scenarios, show loading with retry message
    if (error.includes('Retrying')) {
      return (
        <PublicLayout showNavigation={false}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
            <AuthLoadingSpinner 
              message={error}
              showLogo={true}
              size="lg"
            />
          </div>
        </PublicLayout>
      );
    }
    
    // For other errors, log and continue to show landing page (graceful degradation)
    console.error('Home page authentication error:', error);
    // Continue to render landing page below
  }

  // Only show landing page content if user should see it (unauthenticated)
  if (!shouldShowContent && !error) {
    return (
      <PublicLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <AuthLoadingSpinner 
            message="Loading..."
            showLogo={true}
            size="lg"
          />
        </div>
      </PublicLayout>
    );
  }

  // Render the landing page for unauthenticated users
  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 -z-10" />
        
        {/* Hero Content */}
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="block text-gray-900 mb-2">
                Learn faster with
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                your best tutor
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Connect with 500+ verified expert tutors for personalized 1-on-1 lessons. 
              Join study groups and accelerate your learning journey with enterprise-grade security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  Find your tutor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-8 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">1,000+</div>
                <div className="text-sm text-gray-600 font-medium">Active learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-sm text-gray-600 font-medium">Expert tutors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">120+</div>
                <div className="text-sm text-gray-600 font-medium">Subjects taught</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">4.9</div>
                <div className="text-sm text-gray-600 font-medium">Average rating</div>
              </div>
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
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-xl mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Find your tutor
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Browse through 500+ verified expert tutors. Filter by subject, 
                    availability, and price to find your perfect match.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-xl font-bold text-xl mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Start learning
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Book your first lesson and begin your personalized learning journey. 
                    Flexible scheduling that fits your lifestyle.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-xl font-bold text-xl mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Make progress
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track your improvement with detailed analytics and achieve your 
                    learning goals faster with expert guidance.
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
              {/* For Students */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <GraduationCap className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">For Students</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access personalized tutoring and track your progress
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">One-on-one tutoring sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Interactive study groups</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Progress tracking & analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Mobile-optimized learning</span>
                  </li>
                </ul>
              </div>

              {/* For Teachers */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">For Teachers</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Share your expertise and grow your business
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Flexible scheduling system</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Student progress monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Content creation tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Verified teacher profiles</span>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Community</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join a vibrant learning community
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Peer-to-peer learning</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Discussion forums</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Study group matching</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">Achievement system</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Lessons you&apos;ll love. Guaranteed.
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Try another tutor for free if you&apos;re not satisfied with your first lesson. 
                Your success is our priority.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Verified Tutors</h3>
                  <p className="text-sm text-gray-600">
                    All tutors are verified with background checks
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Secure Platform</h3>
                  <p className="text-sm text-gray-600">
                    Enterprise-grade security for all your data
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">Quality Assured</h3>
                  <p className="text-sm text-gray-600">
                    4.9 average rating from thousands of students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo & Navigation Section */}
        <section id="demo" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Learnity Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Try out different features and see how our platform works
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Authentication Demo */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Authentication</CardTitle>
                </div>
                <CardDescription>
                  Experience our secure authentication system with multiple
                  login options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/auth">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Auth Demo
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Login Page
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Registration
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Features */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Settings className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Admin Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive admin tools with security monitoring and audit
                  logging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Security Dashboard
                  </Button>
                </Link>
                <Link href="/admin/audit-logs">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                </Link>
                <Link href="/admin/security-events">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Security Events
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Demo & Testing */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Live Demo</CardTitle>
                </div>
                <CardDescription>
                  Interactive demos and testing tools to explore platform
                  capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Generate Test Data
                  </Button>
                </Link>
                <Link href="/admin/test">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Test Admin Auth
                  </Button>
                </Link>
                <Link href="/auth-demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Auth Flow Demo
                  </Button>
                </Link>
                <Link href="/theme-demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    UI Components
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Developer Tools */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Developer Tools</CardTitle>
                </div>
                <CardDescription>
                  Debug tools and environment information for developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/debug">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Debug Panel
                  </Button>
                </Link>
                <Link href="/debug-env">
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Environment Info
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Feature Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                </div>
                <CardDescription>
                  User verification, profile management, and role-based access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/verify-user">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    User Verification
                  </Button>
                </Link>
                <Link href="/admin-setup">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Setup
                  </Button>
                </Link>
                <Link href="/unauthorized">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Access Denied
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Shield className="h-5 w-5 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">Security Features</CardTitle>
                </div>
                <CardDescription>
                  Advanced security monitoring, audit trails, and threat
                  detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time audit logging
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suspicious activity detection
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Device fingerprinting
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Rate limiting & bot protection
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section id="admin" className="mb-20">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Enterprise-Grade Security & Reliability
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with security-first architecture, comprehensive audit
                logging, and advanced threat detection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mx-auto p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl w-fit mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Verified Teachers
                </h3>
                <p className="text-gray-600 text-sm">
                  Rigorous verification process with background checks and
                  credential validation
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Advanced Security
                </h3>
                <p className="text-gray-600 text-sm">
                  Multi-factor authentication, encryption, and real-time threat
                  monitoring
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Optimized performance with 99.9% uptime and global CDN
                  delivery
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Audit Logging</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive audit trails with real-time monitoring and
                  analytics
                </p>
              </div>
            </div>

            {/* Security Features Highlight */}
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                Security Features in Action
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Real-time Audit Logs
                    </h4>
                    <p className="text-sm text-gray-600">
                      Every action is logged with detailed metadata for
                      compliance and security analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Threat Detection
                    </h4>
                    <p className="text-sm text-gray-600">
                      AI-powered suspicious activity detection with automated
                      response systems
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Admin Dashboard
                    </h4>
                    <p className="text-sm text-gray-600">
                      Comprehensive security monitoring with real-time alerts
                      and analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden bg-blue-600 rounded-3xl px-8 py-16 md:px-16 md:py-20">
              {/* Background Pattern */}
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
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-100 text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Find your tutor
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base px-8 py-6 rounded-xl border-2 border-white text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition-all duration-300"
                    >
                      Sign In
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
            {/* Platform */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Platform</h3>
              <div className="space-y-3">
                <Link href="/auth/login" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Register
                </Link>
                <Link href="/demo" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Demo
                </Link>
              </div>
            </div>

            {/* For Students */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">For Students</h3>
              <div className="space-y-3">
                <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Find a Tutor
                </Link>
                <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Join Study Groups
                </Link>
                <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Track Progress
                </Link>
              </div>
            </div>

            {/* For Teachers */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">For Teachers</h3>
              <div className="space-y-3">
                <Link href="/auth/register" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Become a Tutor
                </Link>
                <Link href="/admin" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Teacher Dashboard
                </Link>
                <Link href="/admin/demo" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Resources
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Company</h3>
              <div className="space-y-3">
                <Link href="/admin" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
                <Link href="/admin/security-events" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Security
                </Link>
                <Link href="/debug-env" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  System Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO */}
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Learnity",
            "description": "Online tutoring and learning platform connecting students with expert tutors",
            "url": "https://learnity.com",
            "logo": "https://learnity.com/logo.png",
            "sameAs": [
              "https://twitter.com/learnity",
              "https://facebook.com/learnity",
              "https://linkedin.com/company/learnity"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "availableLanguage": ["English"]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1000"
            },
            "offers": {
              "@type": "Offer",
              "category": "Online Education",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      /> */}
      </div>
    </PublicLayout>
  );
}
