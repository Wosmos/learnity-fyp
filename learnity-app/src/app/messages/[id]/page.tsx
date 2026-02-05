import { DirectMessages } from '@/components/chat/DirectMessages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat | Learnity',
  description: 'Chat with your teacher.',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MessageDetail({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-slate-900'>Chat</h1>
      <DirectMessages
        className='min-h-[600px] border shadow-sm'
        initialOtherUserId={id}
      />
    </div>
  );
}
