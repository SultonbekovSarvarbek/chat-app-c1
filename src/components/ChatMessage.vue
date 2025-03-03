<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../types';
import InitialsAvatar from './InitialsAvatar.vue';

const props = defineProps<{
  message: Message;
}>();

const isMine = computed(() => props.message.sender === 'me');

function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <div class="msg" :class="{ 'msg-sent': isMine }">
    <div v-if="!isMine" class="sender-avatar q-mr-sm">
      <initials-avatar :name="message.sender" />
    </div>
    <div class="msg-bubble q-pa-sm" :class="{ 'msg-sent': isMine }">
      <div class="msg-text">{{ message.text }}</div>
      <div class="msg-time text-caption text-grey">
        {{ formatMessageTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.msg {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-end;
}

.msg-sent {
  justify-content: flex-end;
}

.sender-avatar {
  align-self: flex-end;
}

.msg-bubble {
  max-width: 80%;
  border-radius: 12px;
  background-color: #f0f0f0;
  position: relative;
}

.msg-bubble.msg-sent {
  background-color: #dcf8c6;
}

.msg-text {
  word-wrap: break-word;
}

.msg-time {
  text-align: right;
  font-size: 0.7rem;
  margin-top: 4px;
}
</style> 