// pages/bus/router/index.js

import URLUtil from './String';

Page({
    pageId: '10320677779',
    data: {},

    toDefaultPage() {
        BusRouter.redirectTo('index', { bShow: true });
    },

    onShow: function () {},

    onLoad: function (options) {},
    onClickGOTO: function () {
        let path = URLUtil.serializeURL(
            '/pages/busnew/stand/router/index',
            this.options
        );
        wx.navigateToMiniProgram({
            appId: 'wx1746b19d13d9bbe7',
            path: path,
            envVersion: 'release',
            fail: (e) => {
                this.toDefaultPage();
            },
        });
    },
});
