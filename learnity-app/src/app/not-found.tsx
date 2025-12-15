'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, ArrowRight, RotateCcw, Frown } from 'lucide-react';

export default function NotFoundReportCard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full perspective-1000">
        
        {/* Floating Tape Element */}
        <div className="mx-auto w-32 h-8 bg-yellow-100/80 -mb-4 relative z-10 rotate-2 border border-yellow-200/50 backdrop-blur-sm"></div>
        
        <Card className="p-8 shadow-xl border-gray-200 rotate-1 relative bg-[#fffdf0]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-serif text-gray-900 border-b-2 border-gray-900 inline-block pb-1 mb-2">
              SEMESTER REPORT CARD
            </h1>
            <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">
              Student: Guest User
            </p>
          </div>

          {/* Grades Table */}
          <div className="space-y-3 mb-8 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-gray-300 border-dashed pb-2">
              <span>System Uptime</span>
              <span className="font-bold text-green-600">A+</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-300 border-dashed pb-2">
              <span>Page Speed</span>
              <span className="font-bold text-green-600">A</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-300 border-dashed pb-2">
              <span>CSS Styling</span>
              <span className="font-bold text-blue-600">B+</span>
            </div>
            {/* The Failure */}
            <div className="flex justify-between items-center bg-red-50 p-2 -mx-2 rounded border border-red-100">
              <span className="font-bold text-red-700 flex items-center gap-2">
                URL Navigation
                <span className="text-[10px] bg-red-100 px-1 rounded border border-red-200">404</span>
              </span>
              <span className="font-black text-2xl text-red-600 font-serif">F</span>
            </div>
          </div>

          {/* Teacher's Note */}
          <div className="relative mb-8 font-handwriting">
            <p className="text-red-600 text-lg -rotate-1 font-semibold leading-relaxed">
              "Please see me after class! This page doesn't exist on the syllabus."
              <br />
              <span className="text-sm text-red-400 font-normal block text-right mt-2">- The Server</span>
            </p>
            <Frown className="absolute -right-4 top-0 text-red-200 w-16 h-16 -rotate-12 opacity-50" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium">
                <Home className="mr-2 h-4 w-4" /> Return to Homeroom
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full border-gray-400 hover:bg-white text-gray-700">
                <RotateCcw className="mr-2 h-4 w-4" /> Retake Quiz (Find Courses)
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}