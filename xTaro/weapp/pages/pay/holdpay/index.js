import { cwx, CPage, _ } from '../../../cwx/cwx.js';
let Business = require('../../thirdPlugin/pay/common/business.js');
var Util = require('../../thirdPlugin/paynew/common/util.js');
let HoldUi = require('../../thirdPlugin/pay/components/holdui.js');
let HoldPayCtrl = require('../../thirdPlugin/pay/holdpay/ctrl.js');
let paymentStore = require('../../thirdPlugin/paynew/models/stores.js');
var WeAPP_models = require('../../thirdPlugin/pay/models/models.js');
import {queryMiddlegroundRouteInfo} from '../../thirdPlugin/paynew/libs/index'
import * as mdBusiness from '../../thirdPlugin/paynew/common/combus';

let orderDetailStore = paymentStore.HoldTokenStore();
let payResultOStore = paymentStore.HoldResultOrderStore();
let holdOrderInfoOrderStore = paymentStore.HoldOrderInfoOrderStore();
let GetHoldResult = HoldPayCtrl.getHoldResult;
let SubmitHold = HoldPayCtrl.submitPayhold;
const UnWxscoreState = WeAPP_models.UnWxscoreStateModel; //查询微信支付分开通状态服务

import __global from '../../../cwx/ext/global.js';
let currentThis = null;

