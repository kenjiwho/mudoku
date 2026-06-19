<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { generateRandomCode } from "../helper";
import { ref as dbRef, get } from "firebase/database";
import { database } from "@/firebase";

const router = useRouter();
const joinRoomId = ref("");
const playerId = ref("");
const username = ref("");

onMounted(() => {
  username.value = localStorage.getItem("username") || "Player";
  playerId.value = localStorage.getItem("playerId") || crypto.randomUUID();
});

function savePlayerData() {
  localStorage.setItem("username", username.value);
  localStorage.setItem("playerId", playerId.value);
}

async function createRoom() {
  let newRoomId = "";
  let unique = false;

  while (!unique) {
    newRoomId = generateRandomCode(6);
    const roomRef = dbRef(database, `rooms/${newRoomId}`);
    const snapshot = await get(roomRef);
    unique = !snapshot.exists();
  }

  savePlayerData();

  router.push({
    name: "room",
    params: { roomId: newRoomId },
  });
}

function joinRoom() {
  if (joinRoomId.value.trim() === "") return;
  const cleanedId = joinRoomId.value.trim();

  if (!/^[A-Za-z0-9]{6}$/.test(cleanedId)) return;

  savePlayerData();

  router.push({
    name: "room",
    params: { roomId: cleanedId },
  });
}
</script>

<template>
  <div class="flex flex-col items-center p-6 space-y-8 w-full max-w-md">
    <div class="text-center">
      <h1 class="text-5xl font-black mb-2 tracking-tight text-blue-600 dark:text-blue-500">
        Mudoku
      </h1>
    </div>

    <div class="w-full flex items-center space-x-4">
      <div class="text-lg font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
        Username
      </div>

      <input
        v-model="username"
        type="text"
        placeholder="Enter your username"
        class="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-transparent focus:border-blue-500 focus:outline-none transition-colors"
      />
    </div>

    <button
      @click="createRoom"
      class="w-full py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-transform active:scale-95"
    >
      Create New Room
    </button>

    <div class="w-full flex space-x-2">
      <input
        v-model="joinRoomId"
        @keyup.enter="joinRoom"
        type="text"
        placeholder="Enter Room Code"
        class="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-transparent focus:border-blue-500 focus:outline-none transition-colors"
        maxlength="6"
      />
      <button
        @click="joinRoom"
        class="px-6 py-3 font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 dark:text-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-transform active:scale-95"
      >
        Join
      </button>
    </div>
  </div>
</template>
