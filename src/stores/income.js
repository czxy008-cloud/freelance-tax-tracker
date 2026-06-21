import { defineStore } from 'pinia'
import { incomeApi } from '@/utils/ipc'

export const useIncomeStore = defineStore('income', {
  state: () => ({
    incomes: [],
    categories: [],
    stats: {
      total: 0,
      monthly: [],
      byCategory: []
    },
    totalCount: 0,
    loading: false
  }),

  getters: {
    totalIncome: (state) => {
      return state.incomes.reduce((sum, item) => sum + (item.amount || 0), 0)
    },
    monthlyIncome: (state) => {
      const grouped = {}
      for (const item of state.incomes) {
        const date = new Date(item.date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!grouped[key]) grouped[key] = 0
        grouped[key] += item.amount || 0
      }
      return Object.entries(grouped)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
    }
  },

  actions: {
    _normalize(item) {
      if (!item) return item
      return {
        ...item,
        category: item.category_name || item.category || item.category_id
      }
    },

    async fetchIncomes(params) {
      this.loading = true
      try {
        const data = await incomeApi.list(params)
        const rawList = (data && data.items) ? data.items : (data || [])
        this.incomes = rawList.map(item => this._normalize(item))
        this.totalCount = (data && data.total) ? data.total : this.incomes.length
        return this.incomes
      } catch (error) {
        console.error('获取收入列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createIncome(data) {
      try {
        const result = await incomeApi.create(data)
        if (result) {
          this.incomes.unshift(this._normalize(result))
        }
        return result
      } catch (error) {
        console.error('创建收入记录失败:', error)
        throw error
      }
    },

    async updateIncome(id, data) {
      try {
        const result = await incomeApi.update(id, data)
        const index = this.incomes.findIndex((item) => item.id === id)
        if (index !== -1 && result) {
          this.incomes[index] = this._normalize(result)
        }
        return result
      } catch (error) {
        console.error('更新收入记录失败:', error)
        throw error
      }
    },

    async deleteIncome(id) {
      try {
        await incomeApi.delete(id)
        this.incomes = this.incomes.filter((item) => item.id !== id)
        return true
      } catch (error) {
        console.error('删除收入记录失败:', error)
        throw error
      }
    },

    async fetchStats(params) {
      this.loading = true
      try {
        const data = await incomeApi.stats(params)
        this.stats = {
          total: data?.totalIncome || 0,
          monthly: (data?.byMonth || []).map(m => ({ month: m.month, amount: m.total })),
          byCategory: (data?.byCategory || []).map(c => ({ 
            id: c.id, name: c.name, color: c.color, value: c.total 
          }))
        }
        return this.stats
      } catch (error) {
        console.error('获取收入统计失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async importCsv(filePath, mapping) {
      this.loading = true
      try {
        const result = await incomeApi.importCsv(filePath, mapping)
        await this.fetchIncomes()
        return result
      } catch (error) {
        console.error('导入 CSV 失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const data = await incomeApi.categories()
        this.categories = data || []
        return this.categories
      } catch (error) {
        console.error('获取收入分类失败:', error)
        throw error
      }
    }
  }
})
