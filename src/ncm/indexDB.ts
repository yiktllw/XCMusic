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
                db.createObjectStore(this.storeName, { keyPath: 'id' });
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
     * 存储数组
     * @param {Array} array
     * @returns {Promise<string>}
     */
    storePlaylist(array: Array<any>): Promise<string> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction(this.storeName, 'readwrite');
            const store = transaction?.objectStore(this.storeName);
            
            if(!store) {
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
     * 获取数组
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
}

// 导出 IndexedDB 类
export default IndexedDB;