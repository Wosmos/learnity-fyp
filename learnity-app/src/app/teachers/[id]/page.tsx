/**
 * Teacher Detail Page
 * Dynamic page showing complete teacher profile
 */

import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/AppLayout';
import { TeacherDetailContent } from '@/components/teachers/TeacherDetailContent';
import { prisma } from '@/lib/config/database';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTeacher(id: string) {
  try {
    const teacher = await prisma.user.findUnique({
      where: {
        id,
        role: 'TEACHER',
        isActive: true,
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!teacher || !teacher.teacherProfile || teacher.teacherProfile.applicationStatus !== 'APPROVED') {
      return null;
    }

    return {
      id: teacher.id,
      name: `${teacher.firstName} ${teacher.lastName}`,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      profilePicture: teacher.profilePicture,
      subjects: teacher.teacherProfile.subjects,
      experience: teacher.teacherProfile.experience,
      bio: teacher.teacherProfile.bio || '',
      hourlyRate: teacher.teacherProfile.hourlyRate?.toString() || null,
      qualifications: teacher.teacherProfile.qualifications,
      isTopRated: teacher.teacherProfile.rating.toNumber() >= 4.5,
      rating: teacher.teacherProfile.rating?.toString() || '0',
      reviewCount: teacher.teacherProfile.reviewCount,
      responseTime: teacher.teacherProfile.responseTime || 'N/A',
      availability: teacher.teacherProfile.availability || 'Contact for availability',
      languages: teacher.teacherProfile.languages,
      lessonsCompleted: teacher.teacherProfile.lessonsCompleted,
      activeStudents: teacher.teacherProfile.activeStudents,
      teachingStyle: teacher.teacherProfile.teachingStyle || 'Interactive',
      specialties: teacher.teacherProfile.specialties,
      certifications: teacher.teacherProfile.certifications,
      education: teacher.teacherProfile.education,
      availableDays: teacher.teacherProfile.availableDays,
      preferredTimes: teacher.teacherProfile.preferredTimes,
      headline: teacher.teacherProfile.headline || '',
      achievements: teacher.teacherProfile.achievements,
      teachingApproach: teacher.teacherProfile.teachingApproach || '',
      videoIntroUrl: teacher.teacherProfile.videoIntroUrl || null,
    };
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const teacher = await getTeacher(id);
  
  if (!teacher) {
    return {
      title: 'Teacher Not Found | Learnity',
    };
  }

  return {
    title: `${teacher.name} - ${teacher.subjects.join(', ')} Tutor | Learnity`,
    description: teacher.bio,
  };
}

export default async function TeacherDetailPage({ params }: PageProps) {
  const { id } = await params;
  const teacher = await getTeacher(id);

  if (!teacher) {
    notFound();
  }

  return (
    <PublicLayout>
      <TeacherDetailContent teacher={teacher} />
    </PublicLayout>
  );
}
