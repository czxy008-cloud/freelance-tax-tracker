<template>
  <div class="w-full overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width } : {}"
              class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          <template v-if="!loading && data.length">
            <tr
              v-for="(row, rowIndex) in paginatedData"
              :key="rowIndex"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
              :class="rowIndex % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200"
              >
                <slot
                  v-if="$slots[col.key]"
                  :name="col.key"
                  :row="row"
                  :rowIndex="rowIndex"
                />
                <template v-else-if="col.render">
                  {{ col.render(row) }}
                </template>
                <template v-else>
                  {{ row[col.key] }}
                </template>
              </td>
            </tr>
          </template>
          <tr v-else-if="!loading && !data.length">
            <td
              :colspan="columns.length"
              class="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
            >
              <div class="flex flex-col items-center gap-2">
                <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>暂无数据</span>
              </div>
            </td>
          </tr>
          <tr v-else>
            <td
              :colspan="columns.length"
              class="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>加载中...</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="pagination && data.length && !loading"
      class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
    >
      <div class="text-sm text-slate-600 dark:text-slate-300">
        共 {{ totalPages }} 页，{{ data.length }} 条记录
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        <template v-for="page in displayPages" :key="page">
          <button
            v-if="page !== '...'"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              page === currentPage
                ? 'bg-teal-500 text-white'
                : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 text-slate-400">...</span>
        </template>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.data.length / props.pageSize) || 1
})

const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (current < total - 2) {
      pages.push('...')
    }
    pages.push(total)
  }

  return pages
})

const paginatedData = computed(() => {
  if (!props.pagination) return props.data
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return props.data.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(
  () => props.data,
  () => {
    currentPage.value = 1
  }
)
</script>
