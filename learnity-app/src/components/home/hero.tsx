import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '../ui/badge'

function hero() {
  return (
    <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-blue-700 hover:bg-slate-100 border-blue-200 text-sm font-medium rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
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
          <Link href="/teachers">
            <Button
              size="lg"
              variant="cta"
              className="text-base px-8 py-6 rounded-xl hover:scale-105 font-semibold"
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
  )
}

export default hero;
