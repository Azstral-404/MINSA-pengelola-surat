/**
 * MINSA Surat Manager — Electron Main Process
 * Optimized for Windows 10/11, offline-first, lightweight
 */

'use strict';

const { app, BrowserWindow, shell, ipcMain, dialog, nativeTheme, Menu } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

// ── Windows 10/11 optimizations ──────────────────────────────────────────────
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256');

// ── Single instance lock ──────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

// ── App metadata ──────────────────────────────────────────────────────────────
app.setAppUserModelId('com.azstral.minsa');

const isDev       = !app.isPackaged;
const APP_NAME    = 'MINSA-Surat-Manager';
const APP_VERSION = app.getVersion();

// ── Data path management ──────────────────────────────────────────────────────
const DATA_PATH_CONFIG_DIR  = path.join(app.getPath('appData'), 'AZSTRAL-MINSA');
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
      if (p && fs.existsSync(p)) { customDataPath = p; app.setPath('userData', p); }
    }
  } catch { /* ignore */ }
}
function saveCustomDataPath(p) {
  try {
    fs.mkdirSync(DATA_PATH_CONFIG_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH_CONFIG_FILE, p, 'utf8');
    customDataPath = p;
    app.setPath('userData', p);
  } catch { /* ignore */ }
}
loadCustomDataPath();

// ── Asset loader ──────────────────────────────────────────────────────────────
function imageToDataUrl(...candidates) {
  for (const p of candidates) {
    if (!p) continue;
    try {
      if (fs.existsSync(p)) {
        const mime = path.extname(p).toLowerCase() === '.ico' ? 'image/x-icon' : 'image/png';
        return 'data:' + mime + ';base64,' + fs.readFileSync(p).toString('base64');
      }
    } catch (e) { /* try next */ }
  }
  return '';
}

// Logo lives in electron/minsa-logo.png — always packaged via "electron/**/*"
const splashLogoDataUrl = imageToDataUrl(
  path.join(__dirname, 'minsa-logo.png'),
  path.join(__dirname, 'minsa-splash.png'),
  path.join(__dirname, '../src/assets/minsa-logo.png'),
  path.join(__dirname, '../src/assets/minsa-splash.png'),
  path.join(__dirname, '../public/minsa-logo.png')
);

const ICON_PATH = [
  path.join(__dirname, '../public/minsa-icon.ico'),
  path.join(__dirname, '../public/minsa-icon.png'),
  path.join(__dirname, '../src/assets/minsa-icon.png'),
].find(p => fs.existsSync(p)) || '';

// ── Window state ──────────────────────────────────────────────────────────────
let splashWin       = null;
let mainWin         = null;
let splashStartTime = 0;
const SPLASH_MS     = 2500; // logo shows for 2.5 seconds then main window opens

// ── Splash — logo only, fully transparent, no chrome ─────────────────────────
function createSplash() {
  splashWin = new BrowserWindow({
    width:       400,
    height:      300,
    frame:       false,
    transparent: true,   // window itself is transparent — only logo is visible
    resizable:   false,
    movable:     false,
    alwaysOnTop: true,
    center:      true,
    skipTaskbar: true,
    show:        false,  // prevent white flash before content paints
    hasShadow:   false,
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      devTools:         false,
    },
  });

  splashWin.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(makeSplashHtml(splashLogoDataUrl))
  );

  splashWin.once('ready-to-show', () => splashWin && splashWin.show());
  splashWin.on('closed', () => { splashWin = null; });
}

function makeSplashHtml(logo) {
  // Completely transparent page — just the logo centred, softly glowing, gently floating
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'html,body{width:400px;height:300px;background:transparent;overflow:hidden;user-select:none}' +
    'body{display:flex;align-items:center;justify-content:center}' +
    'img{' +
    '  width:320px;height:auto;' +
    '  animation:pop .5s cubic-bezier(.34,1.56,.64,1) both, float 3s ease-in-out .5s infinite;' +
    '  filter:drop-shadow(0 8px 32px rgba(160,100,255,.5)) drop-shadow(0 2px 12px rgba(100,210,255,.35));' +
    '}' +
    '@keyframes pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}' +
    '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}' +
    '</style></head><body>' +
    '<img src="' + logo + '" alt="MINSA">' +
    '</body></html>';
}

// ── Main window ───────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWin = new BrowserWindow({
    width:     1280,
    height:    800,
    minWidth:  960,
    minHeight: 620,
    show:      false,
    backgroundColor: '#0f172a',
    roundedCorners:  true,
    ...(ICON_PATH ? { icon: ICON_PATH } : {}),
    webPreferences: {
      nodeIntegration:             false,
      contextIsolation:            true,
      preload:                     path.join(__dirname, 'preload.js'),
      devTools:                    isDev,
      webSecurity:                 true,
      allowRunningInsecureContent: false,
      experimentalFeatures:        false,
      backgroundThrottling:        false,
    },
    title: 'MINSA Surat Manager',
  });

  if (isDev) {
    mainWin.loadURL('http://localhost:8080');
    mainWin.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWin.webContents.on('will-navigate', (event, url) => {
    const base = isDev ? 'http://localhost:8080' : 'file://';
    if (!url.startsWith(base) && !url.startsWith('file://')) event.preventDefault();
  });

  mainWin.once('ready-to-show', () => {
    const elapsed   = Date.now() - splashStartTime;
    const remaining = Math.max(SPLASH_MS - elapsed, 300);
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) splashWin.close();
      if (mainWin  && !mainWin.isDestroyed())   { mainWin.show(); mainWin.focus(); }
    }, remaining);
  });

  mainWin.on('closed', () => { mainWin = null; });
  setupMenu(mainWin);
}

