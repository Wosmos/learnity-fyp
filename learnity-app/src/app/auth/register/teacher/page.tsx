'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { QuickTeacherRegistrationForm } from '@/components/auth/QuickTeacherRegistrationForm';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';
import { QuickTeacherRegistrationData } from '@/lib/validators/quick-teacher-registration';
import LedtSideSection from '@/components/auth/LedtSideSection';
import { Button } from '@/components/ui/button';

export default function TeacherRegisterPage() {
  const { registerQuickTeacher } = useAuthService();
  const { setSelectedRole, setRegistrationStep, registrationStep } = useAuthStore();
  const router = useRouter();

  // Set teacher role and form step on mount
  useEffect(() => {
    setSelectedRole(UserRole.TEACHER);
    setRegistrationStep('form');
  }, [setSelectedRole, setRegistrationStep]);

  const handleTeacherSubmit = async (data: QuickTeacherRegistrationData) => {
    try {
      await registerQuickTeacher(data);
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
      <div className='min-h-screen bg-slate-50 lg:flex'>
        {/* Left Side - Branding (Desktop Only) */}
        <LedtSideSection
          title='Inspire the Next Generation'
          subtitle='Share your knowledge, mentor motivated students, and build your professional teaching portfolio.'
        />

        {/* Right Side - Registration Form */}
        <div className='flex-1 flex flex-col p-4 sm:p-8 lg:p-12 bg-white lg:bg-transparent overflow-y-auto h-screen relative'>
          {/* Mobile Header */}
          <div className='lg:hidden flex items-center justify-between w-full mb-6 max-w-[800px] mx-auto'>
            <span className='font-bold text-xl text-blue-600'>Learnity</span>
            <Link href='/auth/login'>
              <Button variant='ghost' size='sm'>
                Sign In
              </Button>
            </Link>
          </div>

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
            {registrationStep === 'verification' ? (
              <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl p-8 text-center space-y-6 shadow-xl border border-slate-100 max-w-[580px] mx-auto">
                  <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-200 rotate-3">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 italic uppercase tracking-tight">Application Submitted!</h3>
                    <p className="text-slate-500 font-medium">
                      Thank you for applying! Please check your email to verify your account. Our team will review your application within 2-3 business days.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="default"
                      className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold uppercase italic tracking-wider transition-all active:scale-[0.98] rounded-xl"
                      onClick={() => router.push('/auth/login')}
                    >
                      I've verified my email
                    </Button>
                    <p className="text-xs text-slate-400 mt-4">
                      Didn't receive it? <button className="text-blue-600 hover:underline font-semibold" onClick={() => window.location.reload()}>Click here to refresh</button>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <QuickTeacherRegistrationForm
                onSubmit={handleTeacherSubmit}
                onBack={handleBack}
                variant='simple'
                className='bg-transparent'
              />
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
