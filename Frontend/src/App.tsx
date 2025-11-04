import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatPanel } from "./components/ChatPanel";
import { Auth } from "./components/Auth";
import "./App.css";

interface User {
  id: string;
  email: string;
  token: string;
}

function App() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userEmail = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    if (token && userEmail && userId) {
      setUser({
        id: userId,
        email: userEmail,
        token: token,
      });
    }

    setIsLoading(false);
  }, []);

  const handleAuthenticated = (userData: User) => {
    setUser(userData);
    // Store user data in localStorage
    localStorage.setItem("authToken", userData.token);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userId", userData.id);
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentChatId(null);
    setCurrentMessages([]);
    setCurrentChatTitle("");
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
  };

  const handleChatSelected = (
    conversationId: string,
    messages: any[],
    title?: string
  ) => {
    setCurrentChatId(conversationId);
    setCurrentMessages(messages);
    setCurrentChatTitle(title || "");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  // Show main chat interface if authenticated
  return (
    <div className="flex h-screen bg-[#212121] text-white">
      <Sidebar
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onChatSelected={handleChatSelected}
        user={user}
        onSignOut={handleSignOut}
      />
      <ChatPanel
        conversationId={currentChatId}
        user={user}
        messages={currentMessages}
        conversationTitle={currentChatTitle}
      />
    </div>
  );
}

export default App;
