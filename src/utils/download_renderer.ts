import indexDB from '@/utils/indexDB';

export class Download {
    db: indexDB;
    downloadedSongs: Array<any>;

    constructor() {
        this.db = new indexDB('download', 'songs');
        this.downloadedSongs = [];
        this.db.openDatabase().then(async () => {
            this.downloadedSongs = await this.db.getAllSongs();
        });
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

        });
    }

    async init() {

        // await this.db.openDatabase().then(async () => {
        //     this.downloadedSongs = await this.db.getAllSongs();
        // });
    }

    add(url: string, track: any, downloadDir: string) {
        if (!window.electron?.isElectron) {
            throw new Error('Not in Electron environment');
        }
        window.electron.ipcRenderer.send('download-song', url, track, downloadDir);
    }

    async delete(id: string) {
        if (!window.electron?.isElectron) {
            throw new Error('Not in Electron environment');
        }
        await this.db.deleteDownloadedSong(id);
    }

    async clear() {
        if (!window.electron?.isElectron) {
            throw new Error('Not in Electron environment');
        }
        await this.db.clearDownloadStore();
    }
}