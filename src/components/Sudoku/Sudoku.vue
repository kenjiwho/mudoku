<script setup lang="ts">
import { Board } from '@/sudoku/board';
import { onMounted, ref } from 'vue';
import BoardGrid from './Board.vue';
import { InputType } from './types';
import { generate, initSudokuEngine } from '@/sudoku/engine';
import Buttons from './Buttons.vue';

const isLoaded = ref(false);

const board = ref([0]);
const mistakes = ref(new Set<number>());
const pencilMarks = ref([0]);
let sudoku: Board;
const selectedCell = ref(-1);
const pencil = ref(false);

onMounted(async () => {
  await initSudokuEngine();
  board.value = generate();
  sudoku = new Board(board.value);
  mistakes.value = sudoku.mistakes;
  pencilMarks.value = sudoku.pencilMarks;
  isLoaded.value = true;
});

function cellClick(idx: number) {
  selectedCell.value = idx;
}

function pencilClick() {
  pencil.value = !pencil.value;
}

function onInput(input: InputType, payload: number) {
  switch (input) {
    case InputType.PLACE:
      // cell insertion
      placeNumber(payload, pencil.value);
      break;
    case InputType.PENCILPLACE:
      placeNumber(payload, true);
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

function placeNumber(num: number, pencil: boolean) {
  const idx = selectedCell.value;
  sudoku.placeNumber(idx, num, pencil);
  console.log(pencilMarks.value[idx]?.toString(2));
}

function removeNumber() {
  const idx = selectedCell.value;
  sudoku.removeNumber(idx);
  console.log(pencilMarks.value[idx]?.toString(2));
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
      :mistakes
      :selected-cell="selectedCell"
      :initial-clues="sudoku.initialClues"
      :pencil-marks="pencilMarks"
      @cell-click="cellClick"
      @on-input="onInput"
    />
    <Buttons :pencil @pencil-click="pencilClick" @on-input="onInput" />
  </div>
</template>

<style></style>
