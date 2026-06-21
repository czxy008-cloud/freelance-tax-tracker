<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">发票归档</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">管理您的发票文件，OCR 自动识别关键信息</p>
    </div>

    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索金额、日期、发票号、内容..."
          class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
      </div>
      <select
        v-model="selectedCategory"
        class="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
      >
        <option value="">全部分类</option>
        <option v-for="cat in invoiceStore.categories" :key="cat.id || cat.name" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
      <BaseButton variant="primary" @click="handleUploadClick">
        <template #icon>
          <ArrowUpTrayIcon class="w-5 h-5" />
        </template>
        上传发票
      </BaseButton>
    </div>

    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="handleUploadClick"
      :class="[
        'mb-8 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center',
        isDragging
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
          : 'border-slate-300 dark:border-slate-600 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-slate-800/50'
      ]"
    >
      <div class="flex flex-col items-center gap-3">
        <div
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-teal-100 dark:bg-teal-900/50' : 'bg-slate-100 dark:bg-slate-700'
          ]"
        >
          <CloudArrowUpIcon
            :class="[
              'w-8 h-8 transition-colors',
              isDragging ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
            ]"
          />
        </div>
        <div>
          <p class="text-base font-medium text-slate-900 dark:text-white">
            {{ isDragging ? '松开以上传' : '拖拽文件到此处，或点击选择' }}
          </p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            支持 PDF、JPG、JPEG、PNG 格式
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="uploadingInvoices.length > 0"
      class="mb-6 space-y-3"
    >
      <div
        v-for="item in uploadingInvoices"
        :key="item.tempId"
        class="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      >
        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <DocumentIcon v-if="item.type === 'pdf'" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <PhotoIcon v-else class="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ item.fileName }}</p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            {{ item.status === 'ocr' ? 'OCR 识别中...' : '上传中...' }}
          </p>
        </div>
        <div class="w-6 h-6 flex-shrink-0">
          <svg class="animate-spin w-6 h-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>

    <div
      v-if="filteredInvoices.length === 0"
      class="text-center py-16"
    >
      <InboxStackIcon class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
      <p class="text-lg font-medium text-slate-500 dark:text-slate-400">暂无发票</p>
      <p class="mt-1 text-sm text-slate-400 dark:text-slate-500">上传您的第一张发票开始管理</p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-200"
      >
        <div class="relative h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <template v-if="invoice.fileType === 'pdf'">
            <div class="w-full h-full flex items-center justify-center">
              <DocumentIcon class="w-16 h-16 text-slate-400" />
            </div>
          </template>
          <template v-else-if="invoice.thumbnail">
            <img :src="invoice.thumbnail" alt="" class="w-full h-full object-cover" />
          </template>
          <template v-else>
            <div class="w-full h-full flex items-center justify-center">
              <PhotoIcon class="w-16 h-16 text-slate-400" />
            </div>
          </template>

          <div class="absolute top-2 right-2">
            <span
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                invoice.ocrStatus === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                  : invoice.ocrStatus === 'processing'
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              ]"
            >
              {{ ocrStatusText(invoice.ocrStatus) }}
            </span>
          </div>

          <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              @click="openDetailModal(invoice)"
              class="p-2.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 transition-colors"
            >
              <EyeIcon class="w-5 h-5" />
            </button>
            <button
              @click="handleDeleteInvoice(invoice)"
              class="p-2.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white transition-colors"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-4">
          <p class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {{ formatCurrency(invoice.amount) }}
          </p>
          <div class="space-y-1 text-sm">
            <p class="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CalendarDaysIcon class="w-4 h-4" />
              {{ formatDate(invoice.invoiceDate) }}
            </p>
            <p v-if="invoice.invoiceNumber" class="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <HashtagIcon class="w-4 h-4" />
              {{ invoice.invoiceNumber }}
            </p>
          </div>
          <div v-if="invoice.category" class="mt-3">
            <span class="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
              {{ invoice.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <BaseModal v-model:visible="showDetailModal" title="发票详情" size="lg">
      <div v-if="currentInvoice" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900">
            <div class="aspect-[4/3] flex items-center justify-center">
              <template v-if="currentInvoice.fileType === 'pdf'">
                <DocumentIcon class="w-20 h-20 text-slate-400" />
              </template>
              <template v-else-if="currentInvoice.filePath">
                <img :src="'file://' + currentInvoice.filePath" alt="" class="w-full h-full object-contain" />
              </template>
              <template v-else>
                <PhotoIcon class="w-20 h-20 text-slate-400" />
              </template>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">金额</label>
              <input
                v-model.number="currentInvoice.amount"
                type="number"
                min="0"
                step="0.01"
                class="input-field text-lg font-semibold"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">日期</label>
              <input
                v-model="currentInvoice.invoiceDate"
                type="date"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">发票号</label>
              <input
                v-model="currentInvoice.invoiceNumber"
                type="text"
                class="input-field"
                placeholder="请输入发票号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">分类</label>
              <select
                v-model="currentInvoice.category"
                class="input-field"
              >
                <option value="">未分类</option>
                <option v-for="cat in invoiceStore.categories" :key="cat.id || cat.name" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">OCR 识别文本</label>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    currentInvoice.ocrStatus === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : currentInvoice.ocrStatus === 'processing'
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  ]"
                >
                  {{ ocrStatusText(currentInvoice.ocrStatus) }}
                </span>
              </div>
              <textarea
                v-model="currentInvoice.ocrText"
                rows="4"
                class="input-field text-xs font-mono resize-none"
                placeholder="暂无 OCR 识别文本"
                readonly
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showDetailModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="handleSaveInvoice">保存修改</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  InboxStackIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  HashtagIcon
} from '@heroicons/vue/24/outline'
import { useInvoiceStore } from '@/stores/invoice'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { invoiceApi, fileApi } from '@/utils/ipc'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const invoiceStore = useInvoiceStore()

