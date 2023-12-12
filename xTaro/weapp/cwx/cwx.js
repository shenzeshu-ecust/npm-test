let __global = require("./ext/global.js").default;
let _ = (__global._ = require("../3rd/lodash.core.min.js"));
let store = require("./ext/cwx.storage.js").default;
let cwxSystemInfo = require('./ext/cwx.systemInfo.js').default;
const EXPOSE_TEXT = "请更新小程序壳cwx, 以便使用新增的曝光埋点功能";
const PERFORMANCE_TEXT = "请更新小程序壳cwx, 以便使用新增的性能采集功能";
const hintMap = {
  sendUbtExpose: EXPOSE_TEXT,
  sendUbtGather: PERFORMANCE_TEXT
};

let cwx = (__global.cwx = (function () {
  let globalData = {
    bus: {},
    pay: {},
    train: {},
    flight: {},
    home: {},
    hotel: {},
    ticket: {},
    schedule: {},
  };

  let cwx = Object.create(wx, {
    // ------ 1. 常用公共业务模块 ------
    // 1.1 支付
    payment: {
      get: function () {
        return require("../pages/thirdPlugin/pay/common/cpay.js");
      },
      enumerable: true,
    },
    // 1.2 用户登录注册
    user: {
      get: function () {
        return require("../pages/thirdPlugin/user/user.js");
      },
      enumerable: true,
    },
    // 1.3 常用旅客
    //removePlugin===passenger===begin
    passenger: {
      get: function () {
        return require("../pages/thirdPlugin/user/passenger.js");
      },
      enumerable: true,
    },
    //removePlugin===passenger===end
    // 1.4.1 市场营销业绩
    mkt: {
      get: function () {
        return require("../pages/thirdPlugin/market/market.js");
      },
      enumerable: true,
    },
    // 1.4.2 市场营销相关id，如：openid
    cwx_mkt: {
      get: function () {
        return require("./ext/cwx.market.js").default;
      },
      enumerable: true,
    },

    //delete===begin
    // 1.5.1 onPageNotFound: 酒店处理Mvc
    cwx_htl: {
      get: function () {
        return require("./ext/cwx.hotel.js").default;
      },
      enumerable: true,
    },
    // 1.5.2 onPageNotFound: 机票
    cwx_flt: {
      get: function () {
        return require("./ext/cwx.flight.js").default;
      },
      enumerable: true,
    },
    //delete===end
    // 1.6 表情转换
    getCEmojiMapData: {
      get: function () {
        return require("./ext/cemojiUtil.js").getCEmojiMapData;
      },
      enumerable: true,
    },
    convertCEmojiInput: {
      get: function () {
        return require("./ext/cemojiUtil.js").convertCEmojiInput;
      },
      enumerable: true,
    },

    // ------ 2. 基础模块 ------
    // 2.1 小工具文件
    util: {
      value: require("./ext/util.js").default,
      enumerable: true,
    },
    // 2.1.2 判断是否处于朋友圈单页模式
    checkInTimeline: {
      get: function () {
        return require("./ext/app/cwx.timeline.js").checkInTimeline;
      },
      enumerable: true,
    },

    // 2.2.1 md5加解密
    md5: {
      get: function () {
        return require("./ext/cwx.md5.js").default;
      },
      enumerable: true,
    },
    // 2.2.2 AES加解密
    aes: {
      get: function () {
        return require("./ext/cwx.aes.js").default;
      },
      enumerable: true,
    },
    // 2.3 基础文件
    config: {
      get: function () {
        return require("./cpage/config.js").default;
      },
      enumerable: true,
    },
    // 2.4.1 反爬虫（from 酒店）
    createAntiSpiderRequest: {
      get: function () {
        return require("./ext/cwx.createAntiSpiderRequest.js").default;
      },
      enumerable: true,
    },
    // 2.4.2 反爬虫V2（from 酒店）
    createAntiSpiderRequestV2: {
        get: function () {
            return require("./ext/cwx.createAntiSpiderRequestV2.js").default;
        },
        enumerable: true,
    },
    // 2.5.1 cwx.request: 封装了 wx.request
    request: {
      get: function () {
        return require("./ext/cwx.request.js").default.request;
      },
      enumerable: true,
    },
    // 2.5.2 这是给谁用的？
    _request: {
      get: function () {
        return require("./ext/cwx.request.js").default._request;
      },
      enumerable: true,
    },
    // 2.5.3 取消队列中的请求
    cancel: {
      get: function () {
        return require("./ext/cwx.request.js").default.cancel;
      },
      enumerable: true,
    },
    // 2.6.1 获取定位信息
    locate: {
      get: function () {
        return require("./ext/cwx.locate.js").default;
      },
      enumerable: true,
    },
    // 2.6.2 重写定位方法
    getLocation: {
      get: function () {
        return require("./ext/cwx.getLocation.js").default;
      },
      enumerable: true,
    },
    // 2.6.3 占位预备，暂时不可用
    cancelGetLocationWithUUID: {
      get: function () {
        return require("./ext/cwx.getLocation.js").cancelGetLocationWithUUID;
      },
      enumerable: true,
    },
    createMiniSocket: {
      get: function () {
        return require("./ext/cwx.createMiniSocket").default;
      },
      enumerable: true,
    },
    // 2.7 跳转到各个公共页面级别组件
    component: {
      get: function () {
        return require("./component/component.js");
      },
      enumerable: true,
    },
    // 2.8.1 从其他小程序或APP跳转过来时，同步登录态
    dynamicLogin: {
      get: function () {
        return require("./ext/cwx.dynamicLogin.js").default;
      },
      enumerable: true,
    },
    // 2.8.2 小程序内嵌h5同步登录态
    syncLogin: {
      get: function () {
        return require("./ext/cwx.syncLogin.js").default;
      },
      enumerable: true,
    },
    // 2.9 获取 已登录 用户在携程用户体系下的头像+昵称
    requireUserPic: {
      get: function () {
        return require("./ext/cwx.requireUserPic.js").default;
      },
      enumerable: true,
    },
    // 2.10 ABTesting
    ABTestingManager: {
      get: function () {
        return require("./ext/cwx.abtesting.js").default;
      },
      enumerable: true,
    },
    // 2.11 全局事件监听
    Observer: {
      get: function () {
        return require("./ext/cwx.observer.js").default;
      },
      enumerable: true,
    },
    // 2.12 缓存相关API
    forceCleanStore: {
      get: function () {
        return store.forceCleanStore.bind(store);
      },
      enumerable: true,
    },
    setStorageSync: {
      get: function () {
        return store.set.bind(store);
      },
      enumerable: true,
    },
    removeStorageSync: {
      get: function () {
        return store.remove.bind(store);
      },
      enumerable: true,
    },
    getStorageSync: {
      get: function () {
        return store.get.bind(store);
      },
      enumerable: true,
    },
    setStorage: {
      get: function () {
        return function (o) {
          store.set(o.key, o.data);
          o.success && o.success();
          o.complete && o.complete();
        }.bind(store);
      },
      enumerable: true,
    },
    removeStorage: {
      get: function () {
        return function (o) {
          store.remove(o.key);
          o.success && o.success();
          o.complete && o.complete();
        }.bind(store);
      },
      enumerable: true,
    },
    getStorage: {
      get: function () {
        return function (o) {
          let v = store.get(o.key);
          o.success && o.success({ key: o.key, data: v });
          o.complete && o.complete({ key: o.key, data: v });
        }.bind(store);
      },
      enumerable: true,
    },
    getStorageInfoSync: {
      get: function () {
        return store.getStorageInfoSync.bind(store);
      }
    },
    switchTab: {
      get: function() {
        return require("./ext/performance/cwx.route").default.switchTab
      },
      enumerable: true
    },
    reLaunch: {
      get: function() {
        return require("./ext/performance/cwx.route").default.reLaunch
      },
      enumerable: true
    },
    redirectTo: {
      get: function() {
        return require("./ext/performance/cwx.route").default.redirectTo
      },
      enumerable: true
    },
    navigateTo: {
      get: function() {
        return require("./ext/performance/cwx.route").default.navigateTo
      },
      enumerable: true
    },
    navigateBack: {
      get: function() {
        return require("./ext/performance/cwx.route").default.navigateBack
      },
      enumerable: true
    },
    // 2.13 动态设置当前页面的标题
    setNavigationBarTitle: {
      get: function () {
        return function ({ title }) {
          wx.setNavigationBarTitle({
            title: title || "",
            success: () => {
              try {
                let curPage =
                  cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
                try {
                  curPage.setData({
                    "navbarData.title": title || "",
                  });
                } catch (e) {
                  console.error(e);
                }
              } catch (e) {
                console.error(e);
              }
            },
          });
        };
      },
      enumerable: true,
    },
    // 2.14 同步获取设备
    getSystemInfoSync: {
      get: function() {
        return cwxSystemInfo.getSystemInfoSync;
      }
    },
    // 2.15 判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: {
      get: function () {
        return function (name) {
          if (typeof cwx[name] !== "undefined" || wx.canIUse(name)) {
            return true;
          }
          if (typeof hintMap[name] !== "undefined") {
            console.log(`%c ${hintMap[name]}`, 'color:#0f0;');
          }
          return false;
        };
      },
      enumerable: true,
    },
    // 2.16 loading
    hideLoading: {
      get: function () {
        return require("./ext/cwx.loading.js").hideLoading;
      },
      enumerable: true,
    },

    // ------ 3. UBT相关模块 ------
    // 3.1 通过调用页面实例上的埋点API 来发送埋点
    sendUbtByPage: {
      get: function () {
        return require("./ext/cwx.sendUbtByPage.js").default;
      },
      enumerable: true,
    },
    // 3.2 曝光埋点
    sendUbtExpose: {
      get: function () {
        return require("./ext/cwx.sendUbtExpose.js").default;
      },
      enumerable: true,
    },
    // 3.3 自动上报用户操作事件
    eventWrapper: {
      get: function () {
        return require("./ext/cwx.eventWrapper.js").default;
      },
      enumerable: true,
    },
    uploadUserAction: {
      get: function () {
        return require("./ext/cwx.eventWrapper.js").uploadUserAction;
      },
      enumerable: true,
    },

    // ------ 4. 个人信息保护法 - 合规改造 ------
    // 4.1 设置：个性化推荐开关及消息推送开关
    setPRSetting: {
      get: function () {
        return require("./ext/cwx.personalizedRecommendation").default
          .setPRSetting;
      },
      enumerable: true,
    },
    // 4.2.1 获取：个性化推荐开关及消息推送开关
    getPRSetting: {
      get: function () {
        return require("./ext/cwx.personalizedRecommendation").default
          .getPRSetting;
      },
      enumerable: true,
    },
    // 4.2.2 获取：个性化推荐开关及消息推送开关（同步方法，如果没有服务端数据更新或者客户端缓存，则返回空对象）
    getPrSettingSync: {
      get: function () {
        return require("./ext/cwx.personalizedRecommendation").default
          .getPrSettingSync;
      },
      enumerable: true,
    },
    // 4.3 
    checkRediToGuide: {
      get: function () {
        return require("./ext/perInfoProtect/checkRediToGuide").checkRediToGuide;
      },
      enumerable: true,
    },
    getEnterQueryByGUID: {
      get: function () {
        return require("./ext/perInfoProtect/checkRediToGuide").getEnterQueryByGUID;
      },
      enumerable: true,
    },
    checkIsMasterMiniapp: {
      get: function () {
        return require("./ext/app/checkMiniapp").checkIsMasterMiniapp;
      },
      enumerable: true,
    },
    checkUsePerInfoProtectComponent: {
      get: function () {
        return require("./ext/app/checkMiniapp").checkUsePerInfoProtectComponent;
      },
      enumerable: true,
    },
    handleCustomizedReporting: {
      get: function () {
        return require("./ext/applyForAuth/privacyAuthorize").handleCustomizedReporting;
      },
      enumerable: true,
    },

    // ------ 5. 属性 ------
    miniType: {
      enumerable: true,
      value: 'weapp'
    },
    appId: {
      enumerable: true,
      value: __global.appId,
    },
    // 转发信息
    shareTicket: {
      enumerable: true,
      value: null,
      writable: true,
    },

    // ------ 6. cpage 相关 ------
    processShareData: {
      get: function() {
        return require("./ext/cpage/processShareData.js").default;
      },
      enumerable: true
    },
    processShareTimeline: {
      get: function() {
        return require("./ext/cpage/processShareTimeline.js").default;
      },
      enumerable: true
    },

    // ------ 7. 个保法合规改造 - 信安要求 - 用户授权
    createAuthorizationFn: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.createAuthorizationFn;
      },
      enumerable: true
    },
    chooseMedia: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.chooseMedia;
      },
      enumerable: true
    },
    chooseImage: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.chooseImage;
      },
      enumerable: true
    },
    chooseVideo: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.chooseVideo;
      },
      enumerable: true
    },
    chooseContact: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.chooseContact;
      },
      enumerable: true
    },
    saveFileToDisk: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.saveFileToDisk;
      },
      enumerable: true
    },
    scanCode: {
      get: function () {
        return require('./ext/applyForAuth/cwx.authorization').default.scanCode;
      },
      enumerable: true
    },
    // ------ 8. 页面信息：路由
   getCurrentPageRouter: {
     get: function () {
       return require("./ext/performance/cwx.getPageRoute").default.getCurrentPageRouter;
     },
     enumerable: true
   },
   sendPageRoute: {
    get: function () {
      return require("./ext/performance/cwx.getPageRoute").default.sendPageRoute;
    },
    enumerable: true
  },

  // ------ 9. 性能检测
  handleViewReadyEvent: {
    get: function () {
      return require("./ext/performance/checkWhiteScreen").handleViewReadyEvent;
    },
    enumerable: true
  },
  initWhiteScreen: {
    get: function () {
      return require("./ext/performance/checkWhiteScreen").initWhiteScreen;
    },
    enumerable: true
  },
  collectErrMsg: {
    get: function () {
      return require("./ext/app/cwx.cAppOnError").default;
    },
    enumerable: true
  },

    // todo, 只有 cwx 或 公共基础代码 在用的，从 cwx 上移除
    sendUbtGather: {
      get: function () {
        return require("./ext/cwx.sendUbtGather.js").default;
      },
      enumerable: true,
    },
  });

  // 获取当前页面实例
  cwx.getCurrentPage = function () {
    let pages, page;
    try {
      pages = getCurrentPages();
      page = pages && pages.length ? pages[pages.length - 1] : null;
    } catch (e) {
      page = getApp().getCurrentPage();
    }
    return page;
  };

  Object.keys(globalData).forEach(function (key) {
    cwx[key] = globalData[key];
  });

  // 获取系统信息
  cwx.wxSystemInfo = cwxSystemInfo.systemInfo;// wx.getSystemInfoSync();

  cwx.systemCode = __global.systemCode;
  cwx.mcdAppId = __global.mcdAppId;
  cwx.extMcdAppId = __global.extMcdAppId;
  cwx.accesscode = __global.accesscode;
  // 版本信息
  cwx.cverInfo = {
    version: __global.version, // 小程序官方格式的代码包版本号
    cversion: __global.cversion, // 转成携程格式的代码包版本号
    cwxVersion: __global.cwxVersion, // cwx 小程序基础框架版本号
    envVersion: __global.envVersion, // 运行环境类型：开发版(develop)、体验版(trial)、正式版(release)
  }

  return cwx;
})());

