<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import BoardGrid from './Board.vue';
import Buttons from './Buttons.vue';
import Popup from './Popup.vue';
import { Board } from '@/sudoku/board';
import { generate, initSudokuEngine } from '@/sudoku/engine';
import { InputType, type Player } from './types';
import {
  ref as dbRef,
  get,
  set,
  onChildChanged,
  onDisconnect,
  remove,
  push,
  onValue,
  type ThenableReference,
  update,
} from 'firebase/database';
import { database } from '@/firebase';

const props = defineProps<{
  roomId: string;
}>();

const playerId = localStorage.getItem('playerId') || crypto.randomUUID();
const username = localStorage.getItem('username') || 'Player';

const roomPath = `rooms/${props.roomId}`;
const isLoaded = ref(false);
const board = ref([0]);
const mistakes = ref(new Set<number>());
const pencilMarks = ref([0]);
let sudoku: Board;
const selectedCell = ref(-1);
const pencil = ref(false);
const renderTrigger = ref(0);
const playersList = ref<Record<string, Player>>({});
const showWinPopup = ref(false);

let activeConnectionRef: ThenableReference;

let unsubscribeBoard: () => void;
let unsubscribePencilMarks: () => void;
let unsubscribePlayers: () => void;
let unsubscribeConnection: () => void;

onMounted(async () => {
  await initSudokuEngine();

  const roomRef = dbRef(database, roomPath);
  const snapshot = await get(roomRef);

  if (snapshot.exists() && snapshot.hasChild('initialBoard')) {
    // room and board exists, downloda board state
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
    // room or board does not exist, generate new board
    const initialBoardData = generate();
    board.value = [...initialBoardData];
    sudoku = new Board(board.value);

    await update(roomRef, {
      initialBoard: initialBoardData,
      board: initialBoardData,
      pencilMarks: sudoku.pencilMarks,
    });
  }
  mistakes.value = sudoku.mistakes;
  pencilMarks.value = sudoku.pencilMarks;
  isLoaded.value = true;

  const playerRef = dbRef(database, roomPath + `/players/${playerId}`);
  const allPlayersRef = dbRef(database, roomPath + `/players`);
  const connectedRef = dbRef(database, '.info/connected');
  // on connection
  unsubscribeConnection = onValue(connectedRef, (snapshot) => {
    if (snapshot.val()) {
      const con = push(playerRef);
      activeConnectionRef = con;
      // callback to remove player data on disconnect
      onDisconnect(con).remove();
      // add player data
      set(con, { username: username, joined: Date.now() });
    }
  });

  // LIVE SYNC between players
  unsubscribeBoard = onChildChanged(dbRef(database, roomPath + '/board'), (snap) => {
    const idx = parseInt(snap.key!, 10);
    const val = snap.val();
    // check if the value already exists in the board, if not, update it
    if (val !== sudoku.board[idx]) {
      placeNumber(idx, val, false);
    }
  });
  unsubscribePencilMarks = onChildChanged(dbRef(database, roomPath + '/pencilMarks'), (snap) => {
    const idx = parseInt(snap.key!, 10);
    const val = snap.val();
    // check if the value already exists in the pencil marks, if not, update it
    if (val !== sudoku.pencilMarks[idx]) {
      sudoku.placePencilMarks(idx, val);
      renderTrigger.value++;
    }
  });
  // keep track of player data
  unsubscribePlayers = onValue(allPlayersRef, (snap) => {
    // if player data changes, update the players list with new data
    if (snap.exists()) {
      const rawPlayers = snap.val();
      const newPlayersList: Record<string, Player> = {};
      for (const uuid in rawPlayers) {
        const connections = rawPlayers[uuid];
        // list of all active connections for this player
        const allPlayerData = Object.values(connections) as any[];
        // get the latest player data (last connection in the list)
        const latestPlayerData = allPlayerData[allPlayerData.length - 1] as Player;
        newPlayersList[uuid] = latestPlayerData as Player;
      }
      playersList.value = newPlayersList;
    } else {
      playersList.value = {};
    }
  });
});

// on leave without disconnect (back button)
onUnmounted(() => {
  if (activeConnectionRef) {
    // cancel server-side disconnect
    onDisconnect(activeConnectionRef).cancel();
    // remove connection from the database
    remove(activeConnectionRef);
  }
  if (unsubscribeBoard) unsubscribeBoard();
  if (unsubscribePencilMarks) unsubscribePencilMarks();
  if (unsubscribePlayers) unsubscribePlayers();
  if (unsubscribeConnection) unsubscribeConnection();
});

watch(renderTrigger, () => {
  if (sudoku.solved()) {
    showWinPopup.value = true;
  }
});

function cellClick(idx: number) {
  selectedCell.value = idx;
  // update selectedCell in player data
  if (activeConnectionRef) {
    update(activeConnectionRef, { selectedCell: idx });
  }
}

function onInput(input: InputType, payload: any) {
  let idx: number;
  switch (input) {
    case InputType.PLACE:
      // cell insertion
      idx = selectedCell.value;
      const num = payload;
      placeNumber(idx, num, pencil.value);
      if (!pencil.value) {
        set(dbRef(database, roomPath + `/board/${idx}`), num);
      } else {
        set(dbRef(database, roomPath + `/pencilMarks/${idx}`), sudoku.pencilMarks[idx]);
      }
      break;
    case InputType.REMOVE:
      // cell deletion
      idx = selectedCell.value;
      placeNumber(idx, 0, false);
      set(dbRef(database, roomPath + `/board/${idx}`), 0);
      set(dbRef(database, roomPath + `/pencilMarks/${idx}`), 0);
      break;
    // move selection with arrows
    case InputType.UP:
      cellClick(selectedCell.value - 9);
      break;
    case InputType.DOWN:
      cellClick(selectedCell.value + 9);
      break;
    case InputType.LEFT:
      cellClick(selectedCell.value - 1);
      break;
    case InputType.RIGHT:
      cellClick(selectedCell.value + 1);
      break;
    case InputType.PENCIL:
      pencil.value = payload;
      break;
    default:
      break;
  }
}

function placeNumber(idx: number, num: number, pencil: boolean) {
  if (sudoku.placeNumber(idx, num, pencil)) {
    renderTrigger.value++;
  }
}

function popupCallback() {
  showWinPopup.value = false;
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
      :player-id="playerId"
      :players-list="playersList"
      @cell-click="cellClick"
      @on-input="onInput"
    />
    <Buttons :pencil @on-input="onInput" />
  </div>

  <Popup
    title="🎉"
    subtitle="The board is solved!"
    button-text="👍"
    :show-win-popup="showWinPopup"
    :callback="popupCallback"
  />
</template>

<style></style>
