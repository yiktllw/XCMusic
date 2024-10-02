const { contextBridge, ipcRenderer } = require('electron');

const fs = require('fs');
const path = require('path');
const os = require('os');

contextBridge.exposeInMainWorld('api', {
    pathJoin: (...args) => path.join(...args), // 暴露 path.join
    readFile: (filePath) => {
        return fs.readFileSync(filePath, 'utf-8'); // 读取文件
    },
    writeFile: (filePath, data) => {
        fs.writeFileSync(filePath, data, 'utf-8'); // 写入文件
    },
    homeDir: () => os.homedir(), // 获取用户主目录
});
contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: {
            send: (channel, data) => ipcRenderer.send(channel, data),
            on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
            once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args))
        },
        isElectron: true,
    }
);