import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Logo from '../ui/logo';

const footer = () => {
  return (
    <footer className='bg-gray-50 border-t border-gray-200'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-8'>
          {/* Platform */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4 text-sm'>
              Platform
            </h3>
            <div className='space-y-3'>
              <Link
                href='/auth/login'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Sign In
              </Link>
              <Link
                href='/auth/register'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Register
              </Link>
              <Link
                href='/demo'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Demo
              </Link>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4 text-sm'>
              For Students
            </h3>
            <div className='space-y-3'>
              <Link
                href='/auth/register/student'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Find a Tutor
              </Link>
              <Link
                href='/auth/register/student'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Join Study Groups
              </Link>
              <Link
                href='/auth/register/student'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Track Progress
              </Link>
            </div>
          </div>

          {/* For Teachers */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4 text-sm'>
              For Teachers
            </h3>
            <div className='space-y-3'>
              <Link
                href='/auth/register/teacher'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Become a Tutor
              </Link>
              <Link
                href='/admin'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Teacher Dashboard
              </Link>
              <Link
                href='/admin/demo'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Resources
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4 text-sm'>
              Company
            </h3>
            <div className='space-y-3'>
              <Link
                href='/admin'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                About Us
              </Link>
              <Link
                href='/admin/security-events'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Security
              </Link>
              <Link
                href='/debug-env'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                System Status
              </Link>
              <Link
                href='/terms'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-gray-200'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <Logo showText={true} textColor='text-slate-950' />

            <div className='text-sm text-gray-600 text-center md:text-left'>
              © 2026 Learnity. All rights reserved.
            </div>

            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='text-sm text-gray-600'>
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default footer;
