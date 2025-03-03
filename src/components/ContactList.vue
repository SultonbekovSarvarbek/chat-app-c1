
<script setup lang="ts">
import type { Contact } from '../types';
import InitialsAvatar from './InitialsAvatar.vue';

const { contacts } = defineProps<{
  contacts: Contact[];
}>();

const emit = defineEmits<{
  (e: 'select-contact', contact: Contact): void;
}>();

function onContactClick(contact: Contact) {
  emit('select-contact', contact);
}

function getLastMessagePreview(contact: Contact): string {
  if (contact.messages.length === 0) {
    return 'Нет сообщений';
  }
  
  const lastMsg = contact.messages[0];
  if (!lastMsg) {
    return 'Нет сообщений';
  }
  
  const prefix = lastMsg.sender === 'me' ? 'Вы: ' : '';
  return `${prefix}${lastMsg.text}`;
}

function getTimeLabel(timestamp?: number): string {
  if (!timestamp) return '';
  
  const msgDate = new Date(timestamp);
  const today = new Date();
  
  if (msgDate.toDateString() === today.toDateString()) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDate.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }
  
  return msgDate.toLocaleDateString();
}
</script>

<template>
  <div class="contacts-list">
    <div>
      <q-list separator>
        <q-item 
          v-for="contact in contacts" 
          :key="contact.id"
          clickable
          v-ripple
          @click="onContactClick(contact)"
          class="q-py-md"
        >
          <q-item-section avatar>
            <initials-avatar 
              :name="contact.name" 
              :unreadCount="contact.unreadCount"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ contact.name }}</q-item-label>
            <q-item-label caption lines="1" class="ellipsis">
              {{ getLastMessagePreview(contact) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>
              {{ getTimeLabel(contact.lastMessageTimestamp) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<style scoped>
.contacts-list {
  height: 100%;
  overflow-y: auto;
}
</style> 