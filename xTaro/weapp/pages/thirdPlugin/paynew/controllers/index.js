import {
  cwx,
  _
} from '../../../../cwx/cwx.js';
import __global from '../../../../cwx/ext/global.js';
import {
  paywayModel,
  paywaySubmitModel,
  handleSubmitCallback,
  handleCheckBeforePay,
  getPageTraceId
} from '../libs/index';
import {
  getData,
  directBack,
  getDataDirectPay
} from '../components/getdata.js';
import * as Business from '../common/combus';
import * as Stores from '../models/stores.js';
import * as Util from '../common/util.js';
import {
  getWalletDisplayWay,
  getWalletInfo
} from '../components/utilWallet.js';
import {
  getOrderExtend
} from './queryExtend'
// let orderDetailStore = Stores.OrderDetailStore();
let payResultOStore = Stores.PayResultOrderStore();
let payWayStore = Stores.PayWayStore();
let isDirect = false
let initSettings = {}
let initCallback = () => {}
let notifyContinue = ''
let paramStore = Stores.PayParamsStore()
const reportErrorLog = Business.reportErrorLog
let timeLastCall = 0 //节流时间戳
let uid = '',
  realNamePath = ''
const currentPage = cwx.getCurrentPage();
const throttleDelay = 15000 //兜底放开节流
let isPaying = false // 是否支付请求中，流程走完之前不能重复提交
let hasObserved = false // 是否已经监听过钱包绑卡回调，做防重
let isGuarantee = false // 是否担保场景
let bindCardToken = '' // 担保绑卡成功token
let needSecond = false
let secondData = {}
let submitCallBack = () => {}
let smsSubmitCallBack = () => {}
let isUsingWallet = false // 是否因钱包支付而跳转
let hasWallet = false // 混付：包含钱包
let isSubmitting = false // 是否支付submit提交中