// ── Menu (hidden, toggle with Alt) ────────────────────────────────────────────
function setupMenu(win) {
  let visible = false;
  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [
      { label: 'New Letter', accelerator: 'CmdOrCtrl+N', click: () => win.webContents.send('menu-action', 'new-letter') },
      { type: 'separator' },
      { label: 'Export PDF', accelerator: 'CmdOrCtrl+P', click: () => win.webContents.send('menu-action', 'export-pdf') },
      { type: 'separator' },
      { label: 'Exit', accelerator: 'Alt+F4', click: () => app.quit() },
    ]},
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' },
      { role: 'togglefullscreen' },
    ]},
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
    { label: 'Help', submenu: [{
      label: 'About MINSA Surat Manager',
      click: () => dialog.showMessageBox(win, {
        type: 'info', title: 'About MINSA Surat Manager',
        message: 'MINSA Surat Manager v' + APP_VERSION,
        detail: 'Aplikasi pengelola surat untuk sekolah/madrasah\n\n\u00A9 2025 AZSTRAL',
      }),
    }]},
  ]);
  Menu.setApplicationMenu(null);
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'Alt' && input.type === 'keyDown') {
      visible = !visible;
      Menu.setApplicationMenu(visible ? menu : null);
    }
  });
}

// ── Second instance ───────────────────────────────────────────────────────────
app.on('second-instance', () => {
  if (mainWin) { if (mainWin.isMinimized()) mainWin.restore(); mainWin.focus(); }
});

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.handle('get-data-path', () => getEffectiveDataDir());

ipcMain.handle('choose-data-path', async () => {
  if (!mainWin) return null;
  const r = await dialog.showOpenDialog(mainWin, {
    title: 'Pilih Folder Penyimpanan Data',
    defaultPath: customDataPath || app.getPath('documents'),
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: 'Pilih Folder Ini',
  });
  if (!r.canceled && r.filePaths[0]) { saveCustomDataPath(r.filePaths[0]); return r.filePaths[0]; }
  return null;
});

ipcMain.handle('storage-read', () => {
  try { const f = getDataFile(); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; }
  catch { return null; }
});

ipcMain.handle('storage-write', (_e, json) => {
  try {
    fs.mkdirSync(getEffectiveDataDir(), { recursive: true });
    const f = getDataFile(), tmp = f + '.tmp';
    fs.writeFileSync(tmp, json, 'utf8');
    fs.renameSync(tmp, f);
    return true;
  } catch (e) { console.error('storage-write:', e); return false; }
});

ipcMain.handle('storage-export', async (_e, json) => {
  if (!mainWin) return false;
  const r = await dialog.showSaveDialog(mainWin, {
    title: 'Ekspor Data MINSA',
    defaultPath: path.join(app.getPath('documents'), 'minsa-backup-' + Date.now() + '.json'),
    filters: [{ name: 'JSON Data', extensions: ['json'] }],
    buttonLabel: 'Simpan Backup',
  });
  if (r.canceled || !r.filePath) return false;
  try { fs.writeFileSync(r.filePath, json, 'utf8'); return r.filePath; } catch { return false; }
});

ipcMain.handle('storage-import', async () => {
  if (!mainWin) return null;
  const r = await dialog.showOpenDialog(mainWin, {
    title: 'Impor Data MINSA',
    defaultPath: app.getPath('documents'),
    properties: ['openFile'],
    filters: [{ name: 'JSON Data', extensions: ['json'] }],
    buttonLabel: 'Impor File Ini',
  });
  if (r.canceled || !r.filePaths[0]) return null;
  try { return fs.readFileSync(r.filePaths[0], 'utf8'); } catch { return null; }
});

ipcMain.handle('open-data-folder', () => {
  const d = getEffectiveDataDir(); fs.mkdirSync(d, { recursive: true }); shell.openPath(d);
});

ipcMain.handle('get-app-info', () => ({
  version: APP_VERSION, dataPath: getEffectiveDataDir(),
  platform: process.platform, arch: process.arch, osVersion: os.release(),
}));

ipcMain.handle('set-native-theme', (_e, theme) => { nativeTheme.themeSource = theme; });

ipcMain.handle('get-printers', async (e) =>
  e.sender.getPrinters().map(p => ({ name: p.name, displayName: p.displayName }))
);

ipcMain.handle('print-document', async (_e, opts) => {
  if (!mainWin) return { success: false, error: 'No window' };
  try {
    const ok = await mainWin.webContents.print({
      silent: false, printBackground: true,
      deviceName: opts.printerName || undefined,
      copies: opts.copies || 1,
      duplexMode: opts.duplex ? 'long-edge' : undefined,
    });
    return { success: ok };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('print-to-pdf', async (_e, opts) => {
  if (!mainWin) return { success: false, error: 'No window' };
  try {
    const data = await mainWin.webContents.printToPDF({
      printBackground: true, pageSize: opts.pageSize || 'A4', landscape: opts.landscape || false,
    });
    return { success: true, data: data.toString('base64') };
  } catch (e) { return { success: false, error: e.message }; }
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  splashStartTime = Date.now();
  createSplash();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', e => e.preventDefault());
});
