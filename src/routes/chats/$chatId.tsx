import { createFileRoute } from '@tanstack/react-router';
import { ChatArea } from '@/components/ChatArea';
function ChatPage() {
  const { chatId } = Route.useParams();
  return <ChatArea chatId={chatId} />;
}
export const Route = createFileRoute('/chats/$chatId')({
  component: ChatPage,
});
