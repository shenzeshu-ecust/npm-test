import {
  cwx,
  originCPage as CPage,
  __global,
  EventManager,
  createEventManager,
  BusRouter,
  Utils,
  BusConfig,
} from './index';
import mixin from './mixin.js';

const eventNames = ['load', 'ready', 'show', 'hide', 'unload'];
const eventFnNames = eventNames.map(
  (name) => `on${name.replace(/\w/, (a) => a.toUpperCase())}`
);
const isFunction = (t) => typeof t === 'function';
const isArray = (t) => Array.isArray(t);
const makeArray = (t) => Array.prototype.slice.call(t);
const noop = () => {};
var systemInfo = wx.getSystemInfoSync();

function EmitEventHook(pageOpt) {
  // var isPublic = this.isPublic;
  var emit = function () {
    EventManager.emit.apply(EventManager, arguments);
    this.EventManager &&
      this.EventManager.$emit.apply(this.EventManager, arguments);
  };
  Object.keys(pageOpt).forEach((key) => {
    let origin = pageOpt[key];
    if (!CPage.__isComponent && isFunction(pageOpt[key])) {
      if (eventFnNames.indexOf(key) > -1) {
        let name = eventNames[eventFnNames.indexOf(key)];
        pageOpt[key] = function (params) {
          emit.call(this, `page.${name}`, {
            // name: pageName,
            page: this,
            params: params,
          });

          return origin.call(this, params);
        };
      } else {
        pageOpt[key] = function (evt) {
          if (arguments.length === 1) {
            let e = arguments[0];
            if (e && e.currentTarget) {
              emit.call(this, e.type, {
                page: this,
                bind: key,
                event: e,
              });
            }
          }
          //public类型不hook具体函数名
          this.$emit &&
            this.$emit(`page.${key}`, {
              page: this,
              bind: key,
              arguments: arguments,
            });
          let result = origin.apply(this, makeArray(arguments));

          if (arguments.length === 1) {
            let e = arguments[0];
            if (e && e && e.currentTarget) {
              emit.call(this, 'after.' + e.type, {
                page: this,
                bind: key,
                event: e,
              });
            }
          }
          this.$emit &&
            this.$emit(`page.after.${key}`, {
              page: this,
              bind: key,
              arguments: arguments,
            });
          return result;
        };
      }
    }
  });
  Object.keys(EventManager).forEach((key) => {
    if (isFunction(EventManager[key])) {
      pageOpt['$' + key] = function () {
        this.EventManager &&
          this.EventManager['$' + key].apply(this.EventManager, arguments);
      };
    }
  });
}
var BusPage = (pageOpt) => {
  for (var minKey in mixin) {
    //options 里面的优先级高于 minix
    if (Object.hasOwnProperty.call(pageOpt, minKey)) {
      //不替换
    } else {
      pageOpt[minKey] = mixin[minKey];
    }
  }
  //自动补充缺失的生命周期函数，用于监听
  eventNames.forEach((name, index) => {
    const en = eventFnNames[index];
    if (!pageOpt[en]) {
      pageOpt[en] = function (param) {};
    }
  });
  EmitEventHook(pageOpt);
  pageOpt.checkPerformance = true;
  pageOpt.autoExpose = 2; // 1.1.1 添加 autoExpose 属性，并设置其值为 2
  pageOpt.exposeThreshold = 0.5; // 1.2.1 自定义发送曝光埋点的条件1：相交比例的阈值
  pageOpt.exposeDuration = 2000; // 1.2.2 自定义发送曝光埋点的条件2：停留时长的阈值

  CPage(pageOpt || {});
};

//使用mixin 注入函数函数重名会覆盖
function extend(page, obj) {
  for (var key in obj) {
    //options 里面的优先级高于 minix
    page[key] = obj[key];
  }
}

function UBT_eventWrapper(fn) {
  var _this = this.__cpage;
  return function (evt) {
    if (_this.__ubt_isEvent(arguments)) {
      _this.__ubt_logTap(evt, fn.name);
    }
    var args = Array.prototype.slice.call(arguments, 0);
    var ret;
    if (fn) {
      try {
        ret = fn.apply(this, args);
      } catch (e) {
        // 错误数据收集
        try {
          if (typeof e == 'string') {
            e = new Error(e);
          }

          var obj = {
            message: e && e.message,
            file: 0,
            category: 'inner-error',
            framework: 'normal',
            time: 0,
            line: 0,
            column: 0,
            stack: e && e.stack && e.stack.split('\n'),
            repeat: 1,
          };

          _this.__ubt_instance.send('error', obj);
        } catch (e) {}

        if (cwx.util.isDevice()) {
          setTimeout(function () {
            throw e;
          }, 0);
        } else {
          throw e;
        }
      }
    }
    return ret;
  };
}

