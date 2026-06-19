<script setup lang="ts">
import { Board } from "@/sudoku/board";
import { onMounted, ref } from "vue";
import BoardGrid from "./Board.vue";
import { InputType } from "./types";
import { generate, initSudokuEngine } from "@/sudoku/engine";
import Buttons from "./Buttons.vue";
import { ref as dbRef, get, set, onChildChanged } from "firebase/database";
import { database } from "@/firebase";

const props = defineProps<{
  roomId: string;
}>();

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

  const roomRef = dbRef(database, `rooms/${props.roomId}`);
  const snapshot = await get(roomRef);

  if (snapshot.exists()) {
    // room exists, downloda board state
    const data = snapshot.val();
    // get initial board state
    const initialBoardData = data.initialBoard || [];
    board.value = [...initialBoardData];
    sudoku = new Board(board.value);

    // perform moves that have already been done
    const currentBoard = data.board || [];
    const currentPencilMarks = data.pencilMarks || [];
    for (let i = 0; i < 81; i++) {
      if (currentBoard[i] !== initialBoardData[i] && currentBoard[i] !== 0) {
        sudoku.placeNumber(i, currentBoard[i], false);
      }
      // place pencil marks
      if (currentBoard[i] !== 0 && currentPencilMarks[i] !== 0) {
        sudoku.placePencilMarks(i, currentPencilMarks[i]);
      }
    }
  } else {
    // room does not exist, generate new board
    const initialBoardData = generate();
    board.value = [...initialBoardData];
    sudoku = new Board(board.value);

    await set(roomRef, {
      initialBoard: initialBoardData,
      board: initialBoardData,
      pencilMarks: sudoku.pencilMarks,
    })
  }

  mistakes.value = sudoku.mistakes;
  pencilMarks.value = sudoku.pencilMarks;
  isLoaded.value = true;

  // LIVE SYNC between players
  onChildChanged(dbRef(database, `rooms/${props.roomId}/board`), (snapshot) => {
    const idx = parseInt(snapshot.key!, 10);
    const val = snapshot.val();
    sudoku.placeNumber(idx, val, false);
  });
  onChildChanged(dbRef(database, `rooms/${props.roomId}/pencilMarks`), (snapshot) => {
    const idx = parseInt(snapshot.key!, 10);
    const val = snapshot.val();
    sudoku.placePencilMarks(idx, val);
    renderTrigger.value++;
  });
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

    if (!pencil) {
      set(dbRef(database, `rooms/${props.roomId}/board/${idx}`), num);
    } else {
      set(dbRef(database, `rooms/${props.roomId}/pencilMarks/${idx}`), sudoku.pencilMarks[idx]);
    }
  }
}

function removeNumber() {
  const idx = selectedCell.value;
  if (sudoku.removeNumber(idx)) {
    renderTrigger.value++;

    set(dbRef(database, `rooms/${props.roomId}/board/${idx}`), 0);
    set(dbRef(database, `rooms/${props.roomId}/pencilMarks/${idx}`), 0);
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
