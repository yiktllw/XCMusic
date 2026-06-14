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
import { setProxy } from "@/utils/userProxy";
import { type ProxyConfig } from "@/dual/userProxy.interface";
import { getFonts, type FontList } from "font-list";
import * as os from "os";
import { DatabaseSync } from "node:sqlite";

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

/**
 * 导出用户数据到 SQLite .xcmdb 文件
 */
ipcMain.handle(
  "export-user-data",
  async (
    event,
    request: {
      version: string;
      settings: Record<string, any>;
      playHistory: any[];
      downloadedSongs: any[];
    },
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // 用临时文件建库
      const tmpPath = path.join(os.tmpdir(), `xcmusic-export-${Date.now()}.db`);
      const db = new DatabaseSync(tmpPath);

      db.exec(`CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT)`);
      db.exec(
        `CREATE TABLE settings (section TEXT, key TEXT, value TEXT, PRIMARY KEY (section, key))`,
      );
      db.exec(
        `CREATE TABLE play_history (
          id TEXT PRIMARY KEY,
          track_id INTEGER,
          started_at INTEGER,
          ended_at INTEGER,
          duration_ms INTEGER
        )`,
      );
      db.exec(
        `CREATE TABLE downloaded_songs (id INTEGER PRIMARY KEY, name TEXT, path TEXT)`,
      );

      // meta
      {
        const stmt = db.prepare("INSERT INTO meta VALUES (?, ?)");
        stmt.run("version", request.version);
        stmt.run("exported_at", String(Date.now()));
      }

      // settings
      if (request.settings) {
        const stmt = db.prepare("INSERT INTO settings VALUES (?, ?, ?)");
        for (const [section, values] of Object.entries(request.settings)) {
          if (values && typeof values === "object") {
            for (const [key, value] of Object.entries(
              values as Record<string, any>,
            )) {
              stmt.run(section, key, JSON.stringify(value));
            }
          }
        }
      }

      // play_history
      if (request.playHistory) {
        const stmt = db.prepare(
          "INSERT INTO play_history VALUES (?, ?, ?, ?, ?)",
        );
        for (const record of request.playHistory) {
          stmt.run(
            record.id,
            record.trackId != null ? record.trackId : null,
            record.startedAt != null ? record.startedAt : 0,
            record.endedAt != null ? record.endedAt : 0,
            record.durationMs != null ? record.durationMs : 0,
          );
        }
      }

      // downloaded_songs
      if (request.downloadedSongs) {
        const stmt = db.prepare(
          "INSERT INTO downloaded_songs VALUES (?, ?, ?)",
        );
        for (const song of request.downloadedSongs) {
          stmt.run(song.id, song.name, song.path);
        }
      }

      db.close();

      // 读取临时文件 → 保存为用户选择的路径
      const fileBuffer = fs.readFileSync(tmpPath);
      fs.unlinkSync(tmpPath);

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "导出用户数据",
        defaultPath: path.join(
          app.getPath("desktop"),
          "XCMusic_UserData.xcmdb",
        ),
        filters: [{ name: "XCMusic 用户数据", extensions: ["xcmdb"] }],
      });

      if (canceled || !filePath) {
        return { success: false, message: "cancelled" };
      }

      fs.writeFileSync(filePath, fileBuffer);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Export user data failed:", message);
      return { success: false, message };
    }
  },
);

/**
 * 从 SQLite .xcmdb 文件导入用户数据
 */
ipcMain.handle(
  "import-user-data",
  async (): Promise<{
    success: boolean;
    data?: {
      settings: Record<string, any>;
      playHistory: any[];
      downloadedSongs: any[];
    };
    message?: string;
  }> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        defaultPath: app.getPath("desktop"),
        filters: [{ name: "XCMusic 用户数据", extensions: ["xcmdb"] }],
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, message: "no_file" };
      }

      const db = new DatabaseSync(filePaths[0]);

      // 校验 version
      const versionRow = db
        .prepare("SELECT value FROM meta WHERE key = ?")
        .get("version");
      if (!versionRow) {
        db.close();
        return { success: false, message: "invalid_format" };
      }

      // 读 settings
      const settings: Record<string, any> = {};
      const setRows = db
        .prepare(
          "SELECT section, key, value FROM settings ORDER BY section, key",
        )
        .all() as any[];
      for (const row of setRows) {
        if (!settings[row.section]) settings[row.section] = {};
        settings[row.section][row.key] = JSON.parse(row.value);
      }

      // 读 play_history
      const historyRows = db
        .prepare("SELECT * FROM play_history")
        .all() as any[];
      const playHistory = historyRows.map((row: any) => ({
        id: row.id,
        trackId: row.track_id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        durationMs: row.duration_ms,
      }));

      // 读 downloaded_songs
      const dlRows = db
        .prepare("SELECT * FROM downloaded_songs")
        .all() as any[];
      const downloadedSongs = dlRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        path: row.path,
      }));

      db.close();

      return {
        success: true,
        data: { settings, playHistory, downloadedSongs },
      };
    } catch (err) {
      console.error("Import user data failed:", err);
      return { success: false, message: "parse_error" };
    }
  },
);

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