CPage({
    pageId: '10320674321',
    checkPerformance: true, // 白屏检测
    navigatorState: 0,
    isWxScoreConfrimChannel: false,
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
        extData: {}
    },
    onLoad: function(options) {
        HoldUi.showLoading('加载中...');
        let that = this;
        currentThis = that;
        let navData = options.data; //小程序跳转过来带的data参数
        let directToken = options.token; //h5页面跳转过来带的token参数
        let directPayToken = options.payToken; //h5页面跳转过来的服务端传值

        const payToken = directToken || directPayToken || ''
        const settings = {
          data: {
            payToken
          }
        }
        this.checkIsNew(settings, (res)=>{
          // 切量，进中台
          if (res.isNew) {
            const payLink = `/pages/paynew/directpay/index?tradeNo=${payToken}`
            // if (direct) {
              wx.redirectTo({
                url: `/pages/paynew/holdpay/index?payLink=${encodeURIComponent(payLink)}`,
              })
            // } else {
            //   settings.serverData = settings.serverData || {}
            //   settings.serverData.payLink = payLink
            //   mdBusiness.clearStore();
            //   mainBusiness.init(settings);
            // }
          } else {
            // 走原支付
            start()
          }
        })

        function start(){
          mdBusiness.initFullChain('pre_payment')
          mdBusiness.sendUbt({
            type: 'warning',
            warningCode: 'old_post_pay',
            level: 'p2',
            desc: '小程序老支付_直连',
            devOriKey: `warning_old_pay`,
            extend: options
          })
        // 服务端传值
        if (directPayToken) {
            that.isDirect = true;
            const directTokenData = {
                token: options
            }
            HoldPayCtrl.init2({ busdata: directTokenData, isDirect: true }, function(directData, busdata) {
                that.routineCtrl(directData, busdata);
            });
        } else {
            //判断H5直联
            if (directToken && !navData) {
                that.isDirect = true;
                HoldPayCtrl.init(options, true, function(directData) {
                    that.routineCtrl(directData);
                });
            } else {
                HoldUi.hideLoading();
                if (_.isObject(navData)) {
                    if (navData.nopayment) {
                        that.setData({
                            nopayment: navData.nopayment
                        });
                        return;
                    }


                    const { _payToken, payTitle, extData, wxScoreChannel, resultParams, isWxScoreConfrimChannel, thirdPayRes } = navData;
                    that.thirdPayRes = thirdPayRes;
                    if (isWxScoreConfrimChannel || wxScoreChannel) {
                        that.setPageStatus(navData);
                    } else {
                        that.setData({
                            directed: false,
                            payTitle: payTitle,
                            payTxt: '去开通',
                            isWXHF: true
                        });

                        that.autoSubmitHold();
                    }
                }
                try {
                    Business.sendUbt({ a: 'holdPayPageonLoad', c: 30030, d: '授权后付款失败，进入后付款页面！' });
                } catch (e) {};
            }
        }
        }


        try {
            Business.sendUbt({ a: 'holdPayPageonLoad', c: 30030, d: '记录传入值：' + JSON.stringify(options || '') });
        } catch (e) {};

    },

    // 验证是否切量
    checkIsNew(settings, callback){
      Business.sendUbtTrace({ a: 'check-isNew-start', c: 10010, dd: '获取微信支付分确认模式开通状态开始！' });
        const data = settings.serverData || settings.data || {}
        queryMiddlegroundRouteInfo({
          data: {
            payToken: data.payToken
          },
          h5plat: 29,
          context: {
            cwx: cwx,
            env: __global.env,
            subEnv: 'fat5068'
          },
          success: (res) => {
            if (res.head && res.head.code !== 100000) {
              wx.showToast({
                title: '网络不给力，请稍候重试 -2001',
                icon: 'none'
              })
              callback({
                isNew: false
              })
              try {
                Business.sendUbtTrace({
                  a: 'cpay.init',
                  c: 9004,
                  d: 'CPayPopbox init',
                  dd: '换取token， 其他错误:' + JSON.stringify(res)
                });
              } catch (e) {};
              return
            }
            if (res.status != 1) {
              try {
                Business.sendUbtTrace({
                  a: 'cpay.init',
                  c: 9005,
                  d: 'CPayPopbox init',
                  dd: 'status不是1，非中台'
                });
              } catch (e) {};
              callback({
                isNew: false
              })
            } else {
              try {
                Business.sendUbtTrace({
                  a: 'cpay.init',
                  c: 9006,
                  d: 'CPayPopbox init',
                  dd: 'status是1，中台'
                });
              } catch (e) {};
              callback({
                isNew: true,
              })
            }
          },
          fail: (e) => {
            // this.showToast('网络不给力，请稍候重试 -2002')
            callback({
              isNew: false
            })
          },
          complete: () => {}
      }).excute()
    },

    setPageStatus: function(navData) {
        const { _payToken, payTitle, extData, wxScoreChannel, resultParams, isWxScoreConfrimChannel, thirdPayRes } = navData;
        currentThis.isWxScoreConfrimChannel = isWxScoreConfrimChannel;
        currentThis.payToken = _payToken;

        if (isWxScoreConfrimChannel) {
            currentThis.resultParams = resultParams;
            setTimeout(function() {
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

    routineCtrl: function(directData, busdata) {
        // "{"isWxScoreConfrimChannel":true,"_payToken":"963508579246780416","thirdPayRes":{"paymentwayid":"WechatScanCode","brandid":"WechatQuick","brandtype":"2","channelid":"1235","collectionid":"TRD.TP.WECHAT.MINI.PS.CONFIRM","status":26,"paysign":"","merchantid":200537,"brandname":"微信先享后付","paytip":"微信支付分550分以上有机会可享","resinfo":{"ispoint":true,"needpwd":true,"rusetype":0,"payetype":4}},"extData":{"mch_id":"1400347502","nonce_str":"19bc91a520c94a1fa7e261d1660e5966","package":"AAQTnZoAAAABAAAAAADD30WJj5qtIh8HLCJVYiAAAABcwQVtru-5k9MmEOZJ_Pv_Nq7Cw56dNKKN5EjZKnt5jTeJwCzJ2CYPiGApA_9RUiUMszMqG3jA4vD5T9-k0ZTSYaPo8rlPCw-n4rDb99thibK4QwWJ3j6kmhecGVcqyrswHJdEc77mUyIYdGl6abN3QQpSLIBVlLTkQn66fKRqmtWV89eH-yDgaq7cGuk-hZgaYtzY-RiN9r4h","sign":"7545710D85889AA3E1852E383AFCD65B04E8CFD60BC08C36533D1CC617FA0A0E","sign_type":"HMAC-SHA256","timestamp":"1649746476"},"payTitle":"上海到北京test"}"
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
            Business.sendUbt({ a: 'holdPayPageonLoad', c: 30030, d: 'H5直联进入支付授权页面' });
        } catch (e) {};
    },
    onShow: function(res) {
        let that = this;
        const { scene, referrerInfo = {} } = cwx;
        console.log(scene)
        console.log(referrerInfo)
        console.log('referrerInforeferrerInforeferrerInforeferrerInfo');
        if (scene == 1038) {
            // if (scene == 1001) {
            try {
                Business.sendUbt({ a: 'navigateToMiniProgram back', c: 30032, d: '场景号： ' + cwx.scene });
            } catch (e) {};
            const { appId, extraData } = referrerInfo;
            if (appId == 'wxbd687630cd02ce1d' && that.navigatorState) {
                that.navigatorState = 0;
                HoldUi.showLoading('加载中...');
                setTimeout(function() {
                    that.getholdResult();
                }, 300)
            } else if (appId == 'wxd8f3793ea3b935b8' && that.navigatorState) {
                that.navigatorState = 0;
                HoldUi.showLoading('加载中..');
                if (that.isWxScoreConfrimChannel) {
                    that.getScoreConfrimResult.call(that);
                    return;
                }
                setTimeout(function() {
                    that.getScoreResult.call(that);
                }, 300)
            }

        }
    },
    submitHoldCtrl: function(res) {
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
    autoSubmitHold: function() {
        let that = this;
        that.submitPayhold();
    },
    //获取公共返回参数
    getBackParams: function(rc, status) {
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
    redirectUrl: function(action, data) {
        const orderinfo = orderDetailStore.get() || {};
        const Urldata = Util.pageQueryStr(data);
        let url = orderinfo[action] || '';
        url = Util.appendQuery(url, Urldata);
        Business.sendUbtTrace({ a: 'redirectUrl', c: 1001010, dd: '跳转直连回跳URL地址解析完成', d: 'redirectUrl  URL::::' + url });
        cwx.redirectTo({
            url: '/pages/pay/directback/index?cb=' + encodeURIComponent(url),
            success: function(res) {
                Business.sendUbtTrace({ a: 'redirectUrl', c: 1001011, dd: '跳转直连回跳URL地址成功', d: 'redirectUrl success!' });
            },
            fail: function(res) {
                Business.sendUbtTrace({ a: 'redirectUrl', c: 1001012, dd: '跳转直连回跳URL地址失败', d: 'redirectUrl fail! res::::' + JSON.stringify(res || '') });
            }
        });
        Business.clearStore(); //清除缓存
    },
    //设置执行返回函数
    goBackNav: function(action = '', rc) {
        let that = this;
        let currentPage = cwx.getCurrentPage();
        let resultBackInfo = that.getBackParams(rc);
        let direct = that.data.directed;
        try {
            Business.sendUbt({ a: 'goBackNav', c: 30050, d: '返回上一页面 action: ' + action + ' /rc:' + rc + '  /direct:' + JSON.stringify(direct || '') });
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
    showamt: function() {
        let amt = !this.data.amt;
        this.setData({ amt: amt });
        try {
            Business.sendUbt({ a: '代扣服务协议', c: 30040, d: '代扣服务协议点击状态：' + amt });
        } catch (e) {};
    },
    submitPayhold66: function() {
        let that = this;
        const { scene, referrerInfo = {} } = cwx;
        console.log(scene)
        console.log(referrerInfo)
        console.log('referrerInforeferrerInforeferrerInforeferrerInfo');
        if (1) {
            // if (scene == 1038) {
            // if (scene == 1001) {
            try {
                Business.sendUbt({ a: 'navigateToMiniProgram back', c: 30032, d: '场景号： ' + cwx.scene });
            } catch (e) {};
            const { appId, extraData } = referrerInfo;
            // if (appId == 'wxbd687630cd02ce1d' && that.navigatorState) {
            //     that.navigatorState = 0;
            //     HoldUi.showLoading('加载中...');
            //     setTimeout(function() {
            //         that.getholdResult();
            //     }, 300)
            // } else if (appId == 'wxd8f3793ea3b935b8' && that.navigatorState) {
            that.navigatorState = 0;
            HoldUi.showLoading('加载中..');
            if (that.isWxScoreConfrimChannel) {
                that.getScoreConfrimResult.call(that);
                return;
            }
            setTimeout(function() {
                    that.getScoreResult.call(that);
                }, 300)
                // }

        }
    },
    submitPayhold: function() {
        let that = this;
        let payTxt = that.data.payTxt;
        if (payTxt === '确认') {
            HoldUi.showLoading('确认中..');
        }
        try {
            Business.sendUbt({ a: 'submitPayhold', c: 30010, d: 'submitPayhold start!' });
        } catch (e) {};
        that.holdData = {
            fromHoldPage: true
        };
        HoldUi.showLoading('服务中..');
        SubmitHold.call(that, function(res = {}) {
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
                    Business.sendUbt({ a: 'WxholdWayModel', c: 20021, dd: '20020 success callback rc=1', d: JSON.stringify(res) });
                } catch (e) {};
                HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5121');
                return;
            } else if (rescode == 0) {
                try {
                    Business.sendUbt({ a: 'WxholdPayModel', c: 20020, dd: '20020 success callback rc=0', d: JSON.stringify(res) });
                } catch (e) {};
                that.goBackNav('sback');
            } else if (rescode == 16 || rescode == 17) {
                //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
                let _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
                HoldUi.modalConfirm(_msg, function() {
                    that.goBackNav('rback', 4);
                });
            } else if (rescode == 24) {
                //重复支付
                HoldUi.modalConfirm("您已重复提交订单！", function() {
                    Business.goBackNav('sback');
                });
            } else if (rescode == 18) { //需要开通免密支付
                let sigData;
                try {
                    sigData = JSON.parse(res.sig || '')
                } catch (e) {
                    HoldUi.modalConfirm('系统异常，请稍后再试 -5122');
                    try {
                        Business.sendUbt({ a: 'WxholdPayModel', c: 200218, dd: '200218 JSON parse res.sig error', d: JSON.stringify(res) });
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
                    Business.sendUbt({ a: 'WxholdPayModel', c: 200210, dd: '20020 success callback rc>100', d: JSON.stringify(res) });
                } catch (e) {};
                that.goBackNav('eback', 4);
            } else {
                HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5123');
                try {
                    Business.sendUbt({ a: 'WxholdPayModel', c: 200211, dd: '200211 RC小于100的错误', d: JSON.stringify(res) });
                } catch (e) {};
            }
        })
    },
    getScoreConfrimResult: function() {
        const that = this;
        const params = that.resultParams;
        params.scoreType = 1;
        HoldPayCtrl.init(params, 0, (res) => {
            if (res.scoreState == 1) {
                HoldUi.showLoading('订单提交中..');
                try {
                    Business.sendUbt({ a: 'getScoreResult', c: 30011, d: 'getScoreResult res: ' + JSON.stringify(res || '') });
                } catch (e) {};
                SubmitHold.call(that, function(res = {}) {
                    HoldUi.hideLoading();
                    try {
                        Business.sendUbt({ a: 'SubmitScoreback', c: 30011, d: 'SubmitScoreback res: ' + JSON.stringify(res || '') });
                    } catch (e) {};
                    if (res.result === 1) { //开通授权成功
                        try {
                            Business.sendUbt({ a: 'SubmitScoreback sbackcallback', c: 30011, d: 'SubmitScorebackcallback' + busData.sbackCallback });
                        } catch (e) {};
                        that.goBackNav('sback');
                    } else if (res.result == 16 || res.result == 17) {
                        //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
                        let _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
                        HoldUi.modalConfirm(_msg, function() {
                            that.goBackNav('rback', 4);
                        });
                    } else if (res.result == 18) {
                        HoldUi.modalConfirm('请先开通微信支付分扣款授权');
                    } else {
                        that.goBackNav('eback', 4);
                    }
                });
            } else {
                HoldUi.modalConfirm('开通微信支付分授权扣款失败', function() {});
            }
        });
    },
    queryScoreStatus: function(callBack) {
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
            success: function(res) {
                if (res.rc == 0) {
                    if (res.status === 1) {
                        return callBack({ scoreState: 1, msg: "微信支付分已开通" })
                    } else {
                        HoldUi.hideLoading();
                        return callBack({ scoreState: 0, msg: "微信支付分未开通" })
                    }

                } else {
                    HoldUi.hideLoading();
                    return callBack({ scoreState: 0, msg: res.rmsg || "服务返回异常！" })
                }
            },
            fail: function() {
                HoldUi.hideLoading();
                // console.log("查询失败，请重试！")
                return callBack({ scoreState: 0, msg: "查询失败，请重试！" })
            },
            complete: function() {

            }
        }).excute();
    },
    getScoreResult: function() {
        const that = this;
        const params = that.resultParams;
        params.scoreType = 1;
        params.auth = cwx.user.auth;
        that.queryScoreStatus((res) => {
            if (res.scoreState == 1) {
                HoldUi.showLoading('订单提交中..');
                try {
                    Business.sendUbt({ a: 'getScoreResult', c: 30011, d: 'getScoreResult res: ' + JSON.stringify(res || '') });
                } catch (e) {};
                SubmitHold.call(that, function(res = {}) {
                    HoldUi.hideLoading();
                    try {
                        Business.sendUbt({ a: 'SubmitScoreback', c: 30011, d: 'SubmitScoreback res: ' + JSON.stringify(res || '') });
                    } catch (e) {};
                    if (res.result === 1) { //开通授权成功
                        try {
                            Business.sendUbt({ a: 'SubmitScoreback sbackcallback', c: 30011, d: 'SubmitScorebackcallback' + busData.sbackCallback });
                        } catch (e) {};
                        that.goBackNav('sback');
                    } else if (res.result == 16 || res.result == 17) {
                        //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
                        let _msg = '支付提交失败，如有疑问，请联系携程客服：95010';
                        HoldUi.modalConfirm(_msg, function() {
                            that.goBackNav('rback', 4);
                        });
                    } else if (res.result == 18) {
                        HoldUi.modalConfirm('请先开通微信支付分扣款授权');
                    } else {
                        that.goBackNav('eback', 4);
                    }
                });
            } else {
                HoldUi.modalConfirm(res.msg, function() {});
            }
        });
    },
    getholdResult: function() {
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
            Business.sendUbt({ a: 'getholdResult', c: 30011, d: 'getholdResult start!' });
        } catch (e) {};
        that.holdData = {
            oid: orderDetail.oid,
            fromHoldPage: true
        }
        GetHoldResult.call(that, rData, function(res = {}) {
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
                    Business.sendUbt({ a: 'WxholdResultModel', c: 20031, dd: '20031 success callback rc=1', d: JSON.stringify(res) });
                } catch (e) {};
                HoldUi.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5555', function() {
                    return that.getholdResult();
                }, true, '重试');
            } else if (rescode == 0) {
                try {
                    Business.sendUbt({ a: 'WxholdResultModel', c: 20030, dd: '20030 success callback rc=0', d: JSON.stringify(res) });
                } catch (e) {};
                if (res.status == 1) {
                    that.setData({
                        payTxt: '确认',
                        fromed: true
                    });
                    if (!that.isDirect) {
                        setTimeout(function() {
                            that.submitPayhold();
                        }, 600);
                    }
                } else {
                    HoldUi.modalConfirm('开通微信支付授权扣款失败', function() {}, true, '重试');
                }
            }
        })
    },
    requestFail: function(res) {
        HoldUi.hideLoading();
        if (res && res.retCode && res.retCode != 2) {
            HoldUi.modalConfirm('系统异常，请稍后再试 -505-1', function() {
                cwx.navigateBack({});
            });
        } else {
            HoldUi.modalConfirm('系统异常，请稍后再试 -505-2', function() {
                cwx.navigateBack({});
            });
        }
        try {
            Business.sendUbt({ a: 'requestfail', c: 300500, d: JSON.stringify(res || '') });
        } catch (e) {};
    },
    rquestTimeout: function(res = {}, scode) {
        let that = this;
        let rmsg = res.errMsg || '';
        let _scode = scode.substring(4);
        try {
            Business.sendUbt({ a: 'request complete', c: 300510, d: '服务号：' + scode + '微信响应:' + rmsg });
        } catch (e) {};


        if (rmsg.indexOf('request:fail timeout') > -1) {

            try {
                Business.sendUbt({ a: 'request timeout', c: 300512, d: '服务号：' + scode + '微信响应:' + rmsg });
            } catch (e) {};

            HoldUi.modalConfirm('网络不给力，请稍候重试 - 521-1 ' + _scode, function() {
                cwx.navigateBack({});
            });
            return;
        }
        if (rmsg.indexOf('request:fail') > -1) {

            try {
                Business.sendUbt({ a: 'request fail', c: 300513, d: '服务号：' + scode + '微信响应:' + rmsg });
            } catch (e) {};

            HoldUi.modalConfirm('网络不给力，请稍候重试 - 522-1 ' + _scode, function() {
                cwx.navigateBack({});
            });
        }
    },
    miniSuccess: function(res = '') {
        try {
            Business.sendUbt({ a: 'navigateToMiniProgram success', c: 30030, d: JSON.stringify(res) });
        } catch (e) {};
        this.navigatorState = 1;
    },
    miniFail: function(res = '') {
        try {
            let errMsg = res && res.detail && res.detail.errMsg;
            let type = res && res.type
            Business.sendUbt({ a: 'navigateToMiniProgram fail', c: 30031, d: 'errMsg: ' + errMsg + '; type: ' + type });
        } catch (e) {};
        HoldUi.modalConfirm('唤醒服务失败，请稍候重试 - 1038.');
    },
    miniComplete: function() {

    }
})