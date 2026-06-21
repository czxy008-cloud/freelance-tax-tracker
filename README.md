# Freelance Tax Tracker - 自由职业税务追踪

一款专为自由职业者设计的桌面税务管理应用，帮助您追踪收入、管理发票、计算税款。

## 项目介绍

Freelance Tax Tracker 是一个基于 Electron + Vue 3 的桌面端税务管理应用，提供以下核心功能：

- 收入记录管理：记录和分类您的各项收入
- 发票管理：上传、OCR 识别和管理发票
- 税务计算：基于累进税率的自动税款计算
- 数据可视化：通过图表直观展示收入和税务数据
- 数据备份与恢复：支持数据库备份、JSON 数据导出

## 安装与运行

### 环境要求
- Node.js >= 16
- npm >= 7

### 安装依赖
```bash
npm install
```

### 开发模式运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - Vue.js 官方路由
- **Pinia** - Vue 状态管理库

### UI & 样式
- **Tailwind CSS** - 实用优先的 CSS 框架
- **@heroicons/vue** - 精美的 SVG 图标库

### 图表
- **Chart.js** - 灵活的 JavaScript 图表库
- **vue-chartjs** - Chart.js 的 Vue 封装

### Electron 桌面端
- **Electron** - 使用 JavaScript 构建跨平台桌面应用
- **better-sqlite3** - 高性能 SQLite 数据库绑定

### 数据处理
- **PapaParse** - 强大的 CSV 解析器
- **tesseract.js** - 纯 JavaScript OCR 引擎
- **pdfjs-dist** - PDF 文档处理

### 构建工具
- **Vite** - 下一代前端构建工具
- **electron-builder** - Electron 应用打包工具
