<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">税务计算器</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">输入参数，实时计算税后收入和税额明细</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <Cog6ToothIcon class="w-5 h-5 text-teal-500" />
              <span class="font-semibold text-slate-900 dark:text-white">参数配置</span>
            </div>
          </template>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">年度税前收入</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-400">¥</span>
                <input
                  v-model.number="income"
                  type="number"
                  min="0"
                  step="100"
                  class="w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">社保基数</label>
                <input
                  v-model.number="socialBase"
                  type="number"
                  min="0"
                  class="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  社保比例：{{ formatPercent(socialRate) }}
                </label>
                <input
                  v-model.number="socialRate"
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.01"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div class="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">起征点</label>
              <input
                v-model.number="threshold"
                type="number"
                min="0"
                step="1000"
                class="input-field"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">专项附加扣除</label>
                <button
                  @click="openDeductionModal()"
                  class="inline-flex items-center gap-1 text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                >
                  <PlusIcon class="w-4 h-4" />
                  添加
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="deduction in localDeductions"
                  :key="deduction.id || deduction.name"
                  class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <TagIcon class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900 dark:text-white">{{ deduction.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ deduction.type || '专项扣除' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatCurrency(deduction.amount) }}</span>
                    <button
                      @click="openDeductionModal(deduction)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="handleDeleteDeduction(deduction)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div
                  v-if="localDeductions.length === 0"
                  class="text-center py-6 text-sm text-slate-400 dark:text-slate-500"
                >
                  暂无扣除项，点击"添加"开始
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="lg:col-span-3 space-y-6">
        <BaseCard>
          <div class="text-center py-8">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">预计税后收入</p>
            <p class="text-5xl font-bold text-amber-500 dark:text-amber-400">
              {{ formatCurrency(result.netIncome) }}
            </p>
            <div class="mt-4 flex items-center justify-center gap-6 text-sm">
              <div>
                <span class="text-slate-500 dark:text-slate-400">实际税率：</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ formatPercent(result.effectiveRate) }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400">税前收入：</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ formatCurrency(result.grossIncome) }}</span>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #title>
            <div class="flex items-center gap-2">
              <ChartBarIcon class="w-5 h-5 text-teal-500" />
              <span class="font-semibold text-slate-900 dark:text-white">分级税额明细</span>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="(bracket, index) in result.breakdown.brackets"
              :key="index"
              class="space-y-2"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600 dark:text-slate-400">
                  {{ formatCurrency(bracket.min) }} - {{ bracket.max !== undefined ? formatCurrency(bracket.max) : '以上' }}
                  <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                    {{ formatPercent(bracket.rate) }}
                  </span>
                </span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ formatCurrency(bracket.tax) }}</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                  :style="{ width: getBracketPercent(bracket) + '%' }"
                ></div>
              </div>
            </div>
            <div
              v-if="result.breakdown.brackets.length === 0"
              class="text-center py-6 text-sm text-slate-400 dark:text-slate-500"
            >
              无需纳税
            </div>
          </div>
        </BaseCard>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseCard>
            <template #title>
              <div class="flex items-center gap-2">
                <CalculatorIcon class="w-5 h-5 text-teal-500" />
                <span class="font-semibold text-slate-900 dark:text-white">计算详情</span>
              </div>
            </template>

            <div class="space-y-4">
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500 dark:text-slate-400">应纳税所得额</span>
                <span class="font-semibold text-slate-900 dark:text-white">{{ formatCurrency(result.taxableIncome) }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500 dark:text-slate-400">应缴个税</span>
                <span class="font-semibold text-red-500">{{ formatCurrency(result.tax) }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500 dark:text-slate-400">社保扣除（个人）</span>
                <span class="font-semibold text-amber-500">{{ formatCurrency(result.socialInsurance) }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm text-slate-500 dark:text-slate-400">专项附加扣除总计</span>
                <span class="font-semibold text-teal-500">{{ formatCurrency(result.totalDeductions) }}</span>
              </div>
            </div>
          </BaseCard>

          <BaseCard>
            <template #title>
              <div class="flex items-center gap-2">
                <ReceiptPercentIcon class="w-5 h-5 text-teal-500" />
                <span class="font-semibold text-slate-900 dark:text-white">各级税额</span>
              </div>
            </template>

            <div class="space-y-2">
              <div
                v-for="(bracket, index) in result.breakdown.brackets"
                :key="index"
                class="flex items-center justify-between py-1.5 text-sm"
              >
                <span class="text-slate-600 dark:text-slate-400">
                  第{{ index + 1 }}级 ({{ formatPercent(bracket.rate) }})
                </span>
                <span class="font-medium text-slate-900 dark:text-white">{{ formatCurrency(bracket.tax) }}</span>
              </div>
              <div
                v-if="result.breakdown.brackets.length === 0"
                class="text-center py-6 text-sm text-slate-400 dark:text-slate-500"
              >
                无需纳税
              </div>
              <div v-if="result.breakdown.brackets.length > 0" class="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">合计</span>
                <span class="text-sm font-bold text-red-500">{{ formatCurrency(result.breakdown.totalTax) }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <BaseModal v-model:visible="showDeductionModal" :title="editingDeduction ? '编辑扣除项' : '添加扣除项'" size="sm">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">名称</label>
          <input v-model="deductionForm.name" type="text" class="input-field" placeholder="如：子女教育" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">金额（年度）</label>
          <input v-model.number="deductionForm.amount" type="number" min="0" step="100" class="input-field" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">类型</label>
          <select v-model="deductionForm.type" class="input-field">
            <option value="子女教育">子女教育</option>
            <option value="继续教育">继续教育</option>
            <option value="大病医疗">大病医疗</option>
            <option value="住房贷款利息">住房贷款利息</option>
            <option value="住房租金">住房租金</option>
            <option value="赡养老人">赡养老人</option>
            <option value="其他">其他</option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeductionModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="handleSaveDeduction">保存</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Cog6ToothIcon,
  PlusIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalculatorIcon,
  ReceiptPercentIcon
} from '@heroicons/vue/24/outline'
import { useTaxStore } from '@/stores/tax'
import { calculateTax, calculateSocialInsurance } from '@/utils/taxCalculator'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const taxStore = useTaxStore()

const income = ref(200000)
const socialBase = ref(10000)
const socialRate = ref(0.105)
const threshold = ref(60000)
const localDeductions = ref([])

const showDeductionModal = ref(false)
const editingDeduction = ref(null)
const deductionForm = ref({
  name: '',
  amount: 0,
  type: '子女教育'
})

const allDeductions = computed(() => {
  return [
    { name: '起征点', amount: threshold.value, type: '基本扣除' },
    ...localDeductions.value
  ]
})

const socialInsurance = computed(() => {
  return calculateSocialInsurance(socialBase.value * 12, socialRate.value)
})

const result = computed(() => {
  const rates = taxStore.rates.length > 0 ? taxStore.rates : [
    { min: 0, max: 36000, rate: 0.03, deduction: 0 },
    { min: 36000, max: 144000, rate: 0.10, deduction: 2520 },
    { min: 144000, max: 300000, rate: 0.20, deduction: 16920 },
    { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
    { min: 420000, max: 660000, rate: 0.30, deduction: 52920 },
    { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
    { min: 960000, rate: 0.45, deduction: 181920 }
  ]
  return calculateTax(income.value, rates, allDeductions.value, socialInsurance.value)
})

function getBracketPercent(bracket) {
  if (!result.value.tax || result.value.tax <= 0) return 0
  return Math.min(100, (bracket.tax / result.value.tax) * 100)
}

function openDeductionModal(deduction = null) {
  editingDeduction.value = deduction
  if (deduction) {
    deductionForm.value = {
      name: deduction.name,
      amount: deduction.amount,
      type: deduction.type || '其他'
    }
  } else {
    deductionForm.value = {
      name: '',
      amount: 0,
      type: '子女教育'
    }
  }
  showDeductionModal.value = true
}

async function handleSaveDeduction() {
  if (!deductionForm.value.name || !deductionForm.value.amount) {
    return
  }

  if (editingDeduction.value) {
    const index = localDeductions.value.findIndex(d => d.id === editingDeduction.value.id || d.name === editingDeduction.value.name)
    if (index !== -1) {
      localDeductions.value[index] = {
        ...localDeductions.value[index],
        ...deductionForm.value
      }
      if (editingDeduction.value.id) {
        try {
          await taxStore.saveDeduction(localDeductions.value[index])
        } catch (e) {}
      }
    }
  } else {
    const newDeduction = {
      ...deductionForm.value,
      id: Date.now()
    }
    localDeductions.value.push(newDeduction)
    try {
      await taxStore.saveDeduction(deductionForm.value)
    } catch (e) {}
  }

  showDeductionModal.value = false
}

async function handleDeleteDeduction(deduction) {
  localDeductions.value = localDeductions.value.filter(d => d.id !== deduction.id || d.name !== deduction.name)
  if (deduction.id) {
    try {
      await taxStore.deleteDeduction(deduction.id)
    } catch (e) {}
  }
}

onMounted(async () => {
  try {
    await taxStore.fetchRates('china')
    const deductions = await taxStore.fetchDeductions()
    if (deductions && deductions.length > 0) {
      localDeductions.value = deductions
    }
  } catch (e) {
    console.error('加载税务数据失败:', e)
  }
})
</script>
