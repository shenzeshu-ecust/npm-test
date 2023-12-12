/*
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-07-03 17:10:43
 * @LastEditors: jhyi jhyi@trip.com
 * @LastEditTime: 2023-07-04 18:48:10
 * @FilePath: /bus/utils/webview.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import CWebView from '../../../cwx/component/cwebview/CWebviewBaseClass';
import { CPage, cwx, __global, URLUtil } from '../common/index';
const MyWebView = {
  type: 'bus_cwebview',
  register() {
    let proto = Object.getPrototypeOf(this);
    let protoLink = [proto];
    while ((proto = Object.getPrototypeOf(proto))) {
      protoLink.push(proto);
    }

    let clone = Object.assign({});
    while (protoLink.length) {
      let lastProto = protoLink.pop();
      // Object.assign(this, lastProto);
      clone = Object.assign(clone, lastProto);
    }
    clone = Object.assign(clone, this);
    delete clone.constructor;
    CPage(clone);
  },

  onLoad(options) {
    const mainOptions = this.getH5UrlOptions(options);
    let mergedOptions = Object.assign({}, options, mainOptions);
    super.onLoad(mergedOptions);

    wx.setNavigationBarColor({
      frontColor: mergedOptions.fontColor || '#000000',
      backgroundColor: mergedOptions.naviColor || '#ffffff',
      animation: false,
    });
    wx.setNavigationBarTitle({
      title: options.title,
    });
  },
  onShow() {},
  buildLink(options) {
    return options;
  },

  getH5UrlOptions(options) {
    var afterBuildOptions = this.buildLink(options);
    return {
      ...afterBuildOptions,
      needLogin: true,
    };
  },
  navigateToMainMini: function (link) {
    console.log('navigateToMainMini---', link);
    cwx.user.getToken((token) => {
      if (link.indexOf('http') == 0) {
        link = `/cwx/component/cwebview/cwebview?data={"url":"${encodeURIComponent(
          link
        )}","needLogin":true,"isNavigate":false}`;
      }
      console.log('navigateToMainMini---', link, 'token---', token);
      cwx.navigateToMiniProgram({
        appId: 'wx0e6ed4f51db9d078',
        path: URLUtil.serializeURL(link, {
          __userToken: token,
        }),
        envVersion: 'release', //develop ,release , trial
        extraData: {
          auth: cwx.user.auth || '',
        },
        complete() {},
      });
    });
  },
  webPostMessageB(e) {
    if (e.type === 'message') {
      let data = e.detail.data;

      for (let i = 0; i < data.length; i++) {
        if (data[i].type === 'navigateTo') {
          if (__global.appId === 'wx0e6ed4f51db9d078') {
            cwx.navigateTo({
              url: data[i].url,
            });
          } else {
            this.navigateToMainMini(data[i].url);
          }

          return;
        }
      }
    }
    this.webPostMessage(e);
  },
};

Object.setPrototypeOf(MyWebView, CWebView.prototype);

export default MyWebView;
