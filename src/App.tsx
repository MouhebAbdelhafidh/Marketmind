import React from 'react';
import ChatInterface from './components/ChatInterface';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import './styles/animations.css';

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;