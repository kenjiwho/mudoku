<script setup lang="ts">
import { Board } from '@/sudoku/board';
import { ref } from 'vue';

const sudoku = new Board();
const board = Array.from(sudoku.board);
const initialClues: boolean[] = board.map((val: number, _idx: number, _arr: number[]) => val > 0);
let selectedCell = ref(0);

const emit = defineEmits<{
  (e: 'select-cell', index: number): void;
}>();

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
    '!border-4 !border-blue-500': selectedCell.value === index,
    // Visual styling for locked initial clues vs user inputs
    'font-bold text-slate-800 dark:text-slate-400 bg-slate-200 dark:bg-slate-800':
      initialClues[index],
    // 'text-blue-600 font-medium': !initialClues[index] && board[index] !== 0,
  };
}

function onClick(index: number) {
  selectedCell.value = index;
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <div
      class="grid grid-cols-9 grid-rows-9 border-4 bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-700 dark:text-gray-100 shadow-xl w-full max-w-[500px]"
    >
      <div
        v-for="(value, index) in board"
        :key="index"
        :class="getCellClasses(index)"
        @click="onClick(index)"
        class="flex justify-center items-center cursor-pointer select-none text-xl sm:text-2xl transition-colors duration-150 aspect-square"
      >
        <span v-if="value !== 0">{{ value }}</span>
      </div>
    </div>
  </div>
</template>

<style></style>
