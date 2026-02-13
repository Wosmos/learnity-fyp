import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { PublicLayout } from '@/components/layout/AppLayout';

export default function DocNotFound() {
  return (
    <PublicLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4'>
        <div className='max-w-md w-full text-center'>
          <div className='mb-8'>
            <div className='inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-6'>
              <FileQuestion className='w-12 h-12 text-slate-400' />
            </div>

            <h1 className='text-4xl font-black text-slate-900 mb-4'>
              Documentation Not Found
            </h1>

            <p className='text-lg text-slate-600 mb-8'>
              The documentation page you're looking for doesn't exist or has
              been moved.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/docs'
              className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              View All Documentation
            </Link>

            <Link
              href='/'
              className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-semibold hover:border-slate-900 transition-colors'
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
