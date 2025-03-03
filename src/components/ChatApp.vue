<template>
  <div class="chat-wrapper">
    <div v-if="contacts.length === 0" class="q-pa-md bg-yellow-1">
      <p>Нет доступных контактов. Проверьте соединение с сервером.</p>
      <p>Статус соединения: {{ isConnected ? 'Подключено' : 'Отключено' }}</p>
    </div>
    
    <div class="row no-wrap" style="height: 100%">
      <div 
        class="col-12 col-md-4 contacts-col" 
        :class="{ 'hidden-mobile': isMobile && activeContact }"
      >
        <q-header class="bg-primary fixed-top-within-container">
          <q-toolbar>
            <q-toolbar-title>
              Чат
            </q-toolbar-title>
          </q-toolbar>
        </q-header>
        
        <div class="content-container">
          <contact-list 
            :contacts="contacts" 
            @select-contact="onSelectContact" 
          />
        </div>
      </div>
      
      <div 
        class="col dialog-col" 
        :class="{ 
          'hidden-desktop': !isMobile && !activeContact, 
          'hidden-mobile': isMobile && !activeContact 
        }"
      >
        <template v-if="activeContact">
          <chat-dialog 
            :contact="activeContact" 
            :isMobile="isMobile"
            @send-message="onSendMessage" 
            @go-back="onGoBack" 
          />
        </template>
        <div v-else class="no-chat-selected q-pa-lg text-center text-grey">
          Выберите чат для начала общения
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { Contact } from '../types';
import { useChatService } from '../services/chatService';
import ContactList from './ContactList.vue';
import ChatDialog from './ChatDialog.vue';

const $q = useQuasar();
const { contacts, isConnected, sendMessage: sendMessageToService, markAsRead } = useChatService();
const activeContact = ref<Contact | null>(null);

const isMobile = computed(() => {
  return $q.screen.lt.md;
});

function onSelectContact(contact: Contact) {
  activeContact.value = contact;
  markAsRead(contact.id);
}

function onSendMessage(contactId: string, text: string) {
  sendMessageToService(contactId, text);
}

function onGoBack() {
  activeContact.value = null;
}

watch(contacts, (newContacts) => {
  if (activeContact.value) {
    const updatedContact = newContacts.find(c => c.id === activeContact.value?.id);
    if (updatedContact) {
      activeContact.value = updatedContact;
    }
  }
}, { deep: true });

watch(() => $q.screen.width, () => {
  if (!isMobile.value && !activeContact.value && contacts.value.length > 0) {
    const firstContact = contacts.value[0];
    if (firstContact) {
      activeContact.value = firstContact;
    }
  }
});

onMounted(() => {
  setTimeout(() => {
    if (!isMobile.value && contacts.value.length > 0) {
      const firstContact = contacts.value[0];
      if (firstContact) {
        activeContact.value = firstContact;
        console.log('Selected first contact:', firstContact);
      }
    }
  }, 100);
});
</script>

<style scoped>
.chat-wrapper {
  height: 100vh;
  overflow: hidden;
}

.contacts-col, .dialog-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.contacts-col {
  border-right: 1px solid #e0e0e0;
}

.fixed-top-within-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.content-container {
  padding-top: 50px;
  height: 100%;
  overflow-y: auto;
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
}

@media (max-width: 1023px) {
  .hidden-mobile {
    display: none;
  }
}

@media (min-width: 1024px) {
  .hidden-desktop {
    display: none;
  }
}
</style> 