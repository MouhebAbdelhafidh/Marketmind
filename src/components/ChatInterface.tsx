import React, { useState } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const ChatInterface: React.FC = () => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme.background} bg-gradient-pattern`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-0 transition-all duration-300">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <MessageList />
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatInterface;