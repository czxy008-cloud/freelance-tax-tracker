<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          收入管理
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          记录和管理您的收入明细
        </p>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton variant="secondary" @click="handleImportCsv" :loading="importing">
          <template #icon>
            <ArrowDownTrayIcon class="w-4 h-4" />
          </template>
          导入CSV
        </BaseButton>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon>
            <PlusIcon class="w-4 h-4" />
          </template>
          添加收入
        </BaseButton>
      </div>
    </div>

    <BaseCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            开始日期
          </label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            结束日期
          </label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            分类
          </label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">全部分类</option>
            <option v-for="cat in incomeStore.categories" :key="cat.id || cat.name" :value="cat.id || cat.name">
              {{ cat.name || cat }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            搜索
          </label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="搜索付款方或备注..."
              class="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <BaseTable
        :columns="columns"
        :data="filteredIncomes"
        :loading="incomeStore.loading"
        :pagination="true"
        :page-size="10"
      >
        <template #date="{ row }">
          <span class="text-slate-700 dark:text-slate-200">{{ formatDate(row.date) }}</span>
        </template>

        <template #amount="{ row }">
          <span class="font-semibold text-slate-900 dark:text-white">
            {{ formatCurrency(row.amount, settingsStore.currency) }}
          </span>
        </template>

        <template #category="{ row }">
          <span
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            :style="{
              backgroundColor: getCategoryColor(row.category) + '20',
              color: getCategoryColor(row.category)
            }"
          >
            {{ getCategoryName(row.category) || '未分类' }}
          </span>
        </template>

        <template #payer="{ row }">
          <span class="text-slate-700 dark:text-slate-200">{{ row.payer || '-' }}</span>
        </template>

        <template #note="{ row }">
          <span class="text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">
            {{ row.note || '-' }}
          </span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-1">
            <button
              @click="openEditModal(row)"
              class="p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-400 dark:hover:bg-teal-900/30 transition-colors"
              title="编辑"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="handleDelete(row)"
              class="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              title="删除"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model:visible="modalVisible"
      :title="isEditing ? '编辑收入' : '添加收入'"
      size="md"
    >
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            金额 <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {{ settingsStore.currencySymbol }}
            </span>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              class="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            日期
          </label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            分类
          </label>
          <div class="relative">
            <select
              v-model="form.category"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in incomeStore.categories" :key="cat.id || cat.name" :value="cat.id || cat.name">
                {{ cat.name || cat }}
              </option>
            </select>
            <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div v-if="suggestedCategory && suggestedCategory !== form.category" class="mt-2">
            <button
              type="button"
              @click="applySuggestedCategory"
              class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1"
            >
              <LightBulbIcon class="w-4 h-4" />
              推荐分类：{{ suggestedCategory }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            付款方
          </label>
          <input
            v-model="form.payer"
            type="text"
            placeholder="例如：某某公司"
            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            备注
          </label>
          <textarea
            v-model="form.note"
            rows="3"
            placeholder="添加备注..."
            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <BaseButton variant="ghost" @click="modalVisible = false">
          取消
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="submitting">
          {{ isEditing ? '保存修改' : '确认添加' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model:visible="importResultVisible"
      title="CSV 导入结果"
      size="sm"
    >
      <div class="space-y-4">
        <div class="flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center"
            :class="importResult.failed === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'"
          >
            <CheckCircleIcon
              v-if="importResult.failed === 0"
              class="w-8 h-8 text-emerald-600 dark:text-emerald-400"
            />
            <ExclamationTriangleIcon
              v-else
              class="w-8 h-8 text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>
        <div class="text-center">
          <p class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ importResult.failed === 0 ? '导入成功' : '导入完成（部分失败）' }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {{ importResult.success }}
            </div>
            <div class="text-sm text-emerald-700 dark:text-emerald-300">成功条数</div>
          </div>
          <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {{ importResult.failed }}
            </div>
            <div class="text-sm text-red-700 dark:text-red-300">失败条数</div>
          </div>
        </div>
        <div v-if="importResult.errors && importResult.errors.length" class="mt-2">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">错误详情：</p>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
              v-for="(err, idx) in importResult.errors"
              :key="idx"
              class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
            >
              {{ err }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="primary" @click="importResultVisible = false">
          确定
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useIncomeStore } from '@/stores/income'
import { useSettingsStore } from '@/stores/settings'
import { fileApi } from '@/utils/ipc'
import { formatCurrency, formatDate } from '@/utils/formatters'

const incomeStore = useIncomeStore()
const settingsStore = useSettingsStore()

const modalVisible = ref(false)
const importResultVisible = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const importing = ref(false)

const filters = reactive({
  startDate: '',
  endDate: '',
  category: '',
  keyword: ''
})

const form = reactive({
  amount: null,
  date: '',
  category: '',
  payer: '',
  note: ''
})

const importResult = reactive({
  success: 0,
  failed: 0,
  errors: []
})

const categoryKeywordMap = {
  '软件开发': ['开发', '代码', '程序', '软件', '前端', '后端', '全栈', 'app', '网站', '系统', '编程', '技术'],
  '设计': ['设计', 'ui', 'ux', '视觉', '平面', '海报', 'logo', '界面', '原型', '美工'],
  '咨询': ['咨询', '顾问', '方案', '策划', '分析', '调研'],
  '写作': ['写作', '文章', '文案', '内容', '翻译', '编辑', '撰稿'],
  '培训': ['培训', '课程', '教学', '讲师', '授课', '辅导', '教育']
}

const defaultCategoryColors = [
  '#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ef4444'
]

const columns = [
  { key: 'date', label: '日期', width: '120px' },
  { key: 'amount', label: '金额', width: '140px' },
  { key: 'category', label: '分类', width: '100px' },
  { key: 'payer', label: '付款方' },
  { key: 'note', label: '备注' },
  { key: 'actions', label: '操作', width: '90px' }
]

const filteredIncomes = computed(() => {
  return incomeStore.incomes.filter((item) => {
    if (filters.startDate && item.date < filters.startDate) return false
    if (filters.endDate && item.date > filters.endDate) return false
    if (filters.category && item.category !== filters.category) return false
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      const payer = (item.payer || '').toLowerCase()
      const note = (item.note || '').toLowerCase()
      if (!payer.includes(kw) && !note.includes(kw)) return false
    }
    return true
  })
})

const suggestedCategory = computed(() => {
  const text = `${form.payer || ''} ${form.note || ''}`.toLowerCase()
  if (!text.trim()) return ''
  for (const [category, keywords] of Object.entries(categoryKeywordMap)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        return category
      }
    }
  }
  return ''
})

