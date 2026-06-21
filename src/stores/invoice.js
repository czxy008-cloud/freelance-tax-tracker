import { defineStore } from 'pinia'
import { invoiceApi } from '@/utils/ipc'

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    invoices: [],
    categories: [],
    loading: false
  }),

  getters: {
    totalInvoiceAmount: (state) => {
      return state.invoices.reduce((sum, item) => sum + (item.amount || 0), 0)
    },
    invoicesByCategory: (state) => {
      const grouped = {}
      for (const invoice of state.invoices) {
        const cat = invoice.category || '未分类'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(invoice)
      }
      return grouped
    }
  },

  actions: {
    async fetchInvoices(params) {
      this.loading = true
      try {
        const data = await invoiceApi.list(params)
        this.invoices = (data && data.items) ? data.items : (data || [])
        return this.invoices
      } catch (error) {
        console.error('获取发票列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadInvoice(data) {
      this.loading = true
      try {
        const result = await invoiceApi.upload(data)
        if (result) {
          this.invoices.unshift(result)
        }
        return result
      } catch (error) {
        console.error('上传发票失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async runOcr(filePath) {
      this.loading = true
      try {
        const result = await invoiceApi.ocr(filePath)
        return result
      } catch (error) {
        console.error('OCR 识别失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteInvoice(id) {
      try {
        await invoiceApi.delete(id)
        this.invoices = this.invoices.filter((item) => item.id !== id)
        return true
      } catch (error) {
        console.error('删除发票失败:', error)
        throw error
      }
    },

    async fetchCategories() {
      try {
        const data = await invoiceApi.categories()
        this.categories = data || []
        return this.categories
      } catch (error) {
        console.error('获取发票分类失败:', error)
        throw error
      }
    }
  }
})
