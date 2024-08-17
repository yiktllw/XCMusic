const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
});

// console.log('Preload script successfully loaded.');
// console.log('ipcRenderer:', ipcRenderer);