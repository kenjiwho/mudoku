<script setup lang="ts">
import { Board } from "@/sudoku/board";
import { onMounted, ref } from "vue";
import BoardGrid from "./Board.vue";
import { InputType } from "./types";
import { generate, initSudokuEngine } from "@/sudoku/engine";
import Buttons from "./Buttons.vue";

const isLoaded = ref(false);

const board = ref([0]);
const mistakes = ref(new Set<number>());
const pencilMarks = ref([0]);
let sudoku: Board;
const selectedCell = ref(-1);
const pencil = ref(false);
const renderTrigger = ref(0);

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

function onInput(input: InputType, payload: any) {
  switch (input) {
    case InputType.PLACE:
      // cell insertion
      placeNumber(payload, pencil.value);
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
      break;
    case InputType.PENCIL:
      pencil.value = payload;
      break;
    default:
      break;
  }
}

function placeNumber(num: number, pencil: boolean) {
  const idx = selectedCell.value;
  if (sudoku.placeNumber(idx, num, pencil)) {
    renderTrigger.value++;
  }
}

function removeNumber() {
  const idx = selectedCell.value;
  if (sudoku.removeNumber(idx)) {
    renderTrigger.value++;
  }
}
</script>

<template>
  <div v-if="!isLoaded" class="flex items-center justify-center p-8 text-slate-400">
    <div class="animate-spin mr-2">⏳</div>
    Loading...
  </div>
  <div v-else class="w-full items-center">
    <BoardGrid
      :key="renderTrigger"
      :board
      :mistakes
      :selected-cell="selectedCell"
      :initial-clues="sudoku.initialClues"
      :pencil-marks="pencilMarks"
      @cell-click="cellClick"
      @on-input="onInput"
    />
    <Buttons :pencil @on-input="onInput" />
  </div>
</template>

<style></style>
