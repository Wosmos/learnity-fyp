/**
 * Similar Teachers - Shows teachers with similar subjects/categories
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Star, 
  MapPin, 
  Clock,
  BookOpen,
  ChevronRight,
  Award
} from "lucide-react";
import Link from "next/link";

interface SimilarTeacher {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  teacherProfile: {
    subjects: string[];
    experience: number;
    bio: string;
    hourlyRate: string | null;
    rating: string;
    reviewCount: number;
    responseTime: string;
    city: string | null;
    country: string | null;
    isTopRated: boolean;
    lessonsCompleted: number;
    activeStudents: number;
    headline: string | null;
  };
}

interface SimilarTeachersProps {
  teacherId: string;
  subjects: string[];
  teacherName: string;
}

function TeacherCard({ teacher }: { teacher: SimilarTeacher }) {
  const { firstName, lastName, profilePicture, teacherProfile } = teacher;
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const rating = parseFloat(teacherProfile.rating || "0");
  
  return (
    <Link href={`/teachers/${teacher.id}`} className="block group">
      <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200 bg-white">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profilePicture || undefined} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {fullName}
                  </h3>
                  {teacherProfile.isTopRated && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                </div>
                
                {teacherProfile.headline && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {teacherProfile.headline}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
            </div>

            {/* Rating and Location */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-gray-500">({teacherProfile.reviewCount})</span>
                </div>
              )}
              
              {(teacherProfile.city || teacherProfile.country) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {[teacherProfile.city, teacherProfile.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1 mt-3">
              {teacherProfile.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} variant="outline" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {teacherProfile.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{teacherProfile.subjects.length - 3} more
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {teacherProfile.lessonsCompleted} lessons
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {teacherProfile.activeStudents} students
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {teacherProfile.responseTime}
              </div>
            </div>

            {/* Hourly Rate */}
            {teacherProfile.hourlyRate && (
              <div className="mt-3">
                <span className="text-lg font-semibold text-indigo-600">
                  ${teacherProfile.hourlyRate}
                </span>
                <span className="text-sm text-gray-500 ml-1">/hour</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SimilarTeachers({ teacherId, subjects, teacherName }: SimilarTeachersProps) {
  const [teachers, setTeachers] = useState<SimilarTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchSimilarTeachers() {
      try {
        const response = await fetch(`/api/teachers/${teacherId}/similar?subjects=${subjects.join(',')}`);
        const data = await response.json();
        
        if (data.success) {
          setTeachers(data.teachers);
        }
      } catch (error) {
        console.error("Error fetching similar teachers:", error);
      } finally {
        setLoading(false);
      }
    }

    if (subjects.length > 0) {
      fetchSimilarTeachers();
    } else {
      setLoading(false);
    }
  }, [teacherId, subjects]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Similar Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teachers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Similar Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No similar teachers found</p>
            <p className="text-sm text-gray-500 mt-1">
              {teacherName} has a unique teaching profile!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedTeachers = showAll ? teachers : teachers.slice(0, 4);
  const hasMore = teachers.length > 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Similar Teachers
          <Badge variant="secondary" className="ml-auto">
            {teachers.length} Found
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Other teachers who teach {subjects.slice(0, 2).join(" and ")}
          {subjects.length > 2 && ` and ${subjects.length - 2} more subjects`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show Less' : `Show All ${teachers.length} Teachers`}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/teachers">
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
              Browse All Teachers
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}