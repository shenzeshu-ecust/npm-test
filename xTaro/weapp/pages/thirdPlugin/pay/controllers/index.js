import {
  cwx,
  _
} from '../../../../cwx/cwx.js';
import __global from '../../../../cwx/ext/global.js';

var WeAPP_models = require('../models/models.js');
var WeAPP_paymentWayModel = WeAPP_models.PaymentWayModel;
var WeAPP_paymentWayServerModel = WeAPP_models.PaymentWayServerModel;
var WeAPP_payemnetCardBinQuery = WeAPP_models.CardBinQuery;

var WeAPP_Business = require('../common/business.js');
var WeAPP_paymentStore = require('../../paynew/models/stores.js');
var WeAPP_orderDetailStore = WeAPP_paymentStore.OrderDetailStore();
var WeAPP_extendDataStore = WeAPP_paymentStore.OrderDetailExtendStore();
var WeAPP_payResultOStore = WeAPP_paymentStore.PayResultOrderStore();
var WeAPP_realNameStore = WeAPP_paymentStore.RealNameStore();
var WeAPP_GD = require('../components/getdata.js');
var WeAPP_GDDirect = require('../components/getdatadirect.js');

import mainBusiness from '../../paynew/controllers/index.js';
import * as mdBusiness from '../../paynew/common/combus';

