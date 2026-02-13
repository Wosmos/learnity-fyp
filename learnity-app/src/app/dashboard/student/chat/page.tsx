import MessagesPage from '@/app/messages/page';
import { Metadata } from 'next';
import { ChatProvider } from '@/components/chat/ChatProvider';

export const metadata: Metadata = {
  title: 'Student Chat | Learnity',
  description: 'Your conversations with teachers and students.',
};

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ channelId?: string; userId?: string }>;
}) => {
  return (
    <ChatProvider>
      <div className='container mx-auto px-4 py-8'>
        <MessagesPage searchParams={searchParams} />
      </div>
    </ChatProvider>
  );
};

export default page;
