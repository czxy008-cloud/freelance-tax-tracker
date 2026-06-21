<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <Sidebar />
    <main class="flex-1 ml-60 min-h-screen">
      <div class="px-6 py-6 md:px-8 lg:px-10">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
</script>
