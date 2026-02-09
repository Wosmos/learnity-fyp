import { DirectMessages } from '@/components/chat/DirectMessages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Learnity',
  description: 'Your conversations with teachers and students.',
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ channelId?: string; userId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className='w-full h-full'>
      <DirectMessages
        className='w-full'
        initialChannelId={resolvedSearchParams.channelId}
        initialOtherUserId={resolvedSearchParams.userId}
      />
    </div>
  );
}
