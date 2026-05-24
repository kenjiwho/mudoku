<script setup lang="ts">
import { InputType } from './types';

const props = defineProps<{
  pencil: boolean;
}>();

const emit = defineEmits<{
  (e: 'pencil-click'): void;
  (e: 'on-input', input: InputType, payload: number): void;
}>();

const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '❌', '✏️'];

function onClick(button: string) {
  if (/^[1-9]$/.test(button)) {
    emit('on-input', InputType.PLACE, parseInt(button, 10));
  } else if (button === '❌') {
    emit('on-input', InputType.REMOVE, -1);
  } else if (button === '✏️') {
    emit('pencil-click');
  }
}

function getCellClasses(index: number) {
  return {
    // if pencil mode is on highlight the pencil button
    'border-blue-500! dark:border-blue-600!': index === 10 && props.pencil,
  };
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <div
      class="grid grid-cols-11 grid-rows-1 border-2 bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-700 dark:text-gray-100 shadow-xl w-full max-w-[600px]"
    >
      <div
        v-for="(val, idx) in buttons"
        :key="idx"
        :class="getCellClasses(idx)"
        @click="onClick(val)"
        class="flex justify-center items-center cursor-pointer font-bold select-none text-xl sm:text-2xl aspect-square border-2 border-slate-300 dark:border-slate-500/40"
      >
        <span>{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<style></style>
