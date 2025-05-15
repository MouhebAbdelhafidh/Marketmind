import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

const quickActionMessages = [
  "What can you do?",
  "Tell me a joke",
  "What's the weather today?",
  "Recommend a book",
];

const QuickActions: React.FC = () => {
  const { theme } = useTheme();
  const { addMessage } = useChat();

  const handleActionClick = (message: string) => {
    addMessage(message, 'user');
  };

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {quickActionMessages.map((message, index) => (
        <button
          key={index}
          onClick={() => handleActionClick(message)}
          className={`px-3 py-1.5 text-sm rounded-full border ${theme.border} ${theme.card} ${theme.text} 
                      hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-200`}
        >
          {message}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;