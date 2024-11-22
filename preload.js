/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * preload.js 用于在渲染进程中使用 node.js 模块
 * 已添加的功能:
 * 1. path.join
 * 2. fs.readFileSync
 * 3. fs.writeFileSync
 * 4. fs.existsSync
 * 5. fs.mkdirSync
 * 6. os.homedir
 * 7. crypto.createHash
 * 8. ipcRenderer.send
 * 9. ipcRenderer.on
 * 10. ipcRenderer.once
 * 11. ipcRenderer.invoke
 * 12. shell
 * 13. isElectron
 * 14. ipcRenderer
 * 15. fs
 * 16. path
 * 17. os
 * 18. crypto
 * 19. ipcRenderer.removeEventListener
 * 20. env.isDevelopment 是否为开发环境
 *---------------------------------------------------------------*/

const { contextBridge, ipcRenderer, shell } = require("electron");

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { removeAllListeners } = require("process");

contextBridge.exposeInMainWorld("api", {
  pathJoin: (...args) => path.join(...args), // 暴露 path.join
  readFile: (filePath) => {
    return fs.readFileSync(filePath, "utf-8"); // 读取文件
  },
  writeFile: (filePath, data) => {
    fs.writeFileSync(filePath, data, "utf-8"); // 写入文件
  },
  existsSync: (path) => fs.existsSync(path, "utf-8"), // 判断文件是否存在
  makeDirSync: (path) => fs.mkdirSync(path, { recursive: true }), // 创建文件夹
  homeDir: () => os.homedir(), // 获取用户主目录
  fs: fs,
  path: path,
  os: os,
  crypto: (str) => {
    return crypto.createHash("sha256").update(str).digest("hex");
  }, // 加密字符串
});
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, func) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args)),
    once: (channel, func) =>
      ipcRenderer.once(channel, (event, ...args) => func(...args)),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    removeListener: (channel, func) =>
      ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
  isElectron: true,
  shell: shell,
});

contextBridge.exposeInMainWorld("env", {
  isDevelopment: process.env.NODE_ENV === "development",
})