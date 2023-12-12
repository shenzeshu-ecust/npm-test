const __dataStore = {};
const storage = {
    getItem: (key) => {
        return __dataStore[key];
    },

    setItem: (key, value) => {
        return (__dataStore[key] = value);
    },

    removeItem: (key) => {
        delete __dataStore[key];
    },

    getAllKeys: () => {
        return Object.keys(__dataStore);
    },
    clear: () => {
        const keys = storage.getAllKeys();
        keys.map((key) => {
            return storage.removeItem(key);
        });
    },
    length: () => {
        return Object.keys(__dataStore).length;
    },
};

export default function MockStorage() {
    return storage;
}
