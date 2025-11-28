/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * download.ts 为主进程中下载歌曲的函数
 * 请勿在渲染进程中调用！
 * 请勿在渲染进程中调用！
 * 请勿在渲染进程中调用！
 *---------------------------------------------------------------*/

import axios, { type CancelTokenSource } from "axios";
import fs from "fs";
import path from "path";
import { type ITrack } from "@/utils/tracks";
import { type BrowserWindow } from "electron";
import {
  File,
  type IPicture,
  ByteVector,
  PictureType,
} from "node-taglib-sharp";

export interface IDownloadProgress {
  track: ITrack;
  percent: number;
  status: "pending" | "downloading" | "paused" | "done" | "error" | "cancelled";
  downloadedBytes?: number;
  totalBytes?: number;
}

export interface IDownloadTask {
  id: string; // 唯一标识符
  track: ITrack;
  url: string;
  downloadDir: string;
  lrc?: string;
  /**
   * 下载状态: pending: 等待下载; downloading: 正在下载; paused: 暂停; done: 下载完成; error: 下载出错; cancelled: 已取消.
   */
  status: "pending" | "downloading" | "paused" | "done" | "error" | "cancelled";
  /**
   * 用于取消、暂停下载的 token
   */
  cancelToken?: CancelTokenSource;
  /**
   * 已下载的字节数, 用于断点续传
   */
  downloadedBytes: number;
  /**
   * 总文件大小
   */
  totalBytes: number;
  /**
   * 下载进度, 0-100
   */
  percent: number;
  /**
   * 临时文件路径
   */
  tempFilePath?: string;
  /**
   * 最终文件路径
   */
  outputFilePath?: string;
  /**
   * 错误信息
   */
  error?: string;
}

export class DownloadManager {
  private static instance: DownloadManager;
  private tasks: Map<string, IDownloadTask> = new Map();
  private downloadQueue: IDownloadTask[] = [];
  private maxConcurrentDownloads = 5;
  private activeDownloads = 0;
  private win: BrowserWindow | null = null;

  private constructor() {}

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  setWindow(win: BrowserWindow | null) {
    this.win = win;
  }

  /**
   * 添加下载任务
   */
  addTask(
    id: string,
    track: ITrack,
    url: string,
    downloadDir: string,
    lrc?: string,
  ): string {
    const task: IDownloadTask = {
      id,
      track,
      url,
      downloadDir,
      lrc,
      status: "pending",
      downloadedBytes: 0,
      totalBytes: 0,
      percent: 0,
    };

    this.tasks.set(id, task);
    this.downloadQueue.push(task);
    this.notifyProgress(task);
    this.processQueue();
    return id;
  }

