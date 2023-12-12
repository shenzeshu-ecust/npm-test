import { cwx } from '../../../../cwx/cwx';

export default {
    // exp 过期时间（小时）
    setStorage: function (key, val, exp) {
        exp = exp || 24; // 默认有效期1天
        cwx.setStorageSync(key, { val, exp: exp * 3600000, time: new Date().getTime() });
    },
    getStorage: function (key) {
        const info = cwx.getStorageSync(key);
        if (!info || !info.time) {
            return null;
        }

        if (new Date().getTime() - info.time > info.exp) {
            return null;
        }

        return info.val;
    },
    getSessionStorage: function () {
        let info = wx.getStorageSync('P_HOTEL_SESSIONID');
        const date = new Date();
        if (!info || date > info.expireAt) {
            const sessionID = (info && info.sessionID) || 0;
            date.setMinutes(date.getMinutes() + 20);
            const expireAt = date.getTime();
            wx.setStorageSync('P_HOTEL_SESSIONID', { sessionID: sessionID + 1, expireAt });
            info = wx.getStorageSync('P_HOTEL_SESSIONID');
        }

        return info.sessionID;
    },
    getStorageThenBurn: function (key) {
        const val = this.getStorage(key);
        this.setStorage(key, '', 0);
        return val;
    },
    removeStorage: function (key) {
        cwx.removeStorage({ key });
    },
    removeStorageSync: function (key) {
        cwx.removeStorageSync(key);
    },
    setStorageByMillisecond: function (key, val, exp) {
        exp = exp || 24 * 3600000; // 默认有效期1天
        cwx.setStorageSync(key, { val, exp, time: new Date().getTime() });
    }
};
