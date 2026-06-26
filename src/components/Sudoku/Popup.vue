<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle: string;
  buttonText: string;
  showWinPopup: boolean;
  callback: () => void;
}>();
</script>

<template>
  <div
    v-if="props.showWinPopup"
    class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center transition-opacity"
  >
    <div
      class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700 transform scale-100 animate-bounce-short"
    >
      <div class="text-6xl mb-4">{{ props.title }}</div>
      <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-2">{{ props.subtitle }}</h2>

      <button
        @click="props.callback()"
        class="w-full py-3 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-transform active:scale-95"
      >
        {{ props.buttonText }}
      </button>
    </div>
  </div>
</template>

<style></style>
