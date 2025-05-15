export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isRead?: boolean;
}

export interface Theme {
  name: 'light' | 'dark';
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  inputBg: string;
  border: string;
}