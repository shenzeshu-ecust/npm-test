import Util from "../common/util"
import {
  PaymentWayModel,
  PayMentV3Model
} from '../models/models'
import _ from '../libs/lodash.core.min'
import Stores from '../models/stores'
import WeAPP_Business from '../common/business.js'

const OrderDetailStore = Stores.OrderDetailStore()
const PayWayStore = Stores.PayWayStore()
const paramStore = Stores.PayParamsStore()
const {reportErrorLog} = WeAPP_Business

module.exports.CPayPopbox = {
  init: function (settings, direct = false, callback) {
    var self = this;
    self.guarantedPage = false; //Guarantee to Hotel API Pay
    //初始化data
    self.data = {
      serverData: false, //serverData tag
      weicat: null, //微信支付102服务下发信息
      payData: {}, //保存SBU传递过来的参数
      unionData: null, //保存BU异步获取到的aid, sid
      isPayPlugin: false, //是否是小程序支付插件
      payPluginSback: null, //支付插件获取sign签名成功后执行的函数
      payPluginEback: null, //支付插件获取sign签名失败后执行的函数
      pluginEmsg: "" //支付插件错误提示信息
    };

    self.data.payData.payToken = Util.getParam('tradeNo', settings.data.payLink) || Util.getParam('payToken', settings.data.payLink)
    paramStore.setAttr('payToken', self.data.payData.payToken)
    if(!self.data.payData.payToken){
      reportErrorLog({
        errorType: '32001',
        errorMessage: 'payToken为空'
      })
    }
    OrderDetailStore.setAttr('auth', settings.data.auth)
    OrderDetailStore.setAttr('isDev', settings.isDev)

    //存储支付原始信息
    self.originalOrderDetailData = settings.data || {};
    self.settings = settings;
    self.isDebug = false; //开启调试日志

    if (_.isObject(callback) && callback.payPlugin) {
      self.data.isPayPlugin = true;
      self.data.payPluginSback = callback.successCallback;
      self.data.payPluginEback = callback.failCallback;
      self.settings.fromCallback = function (errMsg) {
        const errobj = {
          type: 1,
          errMsg: errMsg.msg,
          callback: "fromCallback",
          param: {}
        };
        self.data.payPluginEback(errobj);
      };
    }
    return self.getPaywayByServer(callback);
  },

  //错误提示框，点击按钮事件处理
  modalConfirm: function (str, callback) {
    var that = this;
    if (callback) {
      that.data.pluginEmsg = str;
      callback.call(that);
    } else {
      that.settings.fromCallback({
        msg: str
      });
    }
    return;
  },
  //获取公共完成Request参数
  getParames: function (parames) {
    var publicParames = {
      ...parames
    };
    return publicParames;
  },
  payWayComplete: function (res) {
    console.log('payWayComplete', res)
    paramStore.setAttr('get102End', new Date())
    const get102Spent = new Date() - new Date(paramStore.getAttr('get102Start'))
    console.log('get102Spent', get102Spent)
    paramStore.setAttr('get102Spent', get102Spent)
    res = res || {};
    var that = this;
    var rmsg = res.errMsg || "";
    var _msg;
    if (rmsg.indexOf("request:fail timeout") > -1) {
      _msg = "网络不给力，请稍候重试 - 521";

      reportErrorLog({
        errorType: '32008',
        errorMessage: '102超时',
        extendInfo: (res)
      })
      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === "function") {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });

      // that.modalConfirm("网络不给力，请稍候重试 - 521");
      return;
    }
    if (rmsg.indexOf("request:fail") > -1) {
      _msg = "网络不给力，请稍候重试 - 522";

      reportErrorLog({
        errorType: '32009',
        errorMessage: '102失败',
        extendInfo: (res)
      })
      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === "function") {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });
    }
  },
  //start server get data
  getPaywayByServer: function (callBack) {
    var that = this;
    var serverRequestData = {}
    serverRequestData.payToken = that.data.payData.payToken
    console.log('PaymentWayModel serverRequestData', serverRequestData)
    //Submit BU performance parameters and recommendation code and submit payment
    paramStore.setAttr('get102Start', new Date())
    PaymentWayModel({
      data: serverRequestData,
      success: function (res) {
        console.log('PaymentWayModel res', res)
        if (res.retCode == 0 && res.head.code === 100000) {
          const resInfo = res || "{}";
          that.clientCheckData = res;
          PayWayStore.set(res)
          that.requestSubmit();
          return
          // return callBack(resInfo);
        }
        //errno:1:服务端错误即原errorInformation， res; 2:解析错误

        var _msg = res.rmsg || "系统异常，请稍后再试 -5121-2";

        reportErrorLog({
          errorType: '32003',
          errorMessage: '102服务返回值错误，非100000',
          extendInfo: (res)
        })
        that.modalConfirm(_msg, function () {
          if (typeof that.settings.fromCallback === "function") {
            return that.settings.fromCallback.call(that, {
              msg: _msg
            });
          }
        });
      },
      fail: that.failFn.bind(that),
      complete: that.payWayComplete.bind(that)
    }).excute();
  },
  // 102网络请求失败提示信息
  failFn: function (res) {
    console.log('fail', res)
    var that = this;

    if (res && res.retCode && res.retCode != 2) {
      var _msg = "系统异常，请稍后再试 -505" + JSON.stringify(res);

      reportErrorLog({
        errorType: '32002',
        errorMessage: `102失败, ${res.retCode}`,
        extendInfo: (res)
      })
      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === "function") {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });
      // this.modalConfirm("系统异常，请稍后再试 -505");
    }
  },

  //支付提交返回
  paySubmitBack: function (item) {
    const that = this;
    let rmsg = item.retMsg || '';
    if (!item.head || item.head.code !== 100000) {
      //errno:1:服务端错误即原errorInformation， res; 2:解析错误
      that.data.payPluginEback({
        type: 1,
        errMsg: (item.head && item.head.debugMessage) || rmsg,
        callback: "ebackCallback"
      });
      return;
    }

    if(!item.thirdPartyInfo){
      rmsg = '系统异常，请稍后再试 -5025'
      reportErrorLog({
        errorType: '32011',
        errorMessage: `303没有支付信息`,
        extendInfo: (item)
      })
      that.modalConfirm(rmsg, ()=>{
        that.data.payPluginEback({
          type: 1,
          errMsg: rmsg,
          callback: "ebackCallback"
        });
      })
      return;
    }

    try {
      paramStore.setAttr('get303End', new Date())
      const get303Spent = new Date() - new Date(paramStore.getAttr('get303Start'))
      console.log('get303Spent', get303Spent)
      paramStore.setAttr('get303Spent', get303Spent)
    } catch (error) {
      console.log(error)
    }
    if (that.data.isPayPlugin && that.data.payPluginSback) {
      return that.data.payPluginSback(item);
    }
  },
  //发送支付提交
  requestSubmit: function (cardParams) {
    const that = this;

    const resInfo = PayWayStore.get() || {}
    const {
        payCatalogInfo,
        orderInfo
    } = resInfo;

    const { thirdPartyList } = payCatalogInfo;

    if (_.isArray(thirdPartyList) && thirdPartyList.length > 0) {
        _.forEach(thirdPartyList, function(item, key) {
            if ((item.brandId == "WEAPP" || item.brandId == "OGP_WEAPP" || item.brandId == 'WechatScanCode')) {
                //更新数据
                that.data.weicat = item;
            }
        })
    }

    const weicatPayData = that.data.weicat

    // 303 网络失败方法
    const onFail = function (res) {
      if (res && res.retCode && res.retCode != 2) {
        var _msg = "系统异常，请稍后再试 -512";

        reportErrorLog({
          errorType: '32007',
          errorMessage: '303 失败 onFail',
          extendInfo: (res)
        })
        if (typeof that.settings.fromCallback === "function") {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      }
    };
    console.log('wechatCode', that.settings.code)
    let extendJson = {
      "wechatCode": that.settings.code,
      "thirdSubTypeID": 4,
      extend: 'wx0e6ed4f51db9d078'
  };

    let dataParam = {
      "payToken": that.data.payData.payToken,
      "payTypes": ["3"],
      "paymentMethodInfo": {
          "thirdPayInfos": [{
              "payAmount": orderInfo.orderAmount,
              "routerInfo": {
                  "paymentWayToken": weicatPayData.paymentWayToken
              },
              "extend": JSON.stringify(extendJson)
          }]
      },
  };

    paramStore.setAttr('get303Start', new Date())

    PayMentV3Model({
      data: that.getParames(dataParam),
      success: that.paySubmitBack.bind(that),
      fail: onFail.bind(that),
      complete: function (res) {
        var rmsg = res.errMsg || "";
        var _msg;
        if (rmsg.indexOf("request:fail timeout") > -1) {
          _msg = "网络不给力，请稍候重试 - 514";
          reportErrorLog({
            errorType: '32005',
            errorMessage: '303 request:fail timeout 超时'
          })
          that.modalConfirm(_msg, function () {
            if (typeof that.settings.fromCallback === "function") {
              return that.settings.fromCallback.call(that, {
                msg: _msg
              });
            }
          });
          return;
        }

        if (rmsg.indexOf("request:fail") > -1) {
          _msg = "网络不给力，请稍候重试 - 515";

          reportErrorLog({
            errorType: '32006',
            errorMessage: '303 request:fail 网络问题',
            extendInfo: (res)
          })
          that.modalConfirm(_msg, function () {
            if (typeof that.settings.fromCallback === "function") {
              return that.settings.fromCallback.call(that, {
                msg: _msg
              });
            }
          });
        }
      }
    }).excute();
  }
};