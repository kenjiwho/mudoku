<script setup lang="ts">
import { InputType } from './types';

const props = defineProps<{
  pencil: boolean;
}>();

const emit = defineEmits<{
  (e: 'on-input', input: InputType, payload: any): void;
}>();

const number_buttons = [1, 2, 3, 4, 5, -1, 6, 7, 8, 9, 0];

function onClickNumber(button: number) {
  if (button > 0) {
    emit('on-input', InputType.PLACE, button);
  } else if (button === 0) {
    emit('on-input', InputType.REMOVE, -1);
  } else {
    emit('on-input', InputType.PENCIL, !props.pencil);
  }
}

function getCellClasses(val: number) {
  return {
    // if pencil mode is on highlight the pencil button
    'border-blue-500! dark:border-blue-600!': val === -1 && props.pencil,
  };
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <div class="grid grid-cols-6 grid-rows-2 dark:text-gray-100 w-full max-w-[400px]">
      <div
        v-for="val in number_buttons"
        :key="val"
        @click="onClickNumber(val)"
        :class="getCellClasses(val)"
        class="flex justify-center items-center cursor-pointer font-bold select-none text-xl sm:text-2xl aspect-square border-2 border-slate-300 dark:border-slate-500/40"
      >
        <span v-if="val === 0">❌</span>
        <span v-else-if="val === -1">✏️</span>
        <span v-else>{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<style></style>
