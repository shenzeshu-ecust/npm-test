import React, {Component} from 'react'
import cwx from '@/miniapp/cwx/cwx'
import ubt_cwx from '@/miniapp/cwx/cpage/ubt_wx';
import {
  getNavigatorUid,
  navigatorOpts,
  pageStack,
  setCWXPageLoadData,
  getCWXPageLoadData
} from "@/miniapp/cwx/cpage/initNavigator"
import __global from "@/miniapp/cwx/ext/global";
import Taro from '@tarojs/taro';

let instanceId = 0;

function serializeQueryObj(obj) {
  const ret = [];
  for (let k in obj) {
    if (k !== '__navigator') {
      let t = typeof obj[k];
      if (t === 'string' || t === 'number' || t === 'boolean') {
        ret.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
      }
    }
  }
  return ret.length > 0 ? ('?' + ret.join('&')) : ''
}

const tabs = (function () {
  let ret = [];
  let __wxConfig = __global.__wxConfig || {};
  if (__wxConfig.tabBar && __wxConfig.tabBar.list) {
    ret = __wxConfig.tabBar.list.map(function (item) {
      return item.pagePath;
    });
  } else {
    if (__global.tabbar) {
      ret = __global.tabbar;//安卓检测不到tabbar
    }
  }
  return ret;
})();

function __getIndex(tabs, route) {
  let index = -1;
  for (let i = 0; i < tabs.length; i++) {
    let r = tabs[i];
    if (r.indexOf(route) != -1) {
      index = i;
      break;
    }
  }
  return index;
}

const noop = function () {};
// 注意：Taro 页面没有 onShow, onHide ( 20230321记 )
const lifeCycleFns = [
  "onLoad", // 可访问页面路由参数：通过访问 options 参数或调用 getCurrentInstance().router。
  "componentDidShow", // 页面显示/切入前台时触发。【页面没有 onShow, 只有页面组件才会触发 onShow 生命周期】
  "onReady", // 可访问小程序渲染层的 DOM 节点：使用 createCanvasContext 或 createSelectorQuery 等 API 。【使用时，需查看官方文档中的注意事项】
  "componentDidHide", // 在下一个页面的 onLoad 之前触发。页面隐藏/切入后台时触发。【页面没有 onHide, 只有页面组件才会触发 onHide 生命周期】
  "onUnload", // 【在下一个页面的 onLoad 之前触发】
  "componentWillUnmount", // 【在下一个页面的 onLoad 之后触发】页面退出时触发。在微信小程序中这一生命周期方法对应 onUnload
];
const eventHandlerFns = [
  "onShareAppMessage",
  "onShareTimeline"
];
const extraAttrsMap = {
  // 曝光埋点相关属性
  autoExpose: [
    "autoExpose",
    "exposeThreshold",
    "exposeDuration",
    "getExposeData",
  ],
  // 性能检测相关属性
  checkPerformance: [
    "checkPerformance", // 白屏检测
  ],
};
const extraApisMap = {
  ubt: [
    "ubtSendPV",
    "ubtTrace",
    "ubtMetric",
    "ubtDevTrace",
    "ubtExposure",
    "ubtTrackError",
    "__ubt_getPageInfo",
    "ubtSet",
    "navigateTo",
    "navigateBack",
    "invokeCallback",
  ],
  dom: ["getDOMProps"],
  // checkPerformance: [
  //   "viewReadyHandle", // 监听 CSS动画结束 事件
  // ],
};
export default class taroBase extends Component {
  constructor(props) {
    super(props);
    //= 创建PV
    this.runReady = false;
    this.cwx = cwx;
    this.__ubt_events = {};
    this.__ubt_instance = ubt_cwx.createPV();
    this.__route = props && props.tid && props.tid.split("?")[0];
    if (this._getCurrentPageRouter() === this.__route) {
      //绑定当前页面的ubt
      this._bindPageIns("constructor");
    }
    this.wrapLifeCycle();
    this.wrapPopularEventHandler(); // 处理分享内容
    this.bindEntryQueryToIns(); // 个保整改3期，将首个页面参数绑定到页面实例的2个参数相关的属性上
  }

