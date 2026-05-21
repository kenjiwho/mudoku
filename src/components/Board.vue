<script setup lang="ts">
import { Board } from '@/sudoku/board';
import { onMounted, onUnmounted, ref } from 'vue';

const sudoku = new Board();
const board = ref(Array.from(sudoku.board));
let selectedCell = ref(-1);

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
    'ring-4 ring-inset ring-blue-500 dark:ring-blue-600 z-10': selectedCell.value === index,
    // Visual styling for locked initial clues vs user inputs
    'font-bold text-slate-800 dark:text-slate-400 bg-slate-200 dark:bg-slate-800':
      sudoku.initialClues[index],
    // 'text-blue-600 font-medium': !initialClues[index] && board[index] !== 0,
  };
}

function placeNumber(num: number) {
  const idx = selectedCell.value;
  if (sudoku.placeNumber(idx, num)) board.value[idx] = num;
}

function removeNumber() {
  const idx = selectedCell.value;
  if (sudoku.removeNumber(idx)) board.value[idx] = 0;
}

function onClick(idx: number) {
  selectedCell.value = idx;
}

function onInput(event: KeyboardEvent) {
  const code = event.code;

  // if no cell is selected: ignore
  if (selectedCell.value < 0) {
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
      placeNumber(num);
      break;
    case 'Backspace':
    case 'Delete':
    case 'Digit0':
      // remove selection with 0, Backspace, Del
      removeNumber();
      break;
    case 'Escape':
      // deselect
      selectedCell.value = -1;
      break;
    // move selection with arrows
    case 'ArrowUp':
    case 'KeyW':
      if (selectedCell.value > 8) {
        selectedCell.value -= 9;
      }
      break;
    case 'ArrowDown':
    case 'KeyS':
      if (selectedCell.value < 72) {
        selectedCell.value += 9;
      }
      break;
    case 'ArrowLeft':
    case 'KeyA':
      if (selectedCell.value % 9 != 0) {
        selectedCell.value -= 1;
      }
      break;
    case 'ArrowRight':
    case 'KeyD':
      if ((selectedCell.value + 1) % 9 != 0) {
        selectedCell.value += 1;
      }
    default:
      break;
  }
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
        @click="onClick(idx)"
        class="flex justify-center items-center cursor-pointer select-none text-xl sm:text-2xl transition-colors duration-150 aspect-square"
      >
        <span v-if="val !== 0">{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<style></style>
