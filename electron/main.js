const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Store custom user data path
const USER_DATA_PATH_KEY = 'custom-user-data-path';
let customDataPath = null;

function getDataPathFile() {
  return path.join(app.getPath('appData'), 'AZSTRAL-MINSA', 'data-path.txt');
}

function loadCustomDataPath() {
  try {
    const file = getDataPathFile();
    if (fs.existsSync(file)) {
      const p = fs.readFileSync(file, 'utf8').trim();
      if (p && fs.existsSync(p)) {
        customDataPath = p;
        app.setPath('userData', p);
      }
    }
  } catch (e) {
    // ignore
  }
}

function saveCustomDataPath(p) {
  try {
    const file = getDataPathFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, p, 'utf8');
    customDataPath = p;
  } catch (e) {
    // ignore
  }
}

// Load path before app is ready
loadCustomDataPath();

const ICON_PATH = path.join(__dirname, '../public/minsa-icon.png');

// ----- Splash window -----
let splashWin = null;
let mainWin = null;

function createSplash() {
  splashWin = new BrowserWindow({
    width: 560,
    height: 340,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true,
    backgroundColor: '#1a103c',
    icon: ICON_PATH,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load inline splash HTML
  const splashHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 560px; height: 340px;
    background: linear-gradient(135deg, #1a103c 0%, #2d1b69 40%, #1a103c 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Segoe UI', system-ui, sans-serif;
    overflow: hidden; user-select: none;
  }
  .glow {
    position: absolute;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(130,90,240,0.25) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -62%);
  }
  .logo {
    width: 240px; height: auto; object-fit: contain;
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
    background: linear-gradient(90deg, #7c3aed, #a78bfa);
    border-radius: 2px; transition: width 0.08s linear;
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
</style>
</head>
<body>
<div class="glow"></div>
<img class="logo" src="file://${ICON_PATH.replace(/\\/g, '/')}" alt="MINSA" />
<div class="name">MINSA Surat Manager</div>
<div class="progress-wrap">
  <div class="progress-label">
    <span id="lbl">Memuat...</span>
    <span id="pct">0%</span>
  </div>
  <div class="progress-track"><div class="progress-bar" id="bar"></div></div>
</div>
<div class="version">v1.0.0 · AZSTRAL</div>
<script>
  const bar = document.getElementById('bar');
  const lbl = document.getElementById('lbl');
  const pct = document.getElementById('pct');
  const labels = ['Memuat komponen...','Mempersiapkan data...','Hampir selesai...','Siap!'];
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(p + (Math.random() * 3 + 1.5), 100);
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
    lbl.textContent = p < 30 ? labels[0] : p < 65 ? labels[1] : p < 95 ? labels[2] : labels[3];
    if (p >= 100) clearInterval(t);
  }, 60);
</script>
</body>
</html>`;

  splashWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml));
  splashWin.on('closed', () => { splashWin = null; });
}

// ----- Main window -----
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
    },
    title: 'MINSA Surat Manager',
  });

  if (isDev) {
    mainWin.loadURL('http://localhost:8080');
  } else {
    mainWin.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWin.once('ready-to-show', () => {
    // Close splash after main window is ready
    setTimeout(() => {
      if (splashWin) {
        splashWin.close();
      }
      mainWin.show();
    }, 300);
  });

  mainWin.on('closed', () => { mainWin = null; });
}

// ----- IPC handlers -----

// Get current data path
ipcMain.handle('get-data-path', () => {
  return customDataPath || app.getPath('userData');
});

// Open folder picker for data path
ipcMain.handle('choose-data-path', async () => {
  const result = await dialog.showOpenDialog(mainWin, {
    title: 'Pilih Folder Penyimpanan Data',
    defaultPath: customDataPath || app.getPath('documents'),
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: 'Pilih Folder',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const chosen = result.filePaths[0];
    saveCustomDataPath(chosen);
    return chosen;
  }
  return null;
});

// ----- App lifecycle -----
app.whenReady().then(() => {
  createSplash();

  // Load main window while splash is visible
  setTimeout(() => {
    createMainWindow();
  }, 400);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