const searchQuery = ref('')
const selectedCategory = ref('')
const isDragging = ref(false)
const uploadingInvoices = ref([])
const showDetailModal = ref(false)
const currentInvoice = ref(null)

const filteredInvoices = computed(() => {
  let list = invoiceStore.invoices

  if (selectedCategory.value) {
    list = list.filter(inv => inv.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(inv =>
      String(inv.amount || '').includes(q) ||
      String(inv.invoiceDate || '').includes(q) ||
      String(inv.invoiceNumber || '').toLowerCase().includes(q) ||
      String(inv.ocrText || '').toLowerCase().includes(q)
    )
  }

  return list
})

function ocrStatusText(status) {
  const map = {
    completed: '已识别',
    processing: '识别中',
    pending: '未识别',
    failed: '识别失败'
  }
  return map[status] || '未识别'
}

async function handleUploadClick() {
  try {
    const result = await fileApi.openDialog({
      filters: [
        { name: '发票文件', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
      ],
      properties: ['openFile', 'multiSelections']
    })

    if (result && !result.canceled && result.filePaths) {
      for (const filePath of result.filePaths) {
        await processFile(filePath)
      }
    }
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

async function handleDrop(event) {
  isDragging.value = false
  const files = event.dataTransfer.files
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      await processFile(file.path)
    }
  }
}

async function processFile(filePath) {
  const tempId = Date.now() + Math.random()
  const fileName = filePath.split(/[\\/]/).pop()
  const ext = fileName.split('.').pop()?.toLowerCase()
  const type = ext === 'pdf' ? 'pdf' : 'image'

  uploadingInvoices.value.push({
    tempId,
    fileName,
    type,
    filePath,
    status: 'ocr'
  })

  try {
    let ocrResult = null
    try {
      if (type === 'image') {
        ocrResult = await invoiceApi.ocr(filePath)
      }
    } catch (e) {
      console.warn('OCR 识别失败，继续上传:', e)
    }

    const uploadData = {
      filePath,
      fileName,
      fileType: type,
      amount: ocrResult?.amount || 0,
      invoiceDate: ocrResult?.invoiceDate || null,
      invoiceNumber: ocrResult?.invoiceNumber || '',
      ocrText: ocrResult?.text || '',
      ocrStatus: ocrResult ? 'completed' : 'pending',
      category: '',
      thumbnail: type === 'image' ? 'file://' + filePath : null
    }

    await invoiceStore.uploadInvoice(uploadData)
  } catch (error) {
    console.error('上传发票失败:', error)
  } finally {
    uploadingInvoices.value = uploadingInvoices.value.filter(item => item.tempId !== tempId)
  }
}

function openDetailModal(invoice) {
  currentInvoice.value = { ...invoice }
  showDetailModal.value = true
}

async function handleSaveInvoice() {
  if (!currentInvoice.value?.id) return

  try {
    const { id, ...data } = currentInvoice.value
    await invoiceApi.update(id, data)
    const index = invoiceStore.invoices.findIndex(inv => inv.id === id)
    if (index !== -1) {
      invoiceStore.invoices[index] = { ...invoiceStore.invoices[index], ...data }
    }
    showDetailModal.value = false
  } catch (error) {
    console.error('保存发票失败:', error)
  }
}

async function handleDeleteInvoice(invoice) {
  if (!invoice.id) return
  try {
    await invoiceStore.deleteInvoice(invoice.id)
  } catch (error) {
    console.error('删除发票失败:', error)
  }
}

onMounted(async () => {
  try {
    await invoiceStore.fetchInvoices()
    await invoiceStore.fetchCategories()
  } catch (e) {
    console.error('加载发票数据失败:', e)
  }
})
</script>
