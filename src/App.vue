<script setup lang="ts">
import { onMounted } from 'vue';
import Board from './components/Board.vue';

const theme = localStorage.getItem('theme') || 'system';

function applyTheme(theme: string) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

function setTheme(t: string) {
  localStorage.setItem('theme', t);
  applyTheme(t);
}

onMounted(() => applyTheme(theme));
</script>

<template>
  <div class="min-h-dvh bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="p-4">
      <select
        :value="theme"
        @change="setTheme(($event.target as HTMLSelectElement).value)"
        class="rounded border px-2 py-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    <Board />
  </div>
</template>
