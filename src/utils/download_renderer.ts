import indexDB from '@/utils/indexDB';
import { Subscriber } from './subscribe';

export class Download {
    db: indexDB;
    downloadedSongs: Array<any>;
    subscriber: Subscriber;

    constructor() {
        this.db = new indexDB('download', 'songs');
        this.downloadedSongs = [];
        this.subscriber = new Subscriber([
            'downloaded-songs'
        ]);
        this.db.openDatabase().then(async () => {
            this.downloadedSongs = await this.db.getAllSongs();
            this.Exec('downloaded-songs');
        });
        if (window.electron?.isElectron) {
            window.electron.ipcRenderer.on('download-song-reply', async (event, data, nouse) => {
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
                this.Exec('downloaded-songs');
            });
        }
    }

    Subscribe(options: {
        id: string,
        type: string,
        func: Function
    }) {
        this.subscriber.on({
            id: options.id,
            type: options.type,
            func: options.func,
        });
    }

    UnSubscribe(options: {
        id: string,
        type: string
    }) {
        this.subscriber.off({
            id: options.id,
            type: options.type
        });
    }

    Exec(type: string) {
        this.subscriber.exec(type);
    }

    add(url: string, track: any, downloadDir: string) {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        window.electron.ipcRenderer.send('download-song', url, track, downloadDir);
    }

    async delete(id: string) {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        await this.db.deleteDownloadedSong(id);
        this.downloadedSongs = this.downloadedSongs.filter(song => song.id !== id);
        this.Exec('downloaded-songs');
    }

    async clear() {
        if (!window.electron?.isElectron) {
            console.error('Not in Electron environment');
            return;
        }
        await this.db.clearDownloadStore();
        this.downloadedSongs = [];
        this.Exec('downloaded-songs');
    }

    get downloadedSongIds() {
        return this.downloadedSongs.map(song => song.id);
    }
}