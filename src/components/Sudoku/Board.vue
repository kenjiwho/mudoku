<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { InputType } from './types';

const props = defineProps<{
  board: number[];
  selectedCell: number;
  initialClues: boolean[];
}>();

const emit = defineEmits<{
  (e: 'cell-click', idx: number): void;
  (e: 'on-input', input: InputType, payload: number): void;
}>();

function onInput(event: KeyboardEvent) {
  const code = event.code;

  // if no cell is selected: ignore
  if (props.selectedCell < 0) {
    return;
  }

  switch (code) {
    case 'Digit1':
    case 'Digit2':
    case 'Digit3':
    case 'Digit4':
    case 'Digit5':
    case 'Digit6':
    case 'Digit7':
    case 'Digit8':
    case 'Digit9':
      // cell insertion
      const num = parseInt(code.at(-1)!, 10);
      emit('on-input', InputType.PLACE, num);
      break;
    case 'Backspace':
    case 'Delete':
    case 'Digit0':
    case 'Escape':
      // cell deletion
      emit('on-input', InputType.REMOVE, -1);
      break;
    // move selection with arrows
    case 'ArrowUp':
    case 'KeyW':
      if (props.selectedCell > 8) {
        emit('on-input', InputType.UP, -1);
      }
      break;
    case 'ArrowDown':
    case 'KeyS':
      if (props.selectedCell < 72) {
        emit('on-input', InputType.DOWN, -1);
      }
      break;
    case 'ArrowLeft':
    case 'KeyA':
      if (props.selectedCell % 9 != 0) {
        emit('on-input', InputType.LEFT, -1);
      }
      break;
    case 'ArrowRight':
    case 'KeyD':
      if ((props.selectedCell + 1) % 9 != 0) {
        emit('on-input', InputType.RIGHT, -1);
      }
    default:
      break;
  }
}

// Helper to determine if a cell sits on a thick 3x3 boundary line
function getCellClasses(index: number) {
  const row = Math.trunc(index / 9);
  const col = index % 9;

  return {
    // Standard Tailwind borders for every cell
    'border border-slate-300 dark:border-slate-500/40': true,
    // Thick borders to isolate the 3x3 boxes visually
    'border-b-2 border-b-slate-900 dark:border-b-slate-600': row === 2 || row === 5,
    'border-r-2 border-r-slate-900 dark:border-r-slate-600': col === 2 || col === 5,
    'border-t-2 border-t-slate-900 dark:border-t-slate-600': row === 3 || row === 6,
    'border-l-2 border-l-slate-900 dark:border-l-slate-600': col === 3 || col === 6,
    // Highlight if selected
    'ring-4 ring-inset ring-blue-500 dark:ring-blue-600 z-10': props.selectedCell === index,
    // Visual styling for locked initial clues vs user inputs
    'text-slate-800 dark:text-slate-400 bg-slate-200 dark:bg-slate-800': props.initialClues[index],
  };
}

onMounted(() => window.addEventListener('keydown', onInput));
onUnmounted(() => window.removeEventListener('keydown', onInput));
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <div
      class="grid grid-cols-9 grid-rows-9 border-4 bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-700 dark:text-gray-100 shadow-xl w-full max-w-[500px]"
    >
      <div
        v-for="(val, idx) in board"
        :key="idx"
        :class="getCellClasses(idx)"
        @click="emit('cell-click', idx)"
        class="flex justify-center items-center cursor-pointer font-bold select-none text-xl sm:text-2xl transition-colors duration-150 aspect-square"
      >
        <span v-if="val !== 0">{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<style></style>
