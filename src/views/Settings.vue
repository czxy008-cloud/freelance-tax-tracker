<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        设置
      </h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">
        个性化您的税务追踪体验
      </p>
    </div>

    <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
      <nav class="flex gap-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200',
            activeTab === tab.key
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          ]"
        >
          <component :is="tab.icon" class="inline-block w-4 h-4 mr-2" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div v-show="activeTab === 'preferences'">
      <BaseCard>
        <template #title>
          <div class="flex items-center gap-2">
            <SwatchIcon class="w-5 h-5 text-teal-500" />
            <span class="text-slate-900 dark:text-white">主题选择</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            v-for="theme in themes"
            :key="theme.value"
            @click="selectTheme(theme.value)"
            :class="[
              'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
              settingsStore.theme === theme.value
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <div class="flex items-center justify-between mb-3">
              <component :is="theme.icon" :class="['w-8 h-8', settingsStore.theme === theme.value ? 'text-teal-500' : 'text-slate-400 dark:text-slate-500']" />
              <div
                v-if="settingsStore.theme === theme.value"
                class="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
              >
                <CheckIcon class="w-3 h-3 text-white" />
              </div>
            </div>
            <p :class="['font-medium', settingsStore.theme === theme.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-white']">
              {{ theme.label }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ theme.description }}
            </p>
          </button>
        </div>
      </BaseCard>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <CurrencyDollarIcon class="w-5 h-5 text-teal-500" />
              <span class="text-slate-900 dark:text-white">货币单位</span>
            </div>
          </template>
          <select
            v-model="preferencesForm.currency"
            @change="savePreferences"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
          >
            <option value="CNY">人民币 (CNY) ¥</option>
            <option value="USD">美元 (USD) $</option>
            <option value="EUR">欧元 (EUR) €</option>
            <option value="HKD">港币 (HKD) HK$</option>
            <option value="JPY">日元 (JPY) ¥</option>
          </select>
        </BaseCard>

        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <GlobeAltIcon class="w-5 h-5 text-teal-500" />
              <span class="text-slate-900 dark:text-white">地区选择</span>
            </div>
          </template>
          <select
            v-model="preferencesForm.region"
            @change="savePreferences"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
          >
            <option value="CN">中国大陆</option>
            <option value="HK">中国香港</option>
            <option value="US">美国</option>
            <option value="JP">日本</option>
            <option value="EU">欧盟</option>
          </select>
        </BaseCard>
      </div>

      <BaseCard class="mt-6">
        <template #title>
          <div class="flex items-center gap-2">
            <CloudArrowDownIcon class="w-5 h-5 text-teal-500" />
            <span class="text-slate-900 dark:text-white">自动保存</span>
          </div>
        </template>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">自动保存设置</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">修改设置后自动保存到本地</p>
          </div>
          <button
            @click="toggleAutoSave"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
              autoSave ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow',
                autoSave ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </BaseCard>

      <div v-if="saveMessage" :class="['mt-4 p-3 rounded-lg text-sm', saveMessageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400']">
        {{ saveMessage }}
      </div>
    </div>

    <div v-show="activeTab === 'tax'">
      <BaseCard>
        <template #title>
          <div class="flex items-center gap-2">
            <CalculatorIcon class="w-5 h-5 text-teal-500" />
            <span class="text-slate-900 dark:text-white">累进税率表</span>
          </div>
        </template>
        <template #actions>
          <BaseButton size="sm" @click="addTaxRate">
            <template #icon>
              <PlusIcon class="w-4 h-4" />
            </template>
            添加税率级别
          </BaseButton>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">级数</th>
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">下限</th>
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">上限</th>
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">税率(%)</th>
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">速算扣除数</th>
                <th class="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(rate, index) in taxRates"
                :key="index"
                class="border-b border-slate-100 dark:border-slate-700/50"
              >
                <td class="py-2 px-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-2 px-2">
                  <input
                    v-model.number="rate.min"
                    type="number"
                    class="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200"
                    placeholder="0"
                  />
                </td>
                <td class="py-2 px-2">
                  <input
                    v-model.number="rate.max"
                    type="number"
                    class="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200"
                    placeholder="留空表示无上限"
                  />
                </td>
                <td class="py-2 px-2">
                  <div class="flex items-center gap-1">
                    <input
                      v-model.number="rate.ratePercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      class="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200"
                      placeholder="0"
                    />
                    <span class="text-slate-500 dark:text-slate-400 text-sm">%</span>
                  </div>
                </td>
                <td class="py-2 px-2">
                  <input
                    v-model.number="rate.deduction"
                    type="number"
                    class="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-200"
                    placeholder="0"
                  />
                </td>
                <td class="py-2 px-2">
                  <button
                    @click="removeTaxRate(index)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    :disabled="taxRates.length <= 1"
                    :class="{ 'opacity-50 cursor-not-allowed': taxRates.length <= 1 }"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            当前地区：{{ currentRegionLabel }}
          </p>
          <div class="flex items-center gap-3">
            <span v-if="taxSaveMessage" :class="['text-sm', taxSaveMessageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
              {{ taxSaveMessage }}
            </span>
            <BaseButton @click="saveTaxRates" :loading="savingTaxRates">
              <template #icon>
                <CheckIcon class="w-4 h-4" />
              </template>
              保存税率表
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-show="activeTab === 'data'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <ArrowDownTrayIcon class="w-5 h-5 text-teal-500" />
              <span class="text-slate-900 dark:text-white">数据备份</span>
            </div>
          </template>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            导出完整的数据库备份文件，包含所有收入、发票和设置数据。
          </p>
          <BaseButton @click="exportDatabase" :loading="exportingDatabase">
            <template #icon>
              <ArrowDownTrayIcon class="w-4 h-4" />
            </template>
            导出数据库备份
          </BaseButton>
        </BaseCard>

        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <ArrowUpTrayIcon class="w-5 h-5 text-teal-500" />
              <span class="text-slate-900 dark:text-white">数据恢复</span>
            </div>
          </template>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            从备份文件恢复数据，将覆盖当前所有数据。
          </p>
          <BaseButton variant="secondary" @click="importDatabase" :loading="importingDatabase">
            <template #icon>
              <ArrowUpTrayIcon class="w-4 h-4" />
            </template>
            导入数据库备份
          </BaseButton>
        </BaseCard>

        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <DocumentArrowDownIcon class="w-5 h-5 text-teal-500" />
              <span class="text-slate-900 dark:text-white">数据导出</span>
            </div>
          </template>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            将所有数据导出为 JSON 格式，便于查看和迁移。
          </p>
          <BaseButton variant="secondary" @click="exportJsonData" :loading="exportingJson">
            <template #icon>
              <DocumentArrowDownIcon class="w-4 h-4" />
            </template>
            导出所有数据为JSON
          </BaseButton>
        </BaseCard>
      </div>

      <div class="mt-6 border-2 border-red-200 dark:border-red-900/50 rounded-xl p-6 bg-red-50/50 dark:bg-red-900/10">
        <div class="flex items-center gap-2 mb-3">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-500" />
          <span class="font-semibold text-red-700 dark:text-red-400">危险操作</span>
        </div>
        <p class="text-sm text-red-600 dark:text-red-400 mb-4">
          此操作将永久删除所有数据，包括收入记录、发票和设置，且无法恢复。请谨慎操作。
        </p>
        <BaseButton variant="danger" @click="showClearConfirm = true">
          <template #icon>
            <TrashIcon class="w-4 h-4" />
          </template>
          清空所有数据
        </BaseButton>
      </div>

      <div v-if="dataMessage" :class="['mt-4 p-3 rounded-lg text-sm', dataMessageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400']">
        {{ dataMessage }}
      </div>
    </div>

    <BaseModal v-model:visible="showClearConfirm" title="确认清空数据" size="sm">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p class="text-slate-900 dark:text-white font-medium">确定要清空所有数据吗？</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            此操作将删除所有收入记录、发票数据和设置，且无法撤销。建议先导出备份。
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="showClearConfirm = false">
          取消
        </BaseButton>
        <BaseButton variant="danger" @click="clearAllData" :loading="clearingData">
          确认清空
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useTaxStore } from '@/stores/tax'
import { settingsApi, taxApi, fileApi, incomeApi, invoiceApi } from '@/utils/ipc'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  SwatchIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CloudArrowDownIcon,
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const settingsStore = useSettingsStore()
const taxStore = useTaxStore()

