/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * indexDB.ts 为 IndexedDB 操作工具
 * 封闭了以下功能：
 * 1. 打开数据库
 * 2. 存储、获取播放列表
 * 3. 管理已经下载的歌曲信息
*-----------------------------------------*/

class IndexedDB {
    dbName: string;
    storeName: string;
    db: null | IDBDatabase;
    /**
     * 
     * @param {string} dbName 
     * @param {string} storeName 
     */
    constructor(dbName: string, storeName: string) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    /**
     * 打开数据库
     * @param {number} version
     * @returns {Promise<IDBDatabase>}
     */
    openDatabase(version: number = 1): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                // 创建对象存储
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                    console.log(`Object store "${this.storeName}" created.`);
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject('Database error: ' + (event.target as IDBOpenDBRequest).error);
            };
        });
    }

    /**
     * 存储播放列表
     * @param {Array} array
     * @returns {Promise<string>}
     */
    storePlaylist(array: Array<any>): Promise<string> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(this.storeName, 'readwrite');
            const store = transaction?.objectStore(this.storeName);

            if (!store) {
                reject('Store is null');
                return;
            }

            // 清空当前对象存储
            const clearRequest = store?.clear();

            if (!clearRequest) {
                reject('Clear request is null');
                return;
            }

            clearRequest.onsuccess = () => {
                // 清空成功后添加新数组
                const addPromises = array.map(item => {
                    // 使用 JSON.stringify 转换对象为字符串
                    const jsonString = JSON.stringify(item);

                    return new Promise<void>((addResolve, addReject) => {
                        const addRequest = store?.add({
                            id: item.id,
                            data: jsonString
                        });
                        addRequest.onsuccess = () => addResolve();
                        addRequest.onerror = (event: Event) => {
                            const target = event.target as IDBRequest;
                            addReject('Add error: ' + (target.error?.message || 'Unknown error'));
                        };
                    });
                });

                // 等待所有添加操作完成
                Promise.all(addPromises)
                    .then(() => {
                        resolve('All items replaced in the store');
                    })
                    .catch(error => {
                        reject(error);
                    });
            };

            clearRequest.onerror = (event: Event) => {
                const target = event.target as IDBRequest;
                reject('Clear error: ' + (target.error?.message || 'Unknown error'));
            };
        });
    }

    /**
     * 获取播放列表
     * @returns {Promise<Array>}
     */
    fetchPlaylist(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(this.storeName, 'readonly');
            const store = transaction?.objectStore(this.storeName);
            if (!store) {
                reject('Store is null');
                return;
            }
            const getAllRequest = store.getAll();

            if (!getAllRequest) {
                reject('Get all request is null');
                return;
            }

            getAllRequest.onsuccess = (event: Event) => {
                const target = event.target as IDBRequest<any[]>;
                const data = target.result.map(item => JSON.parse(item.data));
                resolve(data);
            };

            getAllRequest.onerror = (event: Event) => {
                const target = event.target as IDBRequest;
                reject('Get error: ' + (target.error?.message || 'Unknown error'));
            };
        });
    }

    /**
     * 获取所有存储的歌曲信息
     * @returns {Promise<Array<object>>}
     */
    getAllSongs(): Promise<Array<object>> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('Database not open');

            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve((event.target as IDBRequest).result);
            };

            request.onerror = (event) => {
                reject('Get all songs error: ' + (event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 添加歌曲信息到数据库
     * @param {object} song
     * @returns {Promise<void>}
     */
    addDownloadedSong(song: { id: string, name: string, path: string }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('Database not open');

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(song);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject('Add song error: ' + (event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 删除数据库中的歌曲
     * @param {string} id
     * @returns {Promise<void>}
     */
    deleteDownloadedSong(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('Database not open');

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject('Delete song error: ' + (event.target as IDBRequest).error);
            };
        });
    }

    /**
     * 清除歌曲存储库
     * @returns {Promise<void>}
     */
    clearDownloadStore(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('Database not open');

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject('Clear store error: ' + (event.target as IDBRequest).error);
            };
        });
    }
}

// 导出 IndexedDB 类
export default IndexedDB;