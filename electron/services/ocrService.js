const Tesseract = require('tesseract.js');

function parseAmount(text) {
  if (!text) return null;
  const patterns = [
    /(?:价税合计|金额合计|合计金额|总计|总金额|应付金额)[^\d]*([\d,]+\.?\d*)/i,
    /(?:¥|￥|RMB|CNY)\s*([\d,]+\.?\d*)/i,
    /(?:金额|amount)[^\d]*([\d,]+\.?\d*)/i,
    /([\d,]+\.\d{2})/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      let amount;
      if (matches[1]) {
        amount = matches[1].replace(/,/g, '');
      } else {
        const allMatches = [...text.matchAll(/[\d,]+\.\d{2}/g)];
        if (allMatches.length > 0) {
          const nums = allMatches.map(m => parseFloat(m[0].replace(/,/g, '')));
          amount = String(Math.max(...nums));
        }
      }
      if (amount) {
        const parsed = parseFloat(amount);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
  }
  return null;
}

function parseDate(text) {
  if (!text) return null;
  const patterns = [
    /(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})[日]?/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{4})\/(\d{2})\/(\d{2})/,
    /开票日期[^\d]*(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const year = match[1];
      const month = String(match[2]).padStart(2, '0');
      const day = String(match[3]).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return dateStr;
      }
    }
  }
  return null;
}

function parseInvoiceNumber(text) {
  if (!text) return null;
  const patterns = [
    /(?:发票号码|发票号|No\.?|编号)[^\d]*([\dA-Za-z\-]{8,})/i,
    /发票代码[^\d]*([\d]{10,12})/,
    /(\d{8,20})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function recognize(filePath, options = {}) {
  const { language = 'chi_sim+eng' } = options;

  try {
    const result = await Tesseract.recognize(filePath, language, {
      logger: () => {}
    });

    const text = result.data.text || '';

    return {
      text,
      amount: parseAmount(text),
      invoiceDate: parseDate(text),
      invoiceNumber: parseInvoiceNumber(text),
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR recognition failed:', error);
    throw error;
  }
}

module.exports = {
  recognize,
  parseAmount,
  parseDate,
  parseInvoiceNumber
};