const getCategoryName = (category) => {
  if (!category) return ''
  const cat = incomeStore.categories.find(
    (c) => c === category || c.id === category || c.name === category
  )
  if (!cat) return category
  return typeof cat === 'object' ? (cat.name || category) : cat
}

const getCategoryColor = (category) => {
  if (!category) return '#64748b'
  const index = incomeStore.categories.findIndex(
    (cat) => cat === category || cat.id === category || cat.name === category
  )
  if (index !== -1) {
    const cat = incomeStore.categories[index]
    if (cat && cat.color) return cat.color
    return defaultCategoryColors[index % defaultCategoryColors.length]
  }
  return '#64748b'
}

const getTodayStr = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const resetForm = () => {
  form.amount = null
  form.date = getTodayStr()
  form.category = ''
  form.payer = ''
  form.note = ''
  isEditing.value = false
  editingId.value = null
}

const openAddModal = () => {
  resetForm()
  modalVisible.value = true
}

const openEditModal = (row) => {
  isEditing.value = true
  editingId.value = row.id
  form.amount = row.amount
  form.date = row.date
  form.category = row.category || ''
  form.payer = row.payer || ''
  form.note = row.note || ''
  modalVisible.value = true
}

const applySuggestedCategory = () => {
  if (suggestedCategory.value) {
    form.category = suggestedCategory.value
  }
}

const handleSubmit = async () => {
  if (!form.amount || form.amount <= 0) {
    alert('请输入有效的金额')
    return
  }
  submitting.value = true
  try {
    const data = {
      amount: Number(form.amount),
      date: form.date || getTodayStr(),
      category: form.category || null,
      payer: form.payer || null,
      note: form.note || null
    }
    if (isEditing.value) {
      await incomeStore.updateIncome(editingId.value, data)
    } else {
      await incomeStore.createIncome(data)
    }
    modalVisible.value = false
    resetForm()
  } catch (error) {
    console.error('保存收入失败:', error)
    alert('保存失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  if (!confirm(`确定要删除这笔 ${formatCurrency(row.amount, settingsStore.currency)} 的收入记录吗？`)) {
    return
  }
  try {
    await incomeStore.deleteIncome(row.id)
  } catch (error) {
    console.error('删除收入失败:', error)
    alert('删除失败：' + (error.message || '未知错误'))
  }
}

const handleImportCsv = async () => {
  importing.value = true
  try {
    const result = await fileApi.openDialog({
      title: '选择 CSV 文件',
      filters: [{ name: 'CSV 文件', extensions: ['csv'] }],
      properties: ['openFile']
    })
    if (!result || !result.filePaths || !result.filePaths.length) {
      return
    }
    const filePath = result.filePaths[0]
    const importRes = await incomeStore.importCsv(filePath)
    importResult.success = (importRes && importRes.success) || 0
    importResult.failed = (importRes && importRes.failed) || 0
    importResult.errors = (importRes && importRes.errors) || []
    importResultVisible.value = true
    await incomeStore.fetchIncomes()
  } catch (error) {
    console.error('导入 CSV 失败:', error)
    alert('导入失败：' + (error.message || '未知错误'))
  } finally {
    importing.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    incomeStore.fetchIncomes(),
    incomeStore.fetchCategories()
  ])
})
</script>
