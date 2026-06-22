const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const initSqlJs = require('sql.js');

let db;
let SQL;

function getDataDir() {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function getInvoicesDir() {
  const dataDir = getDataDir();
  const invoicesDir = path.join(dataDir, 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  return invoicesDir;
}

function getDbPath() {
  return path.join(getDataDir(), 'database.db');
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

function normalizeParams(params) {
  if (params === undefined || params === null) return [];
  if (!Array.isArray(params)) return [params];
  return params;
}

function prepare(sql) {
  const stmt = db.prepare(sql);
  return {
    run(...params) {
      const args = normalizeParams(params.length === 1 ? params[0] : params);
      stmt.bind(args);
      stmt.step();
      stmt.freemem();
      return true;
    },
    get(...params) {
      const args = normalizeParams(params.length === 1 ? params[0] : params);
      stmt.reset();
      stmt.bind(args);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.freemem();
        return row;
      }
      stmt.freemem();
      return undefined;
    },
    all(...params) {
      const args = normalizeParams(params.length === 1 ? params[0] : params);
      stmt.reset();
      stmt.bind(args);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.freemem();
      return rows;
    }
  };
}

async function initDatabase() {
  getInvoicesDir();
  if (!SQL) {
    SQL = await initSqlJs();
  }
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    db = new SQL.Database(new Uint8Array(data));
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA foreign_keys = ON');
  createTables();
  seedInitialData();
  saveDatabase();
  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS income_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      keywords TEXT DEFAULT '',
      color TEXT DEFAULT '#0D9488',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      category_id INTEGER,
      payer TEXT DEFAULT '',
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES income_categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
    CREATE INDEX IF NOT EXISTS idx_incomes_category ON incomes(category_id);

    CREATE TABLE IF NOT EXISTS tax_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT NOT NULL DEFAULT 'default',
      min_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      max_amount DECIMAL(12,2),
      rate DECIMAL(5,4) NOT NULL,
      quick_deduction DECIMAL(12,2) DEFAULT 0,
      level INTEGER
    );

    CREATE TABLE IF NOT EXISTS deductions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      type TEXT DEFAULT 'special',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      amount DECIMAL(12,2),
      invoice_date DATE,
      invoice_number TEXT,
      category_id INTEGER,
      ocr_text TEXT,
      search_index TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES invoice_categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_search ON invoices(search_index);
    CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function seedInitialData() {
  const insertCategory = prepare(
    'INSERT OR IGNORE INTO income_categories (name, keywords, color) VALUES (?, ?, ?)'
  );
  const categories = [
    ['设计费', '设计,design,UI,平面,视觉', '#8B5CF6'],
    ['咨询费', '咨询,consult,顾问,advisory', '#0D9488'],
    ['开发费', '开发,develop,代码,program,编程', '#3B82F6'],
    ['写作费', '写作,write,文案,content', '#F59E0B'],
    ['翻译费', '翻译,translate,interpret', '#EC4899'],
    ['其他收入', '其他,other', '#6B7280']
  ];
  for (const cat of categories) {
    insertCategory.run(cat);
  }

  const insertInvoiceCategory = prepare(
    'INSERT OR IGNORE INTO invoice_categories (name) VALUES (?)'
  );
  const invoiceCategories = ['办公用品', '差旅费', '餐饮费', '通讯费', '其他'];
  for (const cat of invoiceCategories) {
    insertInvoiceCategory.run([cat]);
  }

  const insertSetting = prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  const settings = [
    ['theme', 'dark'],
    ['region', 'default'],
    ['currency', 'CNY'],
    ['social_insurance_base', '0'],
    ['social_insurance_rate', '0.105']
  ];
  for (const set of settings) {
    insertSetting.run(set);
  }

  const taxCount = prepare('SELECT COUNT(*) as count FROM tax_rates WHERE region = ?').get('default');
  if (taxCount.count === 0) {
    const insertTaxRate = prepare(
      'INSERT INTO tax_rates (region, min_amount, max_amount, rate, quick_deduction, level) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const taxRates = [
      ['default', 0, 36000, 0.03, 0, 1],
      ['default', 36000, 144000, 0.10, 2520, 2],
      ['default', 144000, 300000, 0.20, 16920, 3],
      ['default', 300000, 420000, 0.25, 31920, 4],
      ['default', 420000, 660000, 0.30, 52920, 5],
      ['default', 660000, 960000, 0.35, 85920, 6],
      ['default', 960000, null, 0.45, 181920, 7]
    ];
    for (const rate of taxRates) {
      insertTaxRate.run(rate);
    }
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

function createIncome(data) {
  const categoryId = data.category_id !== undefined 
    ? data.category_id 
    : (data.category !== undefined ? data.category : null);

  const stmt = prepare(
    'INSERT INTO incomes (amount, date, category_id, payer, note) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run([
    data.amount,
    data.date,
    categoryId,
    data.payer || '',
    data.note || ''
  ]);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  saveDatabase();
  return getIncomeById(lastId);
}

function getIncomeById(id) {
  return prepare(
    `SELECT i.*, c.name as category_name, c.color as category_color
     FROM incomes i LEFT JOIN income_categories c ON i.category_id = c.id
     WHERE i.id = ?`
  ).get([id]);
}

function listIncomes(params = {}) {
  const { page = 1, pageSize = 20, filter = {} } = params;
  const where = [];
  const args = [];

  if (filter.startDate) {
    where.push('i.date >= ?');
    args.push(filter.startDate);
  }
  if (filter.endDate) {
    where.push('i.date <= ?');
    args.push(filter.endDate);
  }
  if (filter.category_id) {
    where.push('i.category_id = ?');
    args.push(filter.category_id);
  }
  if (filter.keyword) {
    where.push('(i.payer LIKE ? OR i.note LIKE ?)');
    args.push(`%${filter.keyword}%`, `%${filter.keyword}%`);
  }

  const whereSql = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  const offset = (page - 1) * pageSize;

  const total = prepare(
    `SELECT COUNT(*) as count FROM incomes i ${whereSql}`
  ).get(args).count;

  const items = prepare(
    `SELECT i.*, c.name as category_name, c.color as category_color
     FROM incomes i LEFT JOIN income_categories c ON i.category_id = c.id
     ${whereSql}
     ORDER BY i.date DESC, i.id DESC
     LIMIT ? OFFSET ?`
  ).all([...args, pageSize, offset]);

  return { total, items, page, pageSize };
}

function updateIncome(id, data) {
  if (data.category !== undefined && data.category_id === undefined) {
    data.category_id = data.category;
    delete data.category;
  }

  const fields = [];
  const args = [];
  const allowed = ['amount', 'date', 'category_id', 'payer', 'note'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(data[key]);
    }
  }
  if (fields.length === 0) return getIncomeById(id);
  args.push(id);
  prepare(`UPDATE incomes SET ${fields.join(', ')} WHERE id = ?`).run(args);
  saveDatabase();
  return getIncomeById(id);
}

function deleteIncome(id) {
  prepare('DELETE FROM incomes WHERE id = ?').run([id]);
  const changes = db.getRowsModified();
  saveDatabase();
  return changes > 0;
}

function getIncomeStats(params = {}) {
  const { year, month } = params;
  let dateStart, dateEnd;

  if (year && month) {
    const m = String(month).padStart(2, '0');
    dateStart = `${year}-${m}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    dateEnd = `${year}-${m}-${lastDay}`;
  } else if (year) {
    dateStart = `${year}-01-01`;
    dateEnd = `${year}-12-31`;
  } else {
    const now = new Date();
    dateStart = `${now.getFullYear()}-01-01`;
    dateEnd = `${now.getFullYear()}-12-31`;
  }

  const totalIncome = prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE date BETWEEN ? AND ?'
  ).get([dateStart, dateEnd]).total;

  const byCategory = prepare(
    `SELECT c.id, c.name, c.color, COALESCE(SUM(i.amount), 0) as total
     FROM income_categories c LEFT JOIN incomes i
     ON c.id = i.category_id AND i.date BETWEEN ? AND ?
     GROUP BY c.id, c.name, c.color
     ORDER BY total DESC`
  ).all([dateStart, dateEnd]);

  const byMonth = prepare(
    `SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total
     FROM incomes WHERE date BETWEEN ? AND ?
     GROUP BY strftime('%Y-%m', date)
     ORDER BY month ASC`
  ).all([dateStart, dateEnd]);

  const count = prepare(
    'SELECT COUNT(*) as count FROM incomes WHERE date BETWEEN ? AND ?'
  ).get([dateStart, dateEnd]).count;

  return {
    totalIncome,
    count,
    byCategory,
    byMonth,
    dateStart,
    dateEnd
  };
}

function listIncomeCategories() {
  return prepare('SELECT * FROM income_categories ORDER BY id ASC').all();
}

function getTaxRates(region = 'default') {
  const rows = prepare(
    'SELECT * FROM tax_rates WHERE region = ? ORDER BY level ASC'
  ).all([region]);
  return rows.map(r => ({
    id: r.id,
    region: r.region,
    min: r.min_amount,
    max: r.max_amount,
    rate: r.rate,
    deduction: r.quick_deduction || 0,
    level: r.level
  }));
}

function saveTaxRates(region, rates) {
  prepare('DELETE FROM tax_rates WHERE region = ?').run([region]);
  const insert = prepare(
    'INSERT INTO tax_rates (region, min_amount, max_amount, rate, quick_deduction, level) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (let i = 0; i < rates.length; i++) {
    const r = rates[i];
    insert.run([
      region,
      r.min !== undefined ? r.min : r.min_amount,
      r.max !== undefined ? r.max : r.max_amount,
      r.rate,
      (r.deduction !== undefined ? r.deduction : r.quick_deduction) || 0,
      i + 1
    ]);
  }
  saveDatabase();
  return getTaxRates(region);
}

function getDeductions() {
  return prepare('SELECT * FROM deductions ORDER BY created_at DESC').all();
}

function saveDeduction(deduction) {
  if (deduction.id) {
    prepare(
      'UPDATE deductions SET name = ?, amount = ?, type = ? WHERE id = ?'
    ).run([deduction.name, deduction.amount, deduction.type || 'special', deduction.id]);
    saveDatabase();
    return prepare('SELECT * FROM deductions WHERE id = ?').get([deduction.id]);
  } else {
    prepare(
      'INSERT INTO deductions (name, amount, type) VALUES (?, ?, ?)'
    ).run([deduction.name, deduction.amount, deduction.type || 'special']);
    const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    saveDatabase();
    return prepare('SELECT * FROM deductions WHERE id = ?').get([lastId]);
  }
}

function deleteDeduction(id) {
  prepare('DELETE FROM deductions WHERE id = ?').run([id]);
  const changes = db.getRowsModified();
  saveDatabase();
  return changes > 0;
}

function createInvoice(data) {
  const searchParts = [
    data.invoice_number || '',
    data.ocr_text || '',
    data.amount ? String(data.amount) : '',
    data.invoice_date || ''
  ];
  const searchIndex = searchParts.join(' ');

  const stmt = prepare(
    `INSERT INTO invoices (file_path, file_type, amount, invoice_date, invoice_number, category_id, ocr_text, search_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run([
    data.file_path,
    data.file_type,
    data.amount || null,
    data.invoice_date || null,
    data.invoice_number || null,
    data.category_id || null,
    data.ocr_text || null,
    searchIndex
  ]);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  saveDatabase();
  return getInvoiceById(lastId);
}

function getInvoiceById(id) {
  return prepare(
    `SELECT i.*, c.name as category_name
     FROM invoices i LEFT JOIN invoice_categories c ON i.category_id = c.id
     WHERE i.id = ?`
  ).get([id]);
}

function listInvoices(params = {}) {
  const { keyword = '', category = null } = params;
  const where = [];
  const args = [];

  if (keyword) {
    where.push('i.search_index LIKE ?');
    args.push(`%${keyword}%`);
  }
  if (category) {
    where.push('i.category_id = ?');
    args.push(category);
  }

  const whereSql = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  return prepare(
    `SELECT i.*, c.name as category_name
     FROM invoices i LEFT JOIN invoice_categories c ON i.category_id = c.id
     ${whereSql}
     ORDER BY i.created_at DESC`
  ).all(args);
}

function updateInvoice(id, data) {
  const fields = [];
  const args = [];
  const allowed = ['file_path', 'file_type', 'amount', 'invoice_date', 'invoice_number', 'category_id', 'ocr_text'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(data[key]);
    }
  }
  if (fields.length === 0) return getInvoiceById(id);

  const searchParts = [];
  const allData = { ...getInvoiceById(id), ...data };
  if (allData.invoice_number) searchParts.push(allData.invoice_number);
  if (allData.ocr_text) searchParts.push(allData.ocr_text);
  if (allData.amount) searchParts.push(String(allData.amount));
  if (allData.invoice_date) searchParts.push(allData.invoice_date);
  if (searchParts.length > 0) {
    fields.push('search_index = ?');
    args.push(searchParts.join(' '));
  }

  args.push(id);
  prepare(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`).run(args);
  saveDatabase();
  return getInvoiceById(id);
}

function deleteInvoice(id) {
  const invoice = getInvoiceById(id);
  prepare('DELETE FROM invoices WHERE id = ?').run([id]);
  const changes = db.getRowsModified();
  saveDatabase();
  if (changes > 0 && invoice && invoice.file_path) {
    try {
      if (fs.existsSync(invoice.file_path)) {
        fs.unlinkSync(invoice.file_path);
      }
    } catch (e) {
      console.error('Failed to delete invoice file:', e);
    }
  }
  return changes > 0;
}

function listInvoiceCategories() {
  return prepare('SELECT * FROM invoice_categories ORDER BY id ASC').all();
}

function getSettings() {
  const rows = prepare('SELECT key, value FROM settings').all();
  const result = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

function saveSettings(settings) {
  const stmt = prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const [key, value] of Object.entries(settings)) {
    stmt.run([key, String(value)]);
  }
  saveDatabase();
  return getSettings();
}

function getDatabasePath() {
  return getDbPath();
}

module.exports = {
  initDatabase,
  getDb,
  prepare,
  getDataDir,
  getInvoicesDir,
  getDatabasePath,
  createIncome,
  getIncomeById,
  listIncomes,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  listIncomeCategories,
  getTaxRates,
  saveTaxRates,
  getDeductions,
  saveDeduction,
  deleteDeduction,
  createInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  listInvoiceCategories,
  getSettings,
  saveSettings
};
