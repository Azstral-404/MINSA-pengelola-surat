/**
 * MINSA Surat Manager — Electron Main Process
 * Optimized for Windows 10/11, offline-first, lightweight
 */

'use strict';

const { app, BrowserWindow, shell, ipcMain, dialog, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── Windows 10/11 optimizations ──────────────────────────────────────────────
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
// Smoother rendering on integrated GPU (common on school PCs)
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
// Reduce memory footprint
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256');

// ── Single instance lock ──────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

// ── App metadata ──────────────────────────────────────────────────────────────
app.setAppUserModelId('com.azstral.minsa');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const APP_NAME = 'MINSA-Surat-Manager';
const APP_VERSION = app.getVersion();

// ── Data path management ──────────────────────────────────────────────────────
const DATA_PATH_CONFIG_DIR = path.join(app.getPath('appData'), 'AZSTRAL-MINSA');
const DATA_PATH_CONFIG_FILE = path.join(DATA_PATH_CONFIG_DIR, 'data-path.txt');

let customDataPath = null;

function getEffectiveDataDir() {
  return customDataPath || path.join(app.getPath('appData'), APP_NAME);
}

function getDataFile() {
  return path.join(getEffectiveDataDir(), 'minsa-data.json');
}

function loadCustomDataPath() {
  try {
    if (fs.existsSync(DATA_PATH_CONFIG_FILE)) {
      const p = fs.readFileSync(DATA_PATH_CONFIG_FILE, 'utf8').trim();
      if (p && fs.existsSync(p)) {
        customDataPath = p;
        app.setPath('userData', p);
      }
    }
  } catch {
    // ignore
  }
}

function saveCustomDataPath(p) {
  try {
    fs.mkdirSync(DATA_PATH_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH_CONFIG_FILE, p, 'utf8');
    customDataPath = p;
    app.setPath('userData', p);
  } catch {
    // ignore
  }
}

// Load path BEFORE app.ready (critical for setPath to work)
loadCustomDataPath();

// ── Icon path ─────────────────────────────────────────────────────────────────
const ICON_PATH = isDev
  ? path.join(__dirname, '../public/minsa-icon.png')
  : path.join(process.resourcesPath, 'minsa-icon.png');

// ── Window references ─────────────────────────────────────────────────────────
let splashWin = null;
let mainWin = null;

// ── Splash screen ─────────────────────────────────────────────────────────────
function createSplash() {
  splashWin = new BrowserWindow({
    width: 560,
    height: 340,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true,
    backgroundColor: '#1a103c',
    icon: ICON_PATH,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
  });

  const splashHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 560px; height: 340px;
    background: linear-gradient(135deg, #0f0a1f 0%, #1a103c 30%, #2d1b69 60%, #1a103c 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden; user-select: none;
  }
  .grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(130,90,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(130,90,240,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }
  .bg-logo {
    position: absolute;
    width: 320px; height: auto;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.08;
    pointer-events: none;
  }
  .glow {
    position: absolute;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(130,90,240,0.25) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    animation: pulse 3s ease-in-out infinite;
  }
  .logo-container {
    position: relative; z-index: 1;
  }
  .logo-glitch-left {
    position: absolute; top: 0; left: 0;
    width: 200px; height: auto;
    opacity: 0; pointer-events: none;
    filter: hue-rotate(90deg);
    animation: glitchLeft 0.3s infinite;
  }
  .logo-glitch-right {
    position: absolute; top: 0; left: 0;
    width: 200px; height: auto;
    opacity: 0; pointer-events: none;
    filter: hue-rotate(-90deg);
    animation: glitchRight 0.3s infinite;
  }
  .logo {
    width: 200px; height: auto; object-fit: contain;
    filter: drop-shadow(0 8px 28px rgba(130,90,240,0.7));
    animation: logoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative; z-index: 1;
  }
  .name {
    margin-top: 14px;
    color: rgba(255,255,255,0.8);
    font-size: 13px; letter-spacing: 0.15em; font-weight: 500;
    animation: fadeUp 0.6s ease-out 0.3s both;
    position: relative; z-index: 1;
  }
  .progress-wrap {
    position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);
    width: 300px; animation: fadeUp 0.5s ease-out 0.5s both;
  }
  .progress-label {
    display: flex; justify-content: space-between; margin-bottom: 5px;
    color: rgba(255,255,255,0.4); font-size: 10.5px;
  }
  .progress-track {
    height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;
  }
  .progress-bar {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed);
    background-size: 200% 100%;
    border-radius: 2px; transition: width 0.08s linear;
    animation: shine 2s ease-in-out infinite;
  }
  .version {
    position: absolute; bottom: 14px; right: 18px;
    color: rgba(255,255,255,0.22); font-size: 10px; letter-spacing: 0.05em;
  }
  @keyframes logoIn {
    from { opacity: 0; transform: scale(0.8) translateY(14px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gridMove {
    from { transform: translate(0, 0); }
    to { transform: translate(50px, 50px); }
  }
  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
  }
  @keyframes shine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes glitchLeft {
    0%, 100% { transform: translate(-4px, 0); }
    25% { transform: translate(-6px, -2px); }
    50% { transform: translate(-2px, 2px); }
    75% { transform: translate(-5px, 0); }
  }
  @keyframes glitchRight {
    0%, 100% { transform: translate(4px, 0); }
    25% { transform: translate(6px, 2px); }
    50% { transform: translate(2px, -2px); }
    75% { transform: translate(5px, 0); }
  }
  @media (max-width: 560px) {
    body { width: 100%; height: 100vh; }
    .logo, .logo-glitch-left, .logo-glitch-right { width: 160px; }
  }
</style>
</head>
<body>
<div class="grid"></div>
<img class="bg-logo" src="file://${ICON_PATH.replace(/\\/g, '/')}" alt="" aria-hidden="true" />
<div class="glow"></div>
<div class="logo-container">
  <img class="logo-glitch-left" src="file://${ICON_PATH.replace(/\\/g, '/')}" alt="" />
  <img class="logo-glitch-right" src="file://${ICON_PATH.replace(/\\/g, '/')}" alt="" />
  <img class="logo" src="file://${ICON_PATH.replace(/\\/g, '/')}" alt="MINSA" />
</div>
<div class="name">MINSA SURAT MANAGER</div>
<div class="progress-wrap">
  <div class="progress-label">
    <span id="lbl">Memuat komponen...</span>
    <span id="pct">0%</span>
  </div>
  <div class="progress-track"><div class="progress-bar" id="bar"></div></div>
</div>
<div class="version">v${APP_VERSION} · AZSTRAL</div>
<script>
  const bar = document.getElementById('bar');
  const lbl = document.getElementById('lbl');
  const pct = document.getElementById('pct');
  const labels = ['Memuat komponen...','Mempersiapkan data...','Hampir selesai...','Siap!'];
  let p = 0;
  // Trigger glitch effect on load
  setTimeout(() => {
    const glitchLeft = document.querySelector('.logo-glitch-left');
    const glitchRight = document.querySelector('.logo-glitch-right');
    if (glitchLeft) glitchLeft.style.opacity = '0.8';
    if (glitchRight) glitchRight.style.opacity = '0.8';
    setTimeout(() => {
      if (glitchLeft) glitchLeft.style.opacity = '0';
      if (glitchRight) glitchRight.style.opacity = '0';
    }, 500);
  }, 100);
  const t = setInterval(() => {
    p = Math.min(p + (Math.random() * 3 + 1.5), 98);
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
    lbl.textContent = p < 30 ? labels[0] : p < 65 ? labels[1] : p < 90 ? labels[2] : labels[3];
    if (p >= 98) clearInterval(t);
  }, 60);
</script>
</body>
</html>`;

  splashWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml));
  splashWin.on('closed', () => { splashWin = null; });
}

// ── Main window ───────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 620,
    icon: ICON_PATH,
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
      // Security hardening
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Performance
      backgroundThrottling: false,
    },
    title: 'MINSA Surat Manager',
    // Windows 11 rounded corners / Mica effect support
    roundedCorners: true,
  });

  if (isDev) {
    mainWin.loadURL('http://localhost:8080');
    mainWin.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in OS default browser
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Prevent navigation away from app
  mainWin.webContents.on('will-navigate', (event, url) => {
    const appUrl = isDev ? 'http://localhost:8080' : `file://${path.join(__dirname, '../dist/')}`;
    if (!url.startsWith(appUrl) && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  mainWin.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) splashWin.close();
      mainWin.show();
      mainWin.focus();
    }, 500);
  });

  mainWin.on('closed', () => { mainWin = null; });

  // ── Menu bar (hidden by default, show on Alt) ─────────────────────────────────
  const Menu = require('electron').Menu;
  let menuVisible = false;
  
  const appMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Letter', accelerator: 'CmdOrCtrl+N', click: () => mainWin.webContents.send('menu-action', 'new-letter') },
        { type: 'separator' },
        { label: 'Export PDF', accelerator: 'CmdOrCtrl+P', click: () => mainWin.webContents.send('menu-action', 'export-pdf') },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'Alt+F4', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About MINSA Surat Manager', click: () => {
          const { dialog } = require('electron');
          dialog.showMessageBox(mainWin, {
            type: 'info',
            title: 'About MINSA Surat Manager',
            message: 'MINSA Surat Manager v' + APP_VERSION,
            detail: 'Aplikasi pengelola surat untuk sekolah/madrasah\n\n© 2025 AZSTRAL'
          });
        }}
      ]
    }
  ]);
  
  // Set initial menu to hidden
  Menu.setApplicationMenu(null);
  
  // Toggle menu on Alt key
  mainWin.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Alt' && input.type === 'keyDown') {
      menuVisible = !menuVisible;
      if (menuVisible) {
        Menu.setApplicationMenu(appMenu);
      } else {
        Menu.setApplicationMenu(null);
      }
    }
  });
}

