import { ChatProvider } from '@/components/chat/ChatProvider';
import { PublicLayout } from '@/components/layout/AppLayout';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <ChatProvider>
        <div className='container mx-auto px-4 py-8'>{children}</div>
      </ChatProvider>
    </PublicLayout>
  );
}
