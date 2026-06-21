<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-md">
    <div v-if="$slots.title" class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <slot name="title" />
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>