export default {
  init: function (settings, direct = false, callback) {
    // 节流
    const nowTime = Date.now();
    // 3s内直接拦截
    if (nowTime - timeLastCall < 3000) {
      Business.sendUbtTrace({
        a: 'init.throttle',
        c: 1000,
        d: 'throttle',
        settings,
        dd: '命中支付节流'
      });
      timeLastCall = nowTime
      return
    } else if (isPaying) {
      Business.sendUbtTrace({
        a: 'init.throttle-ispaying',
        c: 1000,
        d: 'throttle',
        settings,
        dd: '命中支付节流-3秒外'
      });
      return
    } else {
      isPaying = true
      timeLastCall = nowTime
      // 兜底放开
      setTimeout(() => {
        if (isPaying) {
          Business.sendUbtTrace({
            a: 'init.throttle-default-open',
            c: 1000,
            d: 'throttle',
            settings,
            dd: '命中支付节流-兜底放开'
          });
        }
        isPaying = false
        timeLastCall = 0
      }, throttleDelay);
    }
    var self = this;
    isDirect = direct
    initSettings = settings
    initCallback = callback
    if (!direct) {
      let payToken = settings.serverData.payToken || Util.getParam('tradeNo', settings.serverData.payLink);
      settings.serverData.payToken = payToken;
    }
    const payToken = settings.serverData && settings.serverData.payToken
    paramStore.setAttr('payToken', payToken)
    if (!payToken) {
      reportErrorLog({
        errorType: '30001',
        errorMessage: 'payToken为空',
        extendInfo: settings
      })
    }
    Business.reportTraceLog({
      payToken,
    })

    //初始化data
    self.data = {
      weicat: null, //微信支付102服务下发信息
      payData: {
        orderDetail: {}
      } //保存SBU传递过来的参数
    };

    Object.assign(self.data.payData.orderDetail, settings.data);
    self.showLoading('支付连接中..');
    Business.sendUbtTrace({
      type: 'chain',
      chainName: 'init',
      a: 'cpay.init',
      c: 1000,
      d: 'cpayinit',
      dd: '支付初始化'
    });

    //存储支付原始信息
    self.originalOrderDetailData = settings.data || {};
    self.settings = settings;

    //server data
    self.data.serverData = true;
    Business.checkBeforeAddOrder(() => {
      self.getPayway(function (resPayInfos) {
        self.showLoading('服务获取中..');
        return self.submitWithPaywayInfo(direct, callback, resPayInfos);
      })
    })
  },

  //获取支付提交参数，并提交
  submitWithPaywayInfo: function (direct, callback, resPayInfos) {
    var self = this;
    // 如果是担保单，获取绑卡token并跳转绑卡
    isGuarantee = resPayInfos.orderInfo.isGuarantee
    if (isGuarantee) {
      openPaying()
      hideLoading()
      this.doGuarantee({
        resPayInfos
      })
      return
    }
    if (direct) {
      //验证BU传递过来的参数是否正确; 余额单子不用重复调用此方法
      getDataDirectPay.call(self, resPayInfos, function () {}, direct);
      Business.sendUbtTrace({
        a: 'getpaywaystart',
        c: 2000,
        d: 'getdataCallback/getPaywayStart',
        dd: '解析102参数完成'
      });
      const resCtrlData = {
        callback,
        direct,
        resInfo: resPayInfos
      };
      hideLoading();
      self.payWayCtrl(resCtrlData);
    } else {
      //验证SBU传递过来的参数是否正确
      getData.call(self, self.settings.serverData, resPayInfos);
      const resCtrlData = {
        callback,
        direct,
        resInfo: resPayInfos
      };
      Business.sendUbtTrace({
        a: 'getpaywayok',
        c: 2001,
        d: 'getPaywayCallback',
        dd: '102请求结束，执行回调'
      });
      const payWayResult = self.payWayCtrl(resCtrlData);
      if (payWayResult && payWayResult.autoPay) {
        self.showLoading('支付提交中...');
        self.requestSubmit();
      } else {
        Business.sendUbtTrace({
          a: 'getpaywayNoAuto',
          c: 2002,
          d: 'getpaywayNoAuto',
          dd: '不自动提交',
          extend: {
            payWayResult
          }
        });
      }

    }
  },

  doGuarantee() {
    const payUrl = `${getBindCardUrl()}?subEnv=fat18&isMiniGua=1&tradeNo=${initSettings.serverData.payToken}`
    const obKey = 'pay_wallet_h5'
    hasObserved = false
    cwx.Observer.addObserverForKey(obKey, (value) => {
      // 只处理message，这是postmessage的值
      if (value.type == 'message' && !hasObserved) {
        Business.sendUbtTrace({
          a: '内嵌h5返回，监听到的数值',
          dd: 'addObserverForKey',
          observed: value
        });
        hasObserved = true
        const data = value.options.detail.data
        const {
          rc
        } = data && data[0] || {}
        // 延迟等待页面回退
        setTimeout(() => {
          if (rc == 0) {
            this.backAction('sback', this.getBackParams())
          } else {
            this.backAction('eback', this.getBackParams())
          }
        }, 200);
      }
    })
    Business.sendUbtTrace({
      a: '跳转绑卡地址',
      dd: 'getBindCardUrl',
      payUrl
    });
    cwx.component.cwebview({
      data: {
        url: encodeURIComponent(payUrl),
        needLogin: true,
        observerKey: obKey,
        isNavigate: !isDirect, // 直连的redirect; api的新开页面
      }
    })
  },

  //错误提示框，点击按钮事件处理
  modalConfirm: function (str, callback) {
    var that = this;
    hideLoading();
    wx.showModal({
      title: '提示',
      content: str || '',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          if (callback) {
            return callback.call(that)
          }
        }
      }
    })
  },
  showLoading: function (title) {
    title = title || '';
    try {
      wx.showLoading({
        title: title,
        mask: true
      });
    } catch (err) {
      wx.showToast({
        title: title,
        icon: 'loading',
        duration: 10000,
        mask: true
      });
    }

  },
  //Toast 错误提示
  showToast: function (str, icon, duration, callback) {
    icon = icon || 'success'
    str = str || '网络不给力，请稍候重试'
    duration = duration || 2000;
    wx.showToast({
      title: str,
      icon: icon,
      duration: duration,
      mask: true,
      complete: function () {
        if (callback) {
          return callback()
        }
      }
    });
  },
  //获取返回BU需要传递的参数
  getBackParams: function (rc) {
    const orderInfo = Business.getOrderInfos();
    var payresultInfo = payResultOStore.get() || {};
    var param = {
      orderID: orderInfo.oid || '',
      billNo: payresultInfo.oriBillNo || '',
      payType: orderInfo.realpaytype || '',
      price: orderInfo.amount || '',
      res: payresultInfo
    };

    if (payresultInfo.orderIdExtend) {
      param.orderID = payresultInfo.orderIdExtend;
    }

    if (rc == 2) {
      delete param.payType;
      param.ErrorCode = 888;
      param.ErrorMessage = '';
    } else if (rc == 4) {
      delete param.payType;
      param.ErrorCode = payresultInfo.rc;
      param.ErrorMessage = payresultInfo.rmsg;
    } else if (rc == 3) {
      delete param.payType;
    }
    return param;
  },
  payWayComplete: function (res) {
    res = res || {};
    var that = this;
    var rmsg = res.errMsg || '';
    var _msg;
    if (rmsg.indexOf('request:fail timeout') > -1) {

      _msg = "网络不给力，请稍候重试 - 521";

      that.modalConfirm(_msg, function () {
        that.backAction('from')
      });
      return;
    }
    if (rmsg.indexOf('request:fail') > -1) {
      _msg = "网络不给力，请稍候重试 - 522";
      that.modalConfirm(_msg, function () {
        that.backAction('from')
      });
    }
  },
  //获取支付方式
  getPayway: function (callBack) {
    const that = this;
    let requestData = {};
    requestData.payToken = that.settings.serverData.payToken;
    const startTime = new Date()
    let onSuccess = function (res) {
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'receive102',
        a: 'getPayway_suc',
        c: 2022,
        d: 'getPaywaySuc',
        dd: '102请求成功',
        token: requestData.payToken
      });
      let {
        rmsg,
        head
      } = res;
      let {
        code,
        message
      } = head;
      Business.reportTraceLog({
        status102: code,
        reqPaywayTime: new Date().getTime() - startTime.getTime()
      })
      if (code === 100000) {
        payWayStore.set(res);
        uid = getUidFromPayway(res)
        paramStore.setAttr('uid', uid)
        return callBack(res);
      } else {
        openPaying()
        const msg = message || rmsg || "系统异常，请稍后再试 -5121-2";

        that.modalConfirm(msg, function () {
          that.backAction('from')
        });
        reportErrorLog({
          errorType: '30003',
          errorMessage: `(102)服务返回值错误`,
          extendInfo: (head)
        })
        return;
      }
    };

    Business.sendUbtTrace({
      type: 'chain',
      chainName: 'send102',
      a: 'getPayway_start',
      c: 2021,
      d: 'getPaywayStart',
      dd: '102请求开始',
      token: requestData.payToken
    });

    // 获取增量信息
    getOrderExtend({
      payToken: requestData.payToken
    })

    const extend = JSON.stringify({
      pageTraceId: getPageTraceId(),
    })
    paywayModel({
      data: requestData,
      h5plat: Business.getH5Plat(),
      timeout: 15000,
      context: {
        cwx: cwx,
        env: __global.env,
        subEnv: 'fat18'
      },
      requestHead: {
        extend
      },
      success: onSuccess,
      fail: that.failFn.bind(that),
      complete: that.payWayComplete.bind(that)
    }).excute();
  },
  payWayCtrl: function (responseData = {}) {
    isUsingWallet = false
    const that = this;
    const {
      callback = () => {},
        direct,
        resInfo
    } = responseData;

    const {
      payCatalogInfo
    } = resInfo;

    const {
      thirdPartyList
    } = payCatalogInfo;

    if (_.isArray(thirdPartyList) && thirdPartyList.length > 0) {
      // 筛选微信支付方式
      that.data.weicat = thirdPartyList.find(item => item.brandId == "WEAPP" || item.brandId == "OGP_WEAPP")
    }
    // 获取钱包展示对象
    that.data.walletShowInfo = getWalletDisplayWay(resInfo)
    // 获取钱包支付方式
    that.data.walletWayInfo = getWalletInfo(resInfo)

    paramStore.setAttr('weicat', that.data.weicat)
    paramStore.setAttr('walletShowInfo', that.data.walletShowInfo)
    paramStore.setAttr('walletWayInfo', that.data.walletWayInfo)
    //直连操作，回调到页面
    if (direct) {
      return callback(that.data);
    }
    //服务没有下发第三方微信支付显示提示信息内容
    if (!that.data.weicat || !that.data.weicat.brandId) {

      var _msg = "无法支付，请至携程应用程序进行支付";

      that.modalConfirm(_msg, function () {
        that.backAction('from')
      });
      if (resInfo.head.code == 100000) {
        reportErrorLog({
          errorType: '30004',
          errorMessage: '没有下发微信支付方式'
        })
      }
      return;
    } else if (!direct && that.data.walletShowInfo && cwx.appId == 'wx0e6ed4f51db9d078') {
      // 如果有钱包余额，SDK的跳转到收银台
      openPaying()
      isUsingWallet = true
      cwx.getCurrentPage().navigateTo({
        url: `/pages/paynew/directpay/index?isUsingWallet=1&tradeNo=${initSettings.serverData.payToken}`
      })
      return
    } else {
      if (_.isFunction(callback)) {
        callback();
      }
      return {
        autoPay: true
      };
    }
  },
  //网络请求失败提示信息
  failFn: function (res) {
    openPaying()
    var that = this;
    Business.sendUbtTrace({
      a: 'requestfail',
      c: 3003,
      dd: '网络失败',
      result: res
    });
    try {
      Business.reportTraceLog({
        status102: '-1'
      })
    } catch (error) {
      console.error(error)
    }

    if (res && res.retCode && res.retCode != 2) {
      var _msg = "系统异常，请稍后再试 -505";

      that.modalConfirm(_msg, function () {
        that.backAction('from')
      });
      reportErrorLog({
        errorType: '30002',
        errorMessage: `支付服务请求响应失败:${res.retMsg}`,
        extendInfo: (res)
      })
    }
  },

  //支付提交返回
  paySubmitBack: async function (item) {
    Business.sendUbtTrace({
      type: 'chain',
      chainName: 'receive303',
      a: 'paywaySubmitModel success',
      c: 10023,
      dd: '303返回',
      token: item.tradeNo
    });
    hideLoading()
    if (item.paymentTraceId) {
      Util.setPaymentTraceId(item.paymentTraceId)
    } else {
      Util.clearPaymentTraceId()
    }
    // 遇到手续费，需要二次提交. alert提示用户
    if ([16, 63].includes(item.head.code)) {
      hideLoading()
      wx.showModal({
        confirmText: '确定',
        cancelText: '取消',
        content: item.head.message || '手续费提示，继续支付？',
        success: res => {
          if (res.confirm) {
            needSecond = true
            secondData = {
              status: '16'
            }
            this.showLoading('支付提交中...');
            this.requestSubmit()
          } else {
            this.backAction('rback', this.getBackParams());
          }
        }
      })
      return
    }
    openPaying();
    payResultOStore.set(item);
    item.rc = item.head.code;

    // 钱包支付:风控验证
    const {
      riskAndPwdInfos
    } = item
    try {
      if (item.rc == '66' && riskAndPwdInfos.find(i => i.verifyCodeType == 1) && Business.isPaynewPage()) {
        submitCallBack && submitCallBack(item);
        return
      }
    } catch (error) {
      Business.sendUbtTrace({
        type: 'error',
        a: 'risk-check-fail',
        c: 10024,
        dd: '钱包风控校验报错',
        res: JSON.stringify(res || '')
      });
    }

    // 支付前校验: 如果需要跳转的，直接跳转
    if (item.head.code > 100 && item.notifyOptType == 2) {
      this.doPrePay(item)
      return
    }

    let that = this;
    smsSubmitCallBack && smsSubmitCallBack()
    if ([24, 8].includes(item.head.code)) {
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'paySuccess',
        a: 'wx.requestpayment.success',
        c: 6010,
        dd: '服务返回成功code，提示后直接跳转'
      });
      that.modalConfirm(item.head.message || "订单已支付成功,请勿重复支付!", function () {
        that.backAction('sback', this.getBackParams())
      });
      return
    }
    if ([12].includes(item.head.code)) {
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'paySuccess',
        a: 'wx.requestpayment.success',
        c: 6010,
        dd: '服务返回成功code，直接跳转'
      });
      that.backAction('sback', this.getBackParams())
      return
    }
    // item.head.code = 203
    const res = await handleCheckBeforePay({
      res303: item,
      wx
    })
    // 要拦截
    if (!res.doNext) {
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'preCheckAbort',
        a: 'preCheck201',
        c: 6010,
        dd: '支付前校验拦截',
        result: res
      });
      hideLoading()
      // 201 刷新页面
      if (res.type === 'init') {
        Business.sendUbtTrace({
          type: 'chain',
          chainName: 'preCheck201',
          a: 'preCheck201',
          c: 6010,
          dd: '支付前校验——201'
        });
        // 直连：刷新页面
        initSettings.serverData.payToken = res.payToken
        if (isDirect) {
          this.init(initSettings, isDirect, initCallback)
        }
        // sdk： 回调 201 code
        else {
          this.backAction('eback', {
            code: 201,
            message: '变价，需要刷新价格'
          });
        }
      }
      // 202 硬拦截
      else if (res.type === 'back') {
        openPaying()
        this.backAction('eback', {
          code: 202,
          message: "支付拦截"
        });
      }
      // 203 软拦截 重新发起支付提交
      else if (res.type === 'notifyContinue') {
        notifyContinue = '1'
        this.requestSubmit()
      } else {
        openPaying()
        this.backAction('eback', {
          code: 200,
          message: '不支付'
        });
      }
      return
    }

    const onPaymentSubmitSuccess = function (result) {
      openSubmitting()
      openPaying();
      hideLoading();
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'paySuccess',
        a: 'wx.requestpayment.success',
        c: 6010,
        dd: '微信唤起之后支付成功',
        result
      });
      const REALNAMEURL = '/pages/pay/realname/index';
      let resultBackInfo = that.getBackParams();

      function successBack() {
        that.backAction('sback', resultBackInfo)
        Business.clearStore(); //清除缓存
      }

      // 如需引导实名，跳转至实名引导页
      if (that.isNeedRealName()) {
        Business.sendUbtTrace({
          type: 'chain',
          chainName: 'jumpRealName',
          a: 'wx.requestpayment.jumpRealName',
          c: 6010,
          dd: '引导实名',
          result
        });
        const url = Util.addParamToUrl(REALNAMEURL, {
          uid,
          realNamePath
        })
        console.log('url', url)
        cwx.navigateTo({
          url,
          events: {
            onRealnameBack: (e) => {
              console.log('onRealnameBack', e)
              setTimeout(() => {
                that.backAction('sback', resultBackInfo)
              }, 1000);
            }
          }
        })
      } else {
        successBack()
      }
    };

    if (!item.thirdPartyInfo) {
      const head = item.head || {}
      if (item.rc != 1000004) {
        reportErrorLog({
          errorType: '30009',
          errorMessage: item.rmsg || head.message || head.debugMessage || '没有下发签名',
          extendInfo: item
        })
      }
    }

    handleSubmitCallback({
      h5plat: Business.getH5Plat(),
      isNeedPushOrder: Business.addOrderRes && Business.addOrderRes.requireOrder,
      submitRes: item,
      success: onPaymentSubmitSuccess,
      fail: function (result) {
        openSubmitting()
        openPaying()
        smsSubmitCallBack && smsSubmitCallBack()
        hideLoading();
        Business.sendUbtTrace({
          a: 'wx.requestpayment.fail',
          c: 6011,
          dd: '微信唤起之后支付失败-start',
          d: JSON.stringify(result || '')
        });
        let resultMessage = item.head && item.head.message || '支付失败，请重试';
        let resultCode = result.resultCode;
        if (resultCode == 1001) {
          resultMessage = '支付取消'
        }
        if (hasWallet) {
          Business.sendUbtTrace({
            a: 'wallet_pay_fail_stay',
            c: 6011,
            dd: '使用钱包失败，停留在原地',
            result
          });
          that.modalConfirm(resultMessage);
          return
        }
        if (resultCode < 100) {
          if (resultCode == 1) {
            let resultBackInfo = that.getBackParams(4);
            that.modalConfirm(resultMessage || "系统异常，请稍后再试 -513", function () {
              that.backAction('eback', resultBackInfo);
            });
            return;
          } else if (resultCode == 66) {
            //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
            let msg = '支付提交失败，如有疑问，请联系携程客服：95010';
            that.modalConfirm(msg, function () {
              return that.backAction('eback', {
                msg
              });
            })
            return
          } else {
            that.modalConfirm(resultMessage || '系统异常，请稍后再试 -531');
            return;
          }
        } else if (resultCode > 100 && resultCode < 200) {
          let resultBackInfo = that.getBackParams(4);
          hideLoading();
          that.backAction('eback', resultBackInfo);
          return;
        } else if (resultCode == 3001) {
          let res = result.res;
          Business.sendUbtTrace({
            a: 'wx.requestpayment.fail',
            c: 6011,
            dd: '微信唤起之后支付失败',
            d: JSON.stringify(res || '')
          });

          if (res && res.errMsg) {
            if (res.errMsg.includes(':fail cancel')) {
              let resultBackInfo = that.getBackParams(3);
              that.backAction('rback', resultBackInfo)
            } else {
              let resultBackInfo = that.getBackParams(2);
              var msg = "系统异常，请至携程应用程序进行支付";

              that.modalConfirm(msg, function () {
                that.backAction('eback', {
                  result,
                  resultBackInfo
                })
              });

              Business.clearStore(); //清除缓存
            }
          }
        } else if (resultCode == 3002) {
          that.modalConfirm(resultMessage, function () {
            return that.backAction('eback', {
              msg: resultMessage
            });
          });
        } else if (resultCode == 1001) { // 支付取消逻辑
          // 有钱包的单子，取消后停留
          if (that.data.walletShowInfo) {
            Business.sendUbtTrace({
              a: 'cancel.with.wallet',
              c: 6011,
              dd: '有钱包的单子，取消后停留',
              result: result
            });
            wx.showToast({
              title: resultMessage,
              icon: 'none'
            })
          } else {
            // 没有钱包，取消走rback
            let resultBackInfo = that.getBackParams();
            that.backAction('rback', resultBackInfo);
          }

        } else {
          that.modalConfirm(resultMessage, function () {
            return that.backAction('eback', {
              msg: resultMessage
            });
          });
        }

      }
    });
  },
  //发送支付提交
  requestSubmit: function (params = {}) {
    // 提交防重
    if (isSubmitting && !(params && params.isSmsSubmit)) {
      Business.sendUbtTrace({
        a: 'v',
        c: 5003,
        dd: '支付提交重复发送',
        extend: params
      });
      return
    } else {
      isSubmitting = true
      setTimeout(() => {
        openSubmitting()
      }, 5000);
    }
    wx.showLoading({
      title: '支付提交中...',
    })
    var that = this;
    submitCallBack = params.submitCallBack
    smsSubmitCallBack = params.smsSubmitCallBack
    var onFail = function (res) {
      openSubmitting()
      openPaying()
      Util.clearPaymentTraceId()
      Business.sendUbtTrace({
        a: 'requestSubmitErr',
        c: 5003,
        dd: '301/303 失败的callback',
        d: JSON.stringify(res || '')
      });
      if (res && res.retCode && res.retCode != 2) {
        var _msg = "系统异常，请稍后再试 -512";
        that.modalConfirm(_msg, function () {
          return that.backAction('from');
        });
      }

    };

    var payData = that.data.payData; //SBU传入的数据
    var orderDetail = payData.orderDetail || {};
    const orderInfo = Business.getOrderInfos();

    var weicatPayData = that.data.weicat; //102服务下发的微信第三方支付数据
    var mktopenid = ''; //市场openid
    try {
      mktopenid = cwx.cwx_mkt.openid; //调用框架方法获取市场openid
    } catch (e) {
      Business.sendUbtTrace({
        type: 'error',
        a: 'getOpenidErr',
        dd: '获取市场openid失败！',
        extend: e
      });
    }

    //weichat pay
    if (weicatPayData) {
      if (!mktopenid) {
        try {
          Business.sendUbtTrace({
            a: 'requestSubmit',
            c: 20001,
            d: '_getMarketOpenIDHash',
            dd: '没有openid，尝试获取openid'
          });
          cwx.cwx_mkt._getMarketOpenIDHash(function () {
            console.log('_getMarketOpenIDHash openid = ', cwx.cwx_mkt.openid)
            if (cwx.cwx_mkt.openid) {
              Business.sendUbtTrace({
                a: 'requestSubmit',
                c: 20002,
                d: '_getMarketOpenIDHash',
                dd: '重试获取openid成功'
              });
              that.requestSubmit();
            } else {
              var msg = "系统异常，请稍后再试 -0010";
              reportErrorLog({
                errorType: '30010',
                errorMessage: '重试获取openid失败'
              })
              Business.sendUbtTrace({
                a: 'requestSubmit',
                c: 20003,
                d: '_getMarketOpenIDHash',
                dd: '重试获取openid失败'
              });
              that.modalConfirm(msg, function () {
                return that.backAction('from');
              });
              return;
            }
          })
        } catch (error) {
          reportErrorLog({
            errorType: '30011',
            errorMessage: '重试获取openid-catch',
            extendInfo: error
          })
          console.log(error)
        }
        return
      } else {
        Business.sendUbtTrace({
          a: 'openidScuess',
          c: 10012,
          dd: '验证市场openid成功！',
          d: ''
        });
      }

    }

    let extendJson = {
      "wechatOpenId": mktopenid,
      "thirdSubTypeID": 4
    };
    // 视频号参数
    if (Business.addOrderRes.requireOrder) {
      extendJson.IsNeedPushOrder = Business.addOrderRes.requireOrder
      extendJson.TraceId = Business.addOrderRes.traceId
      extendJson.RequiredFundType = Business.addOrderRes.requiredFundType
    }
    if (cwx.appId) {
      extendJson.extend = cwx.appId;
    }
    if (cwx.scene) {
      extendJson.wechatScene = cwx.scene;
    }

    let dataParam = {
      "payToken": orderDetail.payToken,
      "payTypes": [],
      paymentMethodInfo: {}
    }
    if (params.restAmount !== 0) { // 剩余金额不为零则加入微信方式
      dataParam = {
        "payToken": orderDetail.payToken,
        "payTypes": ["3"],
        "paymentMethodInfo": {
          "thirdPayInfos": [{
            "payAmount": params.restAmount || orderInfo.amount,
            "routerInfo": {
              "paymentWayToken": weicatPayData.paymentWayToken
            },
            "extend": JSON.stringify(extendJson)
          }]
        }
      };
    }
    // 如果有钱包，加入钱包方式
    if (params.walletInfos) {
      hasWallet = true
      dataParam.payTypes.push('1')
      dataParam.paymentMethodInfo.walletInfos = params.walletInfos
    } else {
      hasWallet = false
    }

    // 短信风控
    if (params.isSmsSubmit) {
      dataParam = {
        ...dataParam,
        ...params.riskParam
      }
    }

    // 203 软拦截： 需要加参数 notifyContinue、payNo
    if (notifyContinue) {
      const payresultInfo = payResultOStore.get() || {};
      dataParam.extend = JSON.stringify({
        notifyContinue: '1'
      })
      dataParam.payNo = payresultInfo.payNo
      notifyContinue = ''
    }
    try {
      Business.sendUbtTrace({
        type: 'chain',
        chainName: 'send303',
        a: 'paywaySubmitModel start',
        c: 10022,
        dd: '303请求开始',
        token: orderDetail.payToken,
        payWayBrandId: params.restAmount !== 0 ? that.data.weicat.brandId : '',
        payWayWallet: hasWallet ? '1' : '0'
      });
    } catch (error) {
      Business.sendUbtTrace({
        type: 'error',
        a: 'paywaySubmitModel error',
        c: 10022,
        dd: '303埋点发送失败',
        extend: error
      });
    }

    const extend = JSON.stringify({
      pageTraceId: getPageTraceId(),
      paymentTraceId: Util.getOrCreatePaymentTraceId()
    })
    paywaySubmitModel({
      data: dataParam,
      h5plat: Business.getH5Plat(),
      context: {
        cwx: cwx,
        env: __global.env,
        subEnv: 'fat18'
      },
      requestHead: {
        extend,
      },
      success: that.paySubmitBack.bind(that),
      fail: onFail.bind(that),
      complete: function (res) {
        var rmsg = res.errMsg || '';
        var _msg;
        if (rmsg.indexOf('request:fail timeout') > -1) {

          _msg = "网络不给力，请稍候重试 - 514";

          that.modalConfirm(_msg, function () {
            return that.backAction('from', {
              msg: _msg
            });
          });

          reportErrorLog({
            errorType: '30005',
            errorMessage: '303 request:fail timeout 超时'
          })
          return;
        }

        if (rmsg.indexOf('request:fail') > -1) {
          _msg = "网络不给力，请稍候重试 - 515";

          that.modalConfirm(_msg, function () {
            return that.backAction('from', {
              msg: _msg
            });
          });
          reportErrorLog({
            errorType: '30006',
            errorMessage: '303 request:fail 网络问题',
            extendInfo: (res)
          })
        }

      }
    }).excute();

  },


  //cardPay with API for backAction event
  backAction: async function (action, data = {}) {
    const that = this;
    const guarantedPage = that.guarantedPage;
    Business.sendUbtTrace({
      a: 'backAction-init',
      dd: '调用backAction方法',
      action,
      data
    });
    if (isUsingWallet) {
      Business.navBackToBU()
      Business.sendUbtTrace({
        a: 'navBackToBU',
        dd: '钱包isUsingWallet，回退到BU页面'
      });
    }
    setTimeout(() => {
      if (guarantedPage) {
        currentPage.navigateBack({
          type: action,
          data: data
        });
      } else {
        Business.sendUbtTrace({
          a: 'backAction-start',
          dd: 'backAction 开始判断type',
          extend: {
            ...that.settings,
            action
          }
        });
        if (action === 'sback') {
          if (typeof that.settings.sbackCallback === 'function') {
            return that.settings.sbackCallback(data);
          } else {
            directBack(action, data)
          }
        } else if (action === 'eback') {
          if (typeof that.settings.ebackCallback === 'function') {
            return that.settings.ebackCallback(data);
          } else {
            directBack(action, data)
          }
        } else if (action === 'rback') {
          if (typeof that.settings.rbackCallback === 'function') {
            return that.settings.rbackCallback(data);
          } else {
            directBack(action, data)
          }
        } else {
          if (typeof that.settings.fromCallback === 'function') {
            return that.settings.fromCallback({
              msg: data
            });
          } else {
            directBack(action, data)
          }
        }
      }
    }, 1000);
  },


  isNeedRealName() {
    const payResultData = payResultOStore.get()
    const {
      guideInfos = []
    } = payResultData;
    const hasGuide = guideInfos.find(i => i && i.realNameGuide && i.realNameGuide.realNameType === 4);
    try {
      realNamePath = `/${hasGuide.realNameGuide.nativeWechatUrl}`
    } catch (error) {
      realNamePath = '/pages/wallet/setrealname/index'
      Business.sendUbtTrace({
        a: 'getRealNamePathErr',
        dd: '获取实名路径失败',
        extend: error
      });
    }
    Business.sendUbtTrace({
      a: 'isNeedRealName',
      c: 2414,
      dd: '是否需要去引导实名认证',
      extend: {
        hasGuide: !!hasGuide,
      }
    });
    return hasGuide
  },
  doPrePay(res) {
    wx.showModal({
      title: '支付提示',
      content: res.head.message || '支付失败',
      confirmText: '确认',
      showCancel: false,
      success: () => {
        if (isDirect && res.confirmUrl) {
          cwx.component.cwebview({
            data: {
              url: encodeURIComponent(res.confirmUrl),
              needLogin: true,
              isNavigate: false
            }
          })
        } else {
          const resultBackInfo = this.getBackParams();
          this.backAction('eback', {
            ...resultBackInfo,
            code: 205,
            des: '支付前校验失败'
          });
        }
      }
    })
  }
};