module.exports.CPayPopbox = {
  init: function (settings, direct = false, callback) {
    // AB切量实验
    try {
      WeAPP_Business.sendUbtTrace({
        a: 'cpay.init',
        c: 9001,
        d: 'CPayPopbox init',
        dd: '支付初始化，准备切量' + JSON.stringify(settings)
      });
    } catch (e) {};

    const data = settings.serverData || settings.data
    const payToken = data.payToken
    // 走中台支付
    if(this.checkIsNewToken(payToken)){
      const payLink = `/pages/paynew/directpay/index?tradeNo=${payToken}`
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'cpay.init',
          c: 9002,
          d: 'CPayPopbox is direct:' + direct,
          dd: '走中台， payLink：' + payLink,
        });
      } catch (e) {};
      if (direct) {
        wx.redirectTo({
          url: payLink,
        })
      } else {
        settings.serverData = settings.serverData || {}
        settings.serverData.payLink = payLink
        mdBusiness.clearStore();
        mainBusiness.init(settings);
      }
    }else{
      // 走老支付
      this.doPay(settings, direct, callback)
    }

  },

  checkIsNewToken(payToken){
    return /TP/.test(payToken)
  },

  doPay(settings, direct = false, callback) {
    mdBusiness.initFullChain('pre_payment')
    mdBusiness.sendUbt({
      type: 'warning',
      warningCode: 'old_pre_pay',
      level: 'p2',
      desc: '小程序老支付',
      devOriKey: `warning_old_pay`,
      extend: settings,
      direct
    })
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
      pluginEmsg: '' //支付插件错误提示信息
    };
    self.showLoading('支付连接中..');
    try {
      WeAPP_Business.sendUbtTrace({
        a: 'cpay.init',
        c: 1000,
        d: 'cpayinit',
        dd: '支付初始化'
      });
    } catch (e) {};

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
          callback: 'fromCallback',
          param: {}
        }
        self.data.payPluginEback(errobj);
      }
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'payPlugin',
          c: 2000,
          d: 'payPlugin/init',
          dd: '初始化支付插件数据'
        });
      } catch (e) {};
    }

    //server data
    if (_.isObject(settings.serverData)) {
      self.data.serverData = true;
      self.getPaywayByServer(function (resPayInfos) {
        self.showLoading('服务获取中..');
        self.originalOrderDetailData = WeAPP_GD.buildServerData.call(self, resPayInfos);
        return self.defaultBusData(direct, callback, resPayInfos);
      })
    } else {
      return self.defaultBusData(direct, callback);
    }
  },


  //Default BU pass-through process
  defaultBusData: function (direct, callback, resPayInfos) {
    var self = this;
    if (direct) {
      //验证SBU传递过来的参数是否正确
      WeAPP_GDDirect.getData.call(self, function ({
        unifiedData,
        guaranteeHotel
      }) {
        //获取BU业绩参数和推荐码后提交支付
        self.getUnion();
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'getpaywaystart',
            c: 2000,
            d: 'getdataCallback/getPaywayStart',
            dd: '解析BU参数完成，并102开始请求'
          });
        } catch (e) {};
        if (unifiedData) {
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'getunipaywayok',
              c: 2001,
              d: 'getunipaywayokCallback',
              dd: '3110102请求结束，执行回调'
            });
          } catch (e) {};
          const resCtrlData = {
            callback,
            direct,
            guaranteeHotel,
            resInfo: resPayInfos
          };
          self.hideLoading();
          self.payWayCtrl(resCtrlData);
        } else {
          //验证成功后，发送102服务
          self.getPayway(function (item) {
            try {
              WeAPP_Business.sendUbtTrace({
                a: 'getpaywayok',
                c: 2001,
                d: 'getPaywayCallback',
                dd: '102请求结束，执行回调'
              });
            } catch (e) {};
            self.hideLoading();
            return callback(item);
          }, direct);
        }
      }, direct);
    } else {
      //验证SBU传递过来的参数是否正确
      WeAPP_GD.getData.call(self, function ({
        unifiedData,
        guaranteeHotel
      }) {
        //获取BU业绩参数和推荐码后提交支付
        self.getUnion();
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'getpaywaystart',
            c: 2000,
            d: 'getdataCallback/getPaywayStart',
            dd: '解析BU参数完成，并102开始请求'
          });
        } catch (e) {};

        if (unifiedData) {
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'getunipaywayok',
              c: 2001,
              d: 'getunipaywayokCallback/requestSubmitStart',
              dd: '3110102请求结束，同时支付提交开始'
            });
          } catch (e) {};
          const resCtrlData = {
            callback,
            direct,
            guaranteeHotel,
            resInfo: resPayInfos
          };
          const payWayResult = self.payWayCtrl(resCtrlData);
          if (payWayResult && payWayResult.autoPay) {
            self.showLoading('支付提交中...');
            self.requestSubmit();
          }
        } else {
          //验证成功后，发送102服务
          self.getPayway(function () {
            try {
              WeAPP_Business.sendUbtTrace({
                a: 'getpaywayok',
                c: 2001,
                d: 'getPaywayCallback/requestSubmitStart',
                dd: '102请求结束，同时支付提交开始'
              });
            } catch (e) {};
            self.showLoading('支付提交中...');
            self.requestSubmit();
          });
        }
      });
    }
  },

  //错误提示框，点击按钮事件处理
  modalConfirm: function (str, callback) {
    var that = this;
    that.hideLoading();
    if (that.data.isPayPlugin) {
      if (callback) {
        that.data.pluginEmsg = str;
        callback.call(that);
      } else {
        that.settings.fromCallback({
          msg: str
        })
      }
      return;
    }
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
  hideLoading: function () {
    try {
      wx.hideToast();
      wx.hideLoading();
    } catch (err) {}

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
    } catch (e) {}
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
    var that = this;
    var icon = icon || 'success',
      str = str || '网络不给力，请稍候重试',
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
  getBackParams: function (rc, status) {
    var orderinfo = WeAPP_orderDetailStore.get() || {};
    var payresultInfo = WeAPP_payResultOStore.get() || {};
    var param = {
      orderID: orderinfo.oid || '',
      externalNo: orderinfo.extno || '',
      billNo: orderinfo.bilno || '',
      payType: payresultInfo.realpaytype || '',
      busType: orderinfo.bustype || '',
      price: orderinfo.totalamount || ''
    };

    if (typeof status !== 'undefined') {
      param.Status = status;
    }

    if (payresultInfo.realoid) {
      param.orderID = payresultInfo.realoid;
    }

    if (rc == 2) {
      delete param.payType;
      param.ErrorCode = 888;
      param.ErrorMessage = '';
    } else if (rc == 4) {
      delete param.payType;
      param.ErrorCode = orderinfo.ErrorCode;
      param.ErrorMessage = orderinfo.ErrorMessage;
    } else if (rc == 3) {
      delete param.payType;
    }
    return param;
  },
  //获取公共完成Request参数
  getParames: function (parames) {
    var that = this;
    var payData = that.originalOrderDetailData;
    var thatData = that.data.payData;
    var extParam = thatData.extParam || {};
    var thatPayToken = that.data.payToken;
    var unionData = that.data.unionData || {}; //BU商户aid,sid数据
    var oneselfInfos = extParam.accountinfo;
    //解析封装白名单 变量定义
    var payrestrict = {},
      tempArray = [],
      tempList = [],
      i = 0,
      len = 0;

    var publicParames = {
      "clienttoken": payData.token || '',
      "clientextend": payData.extend || '',
      "clientsign": payData.sign || '',
      "subpay": 0
    };

    if (thatPayToken) {
      publicParames.paytoken = thatPayToken;
    }

    var insuranceinfos = extParam.insuranceinfos || [];

    try {
      //解析封装白名单 向服务端传递
      if (extParam.payTypeList) {
        payrestrict.paytypelist = extParam.payTypeList;
      }
      if (extParam.subPayTypeList) {
        payrestrict.subpaytypelist = extParam.subPayTypeList;
      }
      //支付白名单
      if (extParam.payWayWhiteList) {
        tempList = extParam.payWayWhiteList.split(',');
        len = tempList.length;
        for (; i < len; i++) {
          tempArray.push({
            "whiteid": tempList[i]
          });
        }
        payrestrict.whitelist = tempArray;
      }
      //支付黑名单
      if (extParam.PayWayBlackList) {
        tempArray = [];
        tempList = extParam.PayWayBlackList.split(',');
        i = 0;
        len = tempList.length;
        for (; i < len; i++) {
          tempArray.push({
            "blackid": tempList[i]
          });
        }
        payrestrict.blacklist = tempArray;
      }

      publicParames.payrestrict = payrestrict;
      //解析封装白名单 End

      //保险分帐
      if (_.isArray(insuranceinfos) && insuranceinfos.length > 0) {
        publicParames.insinfos = [];
        _.each(insuranceinfos, function (obj) {
          //设置默认值
          if ((!obj.currency) || (typeof obj.currency == "string" && obj.currency.toLowerCase() == "rmb")) {
            obj.currency = "CNY";
          }
          publicParames.insinfos.push({
            "insamount": obj.amount || 0,
            "inscurrency": obj.currency,
            "provider": obj.provider
          });
        })
      }

      //本人帐户
      if (oneselfInfos) {
        const {
          name,
          idcardtype,
          idcardnumber
        } = oneselfInfos;
        publicParames.myaccountinfo = {
          "name": name,
          "idtype": idcardtype,
          "idnumber": idcardnumber
        }
      }

      for (var attr in parames) {
        publicParames[attr] = parames[attr];
      }

      //验证BU商户aid, sid
      if (_.isObject(unionData)) {
        if (!publicParames.sourceinfo) {
          publicParames.sourceinfo = {};
        }

        if (unionData.allianceid) {
          publicParames.sourceinfo.allianceid = unionData.allianceid
        }

        if (unionData.sid) {
          publicParames.sourceinfo.sid = unionData.sid
        }
      }
      if (that.data.isPayPlugin) {
        publicParames.h5plat = 7; //支付插件平台号为 7
      }
    } catch (e) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'getdataerr',
          c: 1006,
          dd: '获取公共完成Request参数，getParams',
          d: e
        });
      } catch (e) {};
    }
    return publicParames;
  },
  payWayComplete: function (res) {
    res = res || {};
    var that = this;
    var rmsg = res.errMsg || '';
    var _msg;
    if (rmsg.indexOf('request:fail timeout') > -1) {

      _msg = "网络不给力，请稍候重试 - 521";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });

      // that.modalConfirm("网络不给力，请稍候重试 - 521");
      return;
    }
    if (rmsg.indexOf('request:fail') > -1) {

      _msg = "网络不给力，请稍候重试 - 522";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
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
    var serverRequestData = WeAPP_GD.getServerData.call(that, that.settings.serverData);
    if (!serverRequestData) {
      return;
    }
    serverRequestData.clientinfo = {
      "extendbitmap": 64
    }

    if (that.data.isPayPlugin) {
      serverRequestData.h5plat = 7; //支付插件平台号为 7
    }
    serverRequestData.clientCheckIdStr = serverRequestData.paytoken;
    serverRequestData.isUnifiedPay = true;
    //Submit BU performance parameters and recommendation code and submit payment
    WeAPP_paymentWayServerModel({
      data: serverRequestData,
      success: function (res) {

        if (res.rc == 1) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
          try {
            WeAPP_Business.exceptionInfoCollect({
              bustype: 4,
              excode: 'c_e_c03',
              extype: 1,
              exdesc: '102 服务返回RC=1错误, ' + JSON.stringify(res)
            });
            WeAPP_Business.sendUbtTrace({
              a: 'getPaywayByServer',
              c: 2011,
              dd: '102 success callback rc=1',
              d: JSON.stringify(res)
            });
          } catch (e) {};

          var _msg = res.rmsg || "系统异常，请稍后再试 -5121-2";

          that.modalConfirm(_msg, function () {
            if (typeof that.settings.fromCallback === 'function') {
              return that.settings.fromCallback.call(that, {
                msg: _msg
              });
            }
          });
          return;
        }

        //rc=0 request success
        if (res.rc == 0) {
          const resInfo = res.resinfo101 || '{}';
          that.clientCheckData = res.clientCheckData;
          return callBack(resInfo);
        }
      },
      fail: that.failFn.bind(that),
      complete: that.payWayComplete.bind(that)
    }).excute();
  },
  payWayCtrl: function (responseData = {}) {
    const that = this;
    try {
      const {
        callback = () => {},
          direct,
          resInfo,
          guaranteeHotel
      } = responseData;

      const {
        cards,
        paytype,
        thirdpartylist
      } = resInfo;

      const cardPayDatas = {
        guaranted: false,
        cards: []
      };

      //add guarantee to Hotel
      if (guaranteeHotel === 2) {
        WeAPP_orderDetailStore.setAttr("payType", 2);
        if (cards.length > 0) {
          cardPayDatas.cardLimit = true;
          const tmpCardObj = {};
          _.map(cards, function (card, key) {
            const cardStat = card.status;
            const cardTypeid = card.typeid;
            const cardPolicy = card.policy;
            const passPolicy = cardPolicy - 128;
            const tmpCard = tmpCardObj[cardTypeid];
            //new card and Wild card
            if ((cardStat & 0) === 0 && (cardStat & 2) === 2) {
              //Channel not maintenance
              if ((cardStat & 2048) !== 2048 && (67 & passPolicy) === passPolicy) {
                if (tmpCard !== 1) {
                  cardPayDatas.guaranted = true;
                  tmpCardObj[cardTypeid] = 1;
                  cardPayDatas.cards.push(card);
                }
              }
            }
          });
        } else if ((paytype & 2) === 2) {
          cardPayDatas.guaranted = true;
          cardPayDatas.cardLimit = false;
          cardPayDatas.cards.push({
            typename: "",
            typeid: 5600000
          })
        }

        if (cardPayDatas.guaranted) {
          //直连操作
          if (direct) {
            return callback(cardPayDatas);
          } else {
            that.guarantedPage = true;
            const currentPage = cwx.getCurrentPage();
            currentPage.navigateTo({
              url: '/pages/pay/directpay/index',
              data: cardPayDatas,
              callback: function (json) {
                if (json && json.type) {
                  switch (json.type) {
                    case 'sback':
                      that.settings.sbackCallback(json.data);
                      break;
                    case 'rback':
                      if (_.isFunction(that.settings.rbackCallback)) {
                        that.settings.rbackCallback(json.data);
                      }
                      break;
                    case 'eback':
                      that.settings.ebackCallback(json.data);
                      break;
                    default:
                      that.settings.fromCallback();
                  }
                }
              },
              success: function () {

              },
              fail: function (err) {
                WeAPP_Business.sendUbtTrace({
                  a: 'navigateToStart',
                  c: 10000,
                  dd: 'navigateToStart fail',
                  d: '跳转支付面页失败 ERROR: ' + JSON.stringify(err || '')
                });
              },
              complete: function () {

              }
            });
          }
          return;
        }
      } else {
        WeAPP_orderDetailStore.setAttr("payType", 4);
        if (_.isArray(thirdpartylist) && thirdpartylist.length > 0) {
          _.map(thirdpartylist, function (item, key) {
            const thStat = item.thirdstatus && (item.thirdstatus & 4);
            if ((item.paymentwayid == "WechatScanCode" || item.paymentwayid == "OGP_WechatScanCode") && !thStat) {
              //更新数据
              that.data.weicat = item;

              try {
                WeAPP_Business.sendUbtTrace({
                  a: 'getpaywaywechat',
                  c: 2005,
                  dd: '102 callback判断是否有微信支付',
                  d: JSON.stringify(thirdpartylist)
                });
              } catch (e) {};

            }
          })
        }
      }

      //直连操作
      if (direct) {
        return callback(that.data.weicat);
      }

      //服务没有下发第三方微信支付显示提示信息内容
      if (!that.data.weicat || !that.data.weicat.paymentwayid) {

        try {
          WeAPP_Business.sendUbtTrace({
            a: 'getpaywaywechat',
            c: 2009,
            dd: '102 没有下发微信支付方式',
            d: JSON.stringify(thirdpays)
          });
        } catch (e) {};

        try {
          WeAPP_Business.exceptionInfoCollect({
            bustype: 4,
            excode: 'c_e_c03',
            extype: 1,
            exdesc: '102 服务没有下发任何支付方式, ' + JSON.stringify(thirdpays)
          });
        } catch (e) {}

        var _msg = "无法支付，请至携程应用程序进行支付";

        that.modalConfirm(_msg, function () {
          if (typeof that.settings.fromCallback === 'function') {
            return that.settings.fromCallback.call(that, {
              msg: _msg
            });
          }
        });
        return;
      } else {
        if (_.isFunction(callback)) {
          callback();
        }
        return {
          autoPay: true
        };
      }

    } catch (err) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'getthirdpartylistErr',
          c: 2006,
          dd: '102model 报错',
          d: '' + err
        });
        WeAPP_Business.exceptionInfoCollect({
          bustype: 4,
          excode: 'c_e_c03',
          extype: 1,
          exdesc: '102model 报错, ' + err
        });
      } catch (e) {}

      var _msg = "系统异常，请稍后再试 -520";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });
    }
  },
  //发起102服务请求
  getPayway: function (callback, direct) {
    var that = this;
    var thatData = that.data.payData;
    var orderdetail = thatData.orderDetail || {},
      extParam = thatData.extParam || {};
    var guaranteeHotel = 0;
    var params = {};
    var clientCheckIdStr = orderdetail.requestid + '|' + orderdetail.oid;


    try {
      params = {
        "reqpayInfo": {
          "requestid": orderdetail.requestid,
          "paytype": 1, //默认支付
          "payee": 1, //默认到携程 支付类型
          "paybitmap": 0
        },
        "oinfo": {
          "bustype": orderdetail.bustype,
          "oid": orderdetail.oid,
          "odesc": orderdetail.title,
          "currency": orderdetail.currency,
          "oamount": orderdetail.amount
        },
        "extendinfo": {
          "extendbitmap": 64
        }
      };

      params.PayOrderInfo = WeAPP_GD.setServerData({
        orderDetail: orderdetail,
        extParam: extParam
      });

      //是否担保
      if (extParam.useEType == 2) {
        guaranteeHotel = guaranteeHotel + 1;
        params.reqpayInfo.paytype = 2;
      }

      //是否预授权
      if (extParam.IsNeedPreAuth) {
        params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 4;
      }

      //区分先付 后付  Native传了  H5没传 先按照先付流程
      params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 8;

      //支付类型
      if (extParam.subPayType == 1) {
        guaranteeHotel = guaranteeHotel + 1;
        params.reqpayInfo.payee = 2;
      } else if (extParam.subPayType == 2) {
        params.reqpayInfo.payee = 3;
      }

      //微信小程序BU APPID
      if (cwx.appId) {
        params.extend = cwx.appId;
      }


    } catch (e) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'getparamserr',
          c: 2004,
          dd: '102请求拼参数异常',
          d: '' + e
        });
      } catch (e) {};

      try {
        WeAPP_Business.exceptionInfoCollect({
          bustype: 4,
          excode: 'c_e_c03',
          extype: 1,
          exdesc: '102 拼ajax 参数错误，错误信息: ' + e
        });
      } catch (e) {}

      var _msg = "系统异常，请稍后再试 -561";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });
      return;
    }

    try {
      var _data = that.getParames(params) || {};

      try {
        if (_.isObject(_data)) {
          _data.deviceinfo = {
            devmod: cwx.payment.timeStamp + ''
          };
        }
      } catch (e) {}

      _data.clientCheckIdStr = clientCheckIdStr;


      WeAPP_paymentWayModel({
        data: _data,
        success: function (res) {

          if (res.rc == 1) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
            try {
              WeAPP_Business.exceptionInfoCollect({
                bustype: 4,
                excode: 'c_e_c03',
                extype: 1,
                exdesc: '102 服务返回RC=1错误, ' + JSON.stringify(res)
              });
              WeAPP_Business.sendUbtTrace({
                a: 'paymentWayModel',
                c: 2011,
                dd: '102 success callback rc=1',
                d: JSON.stringify(res)
              });
            } catch (e) {};

            var _msg = res.rmsg || "系统异常，请稍后再试 -5121";

            that.modalConfirm(_msg, function () {
              if (typeof that.settings.fromCallback === 'function') {
                return that.settings.fromCallback.call(that, {
                  msg: _msg
                });
              }
            });
            return;
          }

          const resInfoData = res.resinfo101 || {};
          const resCtrlData = {
            callback,
            direct,
            guaranteeHotel,
            resInfo: resInfoData
          };
          that.clientCheckData = res.clientCheckData;
          return that.payWayCtrl(resCtrlData);
        },
        fail: that.failFn.bind(that),
        complete: that.payWayComplete.bind(that)
      }).excute();
    } catch (err) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'getparamrequest',
          c: 2008,
          dd: '102 request 错误',
          d: '' + err
        });
        WeAPP_Business.exceptionInfoCollect({
          bustype: 4,
          excode: 'c_e_c03',
          extype: 1,
          exdesc: '102 request 错误, ' + err
        });
      } catch (e) {};

      var _msg = "系统异常，请稍后再试 -550";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });

      return;

      // that.modalConfirm("系统异常，请稍后再试 -550");
    }


  },
  //获取BU业绩参数和推荐码(aid,sid)
  getUnion: function () {
    var that = this;
    try {
      var payData = that.data.payData; //SBU传入的数据
      var orderDetail = payData.orderDetail || {};
      cwx.mkt.getUnion(function (unionData) {
        that.data.unionData = unionData;
      }, orderDetail.bustype, orderDetail.oid);
    } catch (e) {
      //记录获取BU aid sid函数错误信息
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'mkt.getUnion  error',
          c: 3010,
          d: '' + e
        });
      } catch (e) {};

    }

  },
  //网络请求失败提示信息
  failFn: function (res) {
    var that = this;
    try {
      WeAPP_Business.sendUbtTrace({
        a: 'requestfail',
        c: 3003,
        d: JSON.stringify(res || '')
      });
    } catch (e) {};

    if (res && res.retCode && res.retCode != 2) {
      var _msg = "系统异常，请稍后再试 -505";

      that.modalConfirm(_msg, function () {
        if (typeof that.settings.fromCallback === 'function') {
          return that.settings.fromCallback.call(that, {
            msg: _msg
          });
        }
      });

      // this.modalConfirm("系统异常，请稍后再试 -505");
    }
  },
  //微信支付调起
  weicatPay: function (param) {
    const that = this;
    const sign = param.thirdpartyinfo && param.thirdpartyinfo.sig || '{}';
    const currentPage = cwx.getCurrentPage();
    const uid = param.userid || '';
    const streamContrBit = param.streamcontrbit || 0; //是否需要去引导实名认证
    const realNamePath = '/' + param.nativewechaturl; //实名认证引导聚合页
    const REALNAMEURL = '/pages/pay/realname/index';
    let interval = param.realnameguideinterval || 0;

    const successFn = function (res) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'wx.requestpayment.success',
          c: 6010,
          dd: '微信唤起之后支付成功',
          d: JSON.stringify(res || '')
        });
      } catch (e) {}

      const resultBackInfo = that.getBackParams();
      const sbackFun = that.settings.sbackCallback;
      const realNameVal = WeAPP_realNameStore.get();
      const uidNamed = 'realNamed_' + uid;
      const realNamed = WeAPP_realNameStore.getAttr(uidNamed);
      const hasRealNamed = streamContrBit & 2; //是否实名总开关


      const realNamedTime = realNameVal[uid];
      const cDate = +new Date();
      const realNamedTimeInt = cDate - realNamedTime;

      interval = parseInt(interval, 10) * 1000;

      WeAPP_payResultOStore.setAttr('requestid', WeAPP_orderDetailStore.getAttr("requestid"));

      if (that.isDebug) {
        console.log('++++++++++++++++++++++++++++++sbackcomplete start++++++++++++++++++++++++++++++++++++++++');
        console.log("BU 传入的sbackCallback:" + sbackFun);
        console.log("微信返回res: " + JSON.stringify(res));
        console.log('++++++++++++++++++++++++++++++sbackcomplete end++++++++++++++++++++++++++++++++++++++++');
      }

      if (hasRealNamed !== 2) {
        if (_.isFunction(sbackFun)) {
          return sbackFun.call(that, resultBackInfo)
        }
        WeAPP_Business.sendUbtTrace({
          a: 'hasRealName',
          c: 3003,
          d: '服务下发不进行用户实名认证操作 hasRealNamed值为: ' + streamContrBit
        });
        WeAPP_Business.clearStore(); //清除缓存
      } else {
        if (realNamed) {
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'hasRealNamed',
              c: 3003,
              d: '服务下发进行用户实名认证操作'
            });
          } catch (e) {}

          if (realNamedTimeInt <= interval) {
            if (_.isFunction(sbackFun)) {
              sbackFun.call(that, resultBackInfo);
            }
            WeAPP_Business.sendUbtTrace({
              a: 'realNameGuideInterval',
              c: 3003,
              d: '服务下发免打扰时间未到期'
            });
            WeAPP_Business.clearStore(); //清除缓存
            return;
          }
        }

        cwx.__skipCallback = true; //还原微信支付成功后影响的生命周期

        currentPage.navigateTo({
          url: REALNAMEURL,
          data: {
            uid: uid,
            realNamePath: realNamePath
          },
          callback: function (json) {
            if (json && json.type) {
              switch (json.type) {
                case 'sback':
                  if (_.isFunction(sbackFun)) {
                    sbackFun(resultBackInfo);
                  }
                  break;
                default:
                  if (_.isFunction(sbackFun)) {
                    sbackFun(resultBackInfo);
                  }
              }
            }
          },

          success: function () {
            WeAPP_realNameStore.setAttr(uidNamed, 1);
            WeAPP_Business.sendUbtTrace({
              a: 'hasRealNameNavigate',
              c: 3003,
              d: '跳转到用户实名引导页成功'
            });
          },
          fail: function () {
            WeAPP_Business.sendUbtTrace({
              a: 'hasRealNameNavigate',
              c: 3003,
              d: '跳转到用户实名引导页失败'
            });
          },
          complete: function () {

          }
        });
      }
    }

    const failFn = function (res) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'wx.requestpayment.fail',
          c: 6011,
          dd: '微信唤起之后支付失败',
          d: JSON.stringify(res || '')
        });
      } catch (e) {}

      if (res && res.errMsg) {
        if (res.errMsg.includes(':fail cancel')) {
          var resultBackInfo = that.getBackParams(3);
          if (typeof that.settings.rbackCallback === 'function') {
            //setTimeout(function(){
            that.settings.rbackCallback.call(that, resultBackInfo);
            //}, 10);
          }

        } else {
          var resultBackInfo = that.getBackParams(2);
          var _msg = "系统异常，请至携程应用程序进行支付";

          that.modalConfirm(_msg, function () {
            if (typeof that.settings.ebackCallback === 'function') {
              return that.settings.ebackCallback.call(that, resultBackInfo)
            }
          });


          try {
            var payData = that.originalOrderDetailData;
            WeAPP_Business.exceptionInfoCollect({
              bustype: 4,
              excode: "c_e_c03",
              extype: 1,
              exdesc: 'wcparr 微信支付SIGN:' + sign + '; BU传递的的Token:' + payData.token + ';extend:' + payData.extend
            });
          } catch (e) {}

          WeAPP_Business.clearStore(); //清除缓存
        }
      }
    }

    const completeFn = function () {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'wx.requestpayment.complete',
          c: 6002,
          dd: '微信唤起之后complete  callback',
          d: JSON.stringify(res || '')
        });
      } catch (e) {}
    }

    try {
      WeAPP_Business.sendUbtTrace({
        a: 'wx.requestpayment',
        c: 6001,
        dd: '开始调起微信',
        d: ''
      });
    } catch (e) {}


    try {
      let res = wx.getSystemInfoSync(),
        sys = res.system || '';
      sys = sys.toLowerCase();
      if (sys.indexOf('ios') > -1) {
        setTimeout(function () {
          that.hideLoading();
        }, 1 * 1000);
      } else {
        // android下面 loading延迟hide，
        setTimeout(function () {
          that.hideLoading();
        }, 1 * 1000);
      }
    } catch (e) {}

    try {
      param = JSON.parse(sign);
      const requestData = {
        'timeStamp': param.timeStamp,
        'nonceStr': param.nonceStr,
        'package': param.package,
        'signType': param.signType,
        'paySign': param.paySign,
        'success': successFn,
        'fail': failFn,
        'complete': completeFn
      }

      if (param.orderInfo && param.orderInfo.length > 0) {
        const orderInfoJson = JSON.parse(param.orderInfo);
        requestData.orderInfo = orderInfoJson;
        wx.requestOrderPayment(requestData)
      } else {
        wx.requestPayment(requestData);
      }
    } catch (err) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'wx.requestpayment.error',
          c: 6005,
          dd: '微信唤起之后complete  callback',
          d: '' + err
        });
      } catch (e) {}


      that.modalConfirm("系统异常，请稍后再试 -560");
    }
  },
  //支付提交返回
  paySubmitBack: function (item) {
    var that = this;
    try {
      WeAPP_Business.sendUbtTrace({
        a: 'paysubmitok',
        c: 5002,
        dd: '303请求成功后执行callback',
        d: 'rc=' + item.rc
      });
    } catch (e) {}

    if (item.rc == 1) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
      var resultBackInfo = that.getBackParams(4);
      that.modalConfirm(item.rmsg || "系统异常，请稍后再试 -513", function () {
        that.backAction('eback', resultBackInfo);
      });
      return;
    }

    //设置单号
    //billl
    try {
      WeAPP_Business.setTempOid(item);
      //保存bilno唯一订单号
      if (item.bilno) {
        WeAPP_orderDetailStore.setAttr("bilno", item.bilno);
      }
      //如果有errormsg或者errorcode则保存
      if (item.rc) {
        WeAPP_orderDetailStore.setAttr("ErrorCode", item.rc);
      }
      if (item.rmsg) {
        WeAPP_orderDetailStore.setAttr("ErrorMessage", item.rmsg);
      }
    } catch (e) {}

    var _msg;
    var realNameStoreVal = {};
    var realNameTime;
    if (item.rc == 0) {
      //执行插件函数
      if (that.data.isPayPlugin && that.data.payPluginSback) {
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'payPluginSccuess',
            c: 2000,
            d: 'payPlugin/303sccuess',
            dd: '支付插件提交支付数据成功'
          });
        } catch (e) {};
        return that.data.payPluginSback(item);
      }

      const weicatPayData = that.data.weicat; //thirdPay
      if (weicatPayData) {
        that.showLoading('支付加载中...');
        realNameStoreVal = WeAPP_realNameStore.get() || {};
        realNameTime = realNameStoreVal[item.userid];
        if (!realNameTime) {
          realNameStoreVal[item.userid] = +new Date();
          WeAPP_realNameStore.set(realNameStoreVal);
        }

        return that.weicatPay(item);
      } else {
        const resultBackInfo = that.getBackParams(0, 2); //通知BU扣款成功
        return that.backAction('sback', resultBackInfo);
      }

    } else if (item.rc < 100) {

      if (item.rc == 4) {
        //重复提交订单处理逻辑				
        _msg = item.rmsg || "订单已提交支付，请勿重复提交支付！";
        var resultBackInfo = that.getBackParams(0, 2); //通知BU扣款成功
        that.modalConfirm(_msg, function () {
          return that.backAction('sback', resultBackInfo);
        });

        return;

        // return that.modalConfirm(item.rmsg || "订单已提交支付，请勿重复提交支付！");
      } else if (item.rc == 6) {
        //常用卡连续多次支付失败
        that.modalConfirm('系统异常，请稍后再试 -530');
        return;
      } else if (item.rc == 8) {
        //实时支付已成功，重复提交
        return that.modalConfirm(item.rmsg || "订单支付，请勿重复提交支付！");
      } else if (item.rc == 9) {
        //指纹支付验证失败
        that.modalConfirm('系统异常，请稍后再试 -531');
        return;
      } else if (item.rc == 12) { //实时支付扣款成功 Add by sqsun 20150205
        var resultBackInfo = that.getBackParams(0, 2); //通知BU扣款成功
        that.hideLoading();
        return that.backAction('sback', resultBackInfo);
      } else if (item.rc == 13) {
        //银行和卡号不一致 v6.4 Add by jgd 20150310
        that.modalConfirm('系统异常，请稍后再试 -532');
        return;
      } else if (item.rc == 14) {
        //V6.13支付提交失败时 1.清空对应短信验证码 2.提示文案修改为“请重新获取验证码” 3.六十秒倒计时没有走完 继续走            
        that.modalConfirm('系统异常，请稍后再试 -533');
        return;
      } else if (item.rc == 16 || item.rc == 17) {
        //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
        _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
        that.modalConfirm(_msg, function () {
          return that.backAction('from', _msg);
        });
        return;
      } else {
        //支付错误跳转页面
        return that.modalConfirm(item.rmsg || '系统异常，请稍后再试 -510');
      }

    } else {
      var resultBackInfo = that.getBackParams(4);
      that.hideLoading();
      return that.backAction('eback', resultBackInfo);
    }
  },
  //发送支付提交
  requestSubmit: function (cardParams) {
    var that = this;
    var paramsErr = 0; //记录参数是否有错误
    var clientOrderDetail = WeAPP_orderDetailStore.get() || {};
    var clientCheckIdStr = clientOrderDetail.requestid + '|' + clientOrderDetail.oid;
    var clientCheckData = that.clientCheckData || {};
    var onFail = function (res) {

      try {
        WeAPP_Business.sendUbtTrace({
          a: 'requestSubmitErr',
          c: 5003,
          dd: '301/303 失败的callback',
          d: JSON.stringify(res || '')
        });
      } catch (e) {}

      if (res && res.retCode && res.retCode != 2) {

        var _msg = "系统异常，请稍后再试 -512";

        that.modalConfirm(_msg, function () {
          if (typeof that.settings.fromCallback === 'function') {
            return that.settings.fromCallback.call(that, {
              msg: _msg
            });
          }
        });

        // that.modalConfirm("系统异常，请稍后再试 -512");
      }

    };
    if (clientCheckData.isUnifiedPay) {
      if (clientCheckData.clientCheckIdStr !== that.data.payToken) {
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'requestSubmitErr',
            c: 5003,
            dd: 'clientCheckIdStrErr',
            d: 'cidstr:' + clientCheckIdStr + 'stokengstr: ' + that.data.payToken
          });
        } catch (e) {}
        console.error('服务提交paytoken校验失败');
        that.hideLoading();
        return;
      }
    } else {
      if (clientCheckIdStr !== clientCheckData.clientCheckIdStr) {
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'requestSubmitErr',
            c: 5003,
            dd: 'clientCheckIdStrErr',
            d: 'cidstr:' + clientCheckIdStr + 'scidstr: ' + that.clientCheckIdStr
          });
        } catch (e) {}
        console.error('服务提交orderid与requestid校验失败');
        that.hideLoading();
        return;
      }
    }

    try {
      WeAPP_Business.sendUbtTrace({
        a: 'requestSubmit',
        c: 5010,
        dd: '301/303 服务开始',
        d: ''
      });
    } catch (e) {}

    try {
      var unionData = that.data.unionData || {}; //BU商户aid,sid数据
      var payData = that.data.payData; //SBU传入的数据
      var orderDetail = payData.orderDetail || {};
      var extParam = payData.extParam || {};
      var weicatPayData = that.data.weicat; //102服务下发的微信第三方支付数据
      var paywayid = extParam.useEType == 2 ? "OGP_WechatScanCode" : "WechatScanCode"; //6.11 担保支付传入paymentwayid值需要修改
      var lastpaytime = extParam.paydeadline; //BU传入的最晚收款时间
      var usetype = extParam.useEType || 1; //useEType默认为支付 1
      var isPreAuth = extParam.IsNeedPreAuth; //是否支持预授权
      var subusetype = isPreAuth ? 1 : 0;
      var subpay = extParam.subPayType || 0; //默认支付到携程 0
      var typecode = extParam.typecode || '';
      var isAutoApplyBill = extParam.isAutoApplyBill ? true : false;
      var goodstag = extParam.goodstag; //微信立减金
      var mktopenid = ''; //市场openid
      try {
        mktopenid = cwx.cwx_mkt.openid; //调用框架方法获取市场openid
      } catch (e) {
        try {
          WeAPP_Business.sendUbtTrace({
            a: 'getOpenidErr',
            c: 10010,
            dd: '获取市场openid失败！',
            d: e + ''
          });
        } catch (e) {}
      };

      var dataParam = {
        "opttype": 1,
        "paytype": 4,
        "requestid": orderDetail.requestid,
        "bustype": orderDetail.bustype,
        "usetype": usetype,
        "subusetype": subusetype,
        "subpay": subpay,
        "forcardfee": 0,
        "forcardcharg": 0,
        "stype": 0,
        "oinfo": {
          "bustype": orderDetail.bustype,
          "oid": orderDetail.oid,
          "odesc": orderDetail.title,
          "currency": orderDetail.currency,
          "oamount": orderDetail.amount,
          "oidex": orderDetail.oid,
          "displayCurrency": orderDetail.displayCurrency,
          "displayAmount": orderDetail.displayAmount,
          "extno": orderDetail.extno,
          "notify": orderDetail.paymentnotifyurl, //支付通知接口
          "autoalybil": isAutoApplyBill,
          "recall": orderDetail.recall
        }
      };

      if (lastpaytime) {
        dataParam.lastpaytm = lastpaytime; //BU传入的最晚收款时间
      }

      //微信小程序BU APPID
      if (cwx.appId) {
        dataParam.extend = cwx.appId;
      }

      //weichat pay
      if (weicatPayData) {
        if (!mktopenid) {
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'openidErr',
              c: 10011,
              dd: '验证市场openid失败！',
              d: '' + mktopenid
            });
            WeAPP_Business.exceptionInfoCollect({
              bustype: 4,
              excode: "10010",
              extype: 1,
              exdesc: '10010'
            });
          } catch (e) {}
          // that.modalConfirm("系统异常，请稍后再试 -0010");

          var _msg = "系统异常，请稍后再试 -0010";

          that.modalConfirm(_msg, function () {
            if (typeof that.settings.fromCallback === 'function') {
              return that.settings.fromCallback.call(that, {
                msg: _msg
              });
            }
          });

          return;
        } else {
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'openidScuess',
              c: 10012,
              dd: '验证市场openid成功！',
              d: ''
            });
          } catch (e) {}
        }

        dataParam.thirdpartyinfo = {
          "paymentwayid": paywayid, //微信
          "mktopenid": mktopenid, //市场openid
          "typeid": 0,
          "subtypeid": 4, //微信小应用
          "typecode": typecode,
          "amount": orderDetail.amount,
          "brandid": paywayid,
          "brandtype": weicatPayData.brandtype,
          "channelid": weicatPayData.channelid,
          "thirdfee": 0,
          "scene": cwx.scene
        }

        //微信立减
        if (typeof goodstag === 'string' && goodstag.length !== 0) {
          dataParam.thirdpartyinfo.extendjson = goodstag;
        }

        //ouid, sourceid
        dataParam.thirdpartyinfo.ouid = unionData.ouid || '';
        dataParam.thirdpartyinfo.sourceid = unionData.sourceid || '';

      }

      //card pay
      if (cardParams) {
        dataParam.paytype = 2;
        dataParam.cardinfo = cardParams;
      }


      dataParam = that.getParames(dataParam); //获取整体Request参数
    } catch (e) {
      paramsErr = 1;
      try {
        WeAPP_Business.exceptionInfoCollect({
          bustype: 4,
          excode: 'c_e_c03',
          extype: 1,
          exdesc: 'requestSubmit wcrspe提交参数获取错误 : ' + e
        });
        WeAPP_Business.sendUbtTrace({
          a: 'paySubmitParamErr',
          c: 5004,
          dd: '301/303拼参数错误',
          d: '' + e
        });
      } catch (e) {};

      that.modalConfirm('系统异常，请稍后再试 -508');
    }

    if (paramsErr) {
      return;
    }

    try {
      WeAPP_models.PayMentV3Model({
        data: that.getParames(dataParam),
        success: that.paySubmitBack.bind(that),
        fail: onFail.bind(that),
        complete: function (res) {
          var rmsg = res.errMsg || '';
          var _msg;
          if (rmsg.indexOf('request:fail timeout') > -1) {

            _msg = "网络不给力，请稍候重试 - 514";

            that.modalConfirm(_msg, function () {
              if (typeof that.settings.fromCallback === 'function') {
                return that.settings.fromCallback.call(that, {
                  msg: _msg
                });
              }
            });

            // that.modalConfirm("网络不给力，请稍候重试 - 514");
            return;
          }

          if (rmsg.indexOf('request:fail') > -1) {
            _msg = "网络不给力，请稍候重试 - 515";

            that.modalConfirm(_msg, function () {
              if (typeof that.settings.fromCallback === 'function') {
                return that.settings.fromCallback.call(that, {
                  msg: _msg
                });
              }
            });


            // that.modalConfirm("网络不给力，请稍候重试 - 515");
          }

        }
      }).excute();
    } catch (e) {
      try {
        WeAPP_Business.exceptionInfoCollect({
          bustype: 4,
          excode: 'c_e_c03',
          extype: 1,
          exdesc: '301/303 发起请求抛错 : ' + e
        });
        WeAPP_Business.sendUbtTrace({
          a: 'paySubmitRequestErr',
          c: 5005,
          dd: '301/303 发起请求抛错',
          d: '' + e
        });
      } catch (e) {};

      that.modalConfirm('系统异常，请稍后再试 -509');
    }

  },
  //request cardBin server
  requestCardBinQuery: function (cardNum, callBack) {
    const that = this;
    const orderinfo = WeAPP_orderDetailStore.get() || {};
    const extParam = WeAPP_extendDataStore.get() || {};
    const requestCardNum = cardNum.replace(/\s+/g, "");

    const onFail = function (res) {

      try {
        WeAPP_Business.sendUbtTrace({
          a: 'requestCardBinQueryErr',
          c: 5003,
          dd: '1301 失败的callback',
          d: JSON.stringify(res || '')
        });
      } catch (e) {}

      if (res && res.retCode && res.retCode != 2) {

        var _msg = "系统异常，请稍后再试 -5310";
        that.modalConfirm(_msg);

        // that.modalConfirm("系统异常，请稍后再试 -512");
      }

    };
    const dataParam = {
      cardno: requestCardNum,
      cardamount: orderinfo.totalamount,
      oamount: orderinfo.totalamount,
      currency: orderinfo.currency,
      bustype: orderinfo.bustype,
      oid: orderinfo.oid,
      usetype: extParam.useEType,
      extendbit: 1,
      subpay: extParam.subPayType
    };

    try {
      that.showLoading('查询中..');
      WeAPP_payemnetCardBinQuery({
        data: that.getParames(dataParam),
        success: function (item) {
          that.hideLoading();
          try {
            WeAPP_Business.sendUbtTrace({
              a: 'cardBinSubmitBack',
              c: 5002,
              dd: '1301请求成功后执行callback',
              d: 'rc=' + item.rc
            });
          } catch (e) {}

          if (item.rc == 1 || item.rc == 2) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
            const rMessage = item.rmsg || item.msglist;
            let messageTxt = rMessage;
            if (_.isArray(rMessage)) {
              messageTxt = rMessage[0].value
            }

            that.modalConfirm(messageTxt || "系统异常，请稍后再试 -51301", function () {
              setTimeout(() => {
                callBack();
              });
            });
            return;
          }

          if (item.rc == 0) {
            const cardsInfo = item.cards || [];
            const cardInfos = cardsInfo[0] || {};
            const policyPass = cardInfos.policy - 128; //del card number police
            cardInfos.cardNum = cardNum;


            if ((67 & policyPass) === policyPass) {
              cardInfos.policyPass = policyPass;
              return callBack(cardInfos);
            } else {
              that.modalConfirm("系统暂不支持该银行卡", function () {
                setTimeout(() => {
                  callBack();
                });
              });
            }
          }
        },
        fail: onFail.bind(that),
        complete: function (res) {
          var rmsg = res.errMsg || '';
          var _msg;

          if (rmsg.indexOf('request:fail') > -1) {
            _msg = "网络不给力，请稍候重试 - 53105";
            that.modalConfirm(_msg);
            // that.modalConfirm("网络不给力，请稍候重试 - 515");
          }
        }
      }).excute();
    } catch (e) {
      try {
        WeAPP_Business.sendUbtTrace({
          a: 'requestCardBinQuery',
          c: 5005,
          dd: '301/303 发起请求抛错',
          d: '' + e.message
        });
      } catch (e) {};

      that.modalConfirm('系统异常，请稍后再试 -53109');
    }
  },
  //cardPay with API for backAction event
  backAction: function (action, data) {
    const that = this;
    const guarantedPage = that.guarantedPage;
    const currentPage = cwx.getCurrentPage();

    if (that.data.isPayPlugin) {
      const callBackName = {
        'sback': 'sbackCallback',
        'eback': 'ebackCallback',
        'rback': 'rbackCallback',
      }
      const backObj = {
        type: 1,
        errMsg: that.data.pluginEmsg || '系统异常，请稍后再试 -0666',
        callback: callBackName[action] || 'fromCallback',
        param: data
      }
      if (action === 'sback') {
        that.data.payPluginSback(backObj);
      } else {
        that.data.payPluginEback(backObj);
      }
    } else {
      if (guarantedPage) {
        currentPage.navigateBack({
          type: action,
          data: data
        });
      } else {
        if (action === 'sback') {
          if (typeof that.settings.sbackCallback === 'function') {
            return that.settings.sbackCallback(data);
          }
        } else if (action === 'eback') {
          if (typeof that.settings.ebackCallback === 'function') {
            return that.settings.ebackCallback(data);
          }
        } else if (action === 'rback') {
          if (typeof that.settings.rbackCallback === 'function') {
            return that.settings.rbackCallback(data);
          }
        } else {
          if (typeof that.settings.fromCallback === 'function') {
            return that.settings.fromCallback({
              msg: data
            });
          }
        }
      }
    }
    WeAPP_Business.sendUbt({
      a: 'backAction',
      c: 10001002,
      dd: '跳转中转函数',
      d: 'action::::' + action + '    /guarantedPage:::' + guarantedPage
    });
  }
};