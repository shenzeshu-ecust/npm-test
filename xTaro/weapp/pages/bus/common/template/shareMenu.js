// pages/bus/share/template/shareMenu.js
const isFunction = (t) => typeof t === 'function';
function saveSharePic(path, callBack, successCallback) {
    if (!wx.saveImageToPhotosAlbum || !isFunction(wx.saveImageToPhotosAlbum)) {
        wx.showModal({
            title: '提示',
            content:
                '客户端版本较低，暂不支持保存图片至相册系统，建议截图保存，或升级后重试',
            showCancel: false,
            success: function (res) {},
        });
        return;
    }
    wx.saveImageToPhotosAlbum({
        filePath: path,
        success: function (res) {
            //self.hideBackdrop();
            successCallback && successCallback();
        },
        fail: function (e) {
            console.log('*********** 保存海报图片 - 失败 ************');
            console.log(e);
            reopenAuth(callBack); //提示用户重新授权相册系统
        },
    });
}

function reopenAuth(callBack) {
    wx.getSetting({
        success(res) {
            var _irrd = res.authSetting['scope.writePhotosAlbum'];
            if (_irrd == undefined) {
                console.log(
                    '*************** 相册授权undefined *****************'
                );
                //self.hideBackdrop();
            } else if (_irrd == false) {
                console.log('*************** 相册未授权 *****************');
                wx.showModal({
                    title: '提示',
                    content: '相册系统未授权，请重新授权并保存图片',
                    success: function (stRes) {
                        if (stRes.confirm) {
                            wx.openSetting({
                                success(res) {
                                    if (
                                        res.authSetting[
                                            'scope.writePhotosAlbum'
                                        ]
                                    ) {
                                        console.log(
                                            '*************** 相册重新授权 - 成功 *****************'
                                        );
                                        callBack && callBack();
                                    } else {
                                        console.log(
                                            '*************** 相册重新授权 - 失败 *****************'
                                        );
                                        //self.hideBackdrop();
                                    }
                                },
                            });
                        } else {
                            //self.hideBackdrop();
                        }
                    },
                });
            } else {
                console.log('*************** 相册已授权 *****************');
                callBack && callBack();
            }
        },
    });
}

class shareMenu {
    constructor(page) {
        this.page = page;
        this.page.closeShare = page.UBT_eventWrapper(this.closeShare);
        this.page.showShareMenu = page.UBT_eventWrapper(this.showShareMenu);
        this.page.onShareQrcode = page.UBT_eventWrapper(this.onShareQrcode);
        this.page.onSaveImg = page.UBT_eventWrapper(this.onSaveImg);
        this.page.updateShareInfo = page.UBT_eventWrapper(this.updateShareInfo);
        this.page.onShareApp = page.UBT_eventWrapper(this.onShareApp);
    }
    get data() {
        return this.page && this.page.data;
    }

    updateShareInfo(info, callBack) {
        this.setData(
            {
                'shareInfoData.share_info': info,
            },
            () => {
                callBack && callBack();
            }
        );
    }
    showShareMenu(callback) {
        this.setData({
            'shareInfoData.showDownShare': true,
            'shareInfoData.showShare': true,
            'shareInfoData.showQrcode': false,
            'shareInfoData.inHidden': false,
        });
        if (callback) {
            // once
            this.successCallback = callback;
        }
    }

    closeShare() {
        this.setData({
            'shareInfoData.inHidden': true,
        });
        setTimeout(() => {
            this.setData({
                'shareInfoData.showDownShare': false,
                'shareInfoData.showShare': false,
                'shareInfoData.showQrcode': false,
            });
        }, 200);
        this.successCallback && this.successCallback();
        this.successCallback = null;
    }

    onShareQrcode() {
        this.setData({
            'shareInfoData.showDownShare': false,
            'shareInfoData.showShare': true,
            'shareInfoData.showQrcode': true,
        });
        this.successCallback && this.successCallback();
        this.successCallback = null;
    }

    onSaveImg(e, successCallback) {
        var self = this;
        var picUrl = e.currentTarget.dataset.url || '';

        wx.downloadFile({
            url: picUrl,
            success: function (res) {
                console.log('*********** 下载海报图片 - 成功 ************');
                saveSharePic(
                    res.tempFilePath,
                    self.onSaveImg.bind(self),
                    successCallback ||
                        (() => {
                            wx.showToast({
                                title: '保存成功',
                            });
                        })
                );
            },
            fail: function (e) {
                console.log('*********** 下载海报图片 - 失败 ************');
                console.log(e);

                wx.showModal({
                    title: '提示',
                    content: '图片下载失败',
                });
            },
        });
    }

    onShareApp() {
        this.setData({
            'shareInfoData.showDownShare': false,
            'shareInfoData.showShare': false,
            'shareInfoData.showQrcode': false,
        });
        var activity = (this.data.shareInfoData || {}).share_info || {};

        var share_title =
            activity.share_title || '汽车票查询_汽车票预订【携程汽车票】';
        var share_bg_img = activity.share_bg_img || '';
        var share_link = activity.share_link || '/pages/bus/index/index';
        var share_desc =
            activity.share_desc ||
            '携程汽车票订购中心，为您提供汽车票网上订票服务，汽车票余票查询，汽车票价，预订长途汽车票。';

        var shareParam = {
            title: share_title,
            path: share_link,
            desc: share_desc,
            utmSource: 'ctrip_xcx_share',
            imageUrl: share_bg_img,
        };
        return Object.assign({}, shareParam, {
            success(e) {
                console.log(e);
            },
        });
    }
}
shareMenu.prototype.setData = function (data) {
    this.page && this.page.setData.apply(this.page, arguments);
};

export default shareMenu;