  bindEntryQueryToIns () {
    // 判断小程序壳中是否包含 checkRediToGuide 方法，即是否包含个保整改3期的个保指引页面重定向逻辑
    if (!cwx.canIUse("checkRediToGuide")) {
      return;
    }
    
    let instance = Taro.getCurrentInstance();
    let guid = instance && instance.router && instance.router.params && instance.router.params.enterQueryGUID || "";
    if (!guid) {
      guid = instance && instance.page && instance.page.options && instance.page.options.enterQueryGUID || "";
    }
    if (!guid) {
      return;
    }

    console.log("%c [bindEntryQueryToIns] guid:", "color:#0f0;", guid)
    const enterQuery = cwx.getEnterQueryByGUID(guid)
    console.log("%c [bindEntryQueryToIns] enterQuery:", "color:#0f0;", enterQuery)

    if (enterQuery) {
      // 处理 Taro 页面实例：如果有 guid, 塞入真实的参数值
      if (instance && instance.router && instance.router.params) {
        Object.assign(instance.router.params, enterQuery);
      }
      if (instance && instance.page && instance.page.options) {
        Object.assign(instance.page.options, enterQuery);
      }
    }
  }

  wrapLifeCycle() {
    lifeCycleFns.forEach(fnName => {
      const oldFn = this[fnName] || noop;
      const newFn = (args) => {
        if (cwx.canIUse("checkRediToGuide")) {
          if (fnName === 'onLoad') {
            // 经过 constructor 的处理后，因为 instance.router.params === args, 所以 args 里已经包含 enterQuery, 因此不需要再次将 enterQuery 绑定到 args 上

            // 个人信息保护指引相关处理：不是 个保指引页，并且 生命周期是 onLoad，并且用户未同意授权，则需要重定向至 个保指引页
            if (
              !cwx.checkRediToGuide({
                isPIPGPage: this.isPIPGPage,
                pagePath: this._getCurrentPageRouter(),
                pageQuery: args,
              })
            ) {
              if (cwx.canIUse("checkUsePerInfoProtectComponent") && cwx.checkUsePerInfoProtectComponent()) {
                if (this.__page) {
                  this.__page.isShowGuideComponent = true; // 绑定到小程序的页面实例上
                }
              } else {
                this.isRediToGuide = true;
                this["_" + fnName].call(this, args);
                return;
              }
            }
          }
          
          // 重定向到个保指引页的首屏页面，不执行业务生命周期
          if (this.isRediToGuide) {
            this["_" + fnName].call(this, args);
            return;
          }
        }
        this["_" + fnName].call(this, args);
        // BU主动入参，控制：如果是在朋友圈打开，是否执行业务生命周期逻辑；
        if (cwx.canIUse("checkInTimeline") && (this.stopRunLifeInTL && cwx.checkInTimeline())) {
          return;
        }
        
        oldFn.call(this, args)
      }
      this[fnName] = newFn.bind(this);
    })
  }

  // 包裹分享、收藏事件处理函数，一般是要 return 一个东西出去的
  wrapPopularEventHandler() {
    eventHandlerFns.forEach(fnName => {
      console.log('[wrapPopularEventHandler] typeof this[fnName]:', typeof this[fnName]);
      // todo? 暂不添加 showShareToTimeline || (fnName === "onShareTimeline" && this.showShareToTimeline)
      if (typeof this[fnName] === 'function') {
        const oldFn = this[fnName] || noop; // 这个是BU调用的函数
        const newFn = (args) => {
          console.log('[wrapPopularEventHandler] fnName:', fnName);
          console.log('[wrapPopularEventHandler] args:', args);
          let res = oldFn.call(this, args);
          console.log('[wrapPopularEventHandler] res:', res);
          let processedRes = this[`_${fnName}`].call(this, args, res); // 执行 _ 的函数
          console.log('经过处理，最终返回的 sharedata:', processedRes);
          return processedRes;
        }
        this[fnName] = newFn.bind(this);
      }
    })
  }

  _getCurrentPageRouter(page) {
    if (cwx.getCurrentPageRouter) {
      return cwx.getCurrentPageRouter(page)
    }
    // 保留原有逻辑，兼容 其他平台主板 及 独立小程序（兼容尚未添加 cwx.getCurrentPageRouter 的情况）
    const currentPage = page || cwx.getCurrentPage();
    return currentPage && currentPage.__route__ || currentPage && currentPage.route || "";
  }

