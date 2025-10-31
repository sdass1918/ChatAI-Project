import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  currentChatId: string | null;
  onSelectChat: (id: string | null) => void;
}

export function Sidebar({ currentChatId, onSelectChat }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'New Chat', timestamp: new Date() },
  ]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
    };
    setChats([newChat, ...chats]);
    onSelectChat(newChat.id);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      onSelectChat(null);
    }
  };

  return (
    <div className="w-64 bg-[#171717] border-r border-[#2f2f2f] flex flex-col">
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full bg-transparent border border-[#4f4f4f] hover:bg-[#2a2a2a] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 pb-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`
                group flex items-center justify-between p-3 rounded-lg cursor-pointer
                transition-colors
                ${currentChatId === chat.id
                  ? 'bg-[#2a2a2a]'
                  : 'hover:bg-[#2a2a2a]'
                }
              `}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="text-sm truncate text-gray-200">
                  {chat.title}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
