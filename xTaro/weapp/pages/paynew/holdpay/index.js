import {
  cwx,
  CPage,
  _
} from '../../../cwx/cwx.js';
// let Business = require('../../thirdPlugin/pay/common/business.js');
// var Util = require('../../thirdPlugin/pay/common/util.js');
// let HoldUi = require('../../thirdPlugin/pay/components/holdui.js');
// let HoldPayCtrl = require('../../thirdPlugin/paynew/holdpay/ctrl.js');
// let paymentStore = require('../../thirdPlugin/paynew/models/stores.js');
// var WeAPP_models = require('../../thirdPlugin/pay/models/models.js');
// let orderDetailStore = paymentStore.HoldTokenStore();
// let payResultOStore = paymentStore.HoldResultOrderStore();
// let holdOrderInfoOrderStore = paymentStore.HoldOrderInfoOrderStore();
// let GetHoldResult = HoldPayCtrl.getHoldResult;
// let SubmitHold = HoldPayCtrl.submitPayhold;
// const UnWxscoreState = WeAPP_models.UnWxscoreStateModel; //查询微信支付分开通状态服务

import HoldUi from '../../thirdPlugin/pay/components/holdui.js'
import HoldPayCtrl from '../../thirdPlugin/paynew/holdpay/ctrl.js'
import paymentStore from "../../thirdPlugin/paynew/models/stores.js"
import * as Business from '../../thirdPlugin/paynew/common/combus.js'
let payItemDisplayStore = paymentStore.HoldResultOrderStore(); // 从102提取到的支付方式显示信息
let orderDetailStore = paymentStore.HoldTokenStore();

let currentThis = null;
const wxscoreStore = paymentStore.WxscoreStore();
let shouldChecScoreRes = false // 一个开关，只有手动唤起微信分回来才查询结果
let submitting = false // 节流

