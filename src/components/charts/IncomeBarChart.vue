<template>
  <div class="w-full h-80">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

const chartData = computed(() => {
  const labels = props.data.map((item) => item.month || item.label || '')
  const values = props.data.map((item) => item.value || item.amount || 0)

  return {
    labels,
    datasets: [
      {
        label: '月度收入',
        data: values,
        backgroundColor: (context) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) {
            return 'rgba(20, 184, 166, 0.7)'
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
          gradient.addColorStop(0, 'rgba(20, 184, 166, 0.2)')
          gradient.addColorStop(1, 'rgba(20, 184, 166, 0.9)')
          return gradient
        },
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(20, 184, 166, 1)'
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
          const value = context.parsed.y
          return ` 收入: ¥${value.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: isDark.value ? '#94a3b8' : '#64748b',
        font: {
          size: 12
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: isDark.value ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'
      },
      ticks: {
        color: isDark.value ? '#94a3b8' : '#64748b',
        font: {
          size: 12
        },
        callback: (value) => `¥${value.toLocaleString()}`
      }
    }
  }
}))
</script>
