const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const db = require('./services/database');
const fileService = require('./services/fileService');
const ocrService = require('./services/ocrService');
const csvParser = require('./services/csvParser');

const isDev = !app.isPackaged;

function ensureDataDir() {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const invoicesDir = path.join(dataDir, 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  return dataDir;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0F172A',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return mainWindow;
}

function registerIpcHandlers() {
  ipcMain.handle('income:create', (_event, data) => {
    return db.createIncome(data);
  });

  ipcMain.handle('income:list', (_event, params) => {
    return db.listIncomes(params);
  });

  ipcMain.handle('income:update', (_event, id, data) => {
    return db.updateIncome(id, data);
  });

  ipcMain.handle('income:delete', (_event, id) => {
    return db.deleteIncome(id);
  });

  ipcMain.handle('income:stats', (_event, params) => {
    return db.getIncomeStats(params);
  });

  ipcMain.handle('income:categories', () => {
    return db.listIncomeCategories();
  });

  ipcMain.handle('income:importCsv', async (_event, filePath, mapping) => {
    const result = await csvParser.parseBankCsv(filePath, mapping);
    const imported = [];
    for (const record of result.records) {
      const income = db.createIncome({
        amount: record.amount,
        date: record.date,
        category_id: record.category_id,
        payer: record.payer,
        note: record.note
      });
      imported.push(income);
    }
    return {
      ...result,
      imported
    };
  });

  ipcMain.handle('tax:getRates', (_event, region) => {
    return db.getTaxRates(region);
  });

  ipcMain.handle('tax:saveRates', (_event, region, rates) => {
    return db.saveTaxRates(region, rates);
  });

  ipcMain.handle('tax:getDeductions', () => {
    return db.getDeductions();
  });

  ipcMain.handle('tax:saveDeduction', (_event, deduction) => {
    return db.saveDeduction(deduction);
  });

  ipcMain.handle('tax:deleteDeduction', (_event, id) => {
    return db.deleteDeduction(id);
  });

  ipcMain.handle('invoice:upload', async (_event, data) => {
    let storedPath = data.filePath;
    if (data.filePath && fs.existsSync(data.filePath)) {
      storedPath = fileService.copyInvoiceFile(data.filePath);
    }
    const fileType = fileService.getFileType(storedPath);
    return db.createInvoice({
      ...data,
      file_path: storedPath,
      file_type: fileType
    });
  });

  ipcMain.handle('invoice:list', (_event, params) => {
    return db.listInvoices(params);
  });

  ipcMain.handle('invoice:ocr', async (_event, filePath) => {
    return ocrService.recognize(filePath);
  });

  ipcMain.handle('invoice:get', (_event, id) => {
    return db.getInvoiceById(id);
  });

  ipcMain.handle('invoice:update', (_event, id, data) => {
    return db.updateInvoice(id, data);
  });

  ipcMain.handle('invoice:delete', (_event, id) => {
    return db.deleteInvoice(id);
  });

  ipcMain.handle('invoice:categories', () => {
    return db.listInvoiceCategories();
  });

  ipcMain.handle('file:openDialog', async (_event, options) => {
    return fileService.openDialog(options);
  });

  ipcMain.handle('file:saveDialog', async (_event, options) => {
    return fileService.saveDialog(options);
  });

  ipcMain.handle('file:readCsv', async (_event, filePath) => {
    return fileService.readCsv(filePath);
  });

  ipcMain.handle('file:exportData', async (_event, exportPath) => {
    return fileService.exportData(exportPath);
  });

  ipcMain.handle('settings:get', () => {
    return db.getSettings();
  });

  ipcMain.handle('settings:save', (_event, data) => {
    return db.saveSettings(data);
  });

  ipcMain.handle('settings:exportDatabase', async () => {
    return fileService.exportDatabase();
  });

  ipcMain.handle('settings:importDatabase', async (_event, filePath) => {
    return fileService.importDatabase(filePath);
  });
}

app.whenReady().then(async () => {
  ensureDataDir();
  await db.initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
