import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

const MessageList: React.FC = () => {
  const { theme } = useTheme();
  const { messages, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 ${theme.text}`}>
      <div className="max-w-3xl mx-auto">
        {messages.length === 1 && (
          <>
            <div className="mb-8 text-center">
              <h2 className={`text-2xl font-bold mb-2 ${theme.primary}`}>Welcome to IntelliChat</h2>
              <p className="text-sm opacity-80 mb-4">
                Your intelligent AI assistant. Ask me anything or try one of the suggestions below.
              </p>
              <QuickActions />
            </div>
          </>
        )}
        
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;