CPage({
  pageId: '10320674321',
  navigatorState: 0,
  isWxScoreConfirmChannel: false,
  data: {
    payTitle: '',
    nopayment: false,
    descTxt: '微信支付授权扣款',
    payTxt: '去开通',
    loading: true,
    amt: false,
    isWXHF: false,
    fromed: false,
    hasHold: false, //102服务下发是否已经开通过授权
    directed: false,
    navigatorData: {
      appId: 'wxbd687630cd02ce1d',
      pathUrl: 'pages/index/index'
    },
    thirdPayRes: null,
    extData: {},
    expireTime: 0,
    navbarData:{
      title: '微信授权',
      customBack: true,
      showBack: true
    }
  },
  onBack: function(){
    Business.sendUbt({
      type: 'click',
      clickName: 'postPayBack',
      actionType: 'holdpay_back_click',
      c: 30012,
      d: '点击左上角回退'
    });
    HoldPayCtrl.eBack({
      rc: 2,
      delay: 0,
      title: '用户取消'
    })
  },
  onCountEnd: function(){
    wx.showModal({
      title: '超过授权时限，请重新下单',
      showCancel: false,
      success(){
        // 1、调用关单接口关闭授权单
        // 2、返回BU前端回调页，返回“授权超时状态”
        HoldPayCtrl.eBack({
          rc: 5,
          delay: 0,
          title: '授权超时'
        })
      }
    })
  },
  onLoad: function (options) {
    if(!options.suc303){  // 如果是SDK过来的不用初始化全链路
      Business.initFullChain('post_payment', 'H5')
    }
    cwx.configService.watch('payTaro', function (data) {
    })
    // HoldUi.showLoading('加载中...');
    let that = this;
    currentThis = that;
    Business.sendUbt({
      actionType: 'holdpay_onLoad',
      a: 'holdpay-onLoad',
      c: 30011,
      d: 'onLoad options: ' + JSON.stringify(options)
    });

    if (options.tradeNo) {
      const optionData = {
        tradeNo: options.tradeNo,
        sBackUrl: options.sBackUrl && decodeURIComponent(options.sBackUrl),
        eBackUrl: options.eBackUrl && decodeURIComponent(options.eBackUrl),
      }
      HoldPayCtrl.initH5(optionData, () => that.initData())
    } else if(options.suc303) {
      console.log('suc303 api调用跳转过来', options)
      this.setData({
        loading: false
      })
      if(options.isConfirm == 'true'){
        console.log('suc303 需确认')
        this.isWxScoreConfirmChannel = true
      }
      that.initData()
    }else{
      that.routineCtrl();
    }
    return
  },


  initData() {
    let that = this;
    let navData = wxscoreStore.get(); //小程序跳转过来带的data参数
    let payItemDisplay = payItemDisplayStore.get() || {};
    const orderDetail = orderDetailStore.get() || {};

    Business.sendUbt({
      actionType: 'holdpay_initData',
      a: 'holdpay-initData',
      c: 30013,
      d: 'orderDetail为: ' + JSON.stringify(orderDetail)
    });
    console.log('---------orderDetail start----------------');
    console.log(orderDetail);
    console.log(payItemDisplay);
    console.log('---------orderDetail end------------------');

    if (_.isObject(navData)) {
      if (navData.nopayment) {
        that.setData({
          nopayment: navData.nopayment
        });
        return;
      }
      const {
        wxScoreChannel,
        isWxScoreConfirmChannel
      } = navData;
      that.isWxScoreConfirmChannel = isWxScoreConfirmChannel;


      if (isWxScoreConfirmChannel) {
        that.setData({
          directed: false,
          payTitle: orderDetail.orderTitle || '',
          descTxt: payItemDisplay.name,
          descSubTxt: payItemDisplay.caption,
          payTxt: '使用 微信支付分 授权',
          loading: false,
        });



      } else if (wxScoreChannel) {
        Business.sendUbt({
          actionType: 'holdpay_initData_wxScoreChannel',
          a: 'holdpay-initData',
          c: 30011,
          d: 'payresultInfo为: ' + JSON.stringify(payItemDisplay)
        });

        that.setData({
          directed: false,
          payTitle: orderDetail.orderTitle || '',
          descTxt: payItemDisplay.name,
          descSubTxt: payItemDisplay.caption,
          payTxt: '使用 微信支付分 授权',
          loading: false,
        });
      } else {
        that.setData({
          directed: false,
          payTitle: navData.payTitle,
          payTxt: '去开通',
          isWXHF: true
        })

        //自动处理开通接口服务
        // that.autoSubmitHold();
      }
      that.setData({
        expireTime: orderDetail.orderValidity || 0
      })
      Business.sendUbt({
        type: 'chain',
        chainName: 'cashierShowDone',
        a: 'cashierShowDone',
        c: 100002,
        d: 'd-onload-start-parse',
        dd: '收银台展示成功'
      });
    }
  },

  // 点击授权
  handlePay() {
    Business.sendUbt({
      type: 'chain',
      chainName: 'paymentSubmit',
      isClickTrace: '1',
      clickName: 'paymentSubmit',
      a: 'handlePay click',
      c: 30041,
      dd: '点击授权'
    });
    // 节流
    if(submitting){
      Business.sendUbt({
        a: 'handlePay click jieliu',
        c: 30042,
        d: '授权节流'
      });
      return
    }
    submitting = true
    setTimeout(() => {
      submitting = false
    }, 5000);
    try {
      shouldChecScoreRes = true
      HoldPayCtrl.submitAndInvoke({
        // success: () => {
        //   this.optionsData.miniAppBack = true
        // }
      })
    } catch (error) {
      Business.sendUbt({
        actionType: 'toInvokeWxScore catch error',
        c: 30043,
        d: '唤起授权catch',
        error: JSON.stringify(error)
      });
    }
  },


  onUnload: function () {
    Business.sendUbt({
      actionType: 'holdpay_unload',
      a: 'holdpay-unload',
      c: 30019,
      d: '退出后付页'
    });
  },

  setPageStatus: function (navData) {
    const {
      _payToken,
      payTitle,
      extData,
      wxScoreChannel,
      resultParams,
      isWxScoreConfirmChannel,
      thirdPayRes
    } = navData;
    currentThis.isWxScoreConfirmChannel = isWxScoreConfirmChannel;
    currentThis.payToken = _payToken;

    if (isWxScoreConfirmChannel) {
      currentThis.resultParams = resultParams;
      setTimeout(function () {
        currentThis.setData({
          directed: false,
          payTitle: payTitle,
          descTxt: '微信支付分' + thirdPayRes.brandname,
          descSubTxt: thirdPayRes.paytip,
          payTxt: '使用 微信支付分 授权',
          loading: false,
          navigatorData: {
            appId: 'wxd8f3793ea3b935b8',
            pathUrl: 'pages/use/use'
          },
          extData: extData
        });
      }, 500);

    } else if (wxScoreChannel) {
      currentThis.resultParams = resultParams;
      currentThis.setData({
        directed: false,
        payTitle: payTitle,
        descTxt: '微信支付分' + thirdPayRes.brandname,
        descSubTxt: thirdPayRes.paytip,
        payTxt: '使用 微信支付分 授权',
        loading: false,
        navigatorData: {
          appId: 'wxd8f3793ea3b935b8',
          pathUrl: 'pages/use/enable'
        },
        extData: extData
      });
    }
  },

  routineCtrl: function (directData, busdata) {
    // "{"isWxScoreConfirmChannel":true,"_payToken":"963508579246780416","thirdPayRes":{"paymentwayid":"WechatScanCode","brandid":"WechatQuick","brandtype":"2","channelid":"1235","collectionid":"TRD.TP.WECHAT.MINI.PS.CONFIRM","status":26,"paysign":"","merchantid":200537,"brandname":"微信先享后付","paytip":"微信支付分550分以上有机会可享","resinfo":{"ispoint":true,"needpwd":true,"rusetype":0,"payetype":4}},"extData":{"mch_id":"1400347502","nonce_str":"19bc91a520c94a1fa7e261d1660e5966","package":"AAQTnZoAAAABAAAAAADD30WJj5qtIh8HLCJVYiAAAABcwQVtru-5k9MmEOZJ_Pv_Nq7Cw56dNKKN5EjZKnt5jTeJwCzJ2CYPiGApA_9RUiUMszMqG3jA4vD5T9-k0ZTSYaPo8rlPCw-n4rDb99thibK4QwWJ3j6kmhecGVcqyrswHJdEc77mUyIYdGl6abN3QQpSLIBVlLTkQn66fKRqmtWV89eH-yDgaq7cGuk-hZgaYtzY-RiN9r4h","sign":"7545710D85889AA3E1852E383AFCD65B04E8CFD60BC08C36533D1CC617FA0A0E","sign_type":"HMAC-SHA256","timestamp":"1649746476"},"payTitle":"上海到北京test"}"
    // "{"payLoad":{"requestId":"20220412179654543995","orderId":"933139683816","payToken":"963508579246780416","rextend":{"sbitmap":7,"extend":"wx0e6ed4f51db9d078"}}}"

    if (busdata) {
      this.setPageStatus(directData);
      return;
    }

    const that = this;
    const state = directData.status || 0;
    const noPayment = directData.nopayment || false;
    let hasHold = ((state & 1) === 1);
    if (noPayment) {
      that.setData({
        nopayment: noPayment
      });
      return;
    }

    if (!hasHold) {
      that.setData({
        directed: true,
        payTitle: directData.payTitle,
        payTxt: '去开通'
      });
      that.autoSubmitHold();
    } else {
      that.setData({
        fromed: true,
        directed: true,
        payTitle: directData.payTitle,
        payTxt: '确认'
      });
    }
    try {
      Business.sendUbt({
        a: 'holdPayPageonLoad',
        c: 30030,
        d: 'H5直联进入支付授权页面'
      });
    } catch (e) {};
  },
  onShow: function (res) {
    let that = this;
    const {
      scene,
      referrerInfo = {}
    } = cwx;
    console.log(scene)
    console.log('referrerInfo', referrerInfo)
    if (scene == 1038 && shouldChecScoreRes) {
      shouldChecScoreRes = false
      try {
        Business.sendUbt({
          a: 'navigateToMiniProgram back',
          c: 30032,
          d: '场景号： ' + cwx.scene,
          referrerInfo
        });
      } catch (e) {};
      const {
        appId,
        extraData
      } = referrerInfo;
      if (appId == 'wxbd687630cd02ce1d') {
        HoldUi.showLoading('加载中...');
        setTimeout(function () {
          that.getholdResult();
        }, 300)
      } else if (appId == 'wxd8f3793ea3b935b8') {
        HoldUi.showLoading('加载中..');
        if (that.isWxScoreConfirmChannel) {
          HoldPayCtrl.getScoreConfrimResult()
        }else{
          setTimeout(function () {
            HoldPayCtrl.GetHoldResult()
          }, 300)
        }
      }

    }
  },
  getResult: function(){
    HoldPayCtrl.getScoreConfrimResult()
  },
  submitHoldCtrl: function (res) {
    const that = this;
    let appId = cwx.appId || '';
    let extData = {
      appid: appId,
      contract_code: res.contract_code,
      contract_display_account: res.contract_display_account,
      mch_id: res.mch_id,
      notify_url: res.notify_url,
      plan_id: res.plan_id,
      request_serial: res.request_serial,
      timestamp: res.timestamp,
      sign: res.sign
    };
    try {
      Business.sendUbt({
        a: 'navigateToMiniProgram start',
        c: 3003,
        d: '跳转开通免密支付小程序开始'
      });
    } catch (e) {};
    that.setData({
      loading: false,
      extData: extData
    });
    try {
      Business.sendUbt({
        a: 'navigateToMiniProgram end',
        c: 3003,
        d: '跳转开通免密支付小程序完成'
      });
    } catch (e) {};
  },
  //自动处理开通接口服务
  autoSubmitHold: function () {
    let that = this;
    that.submitPayhold();
  },
  //获取公共返回参数
  getBackParams: function (rc, status) {
    let orderinfo = orderDetailStore.get() || {};
    let payresultInfo = payResultOStore.get() || {};
    let param = {
      orderID: orderinfo.oid || '',
      busType: orderinfo.bustype || '',
      price: orderinfo.amount || ''
    };

    if (typeof status !== 'undefined') {
      param.Status = status
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

    return param
  },
  redirectUrl: function (action, data) {
    const orderinfo = orderDetailStore.get() || {};
    const Urldata = Util.pageQueryStr(data);
    let url = orderinfo[action] || '';
    url = Util.appendQuery(url, Urldata);
    Business.sendUbtTrace({
      a: 'redirectUrl',
      c: 1001010,
      dd: '跳转直连回跳URL地址解析完成',
      d: 'redirectUrl  URL::::' + url
    });
    cwx.component.cwebview({
        data: {
            url: encodeURIComponent(url),
            needLogin: true,
        }
    })
    Business.clearStore(); //清除缓存
  },
  //设置执行返回函数
  goBackNav: function (action = '', rc) {
    let that = this;
    let currentPage = cwx.getCurrentPage();
    let resultBackInfo = that.getBackParams(rc);
    let direct = that.data.directed;
    try {
      Business.sendUbt({
        a: 'goBackNav',
        c: 30050,
        d: '返回上一页面 action: ' + action + ' /rc:' + rc + '  /direct:' + JSON.stringify(direct || '')
      });
    } catch (e) {};

    if (direct) {
      that.redirectUrl(action, resultBackInfo);
    } else {
      Business.clearStore(); //清除缓存
      currentPage.navigateBack({
        type: action,
        data: resultBackInfo
      });
    }
  },
  showamt: function () {
    const scoreData = wxscoreStore.get() || {};
    const htmlUrl = scoreData.frontData.withholdProtocolUrl
    cwx.component.cwebview({
      data: {
        url: encodeURIComponent(htmlUrl)
      }
    });
    try {
      Business.sendUbt({
        type: 'click',
        isClickTrace: '1',
        clickName: 'riskSmsProtocol',
        a: 'show.amount',
        c: 30040,
        dd: '跳转协议：' + htmlUrl
      });
    } catch (e) {};
  },
  submitPayhold66: function () {
    let that = this;
    const {
      scene,
      referrerInfo = {}
    } = cwx;
    console.log(scene)
    console.log(referrerInfo)
    console.log('referrerInforeferrerInforeferrerInforeferrerInfo');
    if (1) {
      // if (scene == 1038) {
      // if (scene == 1001) {
      try {
        Business.sendUbt({
          a: 'navigateToMiniProgram back',
          c: 30032,
          d: '场景号： ' + cwx.scene
        });
      } catch (e) {};
      const {
        appId,
        extraData
      } = referrerInfo;
      // if (appId == 'wxbd687630cd02ce1d' && that.navigatorState) {
      //     that.navigatorState = 0;
      //     HoldUi.showLoading('加载中...');
      //     setTimeout(function() {
      //         that.getholdResult();
      //     }, 300)
      // } else if (appId == 'wxd8f3793ea3b935b8' && that.navigatorState) {
      that.navigatorState = 0;
      HoldUi.showLoading('加载中..');
      if (that.isWxScoreConfirmChannel) {
        that.getScoreConfirmResult.call(that);
        return;
      }
      setTimeout(function () {
        that.getScoreResult.call(that);
      }, 300)
      // }

    }
  },
  submitPayhold: function () {
    let that = this;
    let payTxt = that.data.payTxt;
    if (payTxt === '确认') {
      HoldUi.showLoading('确认中..');
    }
    try {
      Business.sendUbt({
        a: 'submitPayhold',
        c: 30010,
        d: 'submitPayhold start!'
      });
    } catch (e) {};
    that.holdData = {
      fromHoldPage: true
    };
    HoldUi.showLoading('服务中..');
    SubmitHold.call(that, function (res = {}) {
      let rescode = res.rc;
      HoldUi.hideLoading();
      if (rescode == 1) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
        try {
          Business.exceptionInfoCollect({
            bustype: 4,
            excode: 3003,
            extype: 1,
            exdesc: '20020 服务返回RC=1错误, ' + JSON.stringify(res)
          }, '1');
          Business.sendUbt({
            a: 'WxholdWayModel',
            c: 20021,
            dd: '20020 success callback rc=1',
            d: JSON.stringify(res)
          });
        } catch (e) {};
        HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5121');
        return;
      } else if (rescode == 0) {
        try {
          Business.sendUbt({
            a: 'WxholdPayModel',
            c: 20020,
            dd: '20020 success callback rc=0',
            d: JSON.stringify(res)
          });
        } catch (e) {};
        that.goBackNav('sback');
      } else if (rescode == 16 || rescode == 17) {
        //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
        let _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
        HoldUi.modalConfirm(_msg, function () {
          that.goBackNav('rback', 4);
        });
      } else if (rescode == 24) {
        //重复支付
        HoldUi.modalConfirm("您已重复提交订单！", function () {
          Business.goBackNav('sback');
        });
      } else if (rescode == 18) { //需要开通免密支付
        let sigData;
        try {
          sigData = JSON.parse(res.sig || '')
        } catch (e) {
          HoldUi.modalConfirm('系统异常，请稍后再试 -5122');
          try {
            Business.sendUbt({
              a: 'WxholdPayModel',
              c: 200218,
              dd: '200218 JSON parse res.sig error',
              d: JSON.stringify(res)
            });
          } catch (e) {};
        }
        if (_.isObject(sigData)) {
          that.submitHoldCtrl(sigData);
        } else {
          HoldUi.modalConfirm('系统异常，请稍后再试 -5122.1');
        }
        try {
          Business.sendUbt({
            a: 'WxholdPayModel',
            c: 200218,
            dd: '需要开通免密支付',
            d: '服务返回数据：' + JSON.stringify(res)
          });
        } catch (e) {};
      } else if (rescode > 100) {
        try {
          Business.sendUbt({
            a: 'WxholdPayModel',
            c: 200210,
            dd: '20020 success callback rc>100',
            d: JSON.stringify(res)
          });
        } catch (e) {};
        that.goBackNav('eback', 4);
      } else {
        HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5123');
        try {
          Business.sendUbt({
            a: 'WxholdPayModel',
            c: 200211,
            dd: '200211 RC小于100的错误',
            d: JSON.stringify(res)
          });
        } catch (e) {};
      }
    })
  },
  getScoreConfirmResult: function () {
    HoldPayCtrl.GetHoldResult()
  },
  queryScoreStatus: function (callBack) {
    let data = {};
    let that = this;
    let payParam = holdOrderInfoOrderStore.get();
    data.requestid = payParam.requestId;
    data.paytoken = payParam.payToken;
    data.orderid = payParam.orderId;
    data.bid = that.thirdPayRes.brandid;
    data.collectionid = that.thirdPayRes.collectionid;
    data.status = that.thirdPayRes.status;

    // 添加appid
    if (cwx.appId) {
      data.extend = cwx.appId;
    }

    UnWxscoreState({
      data: data,
      success: function (res) {
        if (res.rc == 0) {
          if (res.status === 1) {
            return callBack({
              scoreState: 1,
              msg: "微信支付分已开通"
            })
          } else {
            HoldUi.hideLoading();
            return callBack({
              scoreState: 0,
              msg: "微信支付分未开通"
            })
          }

        } else {
          HoldUi.hideLoading();
          return callBack({
            scoreState: 0,
            msg: res.rmsg || "服务返回异常！"
          })
        }
      },
      fail: function () {
        HoldUi.hideLoading();
        // console.log("查询失败，请重试！")
        return callBack({
          scoreState: 0,
          msg: "查询失败，请重试！"
        })
      },
      complete: function () {

      }
    }).excute();
  },
  getScoreResult: function () {
    HoldPayCtrl.GetHoldResult()

    const that = this;
    const params = that.resultParams;
    params.scoreType = 1;
    params.auth = cwx.user.auth;
    that.queryScoreStatus((res) => {
      if (res.scoreState == 1) {
        HoldUi.showLoading('订单提交中..');
        try {
          Business.sendUbt({
            a: 'getScoreResult',
            c: 30011,
            d: 'getScoreResult res: ' + JSON.stringify(res || '')
          });
        } catch (e) {};
        SubmitHold.call(that, function (res = {}) {
          HoldUi.hideLoading();
          try {
            Business.sendUbt({
              a: 'SubmitScoreback',
              c: 30011,
              d: 'SubmitScoreback res: ' + JSON.stringify(res || '')
            });
          } catch (e) {};
          if (res.result === 1) { //开通授权成功
            try {
              Business.sendUbt({
                a: 'SubmitScoreback sbackcallback',
                c: 30011,
                d: 'SubmitScorebackcallback' + busData.sbackCallback
              });
            } catch (e) {};
            that.goBackNav('sback');
          } else if (res.result == 16 || res.result == 17) {
            //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
            let _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
            HoldUi.modalConfirm(_msg, function () {
              that.goBackNav('rback', 4);
            });
          } else if (res.result == 18) {
            HoldUi.modalConfirm('请先开通微信支付分扣款授权');
          } else {
            that.goBackNav('eback', 4);
          }
        });
      } else {
        HoldUi.modalConfirm(res.msg, function () {});
      }
    });
  },
  getholdResult: function () {
    let that = this;
    let orderDetail = orderDetailStore.get() || {};
    let resData = payResultOStore.get() || {};
    let bustype = orderDetail.bustype;
    let auth = orderDetail.auth;
    let rData = {
      bustype: bustype,
      auth: auth,
      oid: orderDetail.oid,
    }

    if (resData) {
      if (resData.brandid) {
        rData.bid = resData.brandid
      }

      if (resData.collectionid) {
        rData.collectionid = resData.collectionid
      }
    }

    try {
      Business.sendUbt({
        a: 'getholdResult',
        c: 30011,
        d: 'getholdResult start!'
      });
    } catch (e) {};
    that.holdData = {
      oid: orderDetail.oid,
      fromHoldPage: true
    }
    GetHoldResult.call(that, rData, function (res = {}) {
      let rescode = res.rc;
      HoldUi.hideLoading();
      if (rescode == 1) { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
        try {
          Business.exceptionInfoCollect({
            bustype: 4,
            excode: 3003,
            extype: 1,
            exdesc: '20010 服务返回RC=1错误, ' + JSON.stringify(res)
          }, '1');
          Business.sendUbt({
            a: 'WxholdResultModel',
            c: 20031,
            dd: '20031 success callback rc=1',
            d: JSON.stringify(res)
          });
        } catch (e) {};
        HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5555', function () {
          return that.getholdResult();
        }, true, '重试');
      } else if (rescode == 0) {
        try {
          Business.sendUbt({
            a: 'WxholdResultModel',
            c: 20030,
            dd: '20030 success callback rc=0',
            d: JSON.stringify(res)
          });
        } catch (e) {};
        if (res.status == 1) {
          that.setData({
            payTxt: '确认',
            fromed: true
          });
          if (!that.isDirect) {
            setTimeout(function () {
              that.submitPayhold();
            }, 600);
          }
        } else {
          HoldUi.modalConfirm('开通微信支付授权扣款失败', function () {}, true, '重试');
        }
      }
    })
  },
  requestFail: function (res) {
    HoldUi.hideLoading();
    if (res && res.retCode && res.retCode != 2) {
      HoldUi.modalConfirm('系统异常，请稍后再试 -505-1', function () {
        cwx.navigateBack({});
      });
    } else {
      HoldUi.modalConfirm('系统异常，请稍后再试 -505-2', function () {
        cwx.navigateBack({});
      });
    }
    try {
      Business.sendUbt({
        a: 'requestfail',
        c: 300500,
        d: JSON.stringify(res || '')
      });
    } catch (e) {};
  },
  rquestTimeout: function (res = {}, scode) {
    let that = this;
    let rmsg = res.errMsg || '';
    let _scode = scode.substring(4);
    try {
      Business.sendUbt({
        a: 'request complete',
        c: 300510,
        d: '服务号：' + scode + '微信响应:' + rmsg
      });
    } catch (e) {};


    if (rmsg.indexOf('request:fail timeout') > -1) {

      try {
        Business.sendUbt({
          a: 'request timeout',
          c: 300512,
          d: '服务号：' + scode + '微信响应:' + rmsg
        });
      } catch (e) {};

      HoldUi.modalConfirm('网络不给力，请稍候重试 - 521-1 ' + _scode, function () {
        cwx.navigateBack({});
      });
      return;
    }
    if (rmsg.indexOf('request:fail') > -1) {

      try {
        Business.sendUbt({
          a: 'request fail',
          c: 300513,
          d: '服务号：' + scode + '微信响应:' + rmsg
        });
      } catch (e) {};

      HoldUi.modalConfirm('网络不给力，请稍候重试 - 522-1 ' + _scode, function () {
        cwx.navigateBack({});
      });
    }
  },
  miniSuccess: function (res = '') {
    try {
      Business.sendUbt({
        a: 'navigateToMiniProgram success',
        c: 30030,
        d: JSON.stringify(res)
      });
    } catch (e) {};
    this.navigatorState = 1;
  },
  miniFail: function (res = '') {
    try {
      let errMsg = res && res.detail && res.detail.errMsg;
      let type = res && res.type
      Business.sendUbt({
        a: 'navigateToMiniProgram fail',
        c: 30031,
        d: 'errMsg: ' + errMsg + '; type: ' + type
      });
    } catch (e) {};
    HoldUi.modalConfirm('唤醒服务失败，请稍候重试 - 1038.');
  },
  miniComplete: function () {

  }
})