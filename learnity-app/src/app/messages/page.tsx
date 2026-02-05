import { DirectMessages } from '@/components/chat/DirectMessages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Learnity',
  description: 'Your conversations with teachers and students.',
};

export default function MessagesPage() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-slate-900'>Messages</h1>
      <DirectMessages className='min-h-[600px] border shadow-sm' />
    </div>
  );
}
