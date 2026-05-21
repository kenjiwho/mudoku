<script setup lang="ts">
import { Board } from '@/sudoku/board';
import { Generator } from '@/sudoku/generator';
import { ref } from 'vue';
import BoardGrid from './Board.vue';
import { InputType } from './types';

const boardGenerator = new Generator();
const board = ref(boardGenerator.generate());
const sudoku = new Board(board.value);
const selectedCell = ref(-1);

function cellClick(idx: number) {
  selectedCell.value = idx;
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
  <BoardGrid
    :board
    :selected-cell="selectedCell"
    :initial-clues="sudoku.initialClues"
    @cell-click="cellClick"
    @on-input="onInput"
  />
</template>

<style></style>
