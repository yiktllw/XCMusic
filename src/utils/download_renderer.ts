/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * download_renderer.ts 为在渲染进程中下载歌曲的函数
 * 下载任务由主进程完成
 * Download类负责将下载任务添加到主进程，以及管理下载完成的歌曲
*---------------------------------------------------------------*/

import indexDB from '@/utils/indexDB';
import { Subscriber } from './subscribe';
import { ITrack } from './tracks';
import { IDownloadProgress } from './download';

export interface IDownloadedSong {
    id: number;
    name: string;
    path: string;
}

export class Download {
    db: indexDB;
    downloadedSongs: Array<IDownloadedSong>;
    subscriber: Subscriber;
    downloading: ITrack[] = [];

    constructor() {
        this.db = new indexDB('download', 'songs');
        this.downloadedSongs = [];
        this.subscriber = new Subscriber([
            /** 已下载的歌曲 */
            'downloaded-songs',
            /** 下载中的歌曲 */
            'downloading',
            /** 下载进度 */
            'download-progress'
        ]);
        this.db.openDatabase().then(async () => {
            this.downloadedSongs = await this.db.getAllSongs();
            this.subscriber.exec('downloaded-songs');
        });
        if (window.electron?.isElectron) {
            window.electron.ipcRenderer.on('download-song-reply', async (_filePath: string, data: {
                filePath: string;
                track: ITrack;
            }) => {
                const { filePath, track } = data;
                await this.db.addDownloadedSong({
                    id: track.id,
                    name: track.name,
                    path: filePath
                });
                this.downloadedSongs.push({
                    id: track.id,
                    name: track.name,
                    path: filePath
                });
                this.downloading = this.downloading.filter(song => song.id !== track.id);
                this.subscriber.exec('downloading');
                this.subscriber.exec('downloaded-songs', track);
            });
            window.electron.ipcRenderer.on('download-progress', (data: IDownloadProgress) => {
                this.subscriber.exec('download-progress', data);
            });
        }
    }

    Exec(type: string) {
        this.subscriber.exec(type);
    }

    add(url: string, track: ITrack, downloadDir: string) {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        if (this.downloading.some(song => song.id === track.id)) {
            console.error('Song is already downloading: ', { ...track });
            return;
        }
        window.electron.ipcRenderer.send('download-song', url, track, downloadDir);
        this.downloading.push(track);
        this.subscriber.exec('downloading');
    }

    async delete(id: number) {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        await this.db.deleteDownloadedSong(id);
        this.downloadedSongs = this.downloadedSongs.filter(song => song.id !== id);
        this.subscriber.exec('downloaded-songs');
    }

    async clear() {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        await this.db.clearDownloadStore();
        this.downloadedSongs = [];
        this.subscriber.exec('downloaded-songs');
    }

    get downloadedSongIds() {
        return this.downloadedSongs.map(song => song.id);
    }
}