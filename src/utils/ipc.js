const mockIncomeCategories = [
  { id: 1, name: '设计费', keywords: '设计,design,UI,平面,视觉', color: '#8B5CF6' },
  { id: 2, name: '咨询费', keywords: '咨询,consult,顾问,advisory', color: '#0D9488' },
  { id: 3, name: '开发费', keywords: '开发,develop,代码,program,编程', color: '#3B82F6' },
  { id: 4, name: '写作费', keywords: '写作,write,文案,content', color: '#F59E0B' },
  { id: 5, name: '翻译费', keywords: '翻译,translate,interpret', color: '#EC4899' },
  { id: 6, name: '其他收入', keywords: '其他,other', color: '#6B7280' }
]

const now = new Date()
const fmt = (d) => d.toISOString().slice(0, 10)
const mockIncomes = [
  { id: 1, amount: 25000, date: fmt(new Date(now.getFullYear(), now.getMonth(), 15)), category_id: 3, category_name: '开发费', category_color: '#3B82F6', payer: '科技公司A', note: 'Web应用开发项目首款' },
  { id: 2, amount: 18000, date: fmt(new Date(now.getFullYear(), now.getMonth() - 1, 20)), category_id: 1, category_name: '设计费', category_color: '#8B5CF6', payer: '创意工作室', note: '品牌VI设计' },
  { id: 3, amount: 12000, date: fmt(new Date(now.getFullYear(), now.getMonth() - 1, 8)), category_id: 2, category_name: '咨询费', category_color: '#0D9488', payer: '创业公司B', note: '技术咨询' },
  { id: 4, amount: 8500, date: fmt(new Date(now.getFullYear(), now.getMonth() - 2, 25)), category_id: 4, category_name: '写作费', category_color: '#F59E0B', payer: '媒体平台', note: '技术专栏稿费' },
  { id: 5, amount: 32000, date: fmt(new Date(now.getFullYear(), now.getMonth() - 2, 10)), category_id: 3, category_name: '开发费', category_color: '#3B82F6', payer: '科技公司A', note: '二期开发款项' }
]

const mockTaxRates = [
  { id: 1, region: 'default', min: 0, max: 36000, rate: 0.03, deduction: 0, level: 1 },
  { id: 2, region: 'default', min: 36000, max: 144000, rate: 0.10, deduction: 2520, level: 2 },
  { id: 3, region: 'default', min: 144000, max: 300000, rate: 0.20, deduction: 16920, level: 3 },
  { id: 4, region: 'default', min: 300000, max: 420000, rate: 0.25, deduction: 31920, level: 4 },
  { id: 5, region: 'default', min: 420000, max: 660000, rate: 0.30, deduction: 52920, level: 5 },
  { id: 6, region: 'default', min: 660000, max: 960000, rate: 0.35, deduction: 85920, level: 6 },
  { id: 7, region: 'default', min: 960000, max: null, rate: 0.45, deduction: 181920, level: 7 }
]

const mockDeductions = [
  { id: 1, name: '子女教育', amount: 12000, type: 'special' },
  { id: 2, name: '住房贷款利息', amount: 12000, type: 'special' },
  { id: 3, name: '赡养老人', amount: 24000, type: 'special' }
]

const mockInvoiceCategories = [
  { id: 1, name: '办公用品' },
  { id: 2, name: '差旅费' },
  { id: 3, name: '餐饮费' },
  { id: 4, name: '通讯费' },
  { id: 5, name: '其他' }
]

const mockInvoices = [
  { id: 1, file_path: '/mock/invoice1.pdf', file_type: 'pdf', amount: 2500, invoice_date: fmt(new Date(now.getFullYear(), now.getMonth(), 5)), invoice_number: 'INV2024001', category_id: 1, ocr_text: '办公用品发票 ￥2500', category_name: '办公用品' },
  { id: 2, file_path: '/mock/invoice2.jpg', file_type: 'image', amount: 1800, invoice_date: fmt(new Date(now.getFullYear(), now.getMonth() - 1, 12)), invoice_number: 'INV2024002', category_id: 2, ocr_text: '差旅费 机票 ￥1800', category_name: '差旅费' }
]

const mockSettings = {
  theme: 'dark',
  region: 'default',
  currency: 'CNY',
  social_insurance_base: '10000',
  social_insurance_rate: '0.105'
}

