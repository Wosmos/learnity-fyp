/**
 * Teacher Card Component - Clean & Minimal Design
 * Shows essential info with link to detailed page
 */

'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    subjects: string[];
    experience: number;
    bio: string;
    hourlyRate: string | null;
    isTopRated: boolean;
    rating: string;
    reviewCount: number;
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const rating = parseFloat(teacher.rating);

  return (
    <Link href={`/teachers/${teacher.id}`}>
      <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Top Rated Badge */}
        {teacher.isTopRated && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
              <Star className="h-3 w-3 fill-current" />
              <span>Top Rated</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-start space-x-4 mb-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {teacher.profilePicture ? (
                <img
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-gray-100">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {teacher.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">({teacher.reviewCount})</span>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1">
                {teacher.subjects.slice(0, 2).map((subject, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                  >
                    {subject}
                  </span>
                ))}
                {teacher.subjects.length > 2 && (
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    +{teacher.subjects.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {teacher.bio}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {teacher.experience} years exp.
            </div>
            {teacher.hourlyRate && (
              <div className="text-lg font-bold text-gray-900">
                ${teacher.hourlyRate}<span className="text-sm font-normal text-gray-500">/hr</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </Link>
  );
}
