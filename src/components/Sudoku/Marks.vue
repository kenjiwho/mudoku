<script setup lang="ts">
const props = defineProps<{
  marks: number;
}>();
</script>

<template>
  <div class="grid grid-cols-3 grid-rows-3 w-full h-full">
    <div
      v-for="digit in 9"
      :key="digit"
      class="text-[9px] sm:text-[12px] text-center text-slate-400 dark:text-slate-500"
    >
      <span
        v-if="(marks & (1 << digit)) !== 0"
      >
        {{ digit }}
      </span>
    </div>
  </div>
</template>

<style></style>
