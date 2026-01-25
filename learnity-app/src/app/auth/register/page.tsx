'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RegistrationFlow } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import LedtSideSection from '@/components/auth/LedtSideSection';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const { registerStudent, registerQuickTeacher } = useAuthService();

  return (
    <AuthProvider>
      <div className='min-h-screen bg-slate-50 lg:flex'>
        {/* Left Side - Branding (Desktop Only) */}
        <LedtSideSection />

        {/* Right Side - Registration Flow */}
        <div className='flex-1 flex flex-col p-4 sm:p-8 lg:p-12 bg-white lg:bg-transparent overflow-y-auto h-screen relative'>
          {/* Navigation Header (Desktop) */}
          <div className='hidden lg:flex justify-end mb-8 absolute top-8 right-8 z-10'>
            <Link href='/'>
              <Button
                variant='ghost'
                className='text-gray-600 hover:text-gray-900'
              >
                <ChevronLeft className='h-4 w-4 mr-2' />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className='w-full max-w-[800px] mx-auto my-auto'>
            <RegistrationFlow
              onStudentRegister={registerStudent}
              onTeacherRegister={registerQuickTeacher}
              onBackToLogin={() => (window.location.href = '/auth/login')}
              variant='simple'
              className='bg-transparent'
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