  _onShareTimeline(args, shareData = {}) {
    console.log('处理前的 shareData:', shareData);
    if (shareData && typeof shareData === "boolean" && typeof cwx.processShareTimeline === "function") {
      shareData = cwx.processShareTimeline(this.originOptions);
    }
    console.log('处理后的 shareData:', shareData);
    return shareData;
  }

  _onShareAppMessage(args, shareData = {}) {
    console.log('处理前的 args:', args);
    console.log('处理前的 sharedata:', shareData);
    if (cwx.processShareData) {
      shareData = cwx.processShareData(args, shareData);
    }
    console.log('处理后的 sharedata:', shareData);
    return shareData;
  }

  bindExtraApiToPage(type) {
    const apiList = extraApisMap[type] || [];
    apiList.forEach((item) => {
      this.__page[item] = this[item].bind(this);
    });
  }

  userActionWrapper(fnName) {
    const _this = this;
    return function eventWrapper(e) {
      if (typeof _this[fnName] === 'function') {
        //上报event
        try {
          cwx.uploadUserAction(e, fnName, _this);
        } catch (e) {

        }
        _this[fnName].apply(_this, arguments);
      }
    }
  }

  ubtSendPV(options) {
    /**
     * 如果产生了新的PV需要更新当前page下的ubt.pv实例对象
     * 避免新PV下的埋点数据（tracelog,metric）关联到上一个PV
     */
    this.__ubt_instance = this.__ubt_instance.send('pv', options || {});
  }

  ubtTrace(name, value, _extend) {
    let ubtConfig = __global.ubtConfig || {};
    if (value && JSON.stringify(value).length > ubtConfig.maxSize) {
      value = {
        UBT_WARN: `The user data exceeded the upper limit of ${ubtConfig.maxSize}KB.`,
      };
    }
    let traceValue = value;
    //默认不平铺
    if (!_extend?.tiled) {
      switch (cwx.util.type(value)) {
        case "string":
        case "number":
          traceValue = value;
          break;
        default:
          traceValue = JSON.stringify(value);
          break;
      }
    }
    if (cwx.config.ubtDebug) {
      let ubtTrace = this.__ubt_getPageInfo();
      ubtTrace.traceName = name;
      ubtTrace.traceValue = traceValue;
      console.log("UBT Page Trace", ubtTrace);
    }
    if (!_extend?.tiled) {
      this.__ubt_instance.send("tracelog", {
        name: name,
        value: traceValue,
        _extend: _extend || {},
      });
    } else {
      this.__ubt_instance.send("trace", {
        key: name,
        val: traceValue,
        _extend: _extend || {},
      });
    }
  }

  ubtDevTrace(name, value) {
    let option = {
      "$.ubt.hermes.topic.classifier": "DebugCustom",
      key: name,
      val: typeof value != 'object' ? {data: value + ''} : value,
      applet_scene: (cwx.scene || "") + ""
    }
    this.__ubt_instance.send('trace', option);
  }

  ubtMetric(option) {
    // 想办法让ubt取到pageId
    this.__ubt_instance.send('metric', option || {});
  }

  ubtTrackError(options) {
    this.__ubt_instance.send('error', options);
  }

  ubtExposure(name, value, _extend) {
    const {
      duration,
      ...rest
    } = value || {};
    rest.scene = cwx.scene || ""

    let option = {
      key: name,
      data: JSON.stringify(rest),
      duration: duration || 0,
      _extend: _extend || {},
    }
    this.__ubt_instance.send('exposure', option || {});
  }

  ubtSet(name, value) {
    // 想办法让ubt取到pageId
    ubt_cwx.ubtSet(name, value);
  }

