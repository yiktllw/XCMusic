/* eslint-disable @typescript-eslint/no-require-imports */
/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * download.ts 为主进程中下载歌曲的函数
 * 请勿在渲染进程中调用！
 * 请勿在渲染进程中调用！
 * 请勿在渲染进程中调用！
 *---------------------------------------------------------------*/

import axios from "axios";
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
}

export interface IDownloadTask {
  track: ITrack;
  /**
   * 下载状态: pending: 等待下载; downloading: 正在下载; paused: 暂停; done: 下载完成; error: 下载出错.
   */
  status: "pending" | "downloading" | "paused" | "done" | "error";
  /**
   * 用于取消、暂停下载的 token
   */
  cancelToken: any;
  /**
   * 已下载的字节数, 用于断点续传
   */
  downloadedBytes: number;
  /**
   * 下载进度, 0-100
   */
  percent: number;
}

export class Download {
  /**
   * 下载歌曲文件并保存到本地
   * @returns 下载的文件路径
   */
  static async song(
    songUrl: string,
    track: ITrack,
    downloadDir: string,
    win: BrowserWindow | null,
    lrc?: string,
  ): Promise<string> {
    if (!fs.existsSync(downloadDir)) {
      // throw new Error('Invalid download directory');
    }
    const name = sanitizeFileName(track.name);
    const artist = track.ar.map((ar) => ar.name).join("; ");
    const album = track.al.name;
    const coverUrl = track.al.picUrl;
    const url = songUrl.replace(/\?.*$/g, "");

    // 从 URL 中提取文件格式
    const fileExtension = path.extname(url).slice(1); // 获取后缀并去掉前面的"."

    if (!["mp3", "flac"].includes(fileExtension)) {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    // 创建一个临时文件路径
    let tempFilePath = path.join(downloadDir, `${name}-temp.${fileExtension}`);
    let outputFilePath = path.join(downloadDir, `${name}.${fileExtension}`);

    // 下载歌曲文件
    const writer = fs.createWriteStream(tempFilePath);
    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
      family: 4, // 使用 IPv4
      timeout: 30000, // 设置超时时间为30秒
      onDownloadProgress(progressEvent) {
        if (win) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) /
              (progressEvent.total || progressEvent.loaded),
          );
          const progress: IDownloadProgress = {
            track: track,
            percent: percentCompleted,
          };
          win.webContents.send("download-progress", progress);
        }
      },
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", async () => {
        fs.renameSync(tempFilePath, outputFilePath);
        // 如果文件是 mp3 或 flac，嵌入歌曲元数据
        if (fileExtension === "flac" || fileExtension === "mp3") {
          const musicFile = File.createFromPath(outputFilePath);

          musicFile.tag.album = album;
          musicFile.tag.title = name;
          musicFile.tag.performers = [artist];

          const coverResponse = await axios({
            method: "get",
            url: coverUrl,
            responseType: "arraybuffer",
            family: 4, // 使用 IPv4
            timeout: 10000, // 设置超时时间为10秒
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

          if (lrc) musicFile.tag.lyrics = lrc;

          musicFile.save();
          musicFile.dispose();
        }

        resolve(outputFilePath);
      });
      writer.on("error", reject);
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
