<template>
  <div class="w-full h-80 relative">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center">
        <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">总收入</div>
        <div class="text-2xl font-bold text-slate-800 dark:text-white">¥{{ total.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const isDark = ref(document.documentElement.classList.contains('dark'))

const handleThemeChange = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

let observer = null

onMounted(() => {
  observer = new MutationObserver(handleThemeChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

const total = computed(() => {
  return props.data.reduce((sum, item) => sum + (item.value || 0), 0)
})

const chartData = computed(() => {
  const labels = props.data.map((item) => item.name || item.label || '')
  const values = props.data.map((item) => item.value || 0)
  const colors = props.data.map((item) => item.color)

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: isDark.value ? '#1e293b' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: isDark.value ? '#e2e8f0' : '#334155',
        font: {
          size: 13
        },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: isDark.value ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      titleColor: isDark.value ? '#e2e8f0' : '#0f172a',
      bodyColor: isDark.value ? '#cbd5e1' : '#334155',
      borderColor: isDark.value ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 0.8)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const value = context.parsed
          const percentage = (value / total.value) * 100
          return ` ${context.label}: ¥${value.toLocaleString()} (${percentage.toFixed(1)}%)`
        }
      }
    }
  }
}))
</script>
