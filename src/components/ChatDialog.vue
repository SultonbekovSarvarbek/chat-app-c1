<template>
  <div class="dialog-container">
    <q-header class="bg-primary fixed-top-within-container">
      <q-toolbar>
        <q-btn 
          v-if="isMobile" 
          flat 
          round 
          dense 
          icon="arrow_back" 
          @click="goBack" 
        />
        
        <initials-avatar :name="contact.name" class="q-mr-sm" />
        
        <q-toolbar-title>
          {{ contact.name }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    
    <div class="content-area">
      <div class="messages-area q-pa-md" ref="msgContainer">
        <div v-if="!hasMessages" class="text-center q-pa-lg text-grey">
          Нет сообщений
        </div>
        
        <template v-else>
          <chat-message 
            v-for="msg in messages" 
            :key="msg.id" 
            :message="msg" 
          />
        </template>
      </div>
      
      <div class="input-area q-pa-md">
        <q-form @submit="onSendMessage">
          <div class="row">
            <q-input
              v-model="msgText"
              outlined
              dense
              placeholder="Введите сообщение"
              class="col"
              bg-color="white"
              ref="inputField"
              autocomplete="off"
              autofocus
            />
            <q-btn
              type="submit"
              color="primary"
              icon="send"
              flat
              round
              class="q-ml-sm"
              :disable="!msgText.trim()"
            />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { Contact } from '../types';
import ChatMessage from './ChatMessage.vue';
import InitialsAvatar from './InitialsAvatar.vue';
import { QInput } from 'quasar';


interface QInputElement {
  focus: () => void;
  $el?: HTMLElement;
}

const props = defineProps<{
  contact: Contact;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: 'send-message', contactId: string, text: string): void;
  (e: 'go-back'): void;
}>();

const msgText = ref('');
const msgContainer = ref<HTMLElement | null>(null);
const inputField = ref<QInputElement | null>(null);

const hasMessages = computed(() => 
  props.contact.messages && props.contact.messages.length > 0
);

const messages = computed(() => {
  if (!hasMessages.value) return [];
  return [...props.contact.messages].sort((a, b) => b.timestamp - a.timestamp);
});

async function onSendMessage() {
  const text = msgText.value.trim();
  if (text) {
    emit('send-message', props.contact.id, text);
    msgText.value = '';
    
  
    await nextTick();
    if (inputField.value) {
      const qInput = inputField.value;
      if (qInput.focus) {
        qInput.focus();
      } else if (qInput.$el) {
        const inputElement = qInput.$el.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      }
    }
  }
}

function goBack() {
  emit('go-back');
}

async function scrollToBottom() {
  await nextTick();
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  }
}

watch(() => props.contact.messages, () => {
  void scrollToBottom();
}, { deep: true });

onMounted(() => {
  void scrollToBottom();
  
  if (inputField.value) {
    const qInput = inputField.value;
    if (qInput.focus) {
      qInput.focus();
    }
  }
});
</script>

<style scoped>
.dialog-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.fixed-top-within-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.content-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 50px;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
}

.input-area {
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}
</style> 