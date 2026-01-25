import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className='bg-white border-t mt-auto'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center'>
          <div className='flex items-center space-x-2 mb-4 sm:mb-0'>
            <div className='p-1 bg-slate-600 rounded flex items-center justify-center'>
              <img src='/logo.svg' alt='Learnity' className='h-10 w-10' />
            </div>
            <span className='text-sm text-gray-600'>
              ©learnity 2025 Learnity. All rights reserved.
            </span>
          </div>
          <div className='flex items-center space-x-4 text-sm text-gray-500'>
            <Link href='/privacy' className='hover:text-gray-700'>
              Privacy
            </Link>
            <Link href='/terms' className='hover:text-gray-700'>
              Terms
            </Link>
            <Link href='/support' className='hover:text-gray-700'>
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