function getUidFromPayway(res = {}) {
  const extend = res.extend || []
  const uidObj = extend.find(i => i.key === 'uid') || {}
  const uid = uidObj.value
  return uid
}
// 解除支付中状态
export function openPaying() {
  isPaying = false;
  timeLastCall = 0
  Business.sendUbtTrace({
    a: 'openPaying',
    c: 11022,
    dd: '放开 isPaying',
    isPrdTrace: '1'
  });
}

function openSubmitting() {
  isSubmitting = false
  hideLoading()
  Business.sendUbtTrace({
    a: 'openSubmitting',
    c: 11032,
    dd: '放开 isSubmitting'
  });
}

function getBindCardUrl() {
  const pathPrd = 'https://secure.ctrip.com/webapp/payment6/index2'
  const pathDev = 'https://secure.fat18.qa.nt.ctripcorp.com/webapp/payment6/index2'
  return __global.env == 'prd' ? pathPrd : pathDev
}

function hideLoading() {
  try {
    wx.hideToast();
    wx.hideLoading();
  } catch (err) {
    Business.sendUbtTrace({
      type: 'error',
      a: 'hideLoading',
      dd: 'hideLoading 失败',
      extend: err
    });
  }

  try {
    var res = wx.getSystemInfoSync(),
      sys = res.system || '';
    sys = sys.toLowerCase();
    if (sys.indexOf('ios') > -1) {
      wx.hideToast();
      wx.hideLoading();
      wx.hideToast();
      wx.hideLoading();
      wx.hideToast();
      wx.hideLoading();
      wx.hideToast();
      wx.hideLoading();
    }
  } catch (e) {
    console.error(e)
  }
}