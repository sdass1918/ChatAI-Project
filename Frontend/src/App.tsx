import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import './App.css';

function App() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[#212121] text-white">
      <Sidebar
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
      />
      <ChatPanel chatId={currentChatId} />
    </div>
  );
}

export default App;
