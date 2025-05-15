import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev < 3 ? prev + 1 : 1));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center mb-4 transition-opacity duration-300 ease-in-out opacity-80">
      <div className={`flex-shrink-0 h-8 w-8 rounded-full ${theme.name === 'light' ? 'bg-purple-100' : 'bg-purple-900'} flex items-center justify-center mr-2`}>
        <Bot size={16} className={theme.primary} />
      </div>
      
      <div className={`px-4 py-3 rounded-2xl ${theme.card} ${theme.text} rounded-tl-none border ${theme.border}`}>
        <div className="flex items-center h-5">
          <div className="dot-typing">
            {[1, 2, 3].map((dot) => (
              <span 
                key={dot} 
                className={`inline-block w-2 h-2 mx-0.5 rounded-full ${
                  dot <= dotCount 
                    ? 'bg-gray-600 dark:bg-gray-300' 
                    : 'bg-gray-300 dark:bg-gray-600'
                } transition-all duration-200`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;