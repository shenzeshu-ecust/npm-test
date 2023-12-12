import common from '../../common/common.js';
import { cwx, CPage, __global } from '../../../../cwx/cwx.js';

import CWebviewBaseClass from '../../../../cwx/component/cwebview/CWebviewBaseClass';

class WebView extends CWebviewBaseClass {
  constructor(props) {
    super(props);
    Object.assign(this, {
      jumpData: null,
      doRefreshWhileBack: false,
      loadedUrl: '',
      doShowFirstTime: true,
      pageId: '10650051973',
      data: {
        needLogin: false, //是否需要登录  true 需要false 不需要
        canWebView: cwx.canIUse('web-view'),
        pageName: 'cwebview',
        url: '',
        wsg: '',
        envIsMini: true, //true 小程序 ，false为h5跳转
        isNavigate: true, //跳转方式
        loginErrorUrl: '', //登录失败自定义显示地址  默认：url值
        needWriteCrossTicket: true, // 是否需要经过writecrossticket页面
      },

      onLoad: function (options) {
        let wxConfig, homePage;
        let data = options.data || options;
        if (options.data) {
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              try {
                //添加一层解析
                data = JSON.parse(decodeURIComponent(data));
              } catch (e) {
                this.showUrlError();
              }
            }
          }
        } else if (options.scene) {
          data = decodeURIComponent(options.scene);
          data = {
            url: data.split('url=')[1],
          };
          console.log('data', data);
        } else {
          wxConfig = __wxConfig;
          homePage = wxConfig.pages[0];
          if (homePage === 'pages/you/lvpai/webview/webview') {
            data = common.webviewHomeConfig();
          }
        }
        console.log('data', data);
        this.jumpData = data || options;
        if (data && typeof data.doRefreshWhileBack !== 'undefined') {
          this.doRefreshWhileBack = data.doRefreshWhileBack;
        }

        let url = data.url || options.url || '';
        this.observerKey = data.observerKey || options.observerKey || '';

        if (url.length <= 0) {
          this.showUrlError();
          return;
        }
        url = decodeURIComponent(url);
        this.isWhiteDomain(url || '', 179576);
        this.sendWebViewPv(data);
        this._syncDataFromOptions(data, url);
        this._handlerLoading(data);
        this._handlerShare(data, options);
        let isLogin = data.needLogin && !data.noForceLogin ? {} : false;
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

      //兼容旧的参数
      _handlerShare(data, options) {
        let hideShareMenu = data.hideShareMenu || options.hideShareMenu;
        let isHideShareUrl = decodeURIComponent(
          data.url || data.loginErrorUrl || ''
        );
        let isHideShare =
          common.getQueryString(isHideShareUrl, 'isHideShare') || '';
        if (!!hideShareMenu || isHideShare === 'yes') {
          wx.hideShareMenu();
        }
        if (data.shareData) {
          this.shareData = Object.assign(this.shareData, data.shareData);
        }
      },

      webPostMessage: function (e) {
        console.log('webPostMessage:', e.detail.data);
        let postArr = e.detail.data;
        let postCount = postArr.length;
        for (let i = 0; i < postCount; i++) {
          let sData = postArr[i];
          if (sData && sData.type && sData.type.toLowerCase() === 'onshare') {
            this.shareData = sData.shareData;
          }
          if (sData && sData.type && sData.type.toLowerCase() === 'tag') {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]; //上一页
            let tag = sData.tag;
            let newtagData = prevPage.data.newtagData;
            let newtagDataChecked = prevPage.data.newtagDataChecked;
            let prevPageTags = prevPage.data.tags;
            let prevPageChooseTags = prevPage.data.chooseTags;
            let prevPageTagsChecked = prevPage.data.tagsChecked;
            let flag = false;
            let oldFlag = false;
            let chooseFlag = false;
            console.log('tag', tag);
            console.log('prevPageTags', prevPageTags);
            prevPageTags.forEach((item, index) => {
              //判断 上一个的tags里是不是有这个标签
              if (item.topicName == tag.topicName) {
                console.log('prevPageChooseTags', prevPageChooseTags);
                prevPageChooseTags.forEach((i, v) => {
                  //判断 上一个的choosetags里是不是有这个标签
                  if (i.topicName == tag.topicName) {
                    chooseFlag = true; //有选中
                    oldFlag = true;
                  }
                });
                console.log('chooseFlag', chooseFlag);
                if (!chooseFlag) {
                  //没有选中
                  prevPageTagsChecked[index] = 1;
                  prevPageChooseTags.push(tag);
                  oldFlag = true;
                  console.log('prevPageTagsChecked', prevPageTagsChecked);
                  console.log('prevPageChooseTags', prevPageChooseTags);
                  prevPage.setData({
                    tagsChecked: prevPageTagsChecked,
                    chooseTags: prevPageChooseTags,
                  });
                }
              }
            });
            console.log('oldFlag', oldFlag);
            if (!oldFlag) {
              newtagData.forEach((item, index) => {
                if (item.topicName == tag.topicName) {
                  if (newtagDataChecked[index] != 1) {
                    newtagDataChecked[index] = 1;
                    prevPageChooseTags.push(tag);
                  }
                  flag = true;
                  prevPage.setData({
                    newtagDataChecked: newtagDataChecked,
                    chooseTags: prevPageChooseTags,
                  });
                }
              });
              if (!flag) {
                newtagData.push(tag);
                prevPageChooseTags.push(tag);
                let state = 1;
                newtagDataChecked.push(state);
                console.log(
                  '1',
                  newtagData,
                  prevPageChooseTags,
                  newtagDataChecked
                );
                prevPage.setData({
                  newtagData: newtagData,
                  newtagDataItem: tag,
                  chooseTags: prevPageChooseTags,
                  newtagDataChecked: newtagDataChecked,
                });
              }
            }
          }
          if (sData && sData.type && sData.type.toLowerCase() === 'poi') {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]; //上一页
            let poi = sData.poi;
            let poiData = [];
            poiData.push({
              poiType: poi.poiType,
              poiId: poi.poiId,
              districtId: poi.districtId,
            });
            prevPage.setData({
              poiData: poiData,
              poiName: poi.poiName,
              pois: poi,
            });
          }
        }

        try {
          // if (hashMessageKey) {
          //     //监听该messageKey的的内容
          //     cwx.addObserverForKey(hashMessageKey, (msg) => {
          //         this.handlerObserveMsg(msg, hashMessageKey);
          //     });
          // }
          if (this.observerKey) {
            cwx.Observer.noti(this.observerKey, {
              type: 'message',
              options: e,
            });
          }
        } catch (e) {}
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