  _bindPageIns(type) {
    if (this.bindTimer) {
      clearTimeout(this.bindTimer);
      this.bindTimer = null;
    }

    if (this.isBindedUbt) {
      return;
    }
    const allPages = Taro.getCurrentPages();     // Taro 给出的页面堆栈
    const currentRoute = this._getCurrentPageRouter();
    this.__page = allPages[allPages.length - 1];
    const cwxCurrentPage = cwx.getCurrentPage(); // 微信原生API 给出的页面实例
    try {
      if (this.__page || cwxCurrentPage) {
        cwx.sendUbtByPage.ubtDevTrace("tpage_bindPageIns_type", {
          type,
          thisRoute: this.__route || "", // constructor 的 props && props.tid && props.tid.split("?")[0];
          wxGetPRoute: currentRoute, // getCurrentPages()
          taroGetPRoute: this.__page && this.__page.__route__ || "" // Taro.getCurrentPages()
        });
      }
    } catch (e) {

    }

    if (this.__page && (!this.__route || this._getCurrentPageRouter(this.__page) === this.__route)) {
      cwx.sendUbtByPage.ubtDevTrace("tpage_bindPageIns_start", {
        type,
        thisRoute: this.__route || "", // constructor 的 props && props.tid && props.tid.split("?")[0];
        wxGetPRoute: this._getCurrentPageRouter(this.__page), // getCurrentPages()
        taroGetPRoute: this.__page && this.__page.__route__ || "", // Taro.getCurrentPages()
        _isAlreadyBindPage: this.__page._isAlreadyBindPage // 标志位
      });
      if (this.__page._isAlreadyBindPage) {
        return;
      }
      this.__page._isAlreadyBindPage = true;
      // console.log("currentPage.__route__:",this.__page.__route__);
      // console.log("this.__route__:",this.__route);
      // console.log("type:",type);
      this.isBindedUbt = true;
      this.__page.pageId = this.pageId;
      this.__page.__ubt_instance = this.__ubt_instance
      //添加一个双向绑定

      this.__page.__cpage = {
        __ubt_querystring: this.__ubt_querystring,
        pageId: this.pageId,
        __ubt_instance: this.__ubt_instance,
        __instanceId: "taro_" + (instanceId++)
      };
      this.bindExtraApiToPage("ubt");
      this.bindExtraApiToPage("dom");
      this.bindExtraApiToPage("checkPerformance");
      cwx.sendUbtByPage.flush(); // 发送ubt埋点
      return;
    }
    this.bindTimer = setTimeout(() => {
      this.bindTimer = null;
      this._bindPageIns("retry");
    }, 20);
  }

  getDOMProps(id) {
    if (document && document.getElementById) {
      let element = document.getElementById(id);
      return element && element.props || null;
    }
    return null;
  }

  handleLifeCycleNotiOpt () {
    return {
      fcpGUID: this.fcpGUID || "",
      bridgeGUID: this.bridgeGUID || "",
      whiteScreenGUID: this.whiteScreenGUID || "",
      __pageType: "taro",
      pagePath: this._getCurrentPageRouter(this.__page)
    }
  }

  _onLoad(options = {}) {
    this.originOptions = options;
    if (this.checkPerformance && cwx.canIUse("initWhiteScreen")) {
      // console.log("%c --- Taro页面的 checkPerformance 属性为 true", "color:#0f0");
      this.whiteScreenGUID = cwx.initWhiteScreen()
    }
    if (options.fcpGUID) {
      this.fcpGUID = options.fcpGUID
    }
    // 供 引用了 bridge.js 的 webview 内嵌 h5 使用
    if (options.bridgeGUID) {
      this.bridgeGUID = options.bridgeGUID 
    }

    cwx.Observer.noti("cpage_onLoad", {
      ...options,
      ...(this.handleLifeCycleNotiOpt()),
    });
    try {
      //添加同步市场营销数据的逻辑
      cwx.mkt.setUnion(options);
    } catch (e) {
      console.log("CPage cwx.mkt.setUnion error = ", e);
    }
    this.__ubt_totalActiveTime = 0;
    this.__ubt_onLoadTime = +new Date();
    this.__ubt_querystring = serializeQueryObj(options);
    this._bindPageIns("onLoad");
    // loadTime
    this.__ubt_onLoadTime = +new Date();
    this.__ubt_isBack = false;
    this.__ubt_isBackFlag = false;
    if (typeof this.pageId !== 'undefined' && this.__page) {
      this.__page['pageId'] = this.pageId;
      this.__page.__cpage && (this.__page.__cpage['pageId'] = this.pageId);
    }

    if (pageStack.length === 1 && this.__page && __getIndex(tabs, this.__page.__route__) !== -1) {
      pageStack.splice(0, 1, this.__page.__route__);
    } else {
      this.__page && pageStack.push(this.__page.__route__);
    }
    let uid = null;
    delete this.__navigator_fromUid;
    if (options && options['__navigator']) {
      uid = options.__navigator;
      delete options.__navigator;
      let opts = navigatorOpts[uid];
      if (opts) {
        console.log('__navigator_fromUid', uid);
        this.__navigator_fromUid = uid;
        options.data = opts.data;
      }
    }
    const prePageLoadPromise = getCWXPageLoadData && getCWXPageLoadData();
    if (prePageLoadPromise) {
      let lastPagePreData = prePageLoadPromise;
      if (prePageLoadPromise.data) {
        lastPagePreData = prePageLoadPromise.data;
      }
      const currentPage = cwx.getCurrentPage();
      if (!prePageLoadPromise.path || (prePageLoadPromise.path && prePageLoadPromise.path === currentPage.route)) {
        if (options) {
          options.lastPagePreData = lastPagePreData;
        } else {
          options = {
            lastPagePreData
          }
        }
        //直接置空，只能相邻页面使用
        setCWXPageLoadData && setCWXPageLoadData(null);
      }
    }
    this.__navigator_isBack = false;
    this.__navigator_isBackFlag = false;
    cwx._wxGetCurrentPages = Taro.getCurrentPages();
    try {
      cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
    } catch (e) {
    }
    // 兼容cwx上不存在该API的情况
    // 比较 onLoad 时，this 和 微信原生API返回的页面实例是否绝对相等
    cwx.canIUse("sendUbtByPage") && cwx.sendUbtByPage.ubtDevTrace("weapp_tpage_onLoad_comparePage", {
      compare: this.__page === cwx.getCurrentPage(), 
    });
    cwx.canIUse("sendPageRoute") && cwx.sendPageRoute({ type: "taro" });
  }

