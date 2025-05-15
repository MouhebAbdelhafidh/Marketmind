import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Message } from '../types';

interface ChatContextType {
  messages: Message[];
  addMessage: (content: string, sender: 'user' | 'bot') => void;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your AI marketing assistant. How can I help you with your marketing strategy today?",
      sender: 'bot',
      timestamp: new Date(),
      isRead: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = async (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      isRead: sender === 'user'
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    if (sender === 'user') {
      setIsTyping(true);

      try {
        const payload = {
          state: {
            question: content,
            source: null,
            decision_reason: null,
            generation: null
          }
        };

        const response = await axios.post('http://localhost:8000/', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const botResponse = response.data.result.generation;

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: botResponse || "Sorry, I couldn't process your request.",
          sender: 'bot',
          timestamp: new Date(),
          isRead: false
        };

        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error calling API:', error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm having trouble connecting to the server. Please try again later.",
          sender: 'bot',
          timestamp: new Date(),
          isRead: false
        };

        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: Date.now().toString(),
      content: "Hi there! I'm your AI marketing assistant. How can I help you with your marketing strategy today?",
      sender: 'bot',
      timestamp: new Date(),
      isRead: true
    }]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, isTyping, setIsTyping, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
