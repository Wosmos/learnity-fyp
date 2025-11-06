/**
 * Learnity Landing Page
 * Enhanced main entry point with comprehensive navigation and features
 */

'use client';

import Link from "next/link";
import { PublicLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
  Smartphone,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learnity
            </span>
            <Badge variant="secondary" className="ml-2 text-xs">
              Beta
            </Badge>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#demo"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Demo
            </Link>
            <Link
              href="#admin"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="mb-6">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              🚀 Now with Advanced Security & Audit Logging
            </Badge>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              Learn, Teach,
            </span>
            <br />
            <span className="text-gray-900">and Grow with</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learnity
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with expert tutors, join study groups, and accelerate your
            learning journey. Built with enterprise-grade security,
            comprehensive audit logging, and modern authentication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 hover:bg-gray-50"
              >
                Sign In to Continue
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Expert Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed for modern education with
              enterprise-grade security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4 shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">For Students</CardTitle>
                <CardDescription>
                  Access personalized tutoring, join study groups, and track
                  your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    One-on-one tutoring sessions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Interactive study groups
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Progress tracking & analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Mobile-optimized learning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-4 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">For Teachers</CardTitle>
                <CardDescription>
                  Share your expertise, manage students, and earn income through
                  teaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Flexible scheduling system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Student progress monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Content creation tools
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Verified teacher profiles
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
                <CardDescription>
                  Join a vibrant learning community with collaborative features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Peer-to-peer learning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Discussion forums
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Study group matching
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Achievement system
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo & Navigation Section */}
        <section id="demo" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Learnity Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try out different features and see how our platform works for
              students, teachers, and administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </section>

        {/* Trust Indicators */}
        <section id="admin" className="mb-20">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-xl p-12">
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
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Education?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of students and teachers already using Learnity&apos;s
              secure, modern platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Try Demo
                  <Play className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 opacity-90">
              <Badge className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise Security
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Clock className="h-3 w-3 mr-1" />
                24/7 Support
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Award className="h-3 w-3 mr-1" />
                Verified Teachers
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Real-time Analytics
              </Badge>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learnity
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Modern educational platform with enterprise-grade security,
              comprehensive audit logging, and advanced authentication systems.
            </p>
            <div className="flex space-x-4">
              <Badge variant="secondary">Next.js 15</Badge>
              <Badge variant="secondary">Firebase Auth</Badge>
              <Badge variant="secondary">Prisma ORM</Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/auth/login"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Register
              </Link>
              <Link
                href="/auth"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Auth Demo
              </Link>
              <Link
                href="/demo"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Feature Demo
              </Link>
            </div>
          </div>

          {/* Admin & Security */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Admin & Security
            </h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/admin"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/admin/audit-logs"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Audit Logs
              </Link>
              <Link
                href="/admin/security-events"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Security Events
              </Link>
              <Link
                href="/admin/demo"
                className="block text-gray-600 hover:text-blue-600 transition-colors"
              >
                Generate Test Data
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            © 2024 Learnity. Built with Next.js 15, Firebase, and modern
            security practices.
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/debug-env"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Environment Info
            </Link>
            <Link
              href="/unauthorized"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Access Control Demo
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  );
}