let CPage = (__global.CPage = require("./cpage/cpage.js").default);
export default cwx;
export { __global };
export { cwx };
export { _ };
export { CPage };

function equalVersion(curV, reqV) {
  let arr1 = curV.split(".");
  let arr2 = reqV.split(".");

  let maxL = Math.max(arr1.length, arr2.length);
  let pos = 0;
  let diff = 0;

  while (pos < maxL) {
    diff = parseInt(arr1[pos]) - parseInt(arr2[pos]);
    console.log(diff, parseInt(arr1[pos]), parseInt(arr2[pos]));
    if (diff != 0) {
      break;
    }
    pos++;
  }
  if (diff > 0 || diff == 0) {
    //新版本、稳定版
    return 1;
  } else {
    // 旧版本
    return 0;
  }
}


(function load() {
  try {
    let globalData;
    if (global) {
      globalData = global.globalData = global.globalData || {};
    } else {
      let app = getApp();
      globalData = app.globalData = app.globalData || {};
    }

    (function getStatusBarHeight() {
      let res = cwx.wxSystemInfo;
      let customTitleBarHeight;
      try {
        const menuInfo = wx.getMenuButtonBoundingClientRect();
        if (equalVersion(res.version, "7.0.3")) {
          customTitleBarHeight =
            menuInfo.height + (menuInfo.top - res.statusBarHeight) * 2;
        } else {
          customTitleBarHeight = menuInfo.height + menuInfo.top * 2;
        }
      } catch (e) {
        customTitleBarHeight = 48;
      }
      if (res.model.indexOf("iPhone") !== -1) {
        customTitleBarHeight = 44;
      }
      global.globalData.statusBarHeight = res.statusBarHeight;
      global.globalData.titleBarHeight = customTitleBarHeight;
    })();

    global.cwx = {
      __global,
      cwx,
      CPage,
      _,
    };
  } catch (e) {
    console.log("global is not exist");
  }
})();