  viewReadyHandle = () => {
    cwx.canIUse("handleViewReadyEvent") && cwx.handleViewReadyEvent(this.whiteScreenGUID);
  };

  // 将 CPage 实例上的指定属性绑定到 Page 页面实例上
  _appendAttrsToPage(type) {
    const attrList = extraAttrsMap[type] || [];
    attrList.forEach((a) => {
      if (typeof this[a] !== "undefined") {
        this.__page[a] = this[a];
      }
    });
  }

  _onReady() {
    cwx.Observer.noti("cpage_onReady", {
      ...(this.handleLifeCycleNotiOpt())
    });
    if (this.autoExpose) {
      this._appendAttrsToPage("autoExpose");
      cwx.canIUse("sendUbtExpose") && cwx.sendUbtExpose.observe(this.__page);
    }

    if (!this.runReady) {
      this._bindPageIns("onReady");
      // active
      if (!this.__ubt_isBack) {
        this.__ubt_onActiveTime = +new Date();
      }
      this.__ubt_instance.send('metric', {
        name: 100359,       //perf.weixin.ready
        value: +new Date() - this.__ubt_onLoadTime
      });
    }
    this.runReady = true
  }

  _componentDidShow() {
    cwx.Observer.noti("cpage_onShow", {
      ...(this.handleLifeCycleNotiOpt()),
      cpageOnShowTS: Date.now()
    });
    this.isRunPreLoad = false;
    this._bindPageIns("componentDidShow");

    cwx.canIUse("sendUbtGather") && cwx.sendUbtGather.getPageDurationProps('pageOnShow');

    // active
    if (this.__ubt_isBack) {
      this.__ubt_onActiveTime = +new Date();
    }
    if (this.hasOwnProperty('__navigator_isBackFlag')) {
      delete this.__navigator_isBackFlag;
    } else {
      this.__navigator_isBack = true;
    }
    if (this.__navigator_isBack) {
      if (pageStack.length === 1 && this.__page && tabs.indexOf(this.__page.__route__) !== -1) {
        pageStack.splice(0, 1, this.__page.__route__);
      }
      let uid = this.__navigator_toUid;
      if (uid && navigatorOpts[uid] && (!cwx.__skipCallback)) {
        if (navigatorOpts[uid].callback) {
          navigatorOpts[uid].backDatas.forEach((function (data) {
            navigatorOpts[uid].callback.call(this.__page, data);
          }).bind(this));
        }
        if (navigatorOpts[uid].navComplete) {
          navigatorOpts[uid].navComplete.call(this.__page);
        }
        delete this.__navigator_toUid;
      }
      if (cwx.__skipCallback == true) {
        cwx.__skipCallback = false;
      }
    }
    cwx._wxGetCurrentPages = Taro.getCurrentPages();
    try {
      cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
    } catch (e) {
    }
    // back
    if (this.hasOwnProperty('__ubt_isBackFlag')) {
      delete this.__ubt_isBackFlag;
    } else {
      this.__ubt_isBack = true;
    }
    // log pv
    //处理ubt返回相关
    let ubtPv = this.__ubt_getPageInfo();
    ubtPv.url = '' + this.props.tid;
    if (ubtPv.url.indexOf("?") === -1) {
      ubtPv.url += this.__ubt_querystring;
    }
    ubtPv.isBack = this.__ubt_isBack;
    //=发送PV数据，包含是否需要生成新PV的逻辑
    if (ubtPv.pageId !== 'ignore_page_pv') {
      this.__ubt_instance = this.__ubt_instance.send('pv', ubtPv);
      console.log("this.__ubt_instance", this.__ubt_instance);
    }
  }

