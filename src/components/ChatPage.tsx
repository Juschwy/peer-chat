import { useParams } from '@tanstack/react-router';
import { ChatArea } from '@/components/ChatArea';

export function ChatPage() {
  const { chatId } = useParams({ from: '/chats/$chatId' });
  return <ChatArea chatId={chatId} />;
}
