
/**
 * PS2 Estate Nexus - Electron Preload Script
 * 
 * This file runs in the renderer process and safely exposes Electron APIs to the renderer.
 */

const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // IPC communication
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel, func) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
  },
  
  // File system operations
  fs: {
    readFileSync: (path, encoding) => fs.readFileSync(path, encoding),
    writeFileSync: (path, data) => fs.writeFileSync(path, data),
    existsSync: (path) => fs.existsSync(path),
    mkdirSync: (path) => fs.mkdirSync(path, { recursive: true })
  },
  
  // Path utilities
  path: {
    join: (...args) => path.join(...args),
    basename: (path) => path.basename(path),
    dirname: (path) => path.dirname(path),
    extname: (path) => path.extname(path)
  }
});

// Signal to the renderer process that the preload script has loaded
window.addEventListener('DOMContentLoaded', () => {
  window.postMessage({ type: 'electron-ready' }, '*');
});
