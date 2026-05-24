<script setup lang="ts">
import { Board } from '@/sudoku/board';
import { onMounted, ref } from 'vue';
import BoardGrid from './Board.vue';
import { InputType } from './types';
import { getBoardView, initSudokuEngine, type SudokuApi } from '@/sudoku/engine';

let engine: SudokuApi;
const isLoaded = ref(false);

const board = ref([0]);
let sudoku: Board;
const selectedCell = ref(-1);

onMounted(async () => {
  engine = await initSudokuEngine();
  engine.generate(getRandomU64());
  board.value = Array.from(getBoardView());
  sudoku = new Board(board.value);
  isLoaded.value = true;
});

function cellClick(idx: number) {
  selectedCell.value = idx;
}

function getRandomU64(): bigint {
  const arr = new BigUint64Array(1);
  crypto.getRandomValues(arr);
  return arr[0]!;
}

function onInput(input: InputType, payload: number) {
  switch (input) {
    case InputType.PLACE:
      // cell insertion
      placeNumber(payload);
      break;
    case InputType.REMOVE:
      // cell deletion
      removeNumber();
      break;
    // move selection with arrows
    case InputType.UP:
      selectedCell.value -= 9;
      break;
    case InputType.DOWN:
      selectedCell.value += 9;
      break;
    case InputType.LEFT:
      selectedCell.value -= 1;
      break;
    case InputType.RIGHT:
      selectedCell.value += 1;
    default:
      break;
  }
}

function placeNumber(num: number) {
  const idx = selectedCell.value;
  sudoku.placeNumber(idx, num);
}

function removeNumber() {
  const idx = selectedCell.value;
  sudoku.removeNumber(idx);
}
</script>

<template>
  <div v-if="!isLoaded" class="flex items-center justify-center p-8 text-slate-400">
    <div class="animate-spin mr-2">⏳</div>
    Loading...
  </div>
  <div v-else>
    <BoardGrid
      :board
      :selected-cell="selectedCell"
      :initial-clues="sudoku.initialClues"
      @cell-click="cellClick"
      @on-input="onInput"
    />
  </div>
</template>

<style></style>