const mockApi = {
  income: {
    create: async (data) => {
      const newItem = { id: Date.now(), ...data, category_name: mockIncomeCategories.find(c => c.id === data.category_id || data.category)?.name || '未分类', category_color: mockIncomeCategories.find(c => c.id === data.category_id || data.category)?.color || '#6B7280' }
      mockIncomes.unshift(newItem)
      return newItem
    },
    list: async (params = {}) => {
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      return { total: mockIncomes.length, items: mockIncomes.slice(start, start + pageSize), page, pageSize }
    },
    update: async (id, data) => {
      const idx = mockIncomes.findIndex(i => i.id === id)
      if (idx !== -1) {
        mockIncomes[idx] = { ...mockIncomes[idx], ...data }
        return mockIncomes[idx]
      }
      return null
    },
    delete: async (id) => {
      const idx = mockIncomes.findIndex(i => i.id === id)
      if (idx !== -1) mockIncomes.splice(idx, 1)
      return true
    },
    stats: async () => {
      const total = mockIncomes.reduce((s, i) => s + i.amount, 0)
      const byCategory = mockIncomeCategories.map(c => ({
        id: c.id, name: c.name, color: c.color,
        total: mockIncomes.filter(i => i.category_id === c.id).reduce((s, i) => s + i.amount, 0)
      }))
      const byMonth = []
      for (let m = 0; m < 6; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const monthTotal = mockIncomes.filter(i => i.date.startsWith(key)).reduce((s, i) => s + i.amount, 0) || (Math.random() * 30000 + 5000)
        byMonth.unshift({ month: key, total: Math.round(monthTotal) })
      }
      return { totalIncome: total, count: mockIncomes.length, byCategory, byMonth }
    },
    importCsv: async () => ({ success: 3, failed: 0, errors: [] }),
    categories: async () => mockIncomeCategories
  },
  tax: {
    getRates: async () => mockTaxRates,
    saveRates: async (region, rates) => {
      mockTaxRates.length = 0
      rates.forEach((r, i) => mockTaxRates.push({ ...r, id: i + 1, region }))
      return mockTaxRates
    },
    getDeductions: async () => mockDeductions,
    saveDeduction: async (d) => {
      if (d.id) {
        const idx = mockDeductions.findIndex(x => x.id === d.id)
        if (idx !== -1) { mockDeductions[idx] = { ...mockDeductions[idx], ...d }; return mockDeductions[idx] }
      }
      const newItem = { id: Date.now(), ...d }
      mockDeductions.push(newItem)
      return newItem
    },
    deleteDeduction: async (id) => {
      const idx = mockDeductions.findIndex(x => x.id === id)
      if (idx !== -1) mockDeductions.splice(idx, 1)
      return true
    }
  },
  invoice: {
    upload: async (data) => {
      const newItem = { id: Date.now(), ...data, created_at: new Date().toISOString() }
      mockInvoices.unshift(newItem)
      return newItem
    },
    list: async () => ({ total: mockInvoices.length, items: mockInvoices }),
    ocr: async () => ({ amount: 1234.56, date: fmt(new Date()), invoice_number: 'INV' + Date.now(), text: '模拟识别文本 ￥1234.56' }),
    get: async (id) => mockInvoices.find(i => i.id === id),
    delete: async (id) => {
      const idx = mockInvoices.findIndex(i => i.id === id)
      if (idx !== -1) mockInvoices.splice(idx, 1)
      return true
    },
    categories: async () => mockInvoiceCategories,
    update: async (id, data) => {
      const idx = mockInvoices.findIndex(i => i.id === id)
      if (idx !== -1) { mockInvoices[idx] = { ...mockInvoices[idx], ...data }; return mockInvoices[idx] }
      return null
    }
  },
  file: {
    openDialog: async () => ({ filePaths: [], canceled: true }),
    saveDialog: async () => ({ filePath: null, canceled: true }),
    readCsv: async () => [],
    exportData: async () => ({ success: true })
  },
  settings: {
    get: async () => ({ ...mockSettings }),
    save: async (data) => { Object.assign(mockSettings, data); return { ...mockSettings } },
    exportDatabase: async () => ({ success: true }),
    importDatabase: async () => ({ success: true })
  }
}

function createApiWrapper(apiModule, mockModule) {
  const moduleToUse = apiModule || mockModule
  const wrapper = {}
  for (const key of Object.keys(moduleToUse)) {
    if (typeof moduleToUse[key] === 'function') {
      wrapper[key] = async (...args) => {
        try {
          const result = await moduleToUse[key](...args)
          if (result && result.success === false) {
            throw new Error(result.message || '操作失败')
          }
          return result
        } catch (error) {
          console.error(`[IPC:${key}] 调用失败:`, error)
          throw error
        }
      }
    }
  }
  return wrapper
}

const getApi = () => {
  if (typeof window !== 'undefined' && window.api) {
    return window.api
  }
  return null
}

export const incomeApi = createApiWrapper(getApi()?.income, mockApi.income)
export const taxApi = createApiWrapper(getApi()?.tax, mockApi.tax)
export const invoiceApi = createApiWrapper(getApi()?.invoice, mockApi.invoice)
export const fileApi = createApiWrapper(getApi()?.file, mockApi.file)
export const settingsApi = createApiWrapper(getApi()?.settings, mockApi.settings)

export default {
  incomeApi,
  taxApi,
  invoiceApi,
  fileApi,
  settingsApi
}