// ── Second instance: focus existing window ────────────────────────────────────
app.on('second-instance', () => {
  if (mainWin) {
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.focus();
  }
});

// ── IPC Handlers ──────────────────────────────────────────────────────────────

// Get effective data directory path
ipcMain.handle('get-data-path', () => {
  return getEffectiveDataDir();
});

// Open folder picker for data path
ipcMain.handle('choose-data-path', async () => {
  if (!mainWin) return null;
  const result = await dialog.showOpenDialog(mainWin, {
    title: 'Pilih Folder Penyimpanan Data',
    defaultPath: customDataPath || app.getPath('documents'),
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: 'Pilih Folder Ini',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    saveCustomDataPath(result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

// ── File-based JSON storage (replaces localStorage for reliability) ────────────

ipcMain.handle('storage-read', () => {
  try {
    const file = getDataFile();
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
});

ipcMain.handle('storage-write', (_event, jsonString) => {
  try {
    const dir = getEffectiveDataDir();
    fs.mkdirSync(dir, { recursive: true });
    const file = getDataFile();
    // Write to temp file first, then rename (atomic write — prevents corruption)
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, jsonString, 'utf8');
    fs.renameSync(tmp, file);
    return true;
  } catch (e) {
    console.error('storage-write failed:', e);
    return false;
  }
});

// Backup: export data to user-chosen location
ipcMain.handle('storage-export', async (_event, jsonString) => {
  if (!mainWin) return false;
  const result = await dialog.showSaveDialog(mainWin, {
    title: 'Ekspor Data MINSA',
    defaultPath: path.join(app.getPath('documents'), `minsa-backup-${Date.now()}.json`),
    filters: [{ name: 'JSON Data', extensions: ['json'] }],
    buttonLabel: 'Simpan Backup',
  });
  if (result.canceled || !result.filePath) return false;
  try {
    fs.writeFileSync(result.filePath, jsonString, 'utf8');
    return result.filePath;
  } catch {
    return false;
  }
});

// Restore: import data from user-chosen file
ipcMain.handle('storage-import', async () => {
  if (!mainWin) return null;
  const result = await dialog.showOpenDialog(mainWin, {
    title: 'Impor Data MINSA',
    defaultPath: app.getPath('documents'),
    properties: ['openFile'],
    filters: [{ name: 'JSON Data', extensions: ['json'] }],
    buttonLabel: 'Impor File Ini',
  });
  if (result.canceled || !result.filePaths[0]) return null;
  try {
    return fs.readFileSync(result.filePaths[0], 'utf8');
  } catch {
    return null;
  }
});

// Open data folder in Explorer
ipcMain.handle('open-data-folder', () => {
  const dir = getEffectiveDataDir();
  fs.mkdirSync(dir, { recursive: true });
  shell.openPath(dir);
});

// App info
ipcMain.handle('get-app-info', () => ({
  version: APP_VERSION,
  dataPath: getEffectiveDataDir(),
  platform: process.platform,
  arch: process.arch,
  osVersion: os.release(),
}));

// Theme: sync Electron native theme with app theme
ipcMain.handle('set-native-theme', (_event, theme) => {
  nativeTheme.themeSource = theme; // 'light' | 'dark' | 'system'
});

// ── Print functionality ───────────────────────────────────────────────────────
// Get list of available printers
ipcMain.handle('get-printers', async () => {
  const printers = event.sender.getPrinters();   // <-- always defined
  return printers.map(p => ({
    name: p.name,
    displayName: p.displayName }));
});

// Print the document using system dialog
ipcMain.handle('print-document', async (_event, options) => {
  if (!mainWin) return { success: false, error: 'No window' };
  
  try {
    const printOptions = {
      silent: false, // Show system print dialog
      printBackground: true,
      deviceName: options.printerName || undefined,
      copies: options.copies || 1,
      duplexMode: options.duplex ? 'long-edge' : undefined,
    };
    
    const success = await mainWin.webContents.print(printOptions);
    return { success };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Print directly to PDF file
ipcMain.handle('print-to-pdf', async (_event, options) => {
  if (!mainWin) return { success: false, error: 'No window' };
  
  try {
    const data = await mainWin.webContents.printToPDF({
      printBackground: true,
      pageSize: options.pageSize || 'A4',
      landscape: options.landscape || false,
    });
    return { success: true, data: data.toString('base64') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createSplash();
  // Start loading main window in background while splash shows
  setTimeout(createMainWindow, 300);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Prevent loading remote resources (security)
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (e) => { e.preventDefault(); });
});


