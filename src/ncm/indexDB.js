class IndexedDB {
    /**
     * 
     * @param {string} dbName 
     * @param {string} storeName 
     */
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    /**
     * 打开数据库
     * @param {number} version
     * @returns {Promise<IDBDatabase>}
     */
    openDatabase(version = 1) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(this.storeName, { keyPath: 'id' });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject('Database error: ' + event.target.error);
            };
        });
    }

    /**
     * 存储数组
     * @param {Array} array
     * @returns {Promise<string>}
     */
    storePlaylist(array) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // 清空当前对象存储
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // 清空成功后添加新数组
                const addPromises = array.map(item => {
                    // 使用 JSON.stringify 转换对象为字符串
                    const jsonString = JSON.stringify(item);

                    return new Promise((addResolve, addReject) => {
                        const addRequest = store.add({
                            id: item.id,
                            data: jsonString
                        });
                        addRequest.onsuccess = () => addResolve();
                        addRequest.onerror = (event) => addReject('Add error: ' + event.target.error);
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

            clearRequest.onerror = (event) => {
                reject('Clear error: ' + event.target.error);
            };
        });
    }

    /**
     * 获取数组
     * @returns {Promise<Array>}
     */
    fetchPlaylist() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = (event) => {
                // 将获取的数据解析回对象
                const data = event.target.result.map(item => JSON.parse(item.data));
                resolve(data);
            };

            getAllRequest.onerror = (event) => {
                reject('Get error: ' + event.target.error);
            };
        });
    }
}

// 导出 IndexedDB 类
export default IndexedDB;