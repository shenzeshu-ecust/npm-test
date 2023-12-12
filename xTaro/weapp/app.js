require('./mini_build_version.js');
require('./taroBase/app.js');
require("./cwx/ext/applyForAuth/privacyAuthorize.js");
import { collectFnInfo } from "./collectFnInfo.js";
import { __global, cwx } from './cwx/cwx.js';
import cwxLoad from "./cwx/ext/cwx.load.js"
import setup from "./cwx/ext/cwx.setup.js"
import cAppOnLaunch from "./cwx/ext/app/cwx.cAppOnLaunch.js";
import cAppOnShow from "./cwx/ext/app/cwx.cAppOnShow.js";
import cAppOnHide from "./cwx/ext/app/cwx.cAppOnHide.js";
import openGroupInfo from "./cwx/ext/cwx.openGroupInfo.js";
import collectErrMsg from "./cwx/ext/app/cwx.cAppOnError.js";
import updatePackageManager from "./cwx/ext/app/cwx.updatePackageManager.js"
const baseConfig = require("./config")

App({
  onUnhandledRejection(options) {
    try {
      cwx.Observer.noti("appjs_onUnhandledRejection", options);
      if(options && options.reason && options.reason.stack) {
        collectErrMsg(options.reason.stack, "onUnhandledRejection");
      }
    } catch (error) {
      console.error(error)
    }
  },
  onError(msg) {
    try {
      cwx.Observer.noti("appjs_onError", msg)
      let errMsg = typeof msg === 'string' ? msg : (msg.message || JSON.stringify(msg));

      let matchArr = errMsg.match(/(setStorageSync:fail|setStorage:fail).*(quota reached|exceed storage max size)/g);
      if (matchArr && matchArr.length > 0) {
        console.error('本地缓存size超了');
        cwx.forceCleanStore();
      }
      
      collectErrMsg(msg, "onError");
    } catch(e) {
      console.error(e)
    }
  },
  onLaunch: function (options) {
    console.log('代码构建的时间, buildVersion:', wx.buildVersion);
    console.log('小程序启动时的参数, options:', options);
    // 0. 记录 onLaunch 触发情况
    cwx.sendUbtByPage.ubtTrace('wxapp_onLaunch_count', options);
    // 1. 获取、发送性能相关数据
    cAppOnLaunch.sendPerformance(options);
    // 2. raven 已移除
    // 3. 获取首页AB版本
    cAppOnLaunch.getHomeABTest();
    // 4. 给 cwx 绑定小程序间的跳转方法
    cwxLoad && cwxLoad();
    // 5. 将 options 的属性绑定到 cwx 上
    cAppOnLaunch.backupOptionsToCwx(options);
    // 6. 将 onLaunch 的 options 存到 cwx.observer 的内存变量中
    cwx.Observer.noti("appjs_onLaunch_getoptions", {
      ...options,
      cAppOnLaunchTS: Date.now()
    });
    // 7. 初始化 CPageClass, 注册摇一摇，获取CID，获取openid
    setup && setup()
    collectFnInfo();
    // 8. 跨小程序/App唤醒小程序时，执行同步登录态的操作
    cwx.dynamicLogin.publish(options);
    // 9. 记录场景值和openid（营销相关）
    cwx.mkt.setUnion({ isAppLaunch: true });
    // 10. 根据设备信息，计算自定义bar的高度
    if(cwx.wxSystemInfo) {
      this.globalData.statusBarHeight = cwx.wxSystemInfo.statusBarHeight;
      this.globalData.titleBarHeight = cAppOnLaunch.getCustomTitleBarHeight();
      console.log('计算得出的navbar高度（用于自定义navbar）, this.globalData:', this.globalData);
    }
    // 11. 小程序包更新
    updatePackageManager.updateManager()
  },
  globalData: {
    statusBarHeight: "",
    titleBarHeight: ""
  },
  onShow: function (options) {
    console.log('小程序切前台时的参数, options:', options);
    // 1. 获取、发送性能相关数据
    cAppOnShow.sendPerformance();
    // 2. 将 返回参数options 的属性绑定到 cwx 上
    cAppOnShow.backupOptionsToCwx(options);
    // 3. 将 返回参数options 的属性绑定到 __global 上
    cAppOnShow.backupOptionsToCxwGlobal(options);
    // 4. 将 onShow 时的 openid 存到 cwx.observer 的内存变量中
    cwx.Observer.noti("appjs_onShow", cwx.cwx_mkt.openid)
    // 5. 将 onShow 时的 options 存到 cwx.observer 的内存变量中
    cwx.Observer.noti("appjs_onShow_getoptions", {
      ...options,
      cAppOnShowTS: Date.now()
    })
    // 6. 跨小程序/App唤醒小程序时，执行同步登录态的操作
    cwx.dynamicLogin.publish(options);
    // 7. 监听内存不足告警事件
    cAppOnShow.observeMemoryWarning();
    // 8. 监听用户截屏事件
    cAppOnShow.observeUserCaptureScreen();
    
    // 10. 市场静默发券
    cwx.mkt.receiveWeixinCoupon && cwx.mkt.receiveWeixinCoupon();
    // 11. 注册 Observe 事件；获取 code；获取 opengid 相关信息；获取 cwx.cwx_mkt_openid, 若没有则标记并发埋点
    openGroupInfo.getGroupInfo();
  },
  onHide: function () {
    // 1. 获取、发送性能相关数据
    cAppOnHide.sendPerformance();
    // 2. onHide 时，发送目前已获取到的 opengid 相关数据
    openGroupInfo.handlerAppOnHide();
    // 3. 取消监听事件
    cAppOnHide.removeObserver();
    // 4. 注册 onHide 事件
    cwx.Observer.noti("appjs_onHide", cwx.cwx_mkt.openid)
  },
  onPageNotFound(res) {
    console.error('[onPageNotFound] res:', res);
    cwx.sendUbtByPage.ubtTrace(193684, res || {}); // 记录 onPageNotFound 的入参

    let { path = '', query = '' } = res || {};
    console.log("path:", path);
    console.log("query:", query);

    let querySpliced = ''; // 将query处理成可直接拼接到路径后面的字符串
    if (query) {
      for (let key in query) {
        querySpliced += `&${key}=${query[key]}`
      }
      querySpliced = querySpliced.substring(1)
    }

    let wholePath = `/${path}?${querySpliced}`; // 添加 / 前缀
    if (res && res.rawPath) { // 优先使用 rawPath; 由 /, path, query 拼接的路径作为兜底值
      wholePath = res.rawPath;
    }
    // todo, 看看是否需要给 rawPath 添加 / 前缀，以及是否需要移除 path ? 前面的 .html
    console.log("wholePath:", wholePath);

    let doHotelProcess = path && /^(\/)?pages\/hotel/.test(path);
    let doFlightProcess = path && /^(\/)?pages\/flight/.test(path);
    let lackofPathPrefix = path && path[0] !== '/';
    console.log('lackofPathPrefix:', lackofPathPrefix);

    if (baseConfig.tabbar.includes(path.indexOf("/") === 0 ? path.substring(1) : path)) {
      cwx.switchTab({
        url: wholePath,
        doNotIntercept: true,
        fail: function(err) {
          console.error('[switchTab retry] error:', err);
          try {
            cwx.sendUbtByPage.ubtDevTrace("wxapp_onPageNotFound_retry_error", {
              type: "switchTab",
              error: JSON.stringify(err)
            });
          } catch (err) {
            console.error(err);
          }
        }
      })
      return;
    }
    if (lackofPathPrefix) {
      cwx.redirectTo({
        url: wholePath,
        doNotIntercept: true,
        fail: function(err) {
          console.error('[lackofPathPrefix retry] error:', err);
          try {
            cwx.sendUbtByPage.ubtDevTrace("wxapp_onPageNotFound_retry_error", {
              type: "redirectTo",
              error: JSON.stringify(err)
            });
          } catch (err) {
            console.error(err);
          }
          if (doHotelProcess) {
            cwx.cwx_htl.processNotFound(path, querySpliced, res.isEntryPage);
          } else if (doFlightProcess) {
            cwx.cwx_flt.processNotFound(path, querySpliced);
          } else {
            cwx.switchTab({
              doNotIntercept: true,
              url: '/pages/home/homepage'
            })
          }
        }
      })
    } else if (doHotelProcess) {
      cwx.cwx_htl.processNotFound(path, querySpliced, res.isEntryPage);
    } else if (doFlightProcess) {
      cwx.cwx_flt.processNotFound(path, querySpliced);
    } else {
      // 意味着不是由于缺少 / 前缀导致的 onPageNotFound，也不是机酒的页面：重定向到大首页
      cwx.switchTab({
        doNotIntercept: true,
        url: '/pages/home/homepage'
      })
    }
  }
})
