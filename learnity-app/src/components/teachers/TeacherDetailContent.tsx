/**
 * Teacher Detail Content - Professional Preply-Style Design
 * Refactored into smaller components for better maintainability.
 */

"use client";

import { useEffect, useState } from "react";
import { TeacherProfileHeader } from "./profile/TeacherProfileHeader";
import { TeacherHero } from "./profile/TeacherHero";
import { TeacherAbout } from "./profile/TeacherAbout";
import { TeacherEducation } from "./profile/TeacherEducation";
import { TeacherMaterials } from "./profile/TeacherMaterials";
import { TeacherReviews } from "./profile/TeacherReviews";
import { TeacherCourses } from "./profile/TeacherCourses";
import { TeacherActualReviews } from "./profile/TeacherActualReviews";
import { SimilarTeachers } from "./profile/SimilarTeachers";
import { TeacherSidebar } from "./profile/TeacherSidebar";
import { TeacherData, Testimonial } from "./profile/types";

interface TeacherDetailProps {
  teacher: TeacherData;
}

const gradients = [
  "from-blue-600 via-purple-600 to-pink-600",
  "from-cyan-500 via-blue-600 to-purple-700",
  "from-orange-500 via-red-600 to-pink-600",
  "from-green-500 via-teal-600 to-blue-600",
  "from-purple-600 via-pink-600 to-red-600",
  "from-indigo-600 via-purple-600 to-pink-600",
];

export function TeacherDetailContent({
  teacher: initialTeacher,
}: TeacherDetailProps) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const initials =
    `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const gradient =
    gradients[
      Math.abs(
        teacher.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
      ) % gradients.length
    ];

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const total = teacher.reviewCount;
    return [
      { stars: 5, percentage: 85, count: Math.floor(total * 0.85) },
      { stars: 4, percentage: 10, count: Math.floor(total * 0.1) },
      { stars: 3, percentage: 3, count: Math.floor(total * 0.03) },
      { stars: 2, percentage: 1, count: Math.floor(total * 0.01) },
      { stars: 1, percentage: 1, count: Math.floor(total * 0.01) },
    ];
  };

  useEffect(() => {
    // Fetch complete teacher data with testimonials
    async function fetchTeacherData() {
      try {
        const response = await fetch(`/api/teachers/${teacher.id}`);
        console.log(response, 'teachers data on client');
        const data = await response.json();
        if (data.success) {
          setTeacher(data.teacher);
          setTestimonials(data.teacher.testimonials || []);
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherData();
  }, [teacher.id]);

  if (loading && !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TeacherProfileHeader teacher={teacher} />

      <TeacherHero teacher={teacher} gradient={gradient} initials={initials} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TeacherAbout teacher={teacher} />

            <TeacherEducation teacher={teacher} />

            <TeacherMaterials teacher={teacher} />

            {/* Teacher's Courses */}
            <TeacherCourses 
              teacherId={teacher.id} 
              teacherName={teacher.name}
            />

            {/* Actual Student Reviews */}
            <TeacherActualReviews 
              teacherId={teacher.id} 
              teacherName={teacher.name}
            />

            {/* Original Testimonials (if available) */}
            <TeacherReviews
              teacher={teacher}
              testimonials={testimonials}
              getRatingDistribution={getRatingDistribution}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <TeacherSidebar teacher={teacher} />

            {/* Similar Teachers */}
            <SimilarTeachers 
              teacherId={teacher.id}
              subjects={teacher.subjects}
              teacherName={teacher.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
