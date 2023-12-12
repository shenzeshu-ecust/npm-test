import { cwx, CPage, __global } from "../../cwx.js";

/**
 * @module cwx\CWebviewBase
 * @constructor
 * @example import { cwx, CPage } from '../../cwx.js';
 var __global = require('../../ext/global.js');

 // cwx/component/cwebview/cwebview.js
 var CWebviewBase = require( 'CWebviewBaseClass.js');
 class CWebview extends CWebviewBase {
}
 new CWebview().register();
 */
class CWebviewBase {
  constructor() {
    var proto = this.__proto__;
    while ((proto = proto.__proto__)) {
      Object.assign(this, proto);
    }
    this.constructor = this.__proto__.constructor;
  }

  register() {
    const clone = Object.assign({}, this);
    delete clone.constructor;
    CPage(clone);
  }
}

/*
 * public property
 */
Object.assign(CWebviewBase.prototype, {
  /**
   * 分享数据
   */
  shareData: {
    bu: "",
    title: "",
    path: "",
    imageUrl: "",
    desc: "",
    customer: null,
  },
  type: "basecwebview",
  jumpData: null,
  pageId: "ignore_page_pv",
  doRefreshWhileBack: false,
  loadedUrl: "",
  doShowFirstTime: true,
  /*
   * 页面的初始数据
   */
  data: {
    shareType: "all",
    floatTitle: "请选择分享方式",
    showShareFloat: false,
    canWebView: cwx.canIUse("web-view"),
    pageName: "cwebview",
    url: "",
    wsg: "",
    envIsMini: true, //true 小程序 ，false为h5跳转
    isNavigate: true, //跳转方式
    loginErrorUrl: "", //登录失败自定义显示地址  默认：url值
    needWriteCrossTicket: true, // 是否需要经过writecrossticket页面
  },
  observerKey: "",
  preOnError: null,
  showUrlError: function () {
    // 无法打开目标地址
    if (this.preOnError && typeof this.preOnError === 'function') {
      this.preOnError('urlError');
      return;
    }

    let wsg = "目标地址出了点问题，请重新打开该页面";
    if (this.jumpData && typeof this.jumpData.wsg !== "undefined") {
      wsg = this.jumpData.wsg;
    }
    this.setData({
      url: "",
      wsg: wsg,
    });
  },

  /*
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _onLoadBeginTimeStamp = Date.now();
    console.log("处理前 onLoad 的入参 options: ", options);
    if (this.preOnLoad) {
      options = this.preOnLoad(options) || options;
    }
    if (typeof this.webOnError === 'function') {
      this.preOnError = this.webOnError
    }
    console.log("处理后 onLoad 的入参 options: ", options);
    if (this.feature === "middlePage") {
      // 确保只有 作为中间页的webview页面不会执行后续的逻辑
      return;
    }

    cwx.sendUbtByPage.ubtMetric({
      name: 192714, //申请生成的Metric KEY
      tag: { type: this.type }, //自定义Tag
      value: 1, //number 值只能是数字
    });
    cwx.sendUbtByPage.ubtMetric({
      name: 188785, //申请生成的Metric KEY
      tag: { options: JSON.stringify(options) }, //自定义Tag
      value: 1, //number 值只能是数字
    });
    let data = options.data || options;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        try {
          //添加一层解析
          data = JSON.parse(cwx.util.decodeURIComponentSafely(data));
        } catch (e) {
          this.showUrlError();
          return;
        }
      }
    }
    this.jumpData = data || options || {}; // todo??? 为什么存在 this.jumpData.url 是 undefined 的情况？
    // 返回此cwebview 页时（即触发onShow时），h5是否强制刷新
    if (data && typeof data.doRefreshWhileBack !== "undefined") {
      this.doRefreshWhileBack = data.doRefreshWhileBack;
    }
    if (data.shareType || options.shareType) {
        this.setData({
            shareType: data.shareType || options.shareType
        })
    }
    if (data.floatTitle || options.floatTitle) {
        this.setData({
            floatTitle: data.floatTitle || options.floatTitle
        })
    }

    let url = data.url || options.url || this.data.url || "";
    this.observerKey = data.observerKey || options.observerKey || "";
    this.timelineData = data.timeline || options.timeline || {};
    if (url.length <= 0) {
      this.showUrlError();
      return;
    }
    this.jumpData.url = url;
    url = cwx.util.decodeURIComponentSafely(url);
    console.log("this.jumpData: ", this.jumpData);
    console.log("data: ", data);
    console.log("url: ", url);

    // 判断是否在白名单内，并发送metric埋点记录不在白名单之内的域名
    this.isWhiteDomain(url || "", 179576);

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
    this.isLogin = isLogin;

    const self = this;
    console.log(
      "====== needWriteCrossTicket: ",
      self.data.needWriteCrossTicket
    );
    if (data.needSocket) {
      const socketClient = cwx.createMiniSocket({
        socketObserverKey: data.socketObserverKey,
        url,
        source: data.needSocket,  
        onGetKey: (socketUrl) => {
          console.log("onGetKey", socketUrl)
          url = socketUrl;
          syncLogin();
        },
        onMessage: (msg) => {
          //todo?做公共的业务，比如显示分享广告等
          console.log("onMessage:", msg);
          if (typeof self.onSocketMessage === "function") {
            self.onSocketMessage(msg, socketClient);
          }
          let msgObj = {};
          try {
            msgObj = typeof msg === "string" ? JSON.parse(msg) : msg;
          } catch (error) {
            msgObj = {}
          }
          console.log(">>>>>> msgObj:", msgObj)
          if (msgObj && msgObj.action === "share") {
            // 显示 shareFloat
            console.log(">>>>>> 显示 share float, msgObj.info:", msgObj.info)
            if (msgObj.info) {
              this.shareData = msgObj.info.friend || this.shareData;
              this.timelineData = msgObj.info.timeline || this.timelineData;
            }
            self.setData({
              showShareFloat: true
            })
          }
        },
        onOpen: function (opt) {
          console.log("onOpen:", opt);
          if (typeof self.onSocketOpen === "function") {
            self.onSocketOpen(opt, socketClient);
          }
        },
        onClose: function (opt) {
          console.log("onClose:", opt);
          if (typeof self.onSocketClose === "function") {
            self.onSocketClose(opt, socketClient);
          }
        },
        onError: function (e) {
          console.error("onError:", e);
          if (typeof self.onSocketError === "function") {
            self.onSocketError(e, socketClient);
          }
          //报错也不要影响页面打开
          syncLogin();
        }
      });
      this.socketClient = socketClient
    } else {
      syncLogin();
    }

    function syncLogin() {
      console.log("syncLogin:", url)
      cwx.syncLogin.load({
        url,
        isLogin,
        loginErrorUrl: self.data.loginErrorUrl,
        needWriteCrossTicket: self.data.needWriteCrossTicket,
        _onLoadBeginTimeStamp,
        success: function (sucUrl) {
          self.webLoadUrl(sucUrl, true);
        },
        fail: function (errorUrl) {
          if (self.preOnError && typeof self.preOnError === 'function') {
            self.preOnError('loginError');
            return;
          }
          if (self.data.isNavigate) {
            cwx.navigateBack();
          } else {
            let wsg = self.data.wsg;
            if (data && typeof data.wsg !== "undefined") {
              wsg = data.wsg;
            }
            self.setData({
              wsg: wsg,
              url: errorUrl,
            });
          }
        },
      });
    }
  },
  prePageCallback: function (msg) {
    // console.log("prePageCallback, msg: ");
    // console.log(msg);
    this.addParamsToHash(msg);
    // console.log(msg.options)
    // if(msg && msg.options && msg.privateKey) {
    //     //此时需要将ocr的数据放到hash传递到h5页面
    //     this.addParamsToHash(msg.options, msg.privateKey);
    // }
  },
  addParamsToHash: function (res) {
    // console.log("addParamsToHash ++++++++++");
    // console.log(res);
    let currentUrl = this.loadedUrl;
    const paramsStr = `_cwebmsg=${res}`;
    cwx.sendUbtByPage.ubtMetric({
      name: 190670, //申请生成的Metric KEY
      tag: { paramsStr: paramsStr }, //自定义Tag
      value: 1, //number 值只能是数字
    });

    if (currentUrl) {
      if (currentUrl.indexOf("_cwebmsg=") !== -1) {
        currentUrl = currentUrl.replace(/_cwebmsg=[^&|^?]+/, "");
        if (currentUrl.slice(-1) === "#") {
          //如果#号后面为空，则删除＃
          currentUrl = currentUrl.slice(0, -1);
        }
      }
      if (currentUrl.indexOf("#") === -1) {
        currentUrl += `#${paramsStr}`;
      } else {
        let hash = currentUrl.split("#")[1];
        currentUrl += cwx.util.getDeltaFromUrl(hash) + paramsStr;
      }
      console.log(currentUrl);
      this.setData({
        url: currentUrl,
      });
    }
  },
  
  handleHideShare: function (e) {
    console.log(">>>>>> handleHideShare", );
    this.setData({
      showShareFloat: false
    })
  },
  handleShareTimeline: function () {
    console.log("handleShareTimeline")
    let {options, jumpType} = this.timelineData || {};
    const whitelist = ["switchTab", "reLaunch", "redirectTo", "navigateTo", "navigateBack"] // 限制跳转 API 类型
    try {
      if (options) {
        if (whitelist.indexOf(jumpType) > -1) {
          cwx[jumpType || "navigateTo"](options);
        } else {
          throw new Error("jumpType is not in the whitelist")
        }
      } else {
        throw new Error("share timeline options cannot be empty")
      }
    } catch (error) {
      this.socketClient.send({
        message: error.message || 'share timeline error'
      }).then(function (res) {
        console.log("handleShareTimeline error, socket res:", res);
      })
    }
  },
  
  isWhiteDomain: function (url, ubtKeyId) {
    if (__global.env.toLowerCase() !== "prd" || !url) {
      console.log(
        `当前小程序环境为${__global.env.toLowerCase()}, 非生产环境，不判断域名`
      );
      return;
    }

    console.log(`执行 isWhiteDomain, ubtKeyId: ${ubtKeyId}, url: `, url);
    try {
      cwx.configService.watch("WeixinWebviewDomain", (res) => {
        // console.log('请求返回的webview白名单列表为：', res);
        try {
          if (!res || !res.domainList) {
            cwx.sendUbtByPage.ubtMetric({
              name: 183563, //申请生成的Metric KEY
              tag: {
                whitedomain: res && res.domainList ? "[]" : JSON.stringify(res),
              }, //自定义Tag
              value: 1, //number 值只能是数字
            });
            return false;
          }
          const allWebviewDomains = res.domainList;
          const domainsReg = /^(https?:)?\/\/[^/]+/;
          const match = url.match(domainsReg);
          const domain = match && match.length > 0 ? match[0] : "";

          if (domain && !allWebviewDomains.includes(domain)) {
            console.log('%c url域名不在后台配置的webview白名单列表中','color:#0f0;')
            console.log(url)
            // 如果url包含域名 且 域名不在上述webview白名单列表中，则发送埋点上报
            try {
              // console.error('埋点记录url及域名: ', domain, ' ubtKeyId: ', ubtKeyId);
              cwx.sendUbtByPage.ubtMetric({
                name: ubtKeyId, //申请生成的Metric KEY
                tag: { domain: domain, url: url }, //自定义Tag
                value: 1, //number 值只能是数字
              });
            } catch (e) {
              return false;
            }
            return true;
          }
        } catch (e) {
          return false;
        }
      });
    } catch (e) {
      return false;
    }
    return false;
  },
  sendWebViewPv: function (data) {
    try {
      let pageId = (data && data.pageId) || this.data.pageId;
      if (!pageId && this.pageId !== "ignore_page_pv") {
        return;
      }
      pageId = pageId || "10650051973";
      this.pageId = "ignore_page_pv";
      cwx.sendUbtByPage.ubtSendPV({
        pageId,
      });
    } catch (e) {}
  },
  sendLoadUrl: function (url) {
    try {
      cwx.sendUbtByPage.ubtTrace("wxapp_cwebview_loadUrl", url);
    } catch (e) {}
  },
  recordUrlOver3000: function (url) {
    try {
      if (url && url.length > 3000) {
        cwx.sendUbtByPage.ubtTrace("wxapp_cwebview_loadUrl_over3000", url);
      }
    } catch (e) {}
  },
  /*
   * 加载页面
   */
  webLoadUrl: function (url, isNotReWrite) {
    this.sendLoadUrl(url);

    let loadUrl = isNotReWrite ? url : this.urlRewrite(url);
    this.recordUrlOver3000(loadUrl);

    cwx.sendUbtByPage.ubtMetric({
      name: 188783, //申请生成的Metric KEY
      tag: {
        currentUrl: this.data.url,
        loadUrl: loadUrl,
      }, //自定义Tag
      value: 1, //number 值只能是数字
    });
    this.loadedUrl = loadUrl;
    this.setData({
      url: loadUrl,
    });

    console.log('%c webview load url is', 'color:#0f0;');
    console.log(this.data.url);
  },

  /*
   * 将要获取token
   */
  webGetToken: function (url) {
    var auth = cwx.user.auth;
    if (auth.length > 0) {
      this.webGetTokenByAuth(url, auth);
    } else if (this.data.noForceLogin) {
      //如果只设置了同步登录态不强制登录的话，则直接跳转url
      url = this.getLoginTokenUrl("", url); //没有登录每次去除登录态
      this.webLoadUrl(url, true);
    } else {
      this.webToLogin(url);
    }
  },

  /*
   * 跳登录获取toekn
   */
  webToLogin: function (url) {
    const self = this;
    cwx.syncLogin.webToLogin({
      url,
      loginErrorUrl: this.data.loginErrorUrl,
      success: function (sucUrl) {
        self.webLoadUrl(sucUrl, true);
      },
      fail: function (failUrl) {
        // 登录失败
        if (self.preOnError && typeof self.preOnError === 'function') {
          self.preOnError('loginError');
          return;
        }

        cwx.showToast({ title: "登录失败", icon: "none" });
        self.loginedErrorHandler(failUrl, true);
      },
    });
  },

  /*
   * auth 获取token (token 有效时间2分钟)
   */
  webGetTokenByAuth: function (url) {
    const self = this;
    self.showLoading("");
    cwx.syncLogin.webGetTokenByAuth({
      url,
      loginErrorUrl: this.data.loginErrorUrl,
      success: function (sucUrl) {
        self.hideLoading();
        self.webLoadUrl(sucUrl, true);
      },
      fail: function (failUrl) {
        // 登录失败
        if (self.preOnError && typeof self.preOnError === 'function') {
          self.preOnError('loginError');
          return;
        }

        self.hideLoading();

        cwx.showToast({ title: "登录失败", icon: "none" });
        self.loginedErrorHandler(failUrl, true);
      },
    });
  },

  /**
   * 获取token也页地址
   */
  getLoginTokenUrl: function (token, url) {
    return cwx.syncLogin.getLoginTokenUrl(token, url);
  },

  /**
   * 授权失败操作
   */
  loginedErrorHandler: function (errorUrl, isNotReWrite) {
    const loginErrorUrl = errorUrl || this.data.loginErrorUrl;
    if (this.data.isNavigate) {
      // if (this.data.envIsMini) {
      // } else { //h5跳转
      // }
      cwx.navigateBack();
    } else if (!this.data.isNavigate) {
      this.webLoadUrl(loginErrorUrl, isNotReWrite); //redirect方式 登录失败 加载loginErrorUrl
    }
  },

  /**
   * web回调数据
   */
  webPostMessage: function (e) {
    console.log("webPostMessage data:");
    console.log(e);
    let postArr = e.detail.data;
    let postCount = postArr.length;

    cwx.sendUbtByPage.ubtMetric({
      name: 192249, //申请生成的Metric KEY
      tag: {
        data: postCount ? JSON.stringify(postArr[postCount - 1]) : "",
      }, //自定义Tag
      value: 1, //number 值只能是数字
    });
    // let hashMessageKey;
    for (let i = 0; i < postCount; i++) {
      let sData = postArr[i];
      if (sData && sData.type && sData.type.toLowerCase() === "onshare") {
        this.shareData = sData.shareData;
      }
      // if (sData && sData.type && sData.type.toLowerCase() === 'hashMessage') {
      //     hashMessageKey = sData.hashMessageKey;
      // }
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
          type: "message",
          options: e,
        });
      }
    } catch (e) {}
    console.log(">>> this.shareData");
    console.log(this.shareData);
  },

  hideLoading: function () {
    try {
      cwx.hideToast();
      cwx.hideLoading();
    } catch (err) {}
  },
  showLoading: function (title) {
    title = title || "";
    try {
      cwx.showLoading({
        title: title,
        mask: true,
      });
    } catch (err) {
      cwx.showToast({
        title: title,
        icon: "loading",
        duration: 10000,
        mask: true,
      });
    }
  },
  /**
   * 添加安全保护，5s种强制关闭loading
   */
  makeSureDone() {
    console.log("makeSureDone 执行安全保护，开始定时");
    const _this = this;
    let loadingDuration = this.data.loadingDuration || 3000;
    this.makeSureDoneTime = setTimeout(function () {
      console.log(
        "makeSureDone 里的 定时函数被调用，_this.pageDone: ",
        _this.pageDone
      );
      if (!_this.pageDone) {
        // 【百度小程序】的 web-view 网页容器没有bindload事件，即网页加载成功的事件，所以要用makeSureDone来调用onPageLoadDone，用于隐藏loading
        _this.onPageLoadDone.apply(_this);
      }
    }, loadingDuration);
  },
  onPageLoadDone(options) {
    console.log("执行 onPageLoadDone, options: ", options || {});

    let loadDoneData = (options && options.detail && options.detail.src) || "";
    if (options && options.type === "error") {
      // 网页加载失败。记录 binderror 的入参 options.detail.src
      cwx.sendUbtByPage.ubtDevTrace("weapp_cwebview_loaddone_error", {
        src: loadDoneData
      });

      // 网页加载失败
      if (this.preOnError && typeof this.preOnError === 'function') {
        this.preOnError('h5LoadError');
        return;
      }
    } else if(loadDoneData.length && loadDoneData.length > 3000) {
      // 记录长度超过 3000 的 url
      cwx.sendUbtByPage.ubtDevTrace("weapp_cwebview_loaddone_over_3000", {
        src: loadDoneData
      });
    } else {
      cwx.sendUbtByPage.ubtDevTrace("weapp_cwebview_loaddone_success", {
        src: loadDoneData
      });
    }

    if (loadDoneData && typeof loadDoneData === "string") {
      this.loadedUrl = loadDoneData;
    }

    // 判断是否在白名单内，并发送metric埋点记录不在白名单之内的域名
    this.isWhiteDomain(loadDoneData || "", 179577);

    // 【微信小程序】可能会频繁触发bindload事件，只有正在加载的 url 与 onLoad()入参的 url 或 loginErrorUrl 相等时，才执行后续的操作，即隐藏loading
    // 注意编码、解码，domain+path
    console.log(options);
    let optionsSrcPath = this.getUrlDomainPath(loadDoneData);
    let jumpDataUrlPath = this.getUrlDomainPath(
      (this.jumpData && this.jumpData.url) || ""
    );
    let jumpDataErrorUrlPath = this.getUrlDomainPath(
      (this.jumpData && this.jumpData.loginErrorUrl) || ""
    );
    console.log("optionsSrcPath: ", optionsSrcPath);
    console.log("jumpDataUrlPath: ", jumpDataUrlPath);
    console.log("jumpDataErrorUrlPath: ", jumpDataErrorUrlPath);
    // 兼容 bindload 触发的函数 options 为 undefined 的情况，目前已知的是 微信网页授权url
    if (
      !options &&
      this.jumpData &&
      this.jumpData.url &&
      this.jumpData.url.includes("open.weixin.qq.com/connect/oauth2/authorize")
    ) {
      this.pageDone = true;
      console.log(
        "bindload 触发的函数 options 为 undefined, pageDone已置为true"
      );
    }

    if (
      optionsSrcPath !== jumpDataUrlPath &&
      optionsSrcPath !== jumpDataErrorUrlPath
    ) {
      return;
    }

    try {
      this.pageDone = true;
      console.log("pageDone已置为true");
      if (this.makeSureDoneTime) {
        console.log("已清除makeSureDoneTime");
        clearTimeout(this.makeSureDoneTime);
      }
    } catch (e) {}
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    try {
      if (this.observerKey) {
        cwx.Observer.noti(this.observerKey, {
          type: (options && options.type) || "load",
          options,
        });
      }
    } catch (e) {}

    // 获取 url 上的参数 miniTitle, 设置自定义标题
    let matchArr = loadDoneData.match(/[?|&]miniTitle=([^&]+)/);
    if (matchArr && matchArr.length) {
      let title = cwx.util.decodeURIComponentSafely(matchArr[1])
      cwx.setNavigationBarTitle({
        title,
        success: function (opt) {
          console.log(opt)
        },
        fail: function (e) {
          console.error(e)
        }
      })
    }

    if (this.postOnPageLoadDone && typeof this.postOnPageLoadDone === 'function') {
      this.postOnPageLoadDone(options);
    }
  },

  getUrlDomainPath(url) {
    let decodedUrl = '';
    try {
      decodedUrl = cwx.util.decodeURIComponentSafely(url);
    } catch (error) {
      decodedUrl = url;
    }
    let urlArr = decodedUrl ? decodedUrl.split("?") : [];
    let domainPath = urlArr.length > 0 ? urlArr[0] : "";
    return domainPath;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this) {
      return;
    }

    if (this.doRefreshWhileBack && this.loadedUrl && !this.doShowFirstTime) {
      cwx.sendUbtByPage.ubtMetric({
        name: 188780, //申请生成的Metric KEY
        tag: {
          currentUrl: this.data.url,
          loadedUrl: this.loadedUrl,
        }, //自定义Tag
        value: 1, //number 值只能是数字
      });
      this.setData({ url: this.loadedUrl });
    }
    this.doShowFirstTime = false;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log(">>>>>>>>>>>> cwebview onHide");
    if (!this) {
      return;
    }
    if (this.doRefreshWhileBack && this.loadedUrl) {
      cwx.sendUbtByPage.ubtMetric({
        name: 188782, //申请生成的Metric KEY
        tag: {
          currentUrl: this.data.url,
          loadedUrl: this.loadedUrl,
        }, //自定义Tag
        value: 1, //number 值只能是数字
      });
      // 不能直接在onShow中通过给url加时间戳来刷新页面，会给window.history添加页面会话历史，使得用户点击手机自带返回按钮时，不能立刻返回到上一个原生页面，而是返回到了刷新前的h5页面
      this.setData({ url: "" });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (!this) {
      return;
    }
    if (this.socketClient && this.socketClient.close) {
      this.socketClient.close();
    }
    // 20230517, 出现报错，做个兼容。错误信息：TypeError: this.invokeCallback is not a function. (In 'this.invokeCallback({ReturnCode:"-1",Message:"返回操作"})', 'this.invokeCallback' is undefined)
    if (typeof this.invokeCallback === "function") {
      this.invokeCallback({ ReturnCode: "-1", Message: "返回操作" });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 合并处理shareData
   */
  _handlerShare(data, options) {
    let hideShareMenu = data.hideShareMenu || options.hideShareMenu;
    if (!!hideShareMenu) {
      wx.hideShareMenu();
    }
    if (data.shareData) {
      this.shareData = Object.assign(this.shareData, data.shareData);
    }
  },
  /**
   * 处理初始化时的loading业务
   * @param data
   */
  _handlerLoading(data) {
    if (!!data.pageTitle) {
      const { title, color, loading } = data.pageTitle;
      if (title) {
        cwx.setNavigationBarTitle({ title });
      }
      if (loading) {
        cwx.showNavigationBarLoading({});
      }
      if (color) {
        cwx.setNavigationBarColor(color || {});
      }
    }
    if (data.loadingTitle) {
      this.showLoading(data.loadingTitle);
    }
    this.makeSureDone();
  },
  /**
   * 将传入的参数同步到this.data上
   * 地址就暂时不变，因为需要包裹同步登陆态的逻辑
   * @param data
   */
  _syncDataFromOptions(data, url) {
    try {
      //
      let t = {};
      for (let p in data) {
        if (data[p]) {
          t[p] = data[p];
        }
      }
      delete t.url; //如果需要校验登录态，则不先去跳转页面x
      delete t.wsg; //如果需要校验登录态，则不先去跳转页面x
      this.setData(t);
    } catch (e) {
      //
      console.log("onload assign", e);
    }
    let isNavigate = true; //默认true
    if (typeof data.isNavigate !== "undefined") {
      isNavigate = data.isNavigate;
    }
    let needWriteCrossTicket = true;
    if (typeof data.needWriteCrossTicket !== "undefined") {
      needWriteCrossTicket = data.needWriteCrossTicket;
    }
    let envIsMini = data.envIsMini || false;
    let loginErrorUrl = cwx.util.decodeURIComponentSafely(data.loginErrorUrl || url);
    this.setData({
      envIsMini,
      isNavigate,
      loginErrorUrl,
      needWriteCrossTicket,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let curPage = cwx.getCurrentPage();
    let curRoute = (curPage && curPage.route) || "";
    console.log("============= onShareAppMessage curPage.route:", curRoute);
    if (!this.shareData) {
      this.shareData = {};
    }
    const defaultSharePagePath = "/cwx/component/cwebview/cwebview";
    //如果页面没有打开即分享，则分享当前页面的进入参数
    if (!this.pageDone) {
      const shareData = this.shareData;
      shareData.path =
        defaultSharePagePath + "?data=" + JSON.stringify(this.jumpData || {});
      return shareData;
    }
    if (!this.shareData.title) {
      this.shareData.title = "携程订酒店机票火车票汽车票门票";
    }
    if (!this.shareData.path) {
      this.shareData.path = "pages/home/homepage";
    }
    console.log(
      "！！！是否进入替换里:",
      this.jumpData,
      this.jumpData.isShareWebUrl,
      !this.shareData.noWebUrl
    );
    if (
      this.jumpData &&
      this.jumpData.isShareWebUrl &&
      !this.shareData.noWebUrl
    ) {
      let { webViewUrl } = options;
      //此处可以将webviewUrl中的营销参数去除,先去掉_cwxObj
      webViewUrl = webViewUrl.replace(/&?_cwxobj=[^&]+/, "");
      // 此处应将 webviewUrl 中的 socketKey 移除
      webViewUrl = webViewUrl.replace(/&?minisocketkey=[^&]+/, "");
      const shareData = Object.assign({}, this.jumpData, {
        url: encodeURIComponent(webViewUrl),
      });
      let sharePagePath = curRoute.match(/cwx\/component\/(cwebview|extraCweb)/)
        ? defaultSharePagePath
        : curRoute;
      console.log('%c 经过判断当前页面路径后，sharePagePath 的结果：','color:#0f0;')
      console.log(sharePagePath)
      // 如果不是cwebview路径，则说明是BU自定义的webview，分享也取BU自定义的webview页面
      this.shareData.path =
        sharePagePath + "?data=" + JSON.stringify(shareData);
    }
    delete this.shareData.noWebUrl;

    console.log('%c onShareAppMessage 最终 return 的数据','color:#0f0;')
    console.log(this.shareData)
    if (options.title || options.path || options.imageUrl || options.promise) {
      return options;
    }
    return this.shareData;
  },
  /**
   * urlrewrite
   */
  urlRewrite: function (h5url) {
    return cwx.syncLogin.urlRewrite(h5url);
  },
  getEnv: function () {
    return cwx.syncLogin.getEnv();
  },
});
cwx.defaultEnvObject = {
  cid: cwx.clientID,
  appid: __global.appId,
};
cwx.setEnvObject = function (o) {
  Object.assign(cwx.defaultEnvObject, o);
};

export default CWebviewBase;
