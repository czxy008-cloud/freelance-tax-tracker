<template>
  <div class="flex h-screen w-full" :class="{ dark: isDark }">
    <Sidebar />
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import Sidebar from '@/components/Layout/Sidebar.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.isDark)

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>
