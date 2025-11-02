/**
 * Learnity Landing Page
 * Main entry point with authentication options
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Learnity</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn, Teach, and Grow with{" "}
            <span className="text-blue-600">Learnity</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with expert tutors, join study groups, and accelerate your learning journey. 
            Whether you're a student or teacher, Learnity is your platform for educational success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">For Students</CardTitle>
              <CardDescription>
                Access personalized tutoring, join study groups, and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• One-on-one tutoring sessions</li>
                <li>• Interactive study groups</li>
                <li>• Progress tracking & analytics</li>
                <li>• Mobile-optimized learning</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto p-3 bg-green-100 rounded-lg w-fit mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">For Teachers</CardTitle>
              <CardDescription>
                Share your expertise, manage students, and earn income through teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Flexible scheduling system</li>
                <li>• Student progress monitoring</li>
                <li>• Content creation tools</li>
                <li>• Verified teacher profiles</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Community</CardTitle>
              <CardDescription>
                Join a vibrant learning community with collaborative features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Peer-to-peer learning</li>
                <li>• Discussion forums</li>
                <li>• Study group matching</li>
                <li>• Achievement system</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Learnity?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto p-3 bg-yellow-100 rounded-lg w-fit mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Teachers</h3>
              <p className="text-gray-600">
                All teachers go through a rigorous verification process to ensure quality education
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Advanced security measures protect your data and ensure safe learning environment
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">
                Lightning-fast platform with 99.9% uptime for uninterrupted learning
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and teachers already using Learnity
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Learnity</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <Link href="/auth" className="hover:text-gray-900">Authentication Demo</Link>
            <Link href="/auth/register" className="hover:text-gray-900">Register</Link>
            <Link href="/auth/login" className="hover:text-gray-900">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
