<script setup lang="ts">
const props = defineProps<{
  marks: number;
}>();
</script>

<template>
  <div class="grid grid-cols-3 grid-rows-3 w-full h-full select-none">
    <div
      v-for="digit in 9"
      :key="digit"
      class="w-full h-full text-center text-[9px] sm:text-[11px] font-normal leading-none"
    >
      <span
        v-if="(marks & (1 << digit)) !== 0"
        class="text-slate-400 dark:text-slate-500 block w-full h-full"
      >
        {{ digit }}
      </span>
    </div>
  </div>
</template>

<style></style>
