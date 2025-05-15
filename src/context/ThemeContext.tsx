import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types';

const lightTheme: Theme = {
  name: 'light',
  background: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
  text: 'text-gray-800',
  primary: 'text-purple-700',
  secondary: 'text-blue-600',
  accent: 'text-pink-600',
  card: 'bg-white/80',
  inputBg: 'bg-white',
  border: 'border-gray-200'
};

const darkTheme: Theme = {
  name: 'dark',
  background: 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900',
  text: 'text-gray-100',
  primary: 'text-purple-400',
  secondary: 'text-blue-400',
  accent: 'text-pink-400',
  card: 'bg-gray-800/80',
  inputBg: 'bg-gray-800',
  border: 'border-gray-700'
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    // Check user's preferred theme from localStorage or system preference
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && userPrefersDark)) {
      setTheme(darkTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme.name === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme.name);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};