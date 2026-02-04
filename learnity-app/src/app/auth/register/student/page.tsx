'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, UserCircle } from 'lucide-react';
import { StudentRegistrationForm } from '@/components/auth/StudentRegistrationForm';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';
import { StudentRegistrationData } from '@/lib/validators/auth';
import LedtSideSection from '@/components/auth/LedtSideSection';
import { Button } from '@/components/ui/button';

export default function StudentRegisterPage() {
  const { registerStudent } = useAuthService();
  const { setSelectedRole, setRegistrationStep, registrationStep } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setSelectedRole(UserRole.STUDENT);
    setRegistrationStep('form');
  }, [setSelectedRole, setRegistrationStep]);

  const handleStudentSubmit = async (data: StudentRegistrationData) => {
    try {
      await registerStudent(data);
      setRegistrationStep('verification');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthProvider>
      {/* Container maintains the split layout */}
      <div className='min-h-screen bg-white lg:flex'>

        {/* Branding - Static Left Side */}
        <LedtSideSection />

        {/* Right Side - Functional Area */}
        <div className='flex-1 flex flex-col min-h-screen relative bg-slate-50/50 lg:bg-white'>

          {/* 1. Global Utility Header (Sticky-ready) */}
          <header className='w-full flex items-center justify-between p-4 md:p-8 z-20'>
            {/* Mobile Brand Label */}
            <div className='lg:hidden flex items-center gap-2'>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className='font-bold text-xl tracking-tighter text-slate-900'>Learnity</span>
            </div>

            {/* Desktop Navigation Group */}
            <div className='hidden lg:flex items-center gap-4'>
              <Link href='/auth/register'>
                <Button variant='ghost' size="sm" className='text-slate-500 hover:text-slate-900 font-medium'>
                  <ChevronLeft className='h-4 w-4 mr-1' />
                  Roles
                </Button>
              </Link>
            </div>

            {/* Secondary Action Group */}
            <div className="flex items-center gap-3">
              <Link href='/auth/register/teacher' className="hidden md:block">
                <Button variant='outline' size="sm" className="border-slate-200 text-slate-600">
                  Become a Teacher
                </Button>
              </Link>
              <Link href='/auth/login'>
                <Button variant='default' size='sm'>
                  Sign In
                </Button>
              </Link>
            </div>
          </header>

          {/* 2. Main Form Content Area */}
          <main className='flex-1 flex flex-col justify-center px-6 py-10'>
            <div className='w-full max-w-[580px] mx-auto'>

              {/* Contextual Header (Improved UX) */}
              {registrationStep !== 'verification' && (
                <div className="mb-8 hidden lg:block">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Student Registration
                  </h2>
                  <p className="text-slate-500 mt-1">Join the community and start your learning journey.</p>
                </div>
              )}

              <div className="bg-white lg:bg-transparent p-6 md:p-0 rounded-3xl shadow-sm lg:shadow-none border border-slate-100 lg:border-none">
                {registrationStep === 'verification' ? (
                  <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl p-8 text-center space-y-6 shadow-xl border border-slate-100">
                      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 rotate-3">
                        <UserCircle className="h-10 w-10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900 italic uppercase tracking-tight">Check your inbox</h3>
                        <p className="text-slate-500 font-medium">
                          We've sent a verification link to your email. Please click the link to activate your student account.
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
                  <StudentRegistrationForm
                    onSubmit={handleStudentSubmit}
                    onBack={() => router.push('/auth/register')}
                    variant='simple'
                    className='bg-transparent'
                  />
                )}
              </div>
            </div>
          </main>

          {/* 3. Footer / Mobile Back Button */}
          <footer className="p-8 lg:hidden text-center">
            <Link href='/auth/register' className="text-sm font-medium text-slate-400 hover:text-blue-600">
              Change Role Selection
            </Link>
          </footer>

        </div>
      </div>
    </AuthProvider>
  );
}