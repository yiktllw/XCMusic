const { contextBridge, ipcRenderer, shell } = require('electron');

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

contextBridge.exposeInMainWorld('api', {
    pathJoin: (...args) => path.join(...args), // 暴露 path.join
    readFile: (filePath) => {
        return fs.readFileSync(filePath, 'utf-8'); // 读取文件
    },
    writeFile: (filePath, data) => {
        fs.writeFileSync(filePath, data, 'utf-8'); // 写入文件
    },
    existsSync: (path) => fs.existsSync(path, 'utf-8'), // 判断文件是否存在
    makeDirSync: (path) => fs.mkdirSync(path, { recursive: true }), // 创建文件夹
    homeDir: () => os.homedir(), // 获取用户主目录
    fs: fs,
    path: path,
    os: os,
    crypto: (str) => { return crypto.createHash('sha256').update(str).digest('hex'); }, // 加密字符串
});
contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: {
            send: (channel, ...args) => ipcRenderer.send(channel, ...args),
            on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
            once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
            invoke: (channel, data) => ipcRenderer.invoke(channel, data),
        },
        isElectron: true,
        shell: shell,
    }
);