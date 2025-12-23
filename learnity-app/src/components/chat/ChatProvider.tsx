'use client';

/**
 * GetStream Chat Provider
 * Initializes and provides the StreamChat client to child components
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { useAuthStore } from '@/lib/stores/auth.store';

interface ChatContextType {
  client: StreamChat | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
}

const ChatContext = createContext<ChatContextType>({
  client: null,
  isConnected: false,
  isLoading: true,
  error: null,
  userId: null,
});

export const useChatClient = () => useContext(ChatContext);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let chatClient: StreamChat | null = null;

    const initChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get token from API
        const token = await user.getIdToken();
        const response = await fetch('/api/chat/token', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to get chat token');
        }

        const data = await response.json();
        const { token: chatToken, userId: chatUserId, apiKey } = data.data;

        if (!apiKey) {
          throw new Error('GetStream API key not configured');
        }

        // Initialize StreamChat client
        chatClient = StreamChat.getInstance(apiKey);

        // Connect user
        await chatClient.connectUser(
          {
            id: chatUserId,
            name: user.displayName || 'User',
            image: user.photoURL || undefined,
          },
          chatToken
        );

        setClient(chatClient);
        setUserId(chatUserId);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to chat');
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [isAuthenticated, user]);

  return (
    <ChatContext.Provider value={{ client, isConnected, isLoading, error, userId }}>
      {children}
    </ChatContext.Provider>
  );
}
