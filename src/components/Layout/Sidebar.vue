<template>
  <aside class="w-60 h-screen bg-slate-900 dark:bg-slate-950 text-white flex flex-col fixed left-0 top-0 z-40 shadow-xl">
    <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
        <CalculatorIcon class="w-6 h-6 text-white" />
      </div>
      <div class="flex flex-col">
        <h1 class="text-lg font-bold tracking-wide">自由税务管家</h1>
        <span class="text-xs text-slate-400">Freelance Tax</span>
      </div>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 group"
        active-class="!bg-teal-500/20 !text-teal-400 border-l-2 border-teal-400"
        exact-active-class="!bg-teal-500/20 !text-teal-400 border-l-2 border-teal-400"
      >
        <component :is="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
        <span class="text-sm font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="px-3 py-4 border-t border-slate-700/50">
      <button
        @click="toggleTheme"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 group"
      >
        <SunIcon v-if="isDark" class="w-5 h-5 transition-transform group-hover:rotate-12" />
        <MoonIcon v-else class="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span class="text-sm font-medium">{{ isDark ? '浅色模式' : '深色模式' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  HomeIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const navItems = [
  { path: '/', label: '仪表板', icon: HomeIcon },
  { path: '/income', label: '收入管理', icon: BanknotesIcon },
  { path: '/tax', label: '税务计算', icon: CalculatorIcon },
  { path: '/invoices', label: '发票归档', icon: DocumentTextIcon },
  { path: '/settings', label: '系统设置', icon: Cog6ToothIcon }
]

const isDark = ref(true)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

watch(isDark, () => {
  applyTheme()
})

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
