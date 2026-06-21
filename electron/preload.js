const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  income: {
    create: (data) => ipcRenderer.invoke('income:create', data),
    list: (params) => ipcRenderer.invoke('income:list', params),
    update: (id, data) => ipcRenderer.invoke('income:update', id, data),
    delete: (id) => ipcRenderer.invoke('income:delete', id),
    stats: (params) => ipcRenderer.invoke('income:stats', params),
    importCsv: (filePath, mapping) => ipcRenderer.invoke('income:importCsv', filePath, mapping),
    categories: () => ipcRenderer.invoke('income:categories')
  },
  tax: {
    getRates: (region) => ipcRenderer.invoke('tax:getRates', region),
    saveRates: (region, rates) => ipcRenderer.invoke('tax:saveRates', region, rates),
    getDeductions: () => ipcRenderer.invoke('tax:getDeductions'),
    saveDeduction: (deduction) => ipcRenderer.invoke('tax:saveDeduction', deduction),
    deleteDeduction: (id) => ipcRenderer.invoke('tax:deleteDeduction', id)
  },
  invoice: {
    upload: (data) => ipcRenderer.invoke('invoice:upload', data),
    list: (params) => ipcRenderer.invoke('invoice:list', params),
    ocr: (filePath) => ipcRenderer.invoke('invoice:ocr', filePath),
    get: (id) => ipcRenderer.invoke('invoice:get', id),
    delete: (id) => ipcRenderer.invoke('invoice:delete', id),
    categories: () => ipcRenderer.invoke('invoice:categories'),
    update: (id, data) => ipcRenderer.invoke('invoice:update', id, data)
  },
  file: {
    openDialog: (options) => ipcRenderer.invoke('file:openDialog', options),
    saveDialog: (options) => ipcRenderer.invoke('file:saveDialog', options),
    readCsv: (filePath) => ipcRenderer.invoke('file:readCsv', filePath),
    exportData: (exportPath) => ipcRenderer.invoke('file:exportData', exportPath)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (data) => ipcRenderer.invoke('settings:save', data),
    exportDatabase: () => ipcRenderer.invoke('settings:exportDatabase'),
    importDatabase: (filePath) => ipcRenderer.invoke('settings:importDatabase', filePath)
  }
});
