import { _, cwx } from '../../index.js';
/*
首页弹窗组件说明：
* page: 传入调用此组件的页面
* showEntrance:请求返回的弹窗配置参数
* showPopup:展示弹窗或者浮层时的回调函数
* */

class Popup {
    constructor(page, showEntrance, showPopup = null) {
        this.page = page;
        this.page.showPopupWindow = this.showPopupWindow.bind(this);
        this.page.showPopupLogo = this.showPopupLogo.bind(this);
        this.page.checkFirstPopShareWin = this.checkFirstPopShareWin.bind(this);
        this.page.toShareCoupon = this.toShareCoupon.bind(this);
        this.page.closeWinPopup = this.closeWinPopup.bind(this);
        this.page.showShareCoupon = this.showShareCoupon.bind(this);
        this.setData({
            homePopupData: {
                canshow: showEntrance.canshow,
                activityName: showEntrance.activityName,
                floatLogoImg: showEntrance.floatLogoImg,
                popUpImg: showEntrance.popUpImg,
                priority: showEntrance.priority,
                rockType: showEntrance.rockType,
                path: showEntrance.path,
                showPopupLogo: false,
                showPopupWin: false,
                shareLogoAnimationClass: 'jump-shake',
            },
        });
        this.showPopupCallback = showPopup;
        // 分享领券弹窗页面名称
        this.homePopup_pagename = showEntrance.activityName;
    }
    update() {
        let self = this;
        self.resetAnimationClass();
        let popupStatus = self.page.data.homePopupData.showPopupWin;
        if (!popupStatus) {
            // 弹窗处于打开状态，不做处理
            self.checkFirstPopShareWin().then((ret) => {
                if (ret === true) {
                    self.showPopupWindow();
                } else {
                    self.showPopupLogo();
                }
            });
        }
    }

    resetAnimationClass() {
        const rockType = this.page.data.homePopupData.rockType;
        if (rockType === 1) {
            //左右摇晃
            this.setData({
                'homePopupData.shareLogoAnimationClass': 'logo-shake',
            });
        } else if (rockType === 2) {
            //上下摇晃
            this.setData({
                'homePopupData.shareLogoAnimationClass': 'logo-show',
            });
        } else {
            //默认抖动
            this.setData({
                'homePopupData.shareLogoAnimationClass': 'logo-shake',
            });
        }
    }
    //展示弹窗小浮层
    showPopupLogo() {
        const rockType = this.page.data.homePopupData.rockType;
        // 重新触发抖动动画
        if (rockType === 1) {
            this.setData({
                'homePopupData.shareWindowAnimationClass': 'window-close',
            });

            setTimeout(() => {
                this.setData({
                    'homePopupData.showPopupLogo': true,
                    'homePopupData.showPopupWin': false,
                });
            }, 550);
        } else {
            this.setData({
                'homePopupData.showPopupLogo': true,
                'homePopupData.showPopupWin': false,
            });
        }

        this.showPopupCallback();
    }
    showShareCoupon(e) {
        let self = this;
        let url = self.page.data.homePopupData.path;
        cwx.navigateTo({ url: url });
    }
    // 展示首页弹窗
    showPopupWindow() {
        this.setData({
            'homePopupData.showPopupLogo': false,
            'homePopupData.showPopupWin': true,
        });
        this.showPopupCallback();
    }
    // 检查该openId是否为第一次弹出首页弹窗
    checkFirstPopShareWin() {
        return new Promise((resolve) => {
            const openId = cwx.cwx_mkt.openid;
            var userList = [];
            const userListKey = 'sharePopupUserList';
            cwx.getStorage({
                key: userListKey,
                success(res) {
                    userList = (res && res.data) || [];
                    if (userList.join('#').indexOf(openId) > -1) {
                        resolve(false);
                    } else {
                        userList.push(openId);
                        cwx.setStorage({
                            key: userListKey,
                            data: userList,
                        });
                        resolve(true);
                    }
                },
                fail() {
                    // 请求失败，默认弹窗
                    userList.push(openId);
                    cwx.setStorage({
                        key: userListKey,
                        data: userList,
                    });
                    resolve(true);
                },
            });
        });
    }

    toShareCoupon(e) {
        let self = this;
        let url = self.page.data.homePopupData.path;
        cwx.navigateTo({
            url: url,
            success: () => {
                this.setData({
                    'homePopupData.showPopupLogo': true,
                    'homePopupData.showPopupWin': false,
                });
            },
        });
    }
    closeWinPopup() {
        this.showPopupLogo();
    }
}
Popup.prototype.setData = function (data) {
    this.page && this.page.setData.apply(this.page, arguments);
};

Popup.prototype.showToast = function () {
    this.page &&
        this.page.showToast &&
        this.page.showToast.call(this.page, arguments);
};

export default Popup;
