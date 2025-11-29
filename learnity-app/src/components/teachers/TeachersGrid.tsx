/**
 * Teachers Grid Component
 * Displays grid of teachers fetched from database
 */

'use client';

import { useEffect, useState } from 'react';
import { TeacherCard } from './TeacherCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  subjects: string[];
  experience: number;
  bio: string;
  hourlyRate: string | null;
  qualifications: string[];
  isTopRated: boolean;
  rating: string;
  reviewCount: number;
  responseTime: string;
  availability: string;
  languages: string[];
}

export function TeachersGrid() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch('/api/teachers/featured');
        const data = await response.json();

        if (data.success) {
          setTeachers(data.teachers);
        } else {
          setError('Failed to load teachers');
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Unable to load teachers. Please check your internet connection.",
          });
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Unable to load teachers at this time');
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Could not connect to the server. Please check your internet connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, [toast]);

  const displayedTeachers = showAll ? teachers : teachers.slice(0, 3);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No teachers available at the moment.</p>
        <p className="text-gray-500 text-sm mt-2">Check back soon for new tutors!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>

      {/* Show More Button */}
      {!showAll && teachers.length > 3 && (
        <div className="text-center mt-12">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Show All Teachers ({teachers.length})
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
