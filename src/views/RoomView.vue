<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import Sudoku from "@/components/Sudoku/Sudoku.vue";

const route = useRoute();
const router = useRouter();

const roomId = route.params.roomId as string;

function leaveRoom() {
  router.push({ name: "home" });
}
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <div class="w-full max-w-125 flex justify-between items-center mb-4 px-4">
      <button
        @click="leaveRoom"
        class="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        ← Leave Room
      </button>
      <div
        class="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700"
      >
        Room: <span class="font-bold text-blue-500">{{ roomId }}</span>
      </div>
    </div>

    <Sudoku :room-id="roomId" />
  </div>
</template>
