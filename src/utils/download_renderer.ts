/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * download_renderer.ts 为在渲染进程中下载歌曲的函数
 * 下载任务由主进程完成
 * Download类负责将下载任务添加到主进程，以及管理下载完成的歌曲
 * 调用删除方法时，不会删除本地文件
 *---------------------------------------------------------------*/

import indexDB from "@/utils/indexDB";
import { Subscriber } from "@/utils/subscribe";
import { type ITrack } from "@/utils/tracks";
import { type IDownloadProgress } from "@/utils/download";
import { Lyrics, Song } from "@/utils/api";
import { getDownloadDirectory } from "@/utils/setting";
import { getStorage, StorageKey } from "@/utils/render_storage";
import { DownloadEvents } from "@/dual/download_renderer";
import { toRaw } from "vue";

export interface IDownloadedSong {
  id: number;
  name: string;
  path: string;
}

type DownloadEventCallbacks = {
  [DownloadEvents.Complete]: (track?: ITrack) => void;
  [DownloadEvents.Doing]: () => void;
  [DownloadEvents.List]: () => void;
};

export class Download {
  db: indexDB;
  downloadedSongs: Array<IDownloadedSong>;
  subscriber = new Subscriber<DownloadEventCallbacks>(DownloadEvents);
  /**
   * 正在下载的歌曲列表
   */
  downloading: IDownloadProgress[] = [];
  /**
   * 预订了下载任务的歌曲列表
   */
  private downloadlist: ITrack[] = [];

  constructor() {
    this.db = new indexDB("download", "songs");
    this.downloadedSongs = [];
    this.db.openDatabase().then(async () => {
      this.downloadedSongs = await this.db.getAllSongs();
      this.subscriber.exec(DownloadEvents.Complete);
    });
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer.on(
        "download-song-reply",
        async (
          _filePath: string,
          data: {
            filePath: string;
            track: ITrack;
          },
        ) => {
          const { filePath, track } = data;
          await this.db.addDownloadedSong({
            id: track.id,
            name: track.name,
            path: filePath,
          });
          this.downloadedSongs.push({
            id: track.id,
            name: track.name,
            path: filePath,
          });
          this.downloading = this.downloading.filter(
            (item) => item.track.id !== track.id,
          );
          this.subscriber.exec(DownloadEvents.Doing);
          this.subscriber.exec(DownloadEvents.Complete, track);
        },
      );
      window.electron.ipcRenderer.on(
        "download-progress",
        (data: IDownloadProgress) => {
          const index = this.downloading.findIndex(
            (item) => item.track.id === data.track.id,
          );
          if (index !== -1) {
            this.downloading[index] = data;
          }
          this.subscriber.exec(DownloadEvents.Doing);
        },
      );
      this.subscriber.on(
        "download_renderer",
        DownloadEvents.Doing,
        async () => {
          if (this.downloading.length === 0 && this.downloadlist.length > 0) {
            const song = this.downloadlist.shift();
            if (!song) return;

            const url = await Song.getUrl(
              song.id,
              getStorage(StorageKey.Setting_Download_Quality) ?? "standard",
            );
            const downloadDir =
              getStorage(StorageKey.Setting_Download_Path) ??
              getDownloadDirectory();
            if (!url || !downloadDir) return;

            this.add(url, song, downloadDir);
          }
        },
      );
    }
  }

  /**
   * 添加单曲下载任务
   */
  async add(url: string, track: ITrack, downloadDir: string) {
    if (!window.electron?.isElectron) {
      console.error("Not in desktop environment");
      return;
    }
    if (this.downloading.some((item) => item.track.id === track.id)) {
      console.error("Song is already downloading: ", { ...track });
      return;
    }

    const lrc = await Lyrics.getLrcStr(track.id);

    window.electron.ipcRenderer.send(
      "download-song",
      toRaw(url),
      toRaw(track),
      toRaw(downloadDir),
      toRaw(lrc),
    );
    this.downloading.push({
      track: track,
      percent: 0,
    });
    this.subscriber.exec(DownloadEvents.Doing);
  }

  /**
   * 添加歌曲列表下载任务
   */
  addList(_list: ITrack[]) {
    const list = _list.filter(
      (item) =>
        !this.downloadlist.some((song) => song.id === item.id) &&
        !this.downloadedSongIds.includes(item.id),
    );
    // if (list.length === 0) console.log("no new songs to download");
    this.downloadlist.push(...list);
    this.subscriber.exec(DownloadEvents.List);
    this.subscriber.exec(DownloadEvents.Doing);
  }

  /**
   * 删除已下载的歌曲
   */
  async delete(id: number) {
    if (!window.electron?.isElectron) {
      console.error("Not in Electron environment");
      return;
    }
    await this.db.deleteDownloadedSong(id);
    this.downloadedSongs = this.downloadedSongs.filter(
      (song) => song.id !== id,
    );
    this.subscriber.exec(DownloadEvents.Complete);
  }

  /**
   * 清除所有已下载的歌曲
   */
  async clear() {
    if (!window.electron?.isElectron) {
      console.error("Not in Electron environment");
      return;
    }
    await this.db.clearDownloadStore();
    this.downloadedSongs = [];
    this.subscriber.exec(DownloadEvents.Complete);
  }

  /**
   * 获取已下载歌曲的JSON字符串
   */
  exportToJSON() {
    const json = JSON.stringify(this.downloadedSongs, null, "\t");
    return json;
  }

  /**
   * 从JSON字符串导入已下载歌曲
   */
  async importFromJSON(json: string) {
    const songs: IDownloadedSong[] = JSON.parse(json);
    if (!Array.isArray(songs)) return;
    if (songs.length === 0) return;

    // 检查是否满足歌曲格式
    if (
      !songs.every((song) => "id" in song && "name" in song && "path" in song)
    )
      return;

    // 检查是否有重复的歌曲
    let pushRequests: Array<Promise<void>> = [];
    songs.forEach((song) => {
      if (!this.downloadedSongIds.includes(song.id)) {
        this.downloadedSongs.push(song);
        pushRequests.push(
          this.db.addDownloadedSong({
            id: song.id,
            name: song.name,
            path: song.path,
          }),
        );
      }
    });
    await Promise.all(pushRequests);
    this.subscriber.exec(DownloadEvents.Complete);
  }

  /**
   * 获取已下载歌曲的id列表
   */
  get downloadedSongIds() {
    return this.downloadedSongs.map((song) => song.id);
  }
}
