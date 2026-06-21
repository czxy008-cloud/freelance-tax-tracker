export function formatCurrency(amount, currency = 'CNY') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-'
  }
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount))
  } catch {
    const symbol = currency === 'CNY' ? '¥' : '$'
    return `${symbol}${Number(amount).toFixed(2)}`
  }
}

export function formatDate(date) {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return '-'
  }
}

export function formatPercent(rate, fractionDigits = 2) {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '-'
  }
  return `${(Number(rate) * 100).toFixed(fractionDigits)}%`
}
