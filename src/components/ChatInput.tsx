import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, StopCircle, Smile, FlipHorizontal as PaperclipHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

const ChatInput: React.FC = () => {
  const { theme } = useTheme();
  const { addMessage, isTyping } = useChat();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically resize textarea based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const scrollHeight = textAreaRef.current.scrollHeight;
      setInputHeight(scrollHeight < 120 ? scrollHeight : 120);
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    addMessage(message.trim(), 'user');
    setMessage('');
  };

  const toggleRecording = () => {
    // This would normally integrate with the Web Speech API
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setMessage(message + " [Voice transcription would appear here]");
      }, 3000);
    }
  };

  return (
    <div className={`px-4 py-3 border-t ${theme.border} ${theme.card} backdrop-blur-md transition-all duration-300`}>
      <form onSubmit={handleSubmit} className="flex items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={`w-full py-2 px-4 pr-12 ${theme.inputBg} ${theme.text} border ${theme.border} rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow resize-none`}
            style={{ height: `${inputHeight}px` }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isTyping}
          />
          
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <button
              type="button"
              className={`p-1.5 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors ${theme.text}`}
              aria-label="Add emoji"
            >
              <Smile size={18} />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors ${theme.text}`}
              aria-label="Attach file"
            >
              <PaperclipHorizontal size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex ml-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : `${theme.inputBg} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700 border ${theme.border}`
            }`}
            aria-label={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={message.trim() === '' || isTyping}
            className={`p-2.5 ml-2 rounded-full ${
              message.trim() === '' || isTyping
                ? 'bg-purple-300 dark:bg-purple-800 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
            } text-white transition-colors`}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;