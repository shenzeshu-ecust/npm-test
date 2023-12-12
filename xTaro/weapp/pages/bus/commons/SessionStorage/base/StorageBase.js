export default function (storage) {
    const Storage = {
        getStorageSync: (key) => {
            if (storage.getItem) {
                const value = storage.getItem(key);
                return value;
            } else {
                return null;
            }
        },
        setStorageSync: (key, value) => {
            if (storage.setItem) {
                storage.setItem(key, value);
            }
        },
        removeStorageSync: (key) => {
            if (storage.removeItem) {
                storage.removeItem(key);
            }
        },
        getStorage: ({ key, success, fail }) => {
            return new Promise((reslove, reject) => {
                try {
                    let value = Storage.getStorageSync(key);
                    success && success(value);
                    reslove(value);
                } catch (e) {
                    fail && fail(e);
                    reject(e);
                }
            });
        },
        setStorage: ({ key, data, success, fail }) => {
            return new Promise((reslove, reject) => {
                try {
                    Storage.setStorageSync(key, data);
                    success && success();
                    reslove();
                } catch (e) {
                    fail && fail(e);
                    reject(e);
                }
            });
        },
        removeStorage: ({ key, success, fail }) => {
            return new Promise((reslove, reject) => {
                try {
                    Storage.removeStorageSync(key);
                    success && success();
                    reslove();
                } catch (e) {
                    fail && fail(e);
                    reject(e);
                }
            });
        },
        getAllKeys: () => {
            if (storage.length) {
                return Object.keys(storage);
            }
            return [];
        },
        clear: () => {
            if (storage.clear) {
                storage.clear();
            } else {
                let keys = Storage.getAllKeys();
                keys.map((key) => {
                    Storage.removeItem(key);
                });
            }
        },
        length: () => {
            if (storage.length != null) {
                return storage.length;
            } else {
                return 0;
            }
        },
    };
    return Storage;
}