// onLoad 里面注入EventManager 确保ctx正确;
EventManager.on('page.load', function (e) {
  var page = e.page;
  if (!page) return; //没有page对象不监听/
  var EM = createEventManager(page, false);
  page.EventManager = EM;
  page.UBT_eventWrapper = UBT_eventWrapper.bind(page);
  let mUtmsource = Utils.getUtmSource(e.params);
  let bShow = e.params.bShow
    ? true
    : mUtmsource.indexOf('ctripwx') >= 0
    ? true
    : false;
  Utils.saveUtmSource(mUtmsource);
  Object.defineProperty(page, 'pageId', {
    get: function () {
      if (this.__pageId) {
        return this.__pageId;
      }
      this.__pageId = BusRouter.pageId(this, bShow);
      return this.__pageId;
    },
    set: function (val) {
      this.__pageId = val;
      if (this.__cpage) {
        this.__cpage.pageId = val;
      }
    },
    enumerable: true,
  });
  if (page.__cpage) {
    page.__cpage.pageId = page.pageId;
  }
  page.beforeOnLoad && page.beforeOnLoad(e.params);

  var showSlogan = Object.hasOwnProperty.call(e.params, 'showSlogan')
    ? e.params.showSlogan
    : BusConfig.showSlogan || 0;

  var screenHeight = (systemInfo.screenHeight / systemInfo.screenWidth) * 750;

  var navbarData = page.data.navbarData || {};
  if (!navbarData.navigationBarColor) {
    // 未设置颜色使用主题色
    navbarData.navigationBarColor = BusConfig.colorConfig.mainBackColor;
  }

  let isIPhoneX =
    systemInfo.platform !== 'android' && systemInfo.statusBarHeight > 25;

  page &&
    page.setData(
      {
        showSlogan: showSlogan == 0 ? false : true,
        reportSubmit: BusConfig.report_submit,
        isIPhoneX: isIPhoneX,
        utmSource: mUtmsource,
        isPromotion: bShow,
        systemInfo: systemInfo,
        rScreenHeight: screenHeight,
        colorConfig: BusConfig.colorConfig,
        navbarData,
        classConfig: BusConfig.classConfig,
      },
      () => {
        if (
          Object.prototype.toString.call(page.customStyle) === '[object Object]'
        ) {
          //是对象不处理
        } else {
          //默认颜色
          page.customStyle = {};
        }
        if (page.customStyle.autoStyle) {
          //对象类型
          wx.setNavigationBarColor({
            frontColor:
              page.customStyle.frontColor ||
              page.data.colorConfig.titleColor ||
              '#000000',
            backgroundColor:
              page.customStyle.backgroundColor ||
              page.data.colorConfig.headerBgColor ||
              page.data.colorConfig.mainBackColor ||
              '#ffffff',
          });
        }
      }
    );

  page.autoJump(e.params);

  if (cwx.Observer && cwx.Observer.addObserverForKeyOnly) {
    cwx.Observer.addObserverForKeyOnly('__bus_cwebmesssage__', (opt) => {
      console.log('==========webview observer=========', opt);

      if (opt.type === 'message') {
        let e = opt.options;
        let postArr = e.detail.data;
        let postCount = postArr.length;
        let templateIds = null;
        for (let i = 0; i < postCount; i++) {
          let sData = postArr[i];
          if (!templateIds && sData.type.toLowerCase() === 'oncouponmessage') {
            if (sData.couponNotices && sData.couponNotices.length > 0) {
              templateIds = sData.couponNotices;
            } else if (sData.couponNotice) {
              templateIds = [sData.couponNotice];
            }
          }
        }
        if (templateIds) {
          saveTemplateMessage(templateIds);
        }
      }
    });
  }
});
EventManager.on('after.tap', function (e) {
  if (cwx.subscribeMsgTemplateIds) {
    subscribeTemplateMessage(cwx.subscribeMsgTemplateIds, (success) => {
      cwx.subscribeMsgTemplateIds = null;
    });
  }
});

function subscribeTemplateMessage(templateIds, callBack) {
  getSubscriptionsSetting(
    templateIds,
    ({ can, hasAlwaysCheck, allAlwaysCheck, haveReject }) => {
      if (can) {
        cwx.mkt &&
          cwx.mkt.subscribeMsg &&
          cwx.mkt.subscribeMsg(
            templateIds,
            (data) => {
              if (
                (data.templateSubscribeStateInfos &&
                  Array.isArray(data.templateSubscribeStateInfos)) ||
                (data.subscribedEntityIds &&
                  Array.isArray(data.subscribedEntityIds))
              ) {
                cwx.showToast({
                  title: '订阅成功',
                  icon: 'none',
                  duration: 2000,
                  mask: false,
                });
                callBack && callBack(true);
              } else {
                callBack && callBack(false);
              }
            },
            (err) => {
              console.log('网络异常，请重试！');
              callBack && callBack(false);
            }
          );
      } else {
        callBack && callBack(false);
      }
    }
  );
}

