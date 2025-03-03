import { ref, onMounted, onUnmounted } from 'vue';
import type { Message, Contact } from '../types';

export function useChatService() {
  const contacts = ref<Contact[]>([
    {
      id: 'дарья',
      name: 'Дарья',
      messages: [
        {
          id: '1',
          text: 'Вот что я нашел по вашему запросу',
          sender: 'Дарья',
          timestamp: Date.now() - 1000,
          isRead: false
        }
      ],
      unreadCount: 1,
      lastMessageTimestamp: Date.now() - 1000
    }
  ]);
  
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);

  const connect = () => {
    try {
      socket.value = new WebSocket('ws://localhost:8181/ws');
      
      socket.value.onopen = () => {
        isConnected.value = true;
        console.log('WebSocket connected');
      };
      
      socket.value.onmessage = (event) => {
        try {
          console.log('Received message:', event.data);
          const data = JSON.parse(event.data);
          
          if (data.message) {
            handleNewMessage({
              id: `ws_${Date.now()}`,
              text: data.message.message,
              sender: data.message.from,
              timestamp: Date.now(),
              isRead: false
            });
          } else if (data.type === 'message') {
            handleNewMessage(data.message);
          } else if (data.type === 'contacts') {
            contacts.value = data.contacts;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.value.onclose = () => {
        isConnected.value = false;
        console.log('WebSocket disconnected');
        setTimeout(connect, 3000);
      };
      
      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.value?.close();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setTimeout(connect, 3000);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (!message) return;
    
    const contactIndex = contacts.value.findIndex(
      contact => contact.id === message.sender || 
                (contact.messages.length > 0 && 
                 contact.messages[0]?.sender === message.sender)
    );
    
    if (contactIndex !== -1) {
      const contact = contacts.value[contactIndex];
      if (contact) {
        contact.messages.unshift(message);
        contact.lastMessageTimestamp = message.timestamp;
        contact.unreadCount++;
        
        sortContacts();
      }
    } else {
      const newContact: Contact = {
        id: message.sender,
        name: message.sender,
        messages: [message],
        unreadCount: 1,
        lastMessageTimestamp: message.timestamp
      };
      contacts.value.push(newContact);
      sortContacts();
    }
  };

  const sortContacts = () => {
    contacts.value.sort((a, b) => {
      const timestampA = a.lastMessageTimestamp || 0;
      const timestampB = b.lastMessageTimestamp || 0;
      return timestampB - timestampA;
    });
  };

  const sendMessage = (contactId: string, text: string) => {
    if (!contactId || !text || !socket.value || socket.value.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected or invalid parameters');
      return;
    }
    
    const message: Omit<Message, 'id'> = {
      text,
      sender: 'me',
      timestamp: Date.now(),
      isRead: true
    };
    
    socket.value.send(JSON.stringify({
      type: 'message',
      contactId,
      message
    }));
    
    const contactIndex = contacts.value.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      const contact = contacts.value[contactIndex];
      if (contact) {
        const newMessage: Message = {
          ...message,
          id: `local_${Date.now()}`
        };
        contact.messages.unshift(newMessage);
        contact.lastMessageTimestamp = newMessage.timestamp;
        sortContacts();
      }
    }
  };

  const markAsRead = (contactId: string) => {
    if (!contactId) return;
    
    const contactIndex = contacts.value.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      const contact = contacts.value[contactIndex];
      if (contact) {
        contact.unreadCount = 0;
        contact.messages.forEach(msg => {
          if (msg && !msg.isRead) {
            msg.isRead = true;
          }
        });
      }
    }
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    socket.value?.close();
  });

  return {
    contacts,
    isConnected,
    sendMessage,
    markAsRead
  };
} 