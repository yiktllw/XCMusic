/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * rendererEvents.ts 为主进程中，处理渲染进程事件的文件
 *---------------------------------------------------------------*/

import { ipcMain, BrowserWindow, dialog, app } from "electron";
import { Download, DownloadManager } from "@/utils/download";
import { scanMusicDirectory } from "@/utils/localTracks";
import { type ITrack } from "@/utils/tracks";
import * as fs from "fs";
import * as path from "path";
import { type ISaveJSONData } from "@/dual/YSettingView";
import { setProxy } from "@/utils/userProxy";
import { type ProxyConfig } from "@/dual/userProxy.interface";
import { getFonts, type FontList } from "font-list";

// 获取当前窗口
const getCurrentWindow = () => BrowserWindow.getFocusedWindow();

// 监听最小化事件
ipcMain.on("minimize", () => {
  const win = getCurrentWindow();
  if (win) {
    win.minimize();
  }
});

// 监听最大化事件
ipcMain.on("maximize", () => {
  const win = getCurrentWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
  // console.log(process.memoryUsage());
});

// 监听关闭事件
ipcMain.on("close", () => {
  const win = getCurrentWindow();
  if (win) {
    win.hide();
  }
});

ipcMain.on("quit", () => {
  const win = getCurrentWindow();
  if (win) {
    win.close();
    app.quit();
  }
});

// 清除网络缓存
ipcMain.on("clear-cache", () => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => {
    win.webContents.session
      .clearCache()
      .then(() => {
        // console.log("Network cache cleared");
      })
      .catch((err) => {
        console.error("Error clearing cache:", err);
      });
  });
});

// 监听渲染进程的请求，打开选择文件夹对话框
ipcMain.handle("select-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"], // 只允许选择文件夹
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0]; // 返回选中的文件夹路径
  }
});

ipcMain.handle("get-local-tracks", async (_event, dirPath) => {
  try {
    const tracks = await scanMusicDirectory(dirPath);
    return tracks;
  } catch (err: unknown) {
    // return err.toString();
    console.error("Error scanning music directory:", err);
    return [];
  }
});

ipcMain.handle("get-fonts", async (): Promise<FontList> => {
  return await getFonts();
});

ipcMain.handle(
  "save-json",
  async (event, data: ISaveJSONData): Promise<null | string> => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "导出设置JSON文件",
      defaultPath: path.join(app.getPath("desktop"), data.name), // 默认路径为桌面
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    try {
      if (canceled) {
        return null;
      } else if (filePath) {
        fs.writeFileSync(filePath, data.json, "utf-8");
        return filePath;
      } else {
        console.error("No file path provided");
        return null;
      }
    } catch (err) {
      console.error("Error saving JSON file:", err);
      return null;
    }
  },
);

ipcMain.handle("open-json", async (): Promise<null | string> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    defaultPath: app.getPath("desktop"),
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  try {
    if (canceled) {
      return null;
    } else if (filePaths.length > 0) {
      const json = fs.readFileSync(filePaths[0], "utf-8");
      return json;
    } else {
      console.error("No file path provided");
      return null;
    }
  } catch (err) {
    console.error("Error opening JSON file:", err);
    return null;
  }
});

// 保持旧的 API 以保持向后兼容
ipcMain.on(
  "download-song",
  async (
    event,
    songUrl: string,
    track: ITrack,
    downloadDir: string,
    lrc?: string,
  ) => {
    const win = getCurrentWindow();
    try {
      // 下载歌曲文件
      const filePath = await Download.song(
        songUrl,
        track,
        downloadDir,
        win,
        lrc,
      );
      event.reply("download-song-reply", filePath, {
        filePath: filePath,
        track: track,
      });
    } catch (err: unknown) {
      console.error("Error downloading song:", err);
    }
  },
);

// 新的多线程下载 API
ipcMain.on(
  "download-song-v2",
  async (
    event,
    taskId: string,
    songUrl: string,
    track: ITrack,
    downloadDir: string,
    lrc?: string,
  ) => {
    const win = getCurrentWindow();
    const manager = DownloadManager.getInstance();
    manager.setWindow(win);

    try {
      manager.addTask(taskId, track, songUrl, downloadDir, lrc);
    } catch (err: unknown) {
      console.error("Error adding download task:", err);
    }
  },
);

// 暂停下载
ipcMain.on("download-pause", (event, taskId: string) => {
  const manager = DownloadManager.getInstance();
  manager.pauseTask(taskId);
});

// 继续下载
ipcMain.on("download-resume", (event, taskId: string) => {
  const manager = DownloadManager.getInstance();
  manager.resumeTask(taskId);
});

// 取消下载
ipcMain.on("download-cancel", (event, taskId: string) => {
  const manager = DownloadManager.getInstance();
  manager.cancelTask(taskId);
});

// 获取所有下载任务
ipcMain.handle("get-download-tasks", () => {
  const manager = DownloadManager.getInstance();
  return manager.getAllTasks();
});

ipcMain.on("open-at-login", (event, autoLaunch) => {
  app.setLoginItemSettings({
    openAtLogin: autoLaunch,
  });
});

ipcMain.on("set-proxy", (event, proxyConfig: ProxyConfig) => {
  setProxy(proxyConfig);
});
