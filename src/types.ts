export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  messages: Message[];
  unreadCount: number;
  lastMessageTimestamp?: number;
} 