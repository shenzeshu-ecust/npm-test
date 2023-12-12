import { _, config } from '../common.js';

function getKey(key, prefix) {
    var prefixs = {
        'true': 'req', //请求数据
        'false': 'res', //原始数据
        'null' : '', //格式化后的数据
        'undefined': '' //默认
    }
    return [config.Base.bu, prefixs['' + prefix] || prefix || '', key].join("_");
}

function formatTime(time) {
    if (!time) {
        return 0;
    }
    var times = {
        's': 1, //秒
        'm': 60, //分钟
        'h': 3600, //小时
        'd': 86400, //天
        'n': 2592000,//月
        'y': 31536000 //年
    }
    time = time.toLowerCase();
    var len  = time.length - 1,
        last = time.substr(len, 1),
        num  = times[last] ? time.substr(0, len) : time;
    num = parseInt(num);
    num = isNaN(num) ? 0 : parseInt(num);
    return num * (times[last] || times.m);
}

function getTime(expire) {
    var t = new Date().getTime();
    t = parseInt(t / 1000); //最小为秒
    t = expire ? t + formatTime(expire) : t;
    return t;
}

function setStorage(key, data, expire, callback) {
    expire = getTime(expire);
    var storage = {
            data: data,
            expire: expire
    }
    if (!expire) {
        return;
    }
    callback ? wx.setStorage({
        key: key,
        data: storage,
        success : callback
    }) : wx.setStorageSync(key, storage) ;
}

function getStorage(key, callback){
    var time = getTime();
    if (callback) {
        wx.getStorage({
            key : key,
            success : function(data){
                if (time > data.expire) {
                    removeStorage(key, function(){
                        callback(null);
                    });
                    return;
                }
                callback(data.data);
            },
            fail : function(){
                callback(null);
            }
        });
        return;
    }
    var data = wx.getStorageSync(key);
    if (!data || (time > data.expire)) {
        removeStorage(key);
        return null;
    }
    return data.data;
}

function removeStorage(key, callback){
    callback ? wx.removeStorage({
        key : key,
        success : callback
    }) : wx.removeStorageSync(key);
}

function setSync(data, prefix) {
    var key    = this.key,
        expire = this.expire;
    key = getKey(key, prefix);
    setStorage(key, data, expire, null);
}

function setAsync(data, prefix, callback){
    var key    = this.key,
        expire = this.expire;
    key = getKey(key, prefix);
    setStorage(key, data, expire, callback);
}

function getSync(prefix) {
    //clearAsync();
    var key = this.key;
    key = getKey(key, prefix);
    return getStorage(key);
}

function getAsync(prefix, callback){
    //clearAsync();
    var key = this.key;
    key = getKey(key, prefix);
    return getStorage(key, callback);
}

function removeSync(prefix) {
    var key    = this.key;
    key = getKey(key, prefix);
    wx.removeStorageSync(key);
}

function removeAsync(prefix, callback) {
    var key    = this.key;
    key = getKey(key, prefix);
    wx.removeStorage({
        key : key,
        success : callback
    });
}

//异步清理缓存，以免超过
// function clearAsync(){
//     var selflist = config.Base.bu,
//         whitelist = [selflist, config.Base.storageWhiteList].join(",");
//
//     wx.getStorageInfo({
//         success : function(res){
//             //删除警戒线 90%
//             if ((res.currentSize / res.limitSize) < 0.9) {
//                 return;
//             }
//             res.keys.forEach(function(item){
//                 var sub = item.toLowerCase().split('_')[0];
//                 //非本bu,直接清理
//                 if (whitelist.indexOf(sub) < 0) {
//                     removeStorage(item, function(){
//                         //
//                     });
//                 }
//                 //本bu，过期清理
//                 if (sub == selflist) {
//                     getStorage(item, function(){
//                         //
//                     })
//                 }
//             });
//         },
//         fail : function(){
//             wx.clearStorage();
//         }
//     });
// }

//store
var store = config.Store;
Object.keys(store).map(function (key) {
    store[key].set = setSync;
    store[key].setAsync = setAsync;
    store[key].get = getSync;
    store[key].getAsync = getAsync;
    store[key].remove = removeSync;
    store[key].removeAsync = removeAsync;
})
//增加全局清理
//store.clear = clearOther;

module.exports = store;
