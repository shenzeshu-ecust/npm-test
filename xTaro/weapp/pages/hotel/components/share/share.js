/*
* 未开发完成
*/

// pages/hotel      /components/share/share.js
import { cwx } from '../../../../cwx/cwx';

Component({
    options: {
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        imageUrl: {
            type: String,
            value: '',
            observer: function (newVal, oldVal, changedPath) {
                if (newVal && oldVal) {
                    this.setData({
                        imageUrl: newVal
                    });
                }
            }
        },
        title: {
            type: String,
            value: '携程旅行酒店'
        },
        desc: {
            type: String,
            value: ''
        },
        path: {
            type: String,
            value: ''
        },
        url: {
            type: String,
            value: ''
        },
        bgImage: {
            type: String,
            value: ''
        },
        hidden: {
            type: Boolean,
            value: true
        },
        from: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        friendsLayerHidden: true
    },

    ready: function () {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        shareToFriends: function () {
            const self = this;

            this.downloadPic((tempFilePath) => {
                self._tempFilePath = tempFilePath;
                self.saveSharePic();
            });
        },
        downloadPic: function (callback) {
            const imageUrl = this.data.imageUrl;

            wx.downloadFile({
                url: imageUrl,
                success: function (res) {
                    if (res.statusCode !== 200) {
                        cwx.showModal({
                            title: '图片下载失败， 请重试',
                            showCancel: false,
                            confirmText: '我知道了'
                        });
                        return;
                    }

                    callback && callback(res.tempFilePath);
                },
                fail: function (err) {
                    cwx.showModal({
                        title: '图片下载失败， 请重试',
                        showCancel: false,
                        confirmText: '我知道了'
                    });
                }
            });
        },
        saveSharePic: function () {
            const self = this;
            const tempFilePath = this._tempFilePath;

            wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success: () => {
                    cwx.showModal({
                        title: '图片保存成功',
                        content: '请将图片分享到朋友圈',
                        confirmText: '我知道了',
                        showCancel: false
                    });
                    // 分享后传值给父组件detail
                    if (self.data.from === 'hoteldetail') {
                        self.setData({
                            friendsLayerHidden: true
                        });
                    }
                },
                fail: (err) => {
                    if (err.errMsg.indexOf('auth') !== -1) {
                        return self.reopenAuth();
                    }

                    cwx.showModal({
                        title: '图片保存失败，请重试',
                        confirmText: '我知道了',
                        showCancel: false
                    });
                }
            });
        },

        reopenAuth: function () {
            const self = this;

            wx.getSetting({
                success: function (res) {
                    const authRes = res.authSetting['scope.writePhotosAlbum'];

                    if (authRes == null) {
                        cwx.cwx_mkt.refreshSessionKey();
                    } else if (!authRes) {
                        cwx.showModal({
                            title: '提示',
                            content: '相册系统未授权，请重新授权并保存图片',
                            success: function (res) {
                                if (res.confirm) {
                                    self.openWXSetting();
                                }
                            }
                        });
                    } else {
                        cwx.cwx_mkt.refreshSessionKey();
                        self.saveSharePic();
                    }
                }
            });
        },

        openWXSetting: function () {
            const self = this;
            wx.openSetting({
                success: function (res) {
                    if (res.authSetting && res.authSetting['scope.writePhotosAlbum']) {
                        cwx.cwx_mkt.refreshSessionKey();
                        self.saveSharePic();
                    }
                }
            });
        },

        closeFriendsShare: function () {
            this.setData({
                friendsLayerHidden: true
            });
        },

        openFriendsLayer: function () {
            this.setData({
                friendsLayerHidden: false
            });

            this.triggerEvent('openFriendsLayer');
        },

        close: function () {
            this.setData({
                hidden: true
            });

            this.triggerEvent('shareClose', {
                hidden: true
            }, {
                composed: false // 自定义事件不冒泡
            });
        },
        noop: function () {}
    }
});
