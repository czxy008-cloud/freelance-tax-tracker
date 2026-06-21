const Papa = require('papaparse');
const fs = require('fs');
const { listIncomeCategories } = require('./database');

function detectCsvEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return 'utf-8';
    }
    const content = buffer.toString('utf-8');
    if (content.includes('�')) {
      return 'gbk';
    }
    return 'utf-8';
  } catch (e) {
    return 'utf-8';
  }
}

function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const encoding = detectCsvEncoding(filePath);
      let content;
      if (encoding === 'gbk') {
        const iconv = require('iconv-lite');
        const buffer = fs.readFileSync(filePath);
        content = iconv.decode(buffer, 'gbk');
      } else {
        content = fs.readFileSync(filePath, 'utf-8');
      }

      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve({
            data: results.data,
            headers: results.meta.fields || [],
            rowCount: results.data.length
          });
        },
        error: (err) => {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function detectColumns(headers) {
  const headerLower = headers.map(h => h.toLowerCase());
  const mapping = {
    amount: null,
    date: null,
    payer: null,
    note: null,
    type: null
  };

  const amountKeywords = ['金额', 'amount', '收入金额', '交易金额', '发生额'];
  const dateKeywords = ['日期', 'date', '交易日期', '记账日期', '时间'];
  const payerKeywords = ['对方', '付款方', 'payer', '摘要', '交易对方', '对方户名'];
  const noteKeywords = ['备注', 'note', '附言', '说明', '摘要说明'];
  const typeKeywords = ['类型', 'type', '收支', '收支类型', '借贷标志'];

  for (let i = 0; i < headerLower.length; i++) {
    const h = headerLower[i];
    if (!mapping.amount && amountKeywords.some(k => h.includes(k.toLowerCase()))) {
      mapping.amount = headers[i];
    }
    if (!mapping.date && dateKeywords.some(k => h.includes(k.toLowerCase()))) {
      mapping.date = headers[i];
    }
    if (!mapping.payer && payerKeywords.some(k => h.includes(k.toLowerCase()))) {
      mapping.payer = headers[i];
    }
    if (!mapping.note && noteKeywords.some(k => h.includes(k.toLowerCase()))) {
      mapping.note = headers[i];
    }
    if (!mapping.type && typeKeywords.some(k => h.includes(k.toLowerCase()))) {
      mapping.type = headers[i];
    }
  }

  return mapping;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();

  const patterns = [
    /^(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})/,
    /^(\d{4})(\d{2})(\d{2})/,
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})/,
    /^(\d{4})-(\d{2})-(\d{2})/
  ];

  for (const p of patterns) {
    const m = s.match(p);
    if (m) {
      const month = String(m[2]).padStart(2, '0');
      const day = String(m[3]).padStart(2, '0');
      return `${m[1]}-${month}-${day}`;
    }
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return null;
}

function normalizeAmount(amountStr, typeValue) {
  if (amountStr === null || amountStr === undefined) return null;
  let s = String(amountStr).trim().replace(/,/g, '').replace(/¥|￥/g, '');

  if (s === '' || s === '-') return null;

  const isNegative = s.startsWith('-');
  if (isNegative) s = s.substring(1);

  const amount = parseFloat(s);
  if (isNaN(amount)) return null;

  if (typeValue) {
    const t = String(typeValue).toLowerCase();
    if (t.includes('支出') || t.includes('借') || t === 'd' || t.includes('debit')) {
      return -Math.abs(amount);
    }
    if (t.includes('收入') || t.includes('贷') || t === 'c' || t.includes('credit')) {
      return Math.abs(amount);
    }
  }

  return isNegative ? -amount : amount;
}

function categorizeIncome(payer, note, categories) {
  if (!categories || categories.length === 0) return null;
  const text = `${payer || ''} ${note || ''}`.toLowerCase();

  for (const cat of categories) {
    if (!cat.keywords) continue;
    const keywords = cat.keywords.split(/[,，]/).map(k => k.trim().toLowerCase()).filter(k => k);
    for (const kw of keywords) {
      if (kw && text.includes(kw)) {
        return cat.id;
      }
    }
  }
  return null;
}

function parseBankCsv(filePath, customMapping = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const parsed = await readCsvFile(filePath);
      const categories = listIncomeCategories();

      const mapping = {
        ...detectColumns(parsed.headers),
        ...customMapping
      };

      const records = [];
      for (const row of parsed.data) {
        const rawAmount = mapping.amount ? row[mapping.amount] : null;
        const rawType = mapping.type ? row[mapping.type] : null;
        const amount = normalizeAmount(rawAmount, rawType);

        if (amount === null || amount <= 0) continue;

        const date = normalizeDate(mapping.date ? row[mapping.date] : null);
        const payer = mapping.payer ? String(row[mapping.payer] || '').trim() : '';
        const note = mapping.note ? String(row[mapping.note] || '').trim() : '';
        const categoryId = categorizeIncome(payer, note, categories);

        records.push({
          amount,
          date: date || `${new Date().getFullYear()}-01-01`,
          payer,
          note,
          category_id: categoryId,
          raw: row
        });
      }

      resolve({
        headers: parsed.headers,
        mapping,
        totalRows: parsed.rowCount,
        validRows: records.length,
        records
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  readCsvFile,
  detectColumns,
  normalizeDate,
  normalizeAmount,
  categorizeIncome,
  parseBankCsv
};
