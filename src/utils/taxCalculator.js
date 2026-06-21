export function calculateSocialInsurance(base, rate) {
  if (!base || !rate) return 0
  return base * rate
}

export function getTaxBreakdown(taxableIncome, rates) {
  if (!taxableIncome || taxableIncome <= 0 || !rates || rates.length === 0) {
    return { brackets: [], totalTax: 0 }
  }

  const brackets = []
  let remaining = taxableIncome
  let totalTax = 0

  const sortedRates = [...rates].sort((a, b) => a.min - b.min)

  for (const bracket of sortedRates) {
    const { min, max, rate, deduction } = bracket
    const bracketWidth = max !== undefined ? max - min : Infinity
    const taxableInBracket = Math.min(Math.max(remaining, 0), bracketWidth)

    if (taxableInBracket > 0) {
      const taxInBracket = taxableInBracket * rate - (deduction || 0)
      brackets.push({
        min,
        max,
        rate,
        taxableIncome: taxableInBracket,
        tax: Math.max(0, taxInBracket)
      })
      totalTax += Math.max(0, taxInBracket)
    }

    remaining -= bracketWidth
    if (remaining <= 0) break
  }

  return { brackets, totalTax: Math.max(0, totalTax) }
}

export function calculateTax(income, rates, deductions = [], socialInsurance = 0) {
  if (!income || income <= 0) {
    return {
      grossIncome: 0,
      socialInsurance: 0,
      totalDeductions: 0,
      taxableIncome: 0,
      tax: 0,
      netIncome: 0,
      effectiveRate: 0,
      breakdown: { brackets: [], totalTax: 0 }
    }
  }

  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0)
  const taxableIncome = Math.max(0, income - socialInsurance - totalDeductions)
  const breakdown = getTaxBreakdown(taxableIncome, rates)
  const tax = breakdown.totalTax
  const netIncome = income - socialInsurance - tax
  const effectiveRate = income > 0 ? tax / income : 0

  return {
    grossIncome: income,
    socialInsurance,
    totalDeductions,
    taxableIncome,
    tax,
    netIncome,
    effectiveRate,
    breakdown
  }
}