function getSubscriptionsSetting(templateIds, callback) {
  if (__global.appId == '2017081708237081') {
    callback &&
      callback({
        can: true,
      });
    return;
  }
  wx.getSetting({
    withSubscriptions: true,
    success: function (res) {
      let { subscriptionsSetting } = res;
      if (subscriptionsSetting) {
        let mainSwitchClose = !subscriptionsSetting.mainSwitch;
        if (res.subscriptionsSetting && res.subscriptionsSetting.itemSettings) {
          let haveReject = false;
          // 是否勾选订阅面板中的“总是保持以上选择，不再询问”
          let allAlwaysCheck = true;
          let hasAlwaysCheck = false;
          templateIds.forEach((item) => {
            if (res.subscriptionsSetting.itemSettings[item] === 'accept') {
              hasAlwaysCheck = true;
            } else if (
              res.subscriptionsSetting.itemSettings[item] === 'reject'
            ) {
              haveReject = true;
              allAlwaysCheck = false;
            } else if (res.subscriptionsSetting.itemSettings[item] === 'ban') {
              // TODO 上报数据
              haveReject = true;
              allAlwaysCheck = false;
            }
            if (!res.subscriptionsSetting.itemSettings[item]) {
              allAlwaysCheck = false;
            }
          });

          if (mainSwitchClose) {
            cwx.showModal({
              title: '提示',
              content: '检测到没有开启订阅消息的权限，是否去开启',
              success: function (stRes) {
                if (stRes.confirm) {
                  wx.openSetting({
                    success(res) {
                      console.log('设置权限完成');
                    },
                  });
                }
              },
            });
            callback({
              can: false,
            });
          } else {
            if (allAlwaysCheck) {
              cwx.showModal({
                title: '提示',
                content: '已为您保持上次选择',
              });
              callback({
                can: true,
                allAlwaysCheck,
              });
            } else if (haveReject) {
              cwx.showModal({
                title: '提示',
                content: '检测到部分订阅消息的权限被禁用了，是否去开启',
                success: function (stRes) {
                  if (stRes.confirm) {
                    wx.openSetting({
                      success(res) {
                        console.log('设置权限完成');
                      },
                    });
                  }
                },
              });
              callback({
                can: true,
                allAlwaysCheck,
                haveReject,
              });
            } else {
              callback({
                can: true,
                allAlwaysCheck,
                haveReject,
                hasAlwaysCheck,
              });
            }
          }
        } else {
          if (mainSwitchClose) {
            cwx.showModal({
              title: '提示',
              content: '检测到没有开启订阅消息的权限，是否去开启',
              success: function (stRes) {
                if (stRes.confirm) {
                  wx.openSetting({
                    success(res) {
                      console.log('设置权限完成');
                    },
                  });
                }
              },
            });
          }
          callback({
            can: !mainSwitchClose,
          });
        }
      } else {
        cwx.showModal({
          title: '提示',
          content: '检测到没有开启订阅消息的权限，是否去开启',
          success: function (stRes) {
            if (stRes.confirm) {
              wx.openSetting({
                success(res) {
                  console.log('设置权限完成');
                },
              });
            }
          },
        });
        callback({
          can: false,
        });
      }
    },
  });
}

function saveTemplateMessage(templateIds) {
  cwx.subscribeMsgTemplateIds = templateIds;
}

const wxSubscribeMsg = (templateIds) => {
  let mPage = cwx.getCurrentPage();
  let pageId = mPage ? mPage.pageid || mPage.pageId || '' : '';
  return new Promise((resolve) => {
    let sendConfig = {
      success(res) {
        console.log('success', res);
        mPage &&
          mPage.ubtTrace &&
          mPage.ubtTrace(129292, {
            actionCode: 'wx.requestSubscribeMessage-success',
            openid: cwx.cwx_mkt.openid,
            clientid: cwx.clientId,
            pageid: pageId,
            data: JSON.stringify(res),
          });
        resolve(res);
      },
      fail(res) {
        console.log('fail', res);
        mPage &&
          mPage.ubtTrace &&
          mPage.ubtTrace(129293, {
            actionCode: 'wx.requestSubscribeMessage-fail',
            openid: cwx.cwx_mkt.openid,
            clientid: cwx.clientId,
            pageid: pageId,
            data: JSON.stringify(res),
          });
        resolve(res);
      },
    };
    if (typeof my === 'object') {
      sendConfig.entityIds = templateIds;
    } else {
      sendConfig.tmplIds = templateIds;
    }
    wx.requestSubscribeMessage(sendConfig);
  });
};

BusPage.extend = extend;
BusPage.EventManager = EventManager;
BusPage.saveTemplateMessage = saveTemplateMessage;
BusPage.wxSubscribeMsg = wxSubscribeMsg;
BusPage.subscribeTemplateMessage = subscribeTemplateMessage;
export default BusPage;