  /**
   * 暂停下载
   */
  pauseTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (task && task.status === "downloading" && task.cancelToken) {
      task.cancelToken.cancel("用户暂停下载");
      task.status = "paused";
      this.notifyProgress(task);
      return true;
    }
    return false;
  }

  /**
   * 继续下载
   */
  resumeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (task && task.status === "paused") {
      task.status = "pending";
      // 检查任务是否已经在队列中，避免重复添加
      const existsInQueue = this.downloadQueue.some(
        (queueTask) => queueTask.id === id,
      );
      if (!existsInQueue) {
        this.downloadQueue.unshift(task); // 放到队列前面
      }
      this.notifyProgress(task);
      this.processQueue();
      return true;
    }
    return false;
  }

  /**
   * 取消下载
   */
  cancelTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    if (task.status === "downloading" && task.cancelToken) {
      task.cancelToken.cancel("用户取消下载");
    }

    task.status = "cancelled";

    // 从队列中移除
    const queueIndex = this.downloadQueue.findIndex((t) => t.id === id);
    if (queueIndex > -1) {
      this.downloadQueue.splice(queueIndex, 1);
    }

    // 删除临时文件
    if (task.tempFilePath && fs.existsSync(task.tempFilePath)) {
      try {
        fs.unlinkSync(task.tempFilePath);
      } catch (error) {
        console.error("删除临时文件失败:", error);
      }
    }

    // 通知渲染进程任务已取消
    this.notifyProgress(task);

    // 从任务列表中删除
    this.tasks.delete(id);

    // 继续处理队列中的其他任务
    this.processQueue();

    return true;
  }

  /**
   * 获取任务信息
   */
  getTask(id: string): IDownloadTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): IDownloadTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 处理下载队列
   */
  private async processQueue() {
    while (
      this.activeDownloads < this.maxConcurrentDownloads &&
      this.downloadQueue.length > 0
    ) {
      const task = this.downloadQueue.shift();
      if (task && task.status === "pending") {
        this.activeDownloads++;
        this.downloadTask(task).finally(() => {
          this.activeDownloads--;
          // 稍微延迟再处理队列，避免递归问题
          setTimeout(() => this.processQueue(), 100);
        });
      } else if (task) {
        // 如果任务状态不是 pending，从队列中移除并继续处理下一个
        // 继续循环处理下一个任务
        continue;
      } else {
        // 没有更多任务
        break;
      }
    }
  }

  /**
   * 执行单个下载任务
   */
  private async downloadTask(task: IDownloadTask): Promise<void> {
    try {
      task.status = "downloading";
      const cancelToken = axios.CancelToken.source();
      task.cancelToken = cancelToken;

      const name = sanitizeFileName(task.track.name);
      const artist = task.track.ar.map((ar) => ar.name).join("; ");
      const album = task.track.al.name;
      const coverUrl = task.track.al.picUrl;
      const url = task.url.replace(/\?.*$/g, "");

      // 从 URL 中提取文件格式
      const fileExtension = path.extname(url).slice(1);

      if (!["mp3", "flac"].includes(fileExtension)) {
        throw new Error(`不支持的文件格式: ${fileExtension}`);
      }

      task.tempFilePath = path.join(
        task.downloadDir,
        `${name}-temp.${fileExtension}`,
      );
      task.outputFilePath = path.join(
        task.downloadDir,
        `${name}.${fileExtension}`,
      );

      // 支持断点续传
      let startByte = 0;
      if (fs.existsSync(task.tempFilePath)) {
        const stats = fs.statSync(task.tempFilePath);
        startByte = stats.size;
        task.downloadedBytes = startByte;
      }

      const headers: any = {};
      if (startByte > 0) {
        headers.Range = `bytes=${startByte}-`;
      }

      const writer = fs.createWriteStream(task.tempFilePath, {
        flags: startByte > 0 ? "a" : "w",
      });
      const response = await axios({
        url: url,
        method: "GET",
        responseType: "stream",
        headers,
        family: 4,
        timeout: 30000,
        cancelToken: cancelToken.token,
        onDownloadProgress: (progressEvent) => {
          const loaded = startByte + progressEvent.loaded;
          const total = startByte + (progressEvent.total || 0);
          task.downloadedBytes = loaded;
          task.totalBytes = total;
          task.percent = total > 0 ? Math.round((loaded * 100) / total) : 0;
          this.notifyProgress(task);
        },
      });

      // 获取总文件大小
      const contentLength = response.headers["content-length"];
      const contentRange = response.headers["content-range"];
      if (contentRange) {
        const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
        if (match) {
          task.totalBytes = parseInt(match[1]);
        }
      } else if (contentLength) {
        task.totalBytes = startByte + parseInt(contentLength);
      }

      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // 重命名为最终文件
      fs.renameSync(task.tempFilePath, task.outputFilePath!);

      // 嵌入元数据
      if (fileExtension === "flac" || fileExtension === "mp3") {
        await this.embedMetadata(
          task.outputFilePath!,
          name,
          artist,
          album,
          coverUrl,
          task.lrc,
        );
      }

      task.status = "done";
      task.percent = 100;
      this.notifyProgress(task);

      // 发送完成事件
      if (this.win) {
        this.win.webContents.send("download-song-reply", task.outputFilePath, {
          filePath: task.outputFilePath,
          track: task.track,
        });
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        // 取消操作，不更改状态
        return;
      }
      task.status = "error";
      task.error = error.message || "未知错误";
      this.notifyProgress(task);
      console.error("下载失败:", error);
    }
  }

  /**
   * 嵌入元数据
   */
  private async embedMetadata(
    filePath: string,
    name: string,
    artist: string,
    album: string,
    coverUrl: string,
    lrc?: string,
  ): Promise<void> {
    try {
      const musicFile = File.createFromPath(filePath);
      musicFile.tag.album = album;
      musicFile.tag.title = name;
      musicFile.tag.performers = [artist];

      // 下载封面
      if (coverUrl) {
        const coverResponse = await axios({
          method: "get",
          url: coverUrl,
          responseType: "arraybuffer",
          family: 4,
          timeout: 10000,
        });
        const picData = ByteVector.fromByteArray(coverResponse.data);
        const pic: IPicture = {
          mimeType: "image/jpeg",
          type: PictureType.FrontCover,
          data: picData,
          description: "Cover",
          filename: "",
        };
        musicFile.tag.pictures = [pic];
      }

      if (lrc) {
        musicFile.tag.lyrics = lrc;
      }

      musicFile.save();
      musicFile.dispose();
    } catch (error) {
      console.error("嵌入元数据失败:", error);
    }
  }

  /**
   * 发送进度通知
   */
  private notifyProgress(task: IDownloadTask) {
    if (this.win) {
      const progress: IDownloadProgress = {
        track: task.track,
        percent: task.percent,
        status: task.status,
        downloadedBytes: task.downloadedBytes,
        totalBytes: task.totalBytes,
      };
      this.win.webContents.send("download-progress", {
        id: task.id,
        ...progress,
      });
    }
  }
}

export class Download {
  /**
   * 下载歌曲文件并保存到本地
   * @deprecated 使用 DownloadManager 代替
   */
  static async song(
    songUrl: string,
    track: ITrack,
    downloadDir: string,
    win: BrowserWindow | null,
    lrc?: string,
  ): Promise<string> {
    const manager = DownloadManager.getInstance();
    manager.setWindow(win);
    const id = `${track.id}_${Date.now()}`;
    manager.addTask(id, track, songUrl, downloadDir, lrc);

    // 等待下载完成
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const task = manager.getTask(id);
        if (!task) {
          reject(new Error("任务不存在"));
          return;
        }

        if (task.status === "done" && task.outputFilePath) {
          resolve(task.outputFilePath);
        } else if (task.status === "error") {
          reject(new Error(task.error || "下载失败"));
        } else if (task.status === "cancelled") {
          reject(new Error("下载已取消"));
        } else {
          setTimeout(checkStatus, 1000);
        }
      };
      checkStatus();
    });
  }
}

/**
 * 对文件名进行合法化处理，替换掉 Windows 不允许的字符
 * @param fileName 原始文件名
 * @returns 合法的文件名
 */
function sanitizeFileName(fileName: string): string {
  // 替换掉 Windows 系统不允许的字符，如 \ / : * ? " < > |
  return fileName.replace(/[\\/:*?"<>|]/g, "-");
}
