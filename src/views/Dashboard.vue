<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          仪表板
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          查看您的税务和收入概况
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white/80">年度总收入</span>
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CurrencyDollarIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-bold">{{ formatCurrency(incomeStore.stats.total, settingsStore.currency) }}</span>
            <span class="flex items-center gap-1 text-sm font-medium text-emerald-100">
              <ArrowTrendingUpIcon class="w-4 h-4" />
              12.5%
            </span>
          </div>
          <p class="mt-2 text-sm text-white/70">较去年同期</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white/80">本月收入</span>
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-3xl font-bold">{{ formatCurrency(monthlyIncome, settingsStore.currency) }}</span>
          </div>
          <p class="mt-2 text-sm text-white/70">{{ currentMonth }}</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white/80">预估税额</span>
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalculatorIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4">
            <span class="text-3xl font-bold">{{ formatCurrency(estimatedTax, settingsStore.currency) }}</span>
          </div>
          <p class="mt-2 text-sm text-white/70">基于当前收入估算</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-white/80">发票数量</span>
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <DocumentTextIcon class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-bold">{{ invoiceStore.invoices.length }}</span>
            <span class="text-sm text-white/70">张</span>
          </div>
          <p class="mt-2 text-sm text-white/70">已上传发票总数</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <BaseCard class="md:col-span-2">
        <template #title>
          <div class="flex items-center gap-2">
            <ChartBarIcon class="w-5 h-5 text-teal-500" />
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">最近12个月收入</h2>
          </div>
        </template>
        <IncomeBarChart :data="incomeStore.stats.monthly || []" />
      </BaseCard>

      <BaseCard>
        <template #title>
          <div class="flex items-center gap-2">
            <ChartPieIcon class="w-5 h-5 text-teal-500" />
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">收入分类</h2>
          </div>
        </template>
        <CategoryPieChart :data="pieChartData" />
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <BaseCard class="lg:col-span-2">
        <template #title>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-5 h-5 text-teal-500" />
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">最近收入记录</h2>
            </div>
            <button
              @click="$router.push('/income')"
              class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
            >
              查看全部
            </button>
          </div>
        </template>
        <div v-if="recentIncomes.length" class="divide-y divide-slate-100 dark:divide-slate-700">
          <div
            v-for="item in recentIncomes"
            :key="item.id"
            class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :style="{ backgroundColor: (getCategoryColor(item.category) || '#94a3b8') + '20' }"
              >
                <BanknotesIcon class="w-5 h-5" :style="{ color: getCategoryColor(item.category) || '#94a3b8' }" />
              </div>
              <div>
                <div class="font-medium text-slate-900 dark:text-white">
                  {{ item.payer || '未命名收入' }}
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-400">
                  {{ formatDate(item.date) }} · {{ item.category || '未分类' }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-slate-900 dark:text-white">
                {{ formatCurrency(item.amount, settingsStore.currency) }}
              </div>
              <div v-if="item.note" class="text-sm text-slate-400 truncate max-w-[180px]">
                {{ item.note }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-12 text-center text-slate-400 dark:text-slate-500">
          <InboxIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无收入记录</p>
        </div>
      </BaseCard>

      <BaseCard>
        <template #title>
          <div class="flex items-center gap-2">
            <BoltIcon class="w-5 h-5 text-teal-500" />
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">快捷操作</h2>
          </div>
        </template>
        <div class="space-y-3">
          <button
            @click="$router.push('/income')"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
              <PlusIcon class="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
            </div>
            <div class="text-left flex-1">
              <div class="font-medium text-slate-900 dark:text-white">添加收入</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">记录一笔新的收入</div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-slate-400" />
          </button>

          <button
            @click="$router.push('/tax')"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
              <CalculatorIcon class="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors" />
            </div>
            <div class="text-left flex-1">
              <div class="font-medium text-slate-900 dark:text-white">税务计算</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">计算预估税款</div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-slate-400" />
          </button>

          <button
            @click="$router.push('/invoices')"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
              <ArrowUpTrayIcon class="w-5 h-5 text-rose-600 dark:text-rose-400 group-hover:text-white transition-colors" />
            </div>
            <div class="text-left flex-1">
              <div class="font-medium text-slate-900 dark:text-white">上传发票</div>
              <div class="text-sm text-slate-500 dark:text-slate-400">OCR 识别发票信息</div>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  BanknotesIcon,
  InboxIcon,
  BoltIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import BaseCard from '@/components/common/BaseCard.vue'
import IncomeBarChart from '@/components/charts/IncomeBarChart.vue'
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue'
import { useIncomeStore } from '@/stores/income'
import { useInvoiceStore } from '@/stores/invoice'
import { useTaxStore } from '@/stores/tax'
import { useSettingsStore } from '@/stores/settings'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { calculateTax } from '@/utils/taxCalculator'

const incomeStore = useIncomeStore()
const invoiceStore = useInvoiceStore()
const taxStore = useTaxStore()
const settingsStore = useSettingsStore()

const loading = ref(false)

const currentMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

const monthlyIncome = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  return incomeStore.incomes
    .filter((item) => {
      const d = new Date(item.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .reduce((sum, item) => sum + (item.amount || 0), 0)
})

const estimatedTax = computed(() => {
  const total = incomeStore.stats.total || 0
  const socialInsurance = settingsStore.socialInsuranceBase * settingsStore.socialInsuranceRate
  const result = calculateTax(total, taxStore.rates, taxStore.deductions, socialInsurance)
  return result.tax || 0
})

const recentIncomes = computed(() => {
  return [...incomeStore.incomes]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const pieChartData = computed(() => {
  const byCategory = incomeStore.stats.byCategory || []
  const defaultColors = [
    '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]
  return byCategory.map((item, index) => ({
    name: item.name || item.category || '未分类',
    value: item.value || item.amount || 0,
    color: item.color || defaultColors[index % defaultColors.length]
  }))
})

const categoryColorMap = {
  '软件开发': '#14b8a6',
  '设计': '#3b82f6',
  '咨询': '#f59e0b',
  '写作': '#8b5cf6',
  '培训': '#ec4899',
  '其他': '#64748b'
}

const getCategoryColor = (category) => {
  const pieItem = pieChartData.value.find((item) => item.name === category)
  if (pieItem && pieItem.color) return pieItem.color
  return categoryColorMap[category] || '#64748b'
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      incomeStore.fetchStats(),
      incomeStore.fetchIncomes(),
      invoiceStore.fetchInvoices(),
      taxStore.fetchRates(settingsStore.region),
      taxStore.fetchDeductions()
    ])
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
