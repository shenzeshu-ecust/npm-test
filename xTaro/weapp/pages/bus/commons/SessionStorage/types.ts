export interface Storage {
    /**
     * value = storage[key]
     */
    getStorageSync(key: string): any;
    /**
     * storage[key] = value
     */
    setStorageSync(key: string, value: string): any;
    /**
     * delete storage[key]
     */
    removeStorageSync(key: string): any;

    getAllKeys(): string[];
    clear(): void;
    length(): number;

    [name: string]: any;
}

export interface AsyncStorage extends Storage {
    /**
     * value = storage[key]
     */
    setStorage({ key, data, success, fail }): Promise<void>;
    /**
     * storage[key] = value
     */
    getStorage({ key, success, fail }): Promise<string | null>;
    /**
     * delete storage[key]
     */
    removeStorage({ key, success, fail }): Promise<void>;
    [name: string]: any;
}

export interface SessionStorage extends AsyncStorage {}
