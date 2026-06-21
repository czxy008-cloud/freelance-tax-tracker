import { defineStore } from 'pinia'
import { settingsApi } from '@/utils/ipc'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    region: 'CN',
    currency: 'CNY',
    socialInsuranceBase: 0,
    socialInsuranceRate: 0
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    currencySymbol: (state) => {
      const symbols = { CNY: '¥', USD: '$', EUR: '€', JPY: '¥', GBP: '£' }
      return symbols[state.currency] || '¥'
    }
  },

  actions: {
    async loadSettings() {
      try {
        const data = await settingsApi.get()
        if (data) {
          this.theme = data.theme || 'dark'
          this.region = data.region || 'default'
          this.currency = data.currency || 'CNY'
          this.socialInsuranceBase = parseFloat(data.social_insurance_base || data.socialInsuranceBase || 0)
          this.socialInsuranceRate = parseFloat(data.social_insurance_rate || data.socialInsuranceRate || 0)
        }
        this.applyTheme()
      } catch (error) {
        console.error('加载设置失败:', error)
        this.applyTheme()
      }
    },

    _toDbFormat() {
      return {
        theme: this.theme,
        region: this.region,
        currency: this.currency,
        social_insurance_base: String(this.socialInsuranceBase),
        social_insurance_rate: String(this.socialInsuranceRate)
      }
    },

    async saveSettings(settings) {
      try {
        if (settings.theme !== undefined) this.theme = settings.theme
        if (settings.region !== undefined) this.region = settings.region
        if (settings.currency !== undefined) this.currency = settings.currency
        if (settings.socialInsuranceBase !== undefined) this.socialInsuranceBase = settings.socialInsuranceBase
        if (settings.socialInsuranceRate !== undefined) this.socialInsuranceRate = settings.socialInsuranceRate

        this.applyTheme()
        await settingsApi.save(this._toDbFormat())
        return true
      } catch (error) {
        console.error('保存设置失败:', error)
        throw error
      }
    },

    async toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
      try {
        await settingsApi.save(this._toDbFormat())
      } catch (error) {
        console.error('保存主题设置失败:', error)
      }
    },

    applyTheme() {
      if (typeof document !== 'undefined') {
        if (this.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }
})
