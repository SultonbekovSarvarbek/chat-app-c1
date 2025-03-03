<script setup lang="ts">
const props = defineProps<{
  name: string;
  unreadCount?: number;
}>();

function getInitials() {
  if (!props.name) return '?';
  
  const parts = props.name.split(' ');
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || '?';
  }
  
  const firstChar = parts[0]?.charAt(0) || '';
  const secondChar = parts[1]?.charAt(0) || '';
  return (firstChar + secondChar).toUpperCase();
}

function getColor() {
  const colors = [
    '#1976D2',
    '#388E3C',
    '#D32F2F',
    '#7B1FA2',
    '#FFA000',
  ];
  
  let hash = 0;
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
</script>

<template>
  <div class="avatar" :style="{ backgroundColor: getColor() }">
    {{ getInitials() }}
    <q-badge v-if="unreadCount && unreadCount > 0" color="red" floating>
      {{ unreadCount }}
    </q-badge>
  </div>
</template>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style> 