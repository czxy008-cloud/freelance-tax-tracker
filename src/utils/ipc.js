function createApiWrapper(apiModule) {
  const wrapper = {}
  if (!apiModule) {
    Object.keys(wrapper)
    return new Proxy({}, {
      get: () => async () => {
        throw new Error('window.api 不可用，请在 Electron 环境中运行')
      }
    })
  }
  for (const key of Object.keys(apiModule)) {
    if (typeof apiModule[key] === 'function') {
      wrapper[key] = async (...args) => {
        try {
          const result = await apiModule[key](...args)
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

export const incomeApi = createApiWrapper(getApi()?.income)
export const taxApi = createApiWrapper(getApi()?.tax)
export const invoiceApi = createApiWrapper(getApi()?.invoice)
export const fileApi = createApiWrapper(getApi()?.file)
export const settingsApi = createApiWrapper(getApi()?.settings)

export default {
  incomeApi,
  taxApi,
  invoiceApi,
  fileApi,
  settingsApi
}
