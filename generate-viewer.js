const fs = require('fs');
const path = require('path');

// Configuration
const EXCLUDED_DIRS = new Set(['.git', '.qodo', 'node_modules', 'dist', 'build', '.gemini']);
const EXCLUDED_FILES = new Set(['generate-viewer.js', 'code-viewer.html', 'package-lock.json', '.gitignore']);
const SUPPORTED_EXTENSIONS = new Set(['.html', '.css', '.js', '.json']);

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.has(file)) {
        getFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext) && !EXCLUDED_FILES.has(file)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function getRelativePath(absolutePath, basePath) {
  return path.relative(basePath, absolutePath).replace(/\\/g, '/');
}

function getLanguage(ext) {
  switch (ext) {
    case '.html': return 'markup';
    case '.css': return 'css';
    case '.js': return 'javascript';
    case '.json': return 'json';
    default: return 'plaintext';
  }
}

function getMimeType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    default: return 'text/plain';
  }
}

function run() {
  const workspaceDir = __dirname;
  console.log(`Scanning workspace: ${workspaceDir}...`);
  
  const absoluteFiles = getFiles(workspaceDir);
  const bundledFiles = {};
  
  let totalSize = 0;
  let totalLines = 0;
  const stats = {
    totalFiles: 0,
    html: { count: 0, size: 0, lines: 0 },
    css: { count: 0, size: 0, lines: 0 },
    js: { count: 0, size: 0, lines: 0 },
    json: { count: 0, size: 0, lines: 0 }
  };

  absoluteFiles.forEach(file => {
    const relativePath = getRelativePath(file, workspaceDir);
    const content = fs.readFileSync(file, 'utf8');
    const size = fs.statSync(file).size;
    const lines = content.split('\n').length;
    const ext = path.extname(file).toLowerCase();
    const lang = getLanguage(ext);
    const mime = getMimeType(ext);

    bundledFiles[relativePath] = {
      content,
      size,
      lines,
      lang,
      mime
    };

    totalSize += size;
    totalLines += lines;
    stats.totalFiles++;

    const key = ext.substring(1); // 'html', 'css', 'js', 'json'
    if (stats[key]) {
      stats[key].count++;
      stats[key].size += size;
      stats[key].lines += lines;
    }
  });

  stats.totalSize = totalSize;
  stats.totalLines = totalLines;

  console.log(`Found ${stats.totalFiles} files. Total lines: ${totalLines}. Total size: ${(totalSize / 1024).toFixed(2)} KB.`);

  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Code Hub & Exporter</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Prism Syntax Highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
  
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-sidebar: #111827;
      --bg-card: #1f2937;
      --bg-editor: #0d1117;
      --text-main: #cbd5e1;
      --text-light: #f8fafc;
      --text-muted: #6b7280;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --border: #1f2937;
      --border-light: #374151;
      --accent: #10b981;
      --accent-hover: #059669;
      --danger: #ef4444;
      --font-sans: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
      --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-main);
      color: var(--text-main);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-main);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border-light);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    /* Top Navigation / Header */
    header {
      background-color: var(--bg-sidebar);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      background: linear-gradient(135deg, var(--primary), #a855f7);
      color: white;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    .brand-text h1 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-light);
      letter-spacing: -0.025em;
    }

    .brand-text p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
    }

    .btn:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background-color: var(--border-light);
      color: var(--text-light);
      border: 1px solid var(--border-light);
    }

    .btn-secondary:hover {
      background-color: var(--border);
      border-color: var(--border-light);
    }

    .btn-success {
      background-color: var(--accent);
    }

    .btn-success:hover {
      background-color: var(--accent-hover);
    }

    /* Main Layout */
    .app-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* Sidebar Styles */
    aside {
      width: 320px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
      transition: var(--transition);
    }

    .search-box {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .search-wrapper {
      position: relative;
    }

    .search-wrapper i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .search-input {
      width: 100%;
      background-color: var(--bg-main);
      border: 1px solid var(--border-light);
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem 0.5rem 2.2rem;
      color: var(--text-light);
      font-family: var(--font-sans);
      font-size: 0.875rem;
      transition: var(--transition);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.5rem;
    }

    /* File List & Groups */
    .file-group {
      margin-bottom: 1.5rem;
    }

    .group-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 0.25rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .group-badge {
      background-color: var(--border-light);
      color: var(--text-main);
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
      font-weight: 500;
    }

    .file-list {
      list-style: none;
    }

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-main);
      transition: var(--transition);
      margin-bottom: 0.125rem;
    }

    .file-item:hover {
      background-color: rgba(255, 255, 255, 0.03);
      color: var(--text-light);
    }

    .file-item.active {
      background-color: rgba(99, 102, 241, 0.15);
      color: var(--text-light);
      border-left: 3px solid var(--primary);
      padding-left: calc(0.75rem - 3px);
    }

    .file-info-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .file-icon {
      font-size: 0.95rem;
      width: 1.2rem;
      display: flex;
      justify-content: center;
    }

    .icon-html { color: #f06529; }
    .icon-css { color: #2965f1; }
    .icon-js { color: #f0db4f; }
    .icon-json { color: #4ade80; }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .file-meta-size {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-left: 0.5rem;
      flex-shrink: 0;
    }

    /* Main Code View Area */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-main);
      overflow: hidden;
      position: relative;
    }

    /* Welcome / Dashboard View */
    .dashboard-view {
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      overflow-y: auto;
      text-align: center;
    }

    .dashboard-card {
      max-width: 800px;
      width: 100%;
      background-color: var(--bg-sidebar);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 2.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .dashboard-title {
      font-size: 2rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
      font-weight: 700;
      background: linear-gradient(to right, var(--text-light), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .dashboard-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 2.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .stat-card {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-light);
      border-radius: 0.5rem;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .stat-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      background-color: rgba(99, 102, 241, 0.02);
    }

    .stat-icon {
      font-size: 1.5rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-val {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-light);
      font-family: var(--font-mono);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    .lang-chart-container {
      margin-bottom: 2.5rem;
    }

    .chart-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-light);
      text-align: left;
      margin-bottom: 0.75rem;
    }

    .chart-bar-wrapper {
      height: 12px;
      background-color: var(--bg-main);
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      margin-bottom: 1rem;
    }

    .chart-segment {
      height: 100%;
      transition: var(--transition);
    }

    .segment-html { background-color: #f06529; }
    .segment-css { background-color: #2965f1; }
    .segment-js { background-color: #f0db4f; }
    .segment-json { background-color: #4ade80; }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-label {
      color: var(--text-main);
    }

    .legend-val {
      color: var(--text-muted);
      font-size: 0.75rem;
      font-family: var(--font-mono);
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    /* Code Viewer Layout */
    .editor-view {
      display: none;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .editor-header {
      background-color: var(--bg-sidebar);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 5;
    }

    .file-path-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
      font-weight: 500;
    }

    .file-path-display i {
      color: var(--text-muted);
    }

    .file-stats-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      background-color: var(--bg-main);
      padding: 0.25rem 0.6rem;
      border-radius: 0.25rem;
      border: 1px solid var(--border);
      font-family: var(--font-mono);
    }

    .editor-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-editor {
      background-color: transparent;
      border: 1px solid var(--border-light);
      color: var(--text-main);
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 500;
      border-radius: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: var(--transition);
    }

    .btn-editor:hover {
      background-color: var(--border);
      color: var(--text-light);
      border-color: var(--text-muted);
    }

    .btn-editor.copied {
      background-color: rgba(16, 185, 129, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Code Block Area */
    .code-container {
      flex: 1;
      overflow: auto;
      background-color: var(--bg-editor);
      position: relative;
    }

    .code-container pre {
      margin: 0 !important;
      padding: 1.5rem !important;
      background-color: transparent !important;
      height: 100%;
      box-sizing: border-box;
      font-family: var(--font-mono) !important;
      font-size: 0.875rem !important;
      line-height: 1.5 !important;
    }

    .code-container code {
      font-family: var(--font-mono) !important;
      background-color: transparent !important;
      text-shadow: none !important;
    }

    /* Prism Customizations for slate theme integration */
    .token.comment, .token.prolog, .token.doctype, .token.cdata {
      color: #6a737d;
    }
    .token.punctuation {
      color: #999;
    }
    .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted {
      color: #ff7b72;
    }
    .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted {
      color: #7ee787;
    }
    .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
      color: #d1f1a5;
    }
    .token.atrule, .token.attr-value, .token.keyword {
      color: #d2a8ff;
    }
    .token.function, .token.class-name {
      color: #d2a8ff;
    }
    .token.regex, .token.important, .token.variable {
      color: #ffab70;
    }

    /* Zip creation modal/spinner overlay */
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(11, 15, 25, 0.85);
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .spinner-overlay.show {
      opacity: 1;
      pointer-events: auto;
    }

    .spinner {
      border: 4px solid rgba(99, 102, 241, 0.1);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border-left-color: var(--primary);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner-text {
      color: var(--text-light);
      font-weight: 500;
      font-size: 1.1rem;
    }

    /* Mobile Sidebar Toggle */
    .sidebar-toggle {
      display: none;
      background-color: transparent;
      border: 1px solid var(--border-light);
      color: var(--text-main);
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.375rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: var(--transition);
    }

    .sidebar-toggle:hover {
      background-color: var(--border);
      color: var(--text-light);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sidebar-toggle {
        display: flex;
      }
      
      aside {
        position: absolute;
        left: -320px;
        top: 0;
        bottom: 0;
        z-index: 40;
        box-shadow: 10px 0 25px rgba(0, 0, 0, 0.5);
      }

      aside.open {
        left: 0;
      }

      .backdrop {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 35;
      }

      .backdrop.show {
        display: block;
      }

      .dashboard-card {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>

  <!-- Backdrop for mobile sidebar -->
  <div class="backdrop" id="sidebarBackdrop"></div>

  <!-- Header -->
  <header>
    <div class="brand">
      <button class="sidebar-toggle" id="sidebarToggle" title="Toggle Sidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="brand-logo">HP</div>
      <div class="brand-text">
        <h1>Hyperlocal Admin Portal</h1>
        <p>Project Code Hub & Exporter</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="showDashboard()" title="View Statistics & Info">
        <i class="fa-solid fa-chart-simple"></i> Dashboard
      </button>
      <button class="btn btn-success" id="downloadZipBtn" onclick="downloadAllAsZip()" title="Download whole codebase as a single ZIP file">
        <i class="fa-solid fa-file-zipper"></i> Download ZIP
      </button>
    </div>
  </header>

  <div class="app-container">
    <!-- Sidebar -->
    <aside id="appSidebar">
      <div class="search-box">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="searchInput" class="search-input" placeholder="Search files by path/name..." oninput="filterFiles()">
        </div>
      </div>
      <div class="sidebar-content" id="sidebarContent">
        <!-- Dynamic sidebar content loaded via JS -->
      </div>
    </aside>

    <!-- Main Content View -->
    <main>
      <!-- Welcome/Dashboard State -->
      <div class="dashboard-view" id="dashboardView">
        <div class="dashboard-card">
          <h2 class="dashboard-title">Hyperlocal Admin Portal</h2>
          <p class="dashboard-subtitle">A comprehensive offline/online code explorer and downloader for the administration module</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <i class="fa-solid fa-file-code stat-icon"></i>
              <span class="stat-val" id="statFiles">0</span>
              <span class="stat-label">Total Files</span>
            </div>
            <div class="stat-card">
              <i class="fa-solid fa-align-left stat-icon"></i>
              <span class="stat-val" id="statLines">0</span>
              <span class="stat-label">Total Lines</span>
            </div>
            <div class="stat-card">
              <i class="fa-solid fa-weight-hanging stat-icon"></i>
              <span class="stat-val" id="statSize">0 KB</span>
              <span class="stat-label">Total Size</span>
            </div>
          </div>

          <div class="lang-chart-container">
            <h3 class="chart-title">Code Composition</h3>
            <div class="chart-bar-wrapper" id="chartBarWrapper">
              <!-- Visual bar populated via JS -->
            </div>
            <div class="chart-legend" id="chartLegend">
              <!-- Legend items populated via JS -->
            </div>
          </div>

          <div class="quick-actions">
            <button class="btn btn-secondary" onclick="focusSearch()">
              <i class="fa-solid fa-search"></i> Search Files
            </button>
            <button class="btn" onclick="downloadAllAsZip()">
              <i class="fa-solid fa-file-zipper"></i> Download All as ZIP
            </button>
          </div>
        </div>
      </div>

      <!-- Code Editor/Viewer State -->
      <div class="editor-view" id="editorView">
        <div class="editor-header">
          <div class="file-path-display">
            <i class="fa-solid fa-file-code" id="activeFileIcon"></i>
            <span id="activeFilePath">path/to/file.js</span>
            <div class="file-stats-badge">
              <span id="activeFileSize">0 B</span>
              <span>|</span>
              <span id="activeFileLineCount">0 lines</span>
            </div>
          </div>
          <div class="editor-actions">
            <button class="btn-editor" id="copyCodeBtn" onclick="copyCode()" title="Copy entire code to clipboard">
              <i class="fa-solid fa-copy"></i> <span>Copy Code</span>
            </button>
            <button class="btn-editor" onclick="downloadActiveFile()" title="Download this file individually">
              <i class="fa-solid fa-download"></i> <span>Download File</span>
            </button>
          </div>
        </div>
        <div class="code-container">
          <pre class="line-numbers"><code id="codeBlock" class="language-javascript"></code></pre>
        </div>
      </div>
    </main>
  </div>

  <!-- Loading zip spinner overlay -->
  <div class="spinner-overlay" id="spinnerOverlay">
    <div class="spinner"></div>
    <div class="spinner-text" id="spinnerText">Generating ZIP export...</div>
  </div>

  <!-- JSZip and Prism scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>

  <!-- Project Files Data injection -->
  <script>
    const PROJECT_FILES = ${JSON.stringify(bundledFiles, null, 2)};
    const PROJECT_STATS = ${JSON.stringify(stats, null, 2)};
    
    let activeFilePath = null;

    // Helper functions
    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileIcon(lang) {
      switch (lang) {
        case 'markup': return 'fa-html5 icon-html';
        case 'css': return 'fa-css3-alt icon-css';
        case 'javascript': return 'fa-js icon-js';
        case 'json': return 'fa-braces icon-json';
        default: return 'fa-file-code text-muted';
      }
    }

    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Populate stats dashboard
      document.getElementById('statFiles').innerText = PROJECT_STATS.totalFiles;
      document.getElementById('statLines').innerText = PROJECT_STATS.totalLines.toLocaleString();
      document.getElementById('statSize').innerText = formatBytes(PROJECT_STATS.totalSize);

      // 2. Render code composition chart
      renderCompositionChart();

      // 3. Build sidebar list
      renderSidebarList();

      // 4. Set up mobile sidebar events
      const sidebarToggle = document.getElementById('sidebarToggle');
      const appSidebar = document.getElementById('appSidebar');
      const sidebarBackdrop = document.getElementById('sidebarBackdrop');

      sidebarToggle.addEventListener('click', () => {
        appSidebar.classList.toggle('open');
        sidebarBackdrop.classList.toggle('show');
      });

      sidebarBackdrop.addEventListener('click', () => {
        appSidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('show');
      });
    });

    function showDashboard() {
      document.getElementById('editorView').style.display = 'none';
      document.getElementById('dashboardView').style.display = 'flex';
      
      // De-select sidebar files
      const activeItem = document.querySelector('.file-item.active');
      if (activeItem) activeItem.classList.remove('active');
      activeFilePath = null;

      // Close mobile sidebar if open
      document.getElementById('appSidebar').classList.remove('open');
      document.getElementById('sidebarBackdrop').classList.remove('show');
    }

    function focusSearch() {
      document.getElementById('searchInput').focus();
    }

    function renderCompositionChart() {
      const barWrapper = document.getElementById('chartBarWrapper');
      const legend = document.getElementById('chartLegend');
      
      barWrapper.innerHTML = '';
      legend.innerHTML = '';

      const languages = [
        { name: 'HTML', key: 'html', color: '#f06529', cls: 'segment-html' },
        { name: 'CSS', key: 'css', color: '#2965f1', cls: 'segment-css' },
        { name: 'JS', key: 'js', color: '#f0db4f', cls: 'segment-js' },
        { name: 'JSON', key: 'json', color: '#4ade80', cls: 'segment-json' }
      ];

      languages.forEach(lang => {
        const data = PROJECT_STATS[lang.key];
        if (!data || data.count === 0) return;

        const countPercent = (data.count / PROJECT_STATS.totalFiles) * 100;
        
        // Add chart segment
        const segment = document.createElement('div');
        segment.className = `chart-segment \${lang.cls}`;
        segment.style.width = `\${countPercent}%`;
        segment.title = `\${lang.name}: \${data.count} files (\${countPercent.toFixed(1)}%)`;
        barWrapper.appendChild(segment);

        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
          <span class="legend-color" style="background-color: \${lang.color}"></span>
          <span class="legend-label">\${lang.name}</span>
          <span class="legend-val">\${data.count} files (\${formatBytes(data.size)})</span>
        `;
        legend.appendChild(legendItem);
      });
    }

    function renderSidebarList(filterTerm = '') {
      const container = document.getElementById('sidebarContent');
      container.innerHTML = '';

      // Group files
      const groups = {
        'root': { title: 'Root HTML Files', files: [] },
        'css': { title: 'CSS Stylesheets (css/)', files: [] },
        'js': { title: 'JavaScript Logic (js/)', files: [] },
        'data': { title: 'JSON Data (data/)', files: [] }
      };

      Object.keys(PROJECT_FILES).forEach(path => {
        if (filterTerm && !path.toLowerCase().includes(filterTerm.toLowerCase())) {
          return;
        }

        const data = PROJECT_FILES[path];
        if (path.startsWith('css/')) {
          groups.css.files.push({ path, ...data });
        } else if (path.startsWith('js/')) {
          groups.js.files.push({ path, ...data });
        } else if (path.startsWith('data/')) {
          groups.data.files.push({ path, ...data });
        } else {
          groups.root.files.push({ path, ...data });
        }
      });

      // Render groups
      Object.keys(groups).forEach(key => {
        const group = groups[key];
        if (group.files.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'file-group';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'group-title';
        titleDiv.innerHTML = `
          <span>\${group.title}</span>
          <span class="group-badge">\${group.files.length}</span>
        `;
        groupDiv.appendChild(titleDiv);

        const listUl = document.createElement('ul');
        listUl.className = 'file-list';

        group.files.sort((a, b) => a.path.localeCompare(b.path)).forEach(file => {
          const li = document.createElement('li');
          li.className = 'file-item';
          if (activeFilePath === file.path) {
            li.classList.add('active');
          }
          li.dataset.path = file.path;
          li.onclick = () => selectFile(file.path);

          // Get filename only for listing
          const parts = file.path.split('/');
          const fileName = parts[parts.length - 1];

          li.innerHTML = `
            <div class="file-info-left">
              <i class="fa-brands \${getFileIcon(file.lang)} file-icon"></i>
              <span class="file-name" title="\${file.path}">\${fileName}</span>
            </div>
            <span class="file-meta-size">\${formatBytes(file.size)}</span>
          `;
          listUl.appendChild(li);
        });

        groupDiv.appendChild(listUl);
        container.appendChild(groupDiv);
      });
    }

    function filterFiles() {
      const term = document.getElementById('searchInput').value;
      renderSidebarList(term);
    }

    function selectFile(filePath) {
      activeFilePath = filePath;
      const fileData = PROJECT_FILES[filePath];
      if (!fileData) return;

      // Close mobile sidebar if open
      document.getElementById('appSidebar').classList.remove('open');
      document.getElementById('sidebarBackdrop').classList.remove('show');

      // Update active state in sidebar
      document.querySelectorAll('.file-item').forEach(item => {
        if (item.dataset.path === filePath) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Update UI displays
      document.getElementById('dashboardView').style.display = 'none';
      document.getElementById('editorView').style.display = 'flex';
      document.getElementById('activeFilePath').innerText = filePath;
      document.getElementById('activeFileSize').innerText = formatBytes(fileData.size);
      document.getElementById('activeFileLineCount').innerText = `\${fileData.lines} lines`;

      // Set file icon
      const iconEl = document.getElementById('activeFileIcon');
      iconEl.className = 'fa-brands';
      
      const iconClass = getFileIcon(fileData.lang);
      iconClass.split(' ').forEach(cls => iconEl.classList.add(cls));

      // Reset Copy button visual state
      const copyBtn = document.getElementById('copyCodeBtn');
      copyBtn.classList.remove('copied');
      copyBtn.querySelector('span').innerText = 'Copy Code';
      copyBtn.querySelector('i').className = 'fa-solid fa-copy';

      // Load code content
      const codeBlock = document.getElementById('codeBlock');
      codeBlock.className = `language-\${fileData.lang} line-numbers`;
      
      // Escape HTML characters
      codeBlock.textContent = fileData.content;

      // Highlight syntax
      Prism.highlightElement(codeBlock);
      
      // Reset scroll of code block to top
      document.querySelector('.code-container').scrollTop = 0;
      document.querySelector('.code-container').scrollLeft = 0;
    }

    function copyCode() {
      if (!activeFilePath) return;
      const content = PROJECT_FILES[activeFilePath].content;
      
      navigator.clipboard.writeText(content).then(() => {
        const copyBtn = document.getElementById('copyCodeBtn');
        copyBtn.classList.add('copied');
        copyBtn.querySelector('span').innerText = 'Copied!';
        copyBtn.querySelector('i').className = 'fa-solid fa-check';

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.querySelector('span').innerText = 'Copy Code';
          copyBtn.querySelector('i').className = 'fa-solid fa-copy';
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy text. Please select manually and copy.');
      });
    }

    function downloadActiveFile() {
      if (!activeFilePath) return;
      const fileData = PROJECT_FILES[activeFilePath];
      
      const blob = new Blob([fileData.content], { type: fileData.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFilePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function downloadAllAsZip() {
      const spinnerOverlay = document.getElementById('spinnerOverlay');
      const spinnerText = document.getElementById('spinnerText');
      
      spinnerOverlay.classList.add('show');
      spinnerText.innerText = 'Initializing ZIP Generator...';

      setTimeout(() => {
        try {
          if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded. Please connect to the internet.');
          }

          const zip = new JSZip();
          spinnerText.innerText = 'Bundling files...';

          Object.keys(PROJECT_FILES).forEach(filePath => {
            const data = PROJECT_FILES[filePath];
            zip.file(filePath, data.content);
          });

          spinnerText.innerText = 'Compressing archive...';
          
          zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hyperlocal-admin-portal-code-export.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            spinnerOverlay.classList.remove('show');
          }).catch(err => {
            console.error(err);
            alert('Compression failed: ' + err.message);
            spinnerOverlay.classList.remove('show');
          });

        } catch (error) {
          console.error(error);
          alert(error.message);
          spinnerOverlay.classList.remove('show');
        }
      }, 300);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(workspaceDir, 'code-viewer.html'), htmlTemplate, 'utf8');
  console.log(`Successfully generated code-viewer.html inside: ${workspaceDir}`);
}

run();