const activeTab = ref('preferences')
const autoSave = ref(true)
const saveMessage = ref('')
const saveMessageType = ref('success')

const exportingDatabase = ref(false)
const importingDatabase = ref(false)
const exportingJson = ref(false)
const clearingData = ref(false)
const showClearConfirm = ref(false)
const dataMessage = ref('')
const dataMessageType = ref('success')

const savingTaxRates = ref(false)
const taxSaveMessage = ref('')
const taxSaveMessageType = ref('success')

const tabs = [
  { key: 'preferences', label: '偏好设置', icon: SwatchIcon },
  { key: 'tax', label: '税率配置', icon: CalculatorIcon },
  { key: 'data', label: '数据管理', icon: ArrowDownTrayIcon }
]

const themes = [
  { value: 'light', label: '浅色模式', description: '明亮清爽的界面', icon: SunIcon },
  { value: 'dark', label: '深色模式', description: '护眼的深色主题', icon: MoonIcon },
  { value: 'system', label: '跟随系统', description: '自动匹配系统设置', icon: ComputerDesktopIcon }
]

const defaultChinaTaxRates = [
  { min: 0, max: 36000, ratePercent: 3, deduction: 0 },
  { min: 36000, max: 144000, ratePercent: 10, deduction: 2520 },
  { min: 144000, max: 300000, ratePercent: 20, deduction: 16920 },
  { min: 300000, max: 420000, ratePercent: 25, deduction: 31920 },
  { min: 420000, max: 660000, ratePercent: 30, deduction: 52920 },
  { min: 660000, max: 960000, ratePercent: 35, deduction: 85920 },
  { min: 960000, max: null, ratePercent: 45, deduction: 181920 }
]

