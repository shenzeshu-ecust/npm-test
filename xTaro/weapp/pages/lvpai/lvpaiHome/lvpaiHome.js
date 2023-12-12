import { cwx, CPage, __global } from '../../../cwx/cwx.js';
import common from '../common/common.js';
cwx.config.init();

import CWebviewBaseClass from '../../../cwx/component/cwebview/CWebviewBaseClass';
class WebView extends CWebviewBaseClass {
  constructor(props) {
    super(props);
    Object.assign(this, {
      jumpData: null,
      pageId: '10650051973',
      data: {
        canWebView: cwx.canIUse('web-view'),
        pageName: 'cwebview',
        url: '',
        wsg: '',
        envIsMini: true, //true 小程序 ，false为h5跳转
        isNavigate: true, //跳转方式
        loginErrorUrl: '', //登录失败自定义显示地址  默认：url值

        pageId: '',
        h5Url: '',
        fromPage: '',
        fromShare: 0,
        noShareFlag: 0, //用来判断是否需要分享， 1为不需要分享， 0默认需要分享
        needLogin: false, //是否需要登录  true 需要，false 不需要
        auth: '', //用来判断是否授权
        needWriteCrossTicket: true, // 是否需要经过writecrossticket页面
      },

      auth: cwx.user.auth,
      observerKey: '',
      onLoad: function (options) {
        let tabCode = options.tabCode || '';
        let h5Url =
          common.newUrlPrefix() +
          'home/home?seo=0&isMini=2&isHideHeader=true&isHideNavBar=YES&autoawaken=close&popup=close&tabCode=' +
          tabCode;
        let data = {
          url: encodeURIComponent(h5Url),
          needLogin: false,
          isNavigate: false,
        };
        this.jumpData = data;
        let url = data.url || options.url || '';
        this.observerKey = data.observerKey || options.observerKey || '';
        console.log('onloiad', this);
        if (url.length <= 0) {
          this.showUrlError();
          return;
        }
        url = decodeURIComponent(url);
        console.log('onloiadurl', url);
        // 判断是否在白名单内，并发送metric埋点记录不在白名单之内的域名
        this.isWhiteDomain(url || '', 179576);
        this.sendWebViewPv(data);
        this._syncDataFromOptions(data, url);
        this._handlerLoading(data);
        this._handlerShare(data, options);
        this._handleOptionsData(data, options);
      },

      onShow: function () {
        if (this.auth !== cwx.user.auth) {
          this._handleOptionsData(this.jumpData, this.jumpData);
        }
      },

      onHide: function () {
        this.auth = cwx.user.auth;
      },

      _handleOptionsData: function (data, options) {
        let isLogin = data.needLogin && !data.noForceLogin ? {} : false;
        let url = data.url || options.url || '';
        url = decodeURIComponent(url);
        if (isLogin) {
          if (data.IsAuthentication || options.IsAuthentication) {
            isLogin.IsAuthentication =
              data.IsAuthentication || options.IsAuthentication;
          }
          if (data.showDirectLoginBtn || options.showDirectLoginBtn) {
            isLogin.showDirectLoginBtn =
              data.showDirectLoginBtn || options.showDirectLoginBtn;
          }
        }
        const self = this;
        cwx.syncLogin.load({
          url,
          isLogin,
          loginErrorUrl: self.data.loginErrorUrl,
          needWriteCrossTicket: self.data.needWriteCrossTicket,
          success: function (sucUrl) {
            self.webLoadUrl(sucUrl, true);
          },
          fail: function (errorUrl) {
            if (self.data.isNavigate) {
              cwx.navigateBack();
            } else {
              self.setData({
                wsg: data.wsg,
                url: errorUrl,
              });
            }
          },
        });
      },

      onShareAppMessage: function (options) {
        if (!this.shareData.title) {
          this.shareData.title = '分享旅行 发现世界';
        }
        if (!this.shareData.path) {
          this.shareData.path = 'pages/lvpai/lvpaiHome/lvpaiHome';
        }
        return this.shareData;
      },
    });
  }
}
new WebView().register();

cwx.defaultEnvObject = {
  cid: cwx.clientID,
  appid: __global.appId,
  mpopenid: (cwx.cwx_mkt && cwx.cwx_mkt.openid) || '',
};
cwx.setEnvObject = function (o) {
  Object.assign(cwx.defaultEnvObject, o);
};
