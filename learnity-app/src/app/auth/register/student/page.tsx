'use client';

import { StudentRegistrationForm } from '@/components/auth/StudentRegistrationForm';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';
import { StudentRegistrationData } from '@/lib/validators/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LedtSideSection from '@/components/auth/LedtSideSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function StudentRegisterPage() {
  const { registerStudent } = useAuthService();
  const { setSelectedRole, setRegistrationStep } = useAuthStore();
  const router = useRouter();

  // Set student role and form step on mount
  useEffect(() => {
    setSelectedRole(UserRole.STUDENT);
    setRegistrationStep('form');
  }, [setSelectedRole, setRegistrationStep]);

  const handleStudentSubmit = async (data: StudentRegistrationData) => {
    try {
      await registerStudent(data);
      setRegistrationStep('verification');
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleBack = () => {
    // Redirect to role selection if user wants to go back
    router.push('/auth/register');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 lg:flex">
        {/* Left Side - Branding (Desktop Only) */}
        <LedtSideSection
          title="Join the Learning Revolution"
          subtitle="Connect with expert mentors and passionate students in a community dedicated to growth."
          statCount="50k+"
          statLabel="Active Students"
          testimonial={{
            quote: "Learnity helped me find the perfect tutor for my calculus exam. Highly recommended!",
            author: "Sarah J.",
            role: "University Student"
          }}
        />

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col p-4 sm:p-8 lg:p-12 bg-white lg:bg-transparent overflow-y-auto h-screen relative">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between w-full mb-6 max-w-[700px] mx-auto">
            <span className="font-bold text-xl text-blue-600">Learnity</span>
            <Link href="/auth/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
          </div>

          {/* Navigation Header (Desktop) */}
          <div className="hidden lg:flex justify-end mb-8 absolute top-8 right-8 z-10">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="w-full max-w-[700px] mx-auto my-auto">
            <StudentRegistrationForm
              onSubmit={handleStudentSubmit}
              onBack={handleBack}
              variant="simple"
              className="bg-transparent"
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

