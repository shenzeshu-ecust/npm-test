/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-08-16 16:32:45
 * @LastEditors: jhyi jhyi@trip.com
 * @LastEditTime: 2023-08-24 14:42:11
 * @FilePath: /bus/web/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// pages/bus/router/index.js
import { cwx, _, CPage, BusRouter, Utils, Pservice } from '../index.js';

CPage({
    data: {
        url: '',
    },
    onLoad: function (options) {
        var mUtmsource = Utils.getUtmSource(options);
        this.data.utmSource = mUtmsource;

        if (options.url) {
            this.setData({
                url: decodeURIComponent(options.url),
                title: options.title,
            });
        } else {
            this.showMsg('没有找到此页面');
        }

        wx.setNavigationBarColor({
            frontColor: options.fontColor || '#ffffff',
            backgroundColor: options.naviColor || '#0086F6',
            animation: false,
        });
        wx.setNavigationBarTitle({
            title: options.title,
        });
    },
    onShareAppMessage(options) {
        var path;
        if (options.webViewUrl) {
            path = 'pages/bus/web/index?url=' + encodeURIComponent(webViewUrl);
        }
        var shareParam = Utils.share.getParam({
            url: path,
        });
        return Object.assign({}, shareParam);
    },
    webViewMessage(e) {
        console.log(e);
    },
});
