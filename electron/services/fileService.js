const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const Papa = require('papaparse');
const { getInvoicesDir, getDataDir, getDatabasePath, getDb } = require('./database');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

async function openDialog(options = {}) {
  const { filters = [], properties = ['openFile'] } = options;
  const result = await dialog.showOpenDialog({
    filters,
    properties
  });
  return result;
}

async function saveDialog(options = {}) {
  const { defaultPath = '', filters = [] } = options;
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters
  });
  return result;
}

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      Papa.parse(fileContent, {
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

function copyInvoiceFile(sourcePath) {
  const invoicesDir = ensureDir(getInvoicesDir());
  const ext = path.extname(sourcePath).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `invoice_${timestamp}_${random}${ext}`;
  const destPath = path.join(invoicesDir, fileName);
  fs.copyFileSync(sourcePath, destPath);
  return destPath;
}

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  if (imageTypes.includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

async function exportData(exportPath) {
  const db = getDb();

  const tables = {
    income_categories: db.prepare('SELECT * FROM income_categories').all(),
    incomes: db.prepare('SELECT * FROM incomes').all(),
    tax_rates: db.prepare('SELECT * FROM tax_rates').all(),
    deductions: db.prepare('SELECT * FROM deductions').all(),
    invoice_categories: db.prepare('SELECT * FROM invoice_categories').all(),
    invoices: db.prepare('SELECT * FROM invoices').all(),
    settings: db.prepare('SELECT * FROM settings').all()
  };

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tables
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  fs.writeFileSync(exportPath, jsonContent, 'utf-8');
  return { success: true, path: exportPath };
}

async function exportDatabase() {
  const dbPath = getDatabasePath();
  const defaultPath = `freelance-tax-db-${Date.now()}.db`;
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: 'SQLite Database', extensions: ['db'] }]
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  fs.copyFileSync(dbPath, result.filePath);
  return { success: true, path: result.filePath };
}

async function importDatabase(filePath) {
  const dbPath = getDatabasePath();
  const db = getDb();
  db.close();

  const backupPath = `${dbPath}.backup-${Date.now()}`;
  try {
    fs.copyFileSync(dbPath, backupPath);
  } catch (e) {
    console.error('Backup failed:', e);
  }

  fs.copyFileSync(filePath, dbPath);

  return { success: true, path: dbPath, backupPath };
}

module.exports = {
  ensureDir,
  openDialog,
  saveDialog,
  readCsv,
  copyInvoiceFile,
  getFileType,
  exportData,
  exportDatabase,
  importDatabase
};
