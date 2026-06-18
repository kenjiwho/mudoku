<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { InputType } from './types';
import Marks from './Marks.vue';

const props = defineProps<{
  board: number[];
  mistakes: Set<number>;
  selectedCell: number;
  initialClues: boolean[];
  pencilMarks: number[];
}>();

const emit = defineEmits<{
  (e: 'cell-click', idx: number): void;
  (e: 'pencil-click'): void;
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
      if (!event.shiftKey) {
        const num = parseInt(code.at(-1)!, 10);
        emit('on-input', InputType.PLACE, num);
      } else {
        const num = parseInt(code.at(-1)!, 10);
        emit('on-input', InputType.PENCILPLACE, num);
      }
      // mark insertion
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
function getCellClasses(idx: number) {
  const row = Math.trunc(idx / 9);
  const col = idx % 9;

  return {
    // Standard Tailwind borders for every cell
    'border border-slate-300 dark:border-slate-500/40': true,
    // Thick borders to isolate the 3x3 boxes visually
    'border-b-slate-900 dark:border-b-slate-500': row === 2 || row === 5,
    'border-r-slate-900 dark:border-r-slate-500': col === 2 || col === 5,
    'border-t-slate-900 dark:border-t-slate-500': row === 3 || row === 6,
    'border-l-slate-900 dark:border-l-slate-500': col === 3 || col === 6,
    // Highlight if selected
    'ring-2 ring-inset ring-blue-500 dark:ring-blue-600 z-10': props.selectedCell === idx,
    // Visual styling for locked initial clues vs user inputs
    'text-slate-800 dark:text-slate-400 bg-slate-200 dark:bg-slate-800': props.initialClues[idx],
    // red background for mistakes
    'bg-red-500! dark:bg-red-900!': props.mistakes.has(idx),
  };
}

onMounted(() => window.addEventListener('keydown', onInput));
onUnmounted(() => window.removeEventListener('keydown', onInput));
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <div
      class="grid grid-cols-9 grid-rows-9 border-2 border-slate-900 dark:border-slate-500 dark:text-gray-100 shadow-xl w-full max-w-[500px]"
    >
      <div
        v-for="(val, idx) in board"
        :key="idx"
        :class="getCellClasses(idx)"
        @click="emit('cell-click', idx)"
        class="flex justify-center items-center cursor-pointer font-bold select-none text-xl sm:text-2xl transition-colors duration-150 aspect-square"
      >
        <span v-if="val !== 0">{{ val }}</span>
        <span v-else-if="props.pencilMarks[idx] !== 0"
          ><Marks :marks="props.pencilMarks[idx]"
        /></span>
      </div>
    </div>
  </div>
</template>

<style></style>
