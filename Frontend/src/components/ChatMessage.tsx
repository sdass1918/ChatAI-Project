import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-4 group">
      <div
        className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-[#5b5b5b]' : 'bg-[#10a37f]'
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-semibold text-gray-300">
          {isUser ? 'You' : 'ChatAI'}
        </div>
        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}
