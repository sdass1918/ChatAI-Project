import { useEffect, useState } from "react";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface User {
  id: string;
  email: string;
  token: string;
}

interface SidebarProps {
  currentChatId: string | null;
  onSelectChat: (id: string | null) => void;
  onChatSelected: (chatId: string, messages: any[]) => void;
  user: User;
  onSignOut: () => void;
}

export function Sidebar({
  currentChatId,
  onSelectChat,
  onChatSelected,
  user,
  onSignOut,
}: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const getConversations = async () => {
      if (!token) {
        console.warn("No user token available");
        return;
      }
      console.log(`Fetching conversations for user: ${token}`);
      try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/conversations`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          if (data && data.conversations) {
            console.log(data.conversations);
            setChats(data.conversations);
          } else if (Array.isArray(data)) {
            console.log(data);
            setChats(data);
          }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    getConversations();
  }, [user.token]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date(),
    };
    setChats([newChat, ...chats]);
    onSelectChat(newChat.id);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter((chat) => chat.id !== id));
    if (currentChatId === id) {
      onSelectChat(null);
    }
  };

  const openChat = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No user token available");
      return;
    }
    console.log(`Opening chat with id: ${id}`);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/conversations/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      
      if (data && data.conversation && data.conversation.messages) {
        console.log(data.conversation.messages);
        // Pass both the conversation ID and messages to the parent
        onChatSelected(data.conversation.id, data.conversation.messages);
        onSelectChat(data.conversation.id);
      } else {
        console.error("Error opening chat: No messages found in response");
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  return (
    <div className="w-64 bg-[#171717] border-r border-[#2f2f2f] flex flex-col">
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full bg-transparent border border-[#4f4f4f] hover:bg-[#2a2a2a] text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <span className="mr-2">+</span>
          New Chat
        </button>
      </div>

      <div className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-2 pb-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`
                group flex items-center justify-between p-3 rounded-lg cursor-pointer
                transition-colors
                ${
                  currentChatId === chat.id
                    ? "bg-[#2a2a2a]"
                    : "hover:bg-[#2a2a2a]"
                }
              `}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-gray-400">💬</span>
                <button 
                onClick={() => openChat(chat.id)}
                className="text-sm truncate text-gray-200">
                  {chat.title}
                </button>
              </div>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Info and Sign Out */}
      <div className="p-3 border-t border-[#2f2f2f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">👤</span>
            </div>
            <span className="text-sm text-gray-300 truncate">{user.email}</span>
          </div>
          <button
            onClick={onSignOut}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            title="Sign Out"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}
