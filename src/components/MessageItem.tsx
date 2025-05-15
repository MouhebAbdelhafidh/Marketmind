import React, { useState, useEffect } from 'react';
import { UserRound, Bot, Check, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a small delay before showing the message to create an animated appearance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {!isUser && (
        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${theme.name === 'light' ? 'bg-purple-100' : 'bg-purple-900'} flex items-center justify-center mr-2`}>
          <Bot size={16} className={theme.primary} />
        </div>
      )}
      
      <div className={`max-w-[75%] md:max-w-[60%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? `${theme.name === 'light' ? 'bg-purple-600 text-white' : 'bg-purple-700 text-white'} rounded-tr-none` 
              : `${theme.card} ${theme.text} rounded-tl-none border ${theme.border}`
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <div className={`flex items-center mt-1 text-xs ${theme.name === 'light' ? 'text-gray-500' : 'text-gray-400'} ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.timestamp)}</span>
          
          {isUser && (
            <div className="ml-1">
              {message.isRead ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : (
                <Check size={14} />
              )}
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className={`flex-shrink-0 h-8 w-8 rounded-full ${theme.name === 'light' ? 'bg-purple-100' : 'bg-purple-900'} flex items-center justify-center ml-2`}>
          <UserRound size={16} className={theme.primary} />
        </div>
      )}
    </div>
  );
};

export default MessageItem;