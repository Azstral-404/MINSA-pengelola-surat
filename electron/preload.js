/**
 * MINSA Surat Manager — Electron Preload Script
 * Bridges secure IPC from renderer to main process
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Environment flag ────────────────────────────────────────────────────────
  isElectron: true,

  // ── Data path management ────────────────────────────────────────────────────
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  chooseDataPath: () => ipcRenderer.invoke('choose-data-path'),
  openDataFolder: () => ipcRenderer.invoke('open-data-folder'),

  // ── File-based JSON storage ─────────────────────────────────────────────────
  // These replace localStorage for reliable, persistent, file-based storage
  storageRead: () => ipcRenderer.invoke('storage-read'),
  storageWrite: (jsonString) => ipcRenderer.invoke('storage-write', jsonString),

  // ── Backup / Restore ────────────────────────────────────────────────────────
  exportData: (jsonString) => ipcRenderer.invoke('storage-export', jsonString),
  importData: () => ipcRenderer.invoke('storage-import'),

  // ── App info ────────────────────────────────────────────────────────────────
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // ── Native theme sync ───────────────────────────────────────────────────────
  setNativeTheme: (theme) => ipcRenderer.invoke('set-native-theme', theme),
});
