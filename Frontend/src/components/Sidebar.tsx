import { useEffect, useState } from "react";
import { UserMenu } from "./UserMenu";
import { ChatOptionsMenu } from "./ChatOptions";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/ai/conversations`,
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

  const handleNewChat = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No user token available");
      return;
    }
    console.log(`Creating new chat for user: ${token}`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ai/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "New Chat",
          }),
        }
      );

      const data = await response.json();
      console.log("New conversation created:", data);
      const newConversation = data.conversation || data;
      setChats([newConversation, ...chats]);

      onSelectChat(newConversation.id);
      onChatSelected(newConversation.id, []);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleDeleteChat = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No user token available");
      return;
    }
    console.log(`Deleting chat with id: ${id}`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ai/conversations/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chat deleted:", data);
      setChats(chats.filter((chat) => chat.id !== id));
      if (currentChatId === id) {
        onSelectChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ai/conversations/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chat data received:", data);

      // Handle different response structures
      if (data && data.conversation) {
        const conversation = data.conversation;
        const messages = conversation.messages || [];
        console.log("Messages:", messages);
        onChatSelected(conversation.id, messages);
        onSelectChat(conversation.id);
      } else if (data && data.id) {
        // Direct conversation object
        const messages = data.messages || [];
        console.log("Messages:", messages);
        onChatSelected(data.id, messages);
        onSelectChat(data.id);
      } else {
        console.error("Unexpected response structure:", data);
        // Still select the chat even if no messages
        onSelectChat(id);
        onChatSelected(id, []);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      // Fallback - still select the chat
      onSelectChat(id);
      onChatSelected(id, []);
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
              onClick={() => openChat(chat.id)}
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
                <span className="text-sm truncate text-gray-200">
                  {chat.title}
                </span>
              </div>
              <ChatOptionsMenu onDelete={() => handleDeleteChat(chat.id)} />
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-[#2f2f2f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-300 truncate">{user.email}</span>
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </div>
      </div>
    </div>
  );
}