const preferencesForm = reactive({
  currency: 'CNY',
  region: 'CN'
})

const taxRates = ref([])

const currentRegionLabel = computed(() => {
  const regions = {
    CN: '中国大陆',
    HK: '中国香港',
    US: '美国',
    JP: '日本',
    EU: '欧盟'
  }
  return regions[preferencesForm.region] || '中国大陆'
})

const showSaveMessage = (message, type = 'success') => {
  saveMessage.value = message
  saveMessageType.value = type
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}

const showTaxSaveMessage = (message, type = 'success') => {
  taxSaveMessage.value = message
  taxSaveMessageType.value = type
  setTimeout(() => {
    taxSaveMessage.value = ''
  }, 3000)
}

const showDataMessage = (message, type = 'success') => {
  dataMessage.value = message
  dataMessageType.value = type
  setTimeout(() => {
    dataMessage.value = ''
  }, 3000)
}

const applySystemTheme = () => {
  if (settingsStore.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

const selectTheme = async (theme) => {
  try {
    if (theme === 'system') {
      settingsStore.theme = 'system'
      applySystemTheme()
    } else {
      await settingsStore.saveSettings({ theme })
    }
    if (autoSave.value) {
      showSaveMessage('主题设置已保存', 'success')
    }
  } catch (error) {
    showSaveMessage('保存失败：' + error.message, 'error')
  }
}

const toggleAutoSave = () => {
  autoSave.value = !autoSave.value
}

const savePreferences = async () => {
  if (!autoSave.value) return
  try {
    await settingsStore.saveSettings({
      currency: preferencesForm.currency,
      region: preferencesForm.region
    })
    showSaveMessage('设置已自动保存', 'success')
  } catch (error) {
    showSaveMessage('保存失败：' + error.message, 'error')
  }
}

const addTaxRate = () => {
  const lastRate = taxRates.value[taxRates.value.length - 1]
  const newMin = lastRate ? (lastRate.max || lastRate.min + 1) : 0
  taxRates.value.push({
    min: newMin,
    max: null,
    ratePercent: 0,
    deduction: 0
  })
}

const removeTaxRate = (index) => {
  if (taxRates.value.length <= 1) return
  taxRates.value.splice(index, 1)
}

const saveTaxRates = async () => {
  savingTaxRates.value = true
  try {
    const rates = taxRates.value.map(r => ({
      min: r.min || 0,
      max: r.max || null,
      rate: (r.ratePercent || 0) / 100,
      deduction: r.deduction || 0
    }))
    await taxStore.saveRates(preferencesForm.region, rates)
    showTaxSaveMessage('税率表保存成功', 'success')
  } catch (error) {
    showTaxSaveMessage('保存失败：' + error.message, 'error')
  } finally {
    savingTaxRates.value = false
  }
}

const loadTaxRates = async () => {
  try {
    const rates = await taxStore.fetchRates(preferencesForm.region)
    if (rates && rates.length > 0) {
      taxRates.value = rates.map(r => ({
        min: r.min,
        max: r.max,
        ratePercent: Math.round((r.rate || 0) * 100 * 100) / 100,
        deduction: r.deduction || 0
      }))
    } else {
      taxRates.value = JSON.parse(JSON.stringify(defaultChinaTaxRates))
    }
  } catch (error) {
    taxRates.value = JSON.parse(JSON.stringify(defaultChinaTaxRates))
  }
}

const exportDatabase = async () => {
  exportingDatabase.value = true
  try {
    const result = await settingsApi.exportDatabase()
    if (result && result.success !== false) {
      showDataMessage('数据库备份导出成功', 'success')
    } else {
      showDataMessage('导出失败', 'error')
    }
  } catch (error) {
    showDataMessage('导出失败：' + error.message, 'error')
  } finally {
    exportingDatabase.value = false
  }
}

const importDatabase = async () => {
  importingDatabase.value = true
  try {
    const dialogResult = await fileApi.openDialog({
      title: '选择数据库备份文件',
      filters: [{ name: '数据库文件', extensions: ['db', 'sqlite', 'sqlite3'] }],
      properties: ['openFile']
    })
    if (dialogResult && !dialogResult.canceled && dialogResult.filePaths && dialogResult.filePaths.length > 0) {
      const result = await settingsApi.importDatabase(dialogResult.filePaths[0])
      if (result && result.success !== false) {
        showDataMessage('数据恢复成功', 'success')
      } else {
        showDataMessage('恢复失败', 'error')
      }
    }
  } catch (error) {
    showDataMessage('恢复失败：' + error.message, 'error')
  } finally {
    importingDatabase.value = false
  }
}

const exportJsonData = async () => {
  exportingJson.value = true
  try {
    const [incomes, invoices, settings, rates] = await Promise.all([
      incomeApi.list({}).catch(() => []),
      invoiceApi.list({}).catch(() => []),
      settingsApi.get().catch(() => null),
      taxApi.getRates(preferencesForm.region).catch(() => [])
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data: {
        incomes,
        invoices,
        settings,
        taxRates: rates
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freelance-tax-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showDataMessage('JSON 数据导出成功', 'success')
  } catch (error) {
    showDataMessage('导出失败：' + error.message, 'error')
  } finally {
    exportingJson.value = false
  }
}

const clearAllData = async () => {
  clearingData.value = true
  try {
    const incomes = await incomeApi.list({}).catch(() => [])
    const invoices = await invoiceApi.list({}).catch(() => [])

    for (const income of incomes) {
      if (income.id) await incomeApi.delete(income.id).catch(() => {})
    }
    for (const invoice of invoices) {
      if (invoice.id) await invoiceApi.delete(invoice.id).catch(() => {})
    }

    showClearConfirm.value = false
    showDataMessage('所有数据已清空', 'success')
  } catch (error) {
    showDataMessage('清空失败：' + error.message, 'error')
  } finally {
    clearingData.value = false
  }
}

watch(() => settingsStore.theme, () => {
  if (settingsStore.theme === 'system') {
    applySystemTheme()
  }
})

onMounted(async () => {
  await settingsStore.loadSettings()
  preferencesForm.currency = settingsStore.currency
  preferencesForm.region = settingsStore.region

  if (!settingsStore.theme) {
    settingsStore.theme = 'light'
  }
  if (settingsStore.theme === 'system') {
    applySystemTheme()
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (settingsStore.theme === 'system') {
        applySystemTheme()
      }
    })
  }

  await loadTaxRates()
})
</script>
