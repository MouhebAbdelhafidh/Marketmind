import React from 'react';
import { Menu, X, Moon, Sun, Search, Mic, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { clearMessages } = useChat();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <header className={`py-4 px-4 backdrop-blur-md ${theme.card} border-b ${theme.border} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSidebar}
            className={`p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ${theme.text}`}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center">
            <h1 className={`text-xl font-semibold ${theme.primary}`}>
              IntelliChat
            </h1>
            <span className={`ml-2 text-xs py-0.5 px-2 rounded-full bg-purple-100 dark:bg-purple-900 ${theme.primary}`}>AI</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSearchOpen ? (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className={`w-48 py-1 px-3 rounded-full text-sm ${theme.inputBg} ${theme.border} border outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ${theme.text}`}
              aria-label="Search messages"
            >
              <Search size={18} />
            </button>
          )}
          
          <button 
            className={`p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ${theme.text}`}
            aria-label="Voice input"
          >
            <Mic size={18} />
          </button>

          <button 
            onClick={clearMessages}
            className={`p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ${theme.text}`}
            aria-label="New chat"
          >
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ${theme.text}`}
            aria-label={theme.name === 'light' ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme.name === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;