import { defineStore } from 'pinia'
import { taxApi } from '@/utils/ipc'

export const useTaxStore = defineStore('tax', {
  state: () => ({
    rates: [],
    deductions: [],
    loading: false
  }),

  getters: {
    totalDeductionAmount: (state) => {
      return state.deductions.reduce((sum, item) => sum + (item.amount || 0), 0)
    },
    sortedRates: (state) => {
      return [...state.rates].sort((a, b) => a.min - b.min)
    }
  },

  actions: {
    async fetchRates(region) {
      this.loading = true
      try {
        const data = await taxApi.getRates(region)
        this.rates = data || []
        return this.rates
      } catch (error) {
        console.error('获取税率失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveRates(region, rates) {
      try {
        const result = await taxApi.saveRates(region, rates)
        this.rates = rates
        return result
      } catch (error) {
        console.error('保存税率失败:', error)
        throw error
      }
    },

    async fetchDeductions() {
      this.loading = true
      try {
        const data = await taxApi.getDeductions()
        this.deductions = data || []
        return this.deductions
      } catch (error) {
        console.error('获取扣除项失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveDeduction(deduction) {
      try {
        const result = await taxApi.saveDeduction(deduction)
        if (result) {
          if (deduction.id) {
            const index = this.deductions.findIndex((item) => item.id === deduction.id)
            if (index !== -1) {
              this.deductions[index] = result
            }
          } else {
            this.deductions.push(result)
          }
        }
        return result
      } catch (error) {
        console.error('保存扣除项失败:', error)
        throw error
      }
    },

    async deleteDeduction(id) {
      try {
        await taxApi.deleteDeduction(id)
        this.deductions = this.deductions.filter((item) => item.id !== id)
        return true
      } catch (error) {
        console.error('删除扣除项失败:', error)
        throw error
      }
    }
  }
})
