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

import { contextBridge, ipcRenderer, shell, webFrame } from "electron";

import fs, {
  readFileSync,
  writeFileSync,
  existsSync as _existsSync,
  mkdirSync,
} from "fs";
import path, { join } from "path";
import os, { homedir } from "os";
import { createHash } from "crypto";

contextBridge.exposeInMainWorld("api", {
  pathJoin: (...args) => join(...args), // 暴露 path.join
  readFile: (filePath) => {
    return readFileSync(filePath, "utf-8"); // 读取文件
  },
  writeFile: (filePath, data) => {
    writeFileSync(filePath, data, "utf-8"); // 写入文件
  },
  existsSync: (path) => _existsSync(path, "utf-8"), // 判断文件是否存在
  makeDirSync: (path) => mkdirSync(path, { recursive: true }), // 创建文件夹
  homeDir: () => homedir(), // 获取用户主目录
  fs: fs,
  path: path,
  os: os,
  crypto: (str) => {
    return createHash("sha256").update(str).digest("hex");
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
  clearCache: () => webFrame.clearCache(),
  getResourceUsage: () => webFrame.getResourceUsage(),
  // eslint-disable-next-line no-undef
  getProcessInfo: () => process.memoryUsage(),
});

contextBridge.exposeInMainWorld("env", {
  // eslint-disable-next-line no-undef
  isDevelopment: process.env.NODE_ENV === "development",
});