  // 由于 Taro页面 跳转到 原生页面的情况下，
  // Taro 页面的 componentWillUnmount 是在原生页面的 _onUnload 之后触发的，
  // 因此需要把之前写在 _componentWillUnmount 里的逻辑，挪到 _onUnload 里，
  // 才能保证时机的准确性（尤其是获取的页面实例是真正卸载的页面实例）
  _onUnload () {
    cwx.Observer.noti("cpage_onUnload", {
      ...(this.handleLifeCycleNotiOpt()),
    });
    cwx.canIUse("sendUbtGather") && cwx.sendUbtGather.getPageDurationProps('pageOnUnload');

    if (this.__page && pageStack[pageStack.length - 1] == this.__page.__route__) {
      pageStack.pop();
    }
    cwx._wxGetCurrentPages.pop()
    try {
      cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
    } catch (e) {
    }
  }

  _componentWillUnmount() {
    // console.log("%c _componentWillUnmount -----------", "color:#0f0")
  }

  _componentDidHide() {
    cwx.Observer.noti("cpage_onHide", {
      ...(this.handleLifeCycleNotiOpt()),
    });
    if (this.autoExpose) {
      cwx.canIUse("sendUbtExpose") && cwx.sendUbtExpose.disconnect(this.__page);
    }
    this.runPreLoad();
  }

  __ubt_getPageInfo() {
    return {
      pageId: '' + (this.pageId || this.pageid || '0')
    };
  };

  runPreLoad() {
    if (this.isRunPreLoad) {
      return;
    }
    this.isRunPreLoad = true;
    if (typeof this.cwxPrePageLoad === 'function') {
      setCWXPageLoadData && setCWXPageLoadData(this.cwxPrePageLoad());
    }
  }

  navigateTo(opts) {
    let uid = getNavigatorUid();
    let url = opts.url;

    const navOpts = {
      url: url + (/\?/.test(url) ? '&' : '?') + '__navigator=' + encodeURIComponent(uid),
      success: opts.success ? opts.success.bind(this.__page) : null,
      fail: opts.fail ? opts.fail.bind(this.__page) : null,
      complete: opts.complete ? opts.complete.bind(this.__page) : null
    };

    if (this.getPageLevel() >= 10) {
      var err = {
        error: '页面层级超过10层',
        errorCode: '500'
      };
      console.log("CPage.navigateTo :", err, url);
      // console.log( "CPage.stack :", this.getPageStack() );

      navOpts.fail && navOpts.fail(err);
      navOpts.complete && navOpts.complete(err);
      return;
    }

    navigatorOpts[uid] = {
      data: opts.data,
      immediateCallback: opts.immediateCallback ? opts.immediateCallback.bind(this.__page) : null,
      callback: opts.callback ? opts.callback.bind(this.__page) : null,
      navComplete: opts.navComplete ? opts.navComplete.bind(this.__page) : null,
      backDatas: []
    };
    this.runPreLoad();
    this.__navigator_toUid = uid;
    cwx.navigateTo(navOpts);
  };

  navigateBack(data) {
    let uid = this && this.__navigator_fromUid || "";
    if (uid && navigatorOpts[uid] && arguments.length > 0) {
      navigatorOpts[uid].backDatas.push(data);
      navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
    }
    cwx.navigateBack();
  };

  invokeCallback(data) {
    let uid = this && this.__navigator_fromUid || "";
    if (uid && navigatorOpts[uid]) {
      navigatorOpts[uid].backDatas.push(data);
      navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
    }
  };

  getPageStack() {
    return cwx.util.copy(pageStack);
  };

  getPageLevel() {
    return this.getPageStack().length;
  };
}
