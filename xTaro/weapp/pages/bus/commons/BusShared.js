/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2022-09-20 16:15:21
 * @LastEditTime: 2023-02-28 15:22:45
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /commons/BusShared.js
 * @
 */

import { cwx, __global } from './cwx/index';

let t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
function randomString(e) {
    e = e || 32;
    let n = '';
    let i = 0;
    let a = t.length;
    while (i < e) {
        n += t.charAt(Math.floor(Math.random() * a));
        i++;
    }
    return n;
}
function uid(cmd = '') {
    let randString = randomString(8);
    return `busShared${cmd}${randString}`;
}

let shared = cwx.bus;
if (!shared) {
    shared = cwx.bus = {};
}

//增加监听用来处理数据变化
let watcher = {};

// 只存字符串 。其他类型自行处理
let BusShared = Object.assign(shared, {
    watch: function (key, func) {
        let watchers = watcher[key];
        if (!Array.isArray(watchers)) {
            watchers = [];
        }
        watchers.push(func);
        watcher[key] = watchers;
    },
    removeWatch: function (key, func) {
        if (func) {
            let watchers = watcher[key];
            if (!Array.isArray(watchers)) {
                watchers = [];
            }
            let newWatchers = [];
            watchers.forEach((item) => {
                if (item != func) {
                    newWatchers.push(item);
                }
            });
            watcher[key] = newWatchers;
        } else {
            watcher[key] = [];
        }
    },
    notify: function (key, data) {
        let watchers = watcher[key];
        if (Array.isArray(watchers)) {
            watchers.forEach((func) => {
                func(data);
            });
        }
    },
    get: function (key, storage) {
        let value;
        if (storage) {
            value = cwx.getStorageSync(key);
        } else {
            value = shared[key];
        }
        let trueValue;
        try {
            trueValue = JSON.parse(value);
        } catch (err) {
            trueValue = value;
        }
        return trueValue;
    },
    save: function (key, data, storage) {
        let trueValue;
        try {
            trueValue = JSON.stringify(data);
        } catch (e) {
            trueValue = data;
        }
        if (storage) {
            cwx.setStorageSync(key, trueValue);
        } else {
            shared[key] = trueValue;
        }
        BusShared.notify(key, data);
    },
    delete: function (key) {
        try {
            cwx.removeStorageSync(key);
            delete shared[key];
        } catch (e) {}
    },
    genKey: function (tag) {
        return uid(tag);
    },
});

export default BusShared;
