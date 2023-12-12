import { _, cwx, Utils } from './index';

var setTiteTimer = null;
var busLoadingTimer = null;
var mixin = {
    onShareAppMessage: function () {
        // 默认分享首页
        var shareParam = Utils.share.getParam({});
        return Object.assign({}, shareParam);
    },

    isLogin(onlineCheck) {
        return new Promise((resolve, reject) => {
            if (onlineCheck) {
                cwx.user.checkLoginStatusFromServer((isLogin) => {
                    resolve({ isLogin });
                });
            } else {
                resolve({ isLogin: cwx.user.isLogin() });
            }
        });
    },

    setNavigationBarTitle({ title }) {
        setTiteTimer = setTimeout(() => {
            if (!this.didUnload) {
                wx.setNavigationBarTitle({
                    title: title || '',
                    success: () => {
                        this.setData({
                            'navbarData.title': title || '',
                        });
                    },
                });
            }
        }, 0);
    },

    autoJump(options) {
        var navigateTo = options.navigateTo;
        var redirectTo = options.redirectTo;
        var reLaunch = options.reLaunch;

        var path = navigateTo || redirectTo || reLaunch;
        path = decodeURIComponent(path);
        if (path) {
            //含有跳转path 且有跳转方式
            //直接调用不使用 busrouter
            if (navigateTo) {
                this.navigateTo({
                    url: path,
                });
            } else if (redirectTo) {
                this.redirectTo({
                    url: path,
                });
            } else if (reLaunch) {
                //重新打开
                cwx.reLaunch({
                    url: path,
                });
            }
        }
    },

    showMsg: function (msg, callback) {
        var message = msg;
        var title = '提示';
        if (typeof msg == 'string') {
            message = msg;
        } else {
            message = msg.message;
            title = msg.title || '提示';
        }
        cwx.showModal({
            title: title,
            content: message,
            showCancel: false,
            success: (data) => {
                callback && callback.call(this);
            },
        });
    },
    empty: function (e) {
        e.stopPropagation && e.stopPropagation();
        e.preventDefault && e.preventDefault();
    },
    showToast: function (msg, callback) {
        var message = '成功';
        var icon = 'success';
        var duration = 2000;
        if (typeof msg == 'string') {
            message = msg;
        } else {
            message = msg.message || '成功';
            icon = msg.icon || 'success';
            duration = msg.duration || 2000;
        }
        cwx.showToast({
            title: message,
            icon: icon,
            duration: duration,
            mask: false,
            complete: () => {
                callback && callback.call(this);
            },
        });
    },

    showLoading: function (msg) {
        try {
            cwx.showLoading({
                title: msg || '加载中',
                mask: true,
            });
        } catch (err) {
            cwx.showToast({
                title: msg || '加载中',
                icon: 'loading',
                duration: 10000,
                mask: true,
            });
        }

        clearTimeout(busLoadingTimer);
        busLoadingTimer = setTimeout(() => {
            this.hideLoading(true);
        }, 10000);
    },
    hideLoading: function (timeout, callback) {
        if (timeout) {
            this.setData &&
                this.setData({
                    isTimeout: true,
                });
        }
        clearTimeout(busLoadingTimer);

        Promise.resolve(wx.hideLoading()).catch((err) => {
            console.log(err);
            wx.hideToast();
        });

        callback && callback.call(this, timeout);
    },
    onUnload: function () {
        this.didUnload = true;
    },
    onHide: function () {
        this.hideLoading();
    },
    reportSubmitFromID(evt) {
        var formId = evt && evt.detail && evt.detail.formId;
        if (formId && cwx.mkt) {
            if (cwx.mkt.saveUserFormID) {
                cwx.mkt.saveUserFormID(formId);
            }
        }
    },
};

export default mixin;
