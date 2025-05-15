import React from 'react';
import { History, Sparkles, Settings, Info, MessagesSquare, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  
  // Mock conversation history
  const conversationHistory = [
    { id: '1', title: 'Weather forecast', date: '2 hours ago' },
    { id: '2', title: 'Book recommendations', date: 'Yesterday' },
    { id: '3', title: 'Travel itinerary', date: '3 days ago' },
    { id: '4', title: 'Recipe ideas', date: 'Last week' },
    { id: '5', title: 'Coding help', date: 'Last week' },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
          onClick={onClose}
        ></div>
      )}
      
      <aside 
        className={`fixed md:static top-0 bottom-0 left-0 w-72 z-30 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${theme.card} border-r ${theme.border} ${theme.text}`}
      >
        <div className="flex items-center justify-between p-4 border-b ${theme.border}">
          <h2 className={`text-lg font-semibold ${theme.primary}`}>IntelliChat</h2>
          <button 
            className="md:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-2">
          <button className={`w-full flex items-center space-x-2 p-2 rounded-lg ${theme.name === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/50 text-purple-300'}`}>
            <MessagesSquare size={18} />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="px-3 py-2">
          <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-2">Recent Conversations</h3>
          <div className="space-y-1">
            {conversationHistory.map((convo) => (
              <button
                key={convo.id} 
                className={`w-full text-left p-2 rounded-lg text-sm flex items-center space-x-2
                  hover:${theme.name === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} transition-colors`}
              >
                <History size={16} className="flex-shrink-0" />
                <div className="flex-1 truncate">
                  <span>{convo.title}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{convo.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t ${theme.border}">
          <div className="space-y-1">
            <button className={`w-full text-left p-2 rounded-lg text-sm flex items-center space-x-2
              hover:${theme.name === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} transition-colors`}>
              <Sparkles size={16} />
              <span>Features</span>
            </button>
            <button className={`w-full text-left p-2 rounded-lg text-sm flex items-center space-x-2
              hover:${theme.name === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} transition-colors`}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className={`w-full text-left p-2 rounded-lg text-sm flex items-center space-x-2
              hover:${theme.name === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} transition-colors`}>
              <Info size={16} />
              <span>About</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;