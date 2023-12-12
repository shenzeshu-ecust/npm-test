import {cwx} from '../../../cwx/cwx.js';

module.exports = {
    //exp 过期时间（小时）
    set: function (key, val, exp) {
        exp = exp || 24;        //默认有效期1天
        cwx.setStorageSync(key, { val: val, exp: exp * 3600000, time: new Date().getTime() });
    },
    get: function (key) {
        const info = cwx.getStorageSync(key);
        if (!info || !info.time) {
            return null;
        }

        if (new Date().getTime() - info.time > info.exp) {
            return null;
        }

        return info.val
    },
    remove: function (key) {
        cwx.removeStorage({'key' : key});
    }
};
