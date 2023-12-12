import { cwx, CPage, _ } from '../../../../cwx/cwx.js';
let Business = require('../common/business.js');
let paymodels = require('../models/models.js');
let paymentStore = require('../../paynew/models/stores.js');
let HoldDatas = require('../components/getholddata.js');
let HoldUi = require('../components/holdui.js');
let GetHoldata = HoldDatas.getData;
let orderDetailStore = paymentStore.HoldTokenStore();
let holdOrderInfoOrderStore = paymentStore.HoldOrderInfoOrderStore();

let payResultOStore = paymentStore.HoldResultOrderStore();

let WxholdWayModel = paymodels.WxholdWayModel;
let WxholdResultModel = paymodels.WxholdResultModel;
let WxholdPayModel = paymodels.WxholdPayModel;

const WxscoreState = paymodels.WxscoreStateModel; //查询微信支付分开通状态服务
const UnWxscoreState = paymodels.UnWxscoreStateModel; //查询微信支付分开通状态服务
const WxscoreData = paymodels.WxscoreDataModel; //获取开通微信支付分所需数据

//查询微信分开通模式状态查询
const WxscoreConfirmResultQueryModel = paymodels.WxscoreConfirmResultQueryModel

let holdData;
let payToken = '';

function transStr2Obj(str) {
    var tempArray = str.split('&');
    var retObj = {};
    for (let i = 0; i < tempArray.length; i++) {
        let obj = tempArray[i];
        let innerTempArr = obj.split('=');
        retObj[innerTempArr[0]] = innerTempArr[1];
    }

    return retObj;
}

//获取公共request参数
let getParams = function(cparams, serverData) {
    let orderDetail = orderDetailStore.get() || {};
    let paramJson = {
        rextend: {
            sbitmap: 7,
            extend: ""
        }
    };

    if (serverData) {
        paramJson.requestid = orderDetail.requestid;
        paramJson.paytype = orderDetail.paytype;
        paramJson.payee = orderDetail.payee;
    } else {
        paramJson.reqpayInfo = {
            requestid: orderDetail.requestid,
            paytype: orderDetail.paytype,
            payee: orderDetail.payee
        };
        paramJson.oinfo = {
            bustype: orderDetail.bustype,
            oid: orderDetail.oid,
            currency: orderDetail.currency,
            oamount: orderDetail.amount
        }

        // subordertype
        if (orderDetail.suborderType) {
            paramJson.oinfo.subordertype = orderDetail.suborderType
        }
    }

    //! 添加支付分bizparam字段
    if (orderDetail.bizparam) {
        paramJson.bizparam = orderDetail.bizparam;
    }

    // 添加appid
    if (cwx.appId) {
        paramJson.rextend.extend = cwx.appId;
        paramJson.extend = cwx.appId;
    }

    if (cparams) {
        paramJson = _.extend(paramJson, cparams);
    }



    return paramJson;
};

//设置跳转到代扣页函数
let holdNavigate = function(hdata, settings) {
    let currentPage = cwx.getCurrentPage();
    try {
        Business.sendUbt({ a: 'holdNavigate', c: 80010, d: 'holdNavigate start!' });
    } catch (e) {};
    currentPage.navigateTo({
        url: '/pages/pay/holdpay/index',
        data: hdata,
        callback: function(json) {
            if (json && json.type) {
                switch (json.type) {
                    case 'sback':
                        settings.sbackCallback(json.data);
                        break;
                    case 'eback':
                        settings.ebackCallback(json.data);
                        break;
                    case 'rback':
                        if (typeof settings.rbackCallback === 'function') {
                            return settings.rbackCallback(json.data);
                        }
                        break;
                }
            }
        },
        success: function(data) {
            try {
                Business.sendUbt({ a: 'currentPage.navigateTo', c: 8002, d: 'currentPage.navigateTo success', dd: 'callback返回结果' + JSON.stringify(data) });
            } catch (e) {};
        },
        fail: function(data) {

            try {
                Business.sendUbt({ a: 'currentPage.navigateTo', c: 8001, d: 'currentPage.navigateTo fail', dd: 'callback返回结果' + JSON.stringify(data) });
            } catch (e) {};
            console.log('--------微信分跳转返回参数----------');
            console.log(JSON.stringify(data));

            cwx.showModal({
                title: '提示',
                content: '系统异常，请稍后再试 -8002',
                showCancel: false,
                success: function(res) {

                }
            });

        },
        complete: function(data) {
            try {
                Business.sendUbt({ a: 'currentPage.navigateTo', c: 8000, d: 'currentPage.navigateTo complete', dd: 'callback返回结果' + JSON.stringify(data) });
            } catch (e) {};
        }
    });
}

let errComplete = function(res = {}, scode, callback) {
    let that = this;
    let rmsg = res.errMsg || '';
    let mscode = scode.substring(4);
    try {
        Business.sendUbt({ a: 'request complete', c: 300510, d: '服务号：' + scode + '微信响应:' + rmsg });
    } catch (e) {};

    if (rmsg.indexOf('request:fail timeout') > -1) {

        try {
            Business.sendUbt({ a: 'request timeout', c: 300512, d: '服务号：' + scode + '微信响应:' + rmsg });
        } catch (e) {};

        callback({
            errCode: 6,
            errMsg: '网络超时，请稍候重试 - 521-1 ' + mscode
        });
    }
    if (rmsg.indexOf('request:fail') > -1) {

        try {
            Business.sendUbt({ a: 'request fail', c: 300513, d: '服务号：' + scode + '微信响应:' + rmsg });
        } catch (e) {};

        callback({
            errCode: 5,
            errMsg: '网络不给力，请稍候重试 - 522-1 ' + mscode
        });
    }
}
module.exports = {

    /**
     * 获取微信支付分确认模式开通状态
     * @function
     * @name getScoreState
     * @param {Function} callBack 执行完成后的回调函数
     * @param {Object} uictx ui交互操作对象
     * @return {undefined} 默认无返回
     * @description 获取微信支付分开通状态
     * @author lh_sun@ctrip.com
     * @inner
     */
    getScoreConfrimResult: function(callBack, uictx) {
        callBack = callBack || function() {};
        const orderDetail = orderDetailStore.get() || {};

        const param = {
            requestId: orderDetail.requestid,
            paytoken: payToken
        };
        Business.sendUbtTrace({ a: 'getScoreConfrimResult-server-start', c: 10010, dd: '获取微信支付分确认模式开通状态开始！' });
        WxscoreConfirmResultQueryModel({
            data: param,
            success: function(res) {
                if (res.rc == 0) {
                    return callBack({ scoreState: 1, msg: "微信支付分已开通" })
                } else if (res.rc == 1) {
                    return callBack({ scoreState: 0, msg: "微信支付分未开通" })
                } else {
                    return callBack({ scoreState: 0, msg: "服务返回异常！" })
                }
            },
            fail: function() {
                // console.log("查询失败，请重试！")
                return callBack({ scoreState: 0, msg: "查询失败，请重试！" })
            },
            complete: function() {
                uictx.hideLoading();
            }
        }).excute();
    },


    /**
     * 获取微信支付分开通状态
     * @function
     * @name getScoreState
     * @param {Function} callBack 执行完成后的回调函数
     * @param {Object} uictx ui交互操作对象
     * @return {undefined} 默认无返回
     * @description 获取微信支付分开通状态
     * @author sqsun@ctrip.com
     * @inner
     */
    getScoreState: function(callBack, uictx) {
        const that = this;
        callBack = callBack || function() {};
        const vData = that.valiData;
        let mktopenid = '';
        try {
            mktopenid = cwx.cwx_mkt.openid; //调用框架方法获取市场openid
        } catch (e) {
            try {
                Business.sendUbtTrace({ a: 'getScoreState_getOpenidErr', c: 10010, dd: '获取市场openid失败！', d: e + '' });
            } catch (e) {}
        };
        vData.openid = mktopenid;
        //微信小程序 APPID
        if (cwx.appId) {
            vData.extend = cwx.appId;
        }
        WxscoreState({
            data: vData,
            success: function(res) {
                if (res.rc == 0) {
                    return callBack({ scoreState: 1, msg: "微信支付分已开通" })
                } else if (res.rc == 1) {
                    return callBack({ scoreState: 0, msg: "微信支付分未开通" })
                } else {
                    return callBack({ scoreState: 0, msg: "服务返回异常！" })
                }
            },
            fail: function() {
                // console.log("查询失败，请重试！")
                return callBack({ scoreState: 0, msg: "查询失败，请重试！" })
            },
            complete: function() {
                uictx.hideLoading();
            }
        }).excute();
    },
    getScoreStateNew: function(callBack, data, uictx) {
        const that = this;
        callBack = callBack || function() {};
        const vData = that.valiData;
        let mktopenid = '';
        try {
            mktopenid = cwx.cwx_mkt.openid; //调用框架方法获取市场openid
        } catch (e) {
            try {
                Business.sendUbtTrace({ a: 'getScoreState_getOpenidErr', c: 10010, dd: '获取市场openid失败！', d: e + '' });
            } catch (e) {}
        };
        vData.openid = mktopenid;
        //微信小程序 APPID
        if (cwx.appId) {
            vData.extend = cwx.appId;
        }
        UnWxscoreState({
            data: vData,
            success: function(res) {
                if (res.rc == 0) {
                    return callBack({ scoreState: 1, msg: "微信支付分已开通" })
                } else if (res.rc == 1) {
                    return callBack({ scoreState: 0, msg: "微信支付分未开通" })
                } else {
                    return callBack({ scoreState: 0, msg: "服务返回异常！" })
                }
            },
            fail: function() {
                // console.log("查询失败，请重试！")
                return callBack({ scoreState: 0, msg: "查询失败，请重试！" })
            },
            complete: function() {
                uictx.hideLoading();
            }
        }).excute();
    },
    /**
     * 开启微信支付分
     * @function
     * @name openWxScore
     * @param {Function} callBack 执行完成后的回调函数
     * @param {Object} uictx ui交互操作对象
     * @return {undefined} 默认无返回
     * @description 开启微信支付分
     * @author sqsun@ctrip.com
     * @inner
     */
    openWxScore: function(callBack, uictx, scoreDatas) {
        const that = this;
        callBack = callBack || function() {};
        const vData = that.valiData;
        //微信小程序 APPID
        if (cwx.appId) {
            vData.extend = cwx.appId;
        }

        vData.head = {
            auth: cwx.user.auth
        };

        WxscoreData({
            data: vData,
            success: function(res) {
                if (res.rc == 0) {
                    let extData = res.extradata || '';
                    try {
                        extData = JSON.parse(extData);
                    } catch (e) {
                        Business.sendUbt({ a: 'parseextradataErr', c: 1010, dd: 'JSON格式化extradata字段失败, extradata: ' + res.extradata, d: 'openWxScore err!' });
                        extData = {};
                    }

                    if (scoreDatas.isSelfCall) {
                        const resultParams = {
                            bustype: vData.bustype,
                            auth: vData.auth
                        }
                        if (vData.requestid) {
                            resultParams.requestid = vData.requestid
                        }

                        let hdParam = _.extend({ extData, resultParams, wxScoreChannel: scoreDatas.wxScoreChannel, isWxScoreConfrimChannel: scoreDatas.isWxScoreConfrimChannel }, scoreDatas.tempObj);
                        return holdNavigate(hdParam, scoreDatas.busData);
                    }

                    that.openWxScoreView(extData, (info) => {
                        if (info) {
                            if (info.errCode === 0) {
                                return callBack({ scoreState: 1, msg: "开通微信支付分成功!" });
                            } else if (info.errCode === 2) {
                                return callBack({ scoreState: 2, msg: "开通微信支付分跳转授权页成功!" });
                            } else if (info.errCode === -3) {
                                return callBack({ scoreState: -3, msg: "取消了开通微信支付分!" });
                            } else {
                                return callBack({ scoreState: 0, msg: "开通微信支付分失败!" });
                            }
                        }
                    });
                } else {
                    callBack({ scoreState: 0, msg: "获取微信支付分sign服务返回失败!" });
                }
                try {
                    Business.sendUbt({ a: 'openWxScoreErr', c: 1010, dd: '调用openWxScore服务返回失败, rc: ' + res.rc, d: 'openWxScore err!' });
                } catch (e) {}
            },
            fail: function() {
                try {
                    Business.sendUbt({ a: 'openWxScorefail', c: 1010, dd: '调用openWxScore服务返回fail', d: 'openWxScore fail!' });
                } catch (e) {}
                return callBack({ scoreState: 0, msg: "获取微信支付分sign服务fail" });
            },
            complete: function() {
                uictx.hideLoading();
            }

        }).excute();
    },

    /**
     * 开启微信支付分API
     * @function
     * @name openWxScoreView
     * @param {Json} extraData 开通微信支付分具体参数
     * @param {Function} callBack 执行完成后的回调函数
     * @return {undefined} 默认无返回
     * @description 开启微信支付分
     * @author sqsun@ctrip.com
     * @inner
     */
    openWxScoreView: function(extraData = {}, callBack) {
        callBack = callBack || function() {};

        wx.navigateToMiniProgram({
            appId: 'wxd8f3793ea3b935b8',
            path: 'pages/use/enable',
            extraData: extraData,
            success(info) {
                console.log(info)
                callBack({ errCode: 2, errMsg: '开通免密服务跳转授权页成功' });
                try {
                    Business.sendUbt({ a: 'openWxScoreViewSuccess', c: 1010, dd: '调用navigateToMiniProgram返回success' + JSON.stringify(info || ''), d: 'openBusinessView success!' });
                } catch (e) {}
            },
            fail() {
                try {
                    Business.sendUbt({ a: 'openBusinessViewfail', c: 1010, dd: '调用openBusinessViewAPI返回fail' + JSON.stringify(err || ''), d: 'openBusinessView fail!' });
                } catch (e) {}
                return callBack({ errCode: 1, errMsg: '开通免密服务API FAIL' });
            },
            complete(res) {
                console.log(JSON.stringify(res), '++++++++++++++++++++')
            }
        });
    },
    //提交2002服务
    submitPayhold: function(callback) {
        let that = this;
        let requestData = getParams(null, true);
        let orderDetail = orderDetailStore.get() || {};
        let resData = payResultOStore.get() || {};
        let resInfo = resData.resinfo;
        let mktopenid = ''; //市场openid
        let holdData = that.holdData || {}; //代扣页面自己调用时通过作用域传值
        let fromHoldPage = holdData.fromHoldPage;
        const busType = orderDetail.bustype;
        try {
            mktopenid = cwx.cwx_mkt.openid; //调用框架方法获取市场openid
        } catch (e) {
            try {
                Business.sendUbtTrace({ a: 'getOpenidErr', c: 10010, dd: '获取市场openid失败！', d: e + '' });
            } catch (e) {}
        };

        requestData.payToken = payToken;

        requestData.ispoint = resInfo.ispoint;
        requestData.payex = 1;
        requestData.payetype = resInfo.payetype;

        requestData.submitthirdpay = {
            paymentwayid: resData.paymentwayid,
            brandid: resData.brandid,
            brandtype: resData.brandtype,
            channelid: resData.channelid,
            collectionid: resData.collectionid,
            status: resData.status,
            amount: orderDetail.amount,
            extend: cwx.appId,
            openid: mktopenid
        }
        requestData.paysign = resData.paysign;

        try {
            Business.sendUbt({ a: 'submitPayhold', c: 30010, d: 'submitPayhold start!' });
        } catch (e) {};
        WxholdPayModel({
            data: requestData,
            success: function(res = {}) {
                // res = { "ResponseStatus": { "Timestamp": "/Date(1649746477202+0800)/", "Ack": "Success", "Errors": [], "Build": null, "Version": null, "Extension": [{ "Id": "CLOGGING_TRACE_ID", "Version": null, "ContentType": null, "Value": "6873845572736325255" }, { "Id": "RootMessageId", "Version": null, "ContentType": null, "Value": "100028317-0a06b391-458262-9061" }] }, "rc": 18, "subcode": "cbu_20025", "rmsg": "您需要开通微信支付分", "dbgmsg": null, "oid": 706316263111, "seqid": "220412065433069p1yz", "bilno": null, "sphone": null, "sig": "mch_id=1400347502&nonce_str=19bc91a520c94a1fa7e261d1660e5966&package=AAQTnZoAAAABAAAAAADD30WJj5qtIh8HLCJVYiAAAABcwQVtru-5k9MmEOZJ_Pv_Nq7Cw56dNKKN5EjZKnt5jTeJwCzJ2CYPiGApA_9RUiUMszMqG3jA4vD5T9-k0ZTSYaPo8rlPCw-n4rDb99thibK4QwWJ3j6kmhecGVcqyrswHJdEc77mUyIYdGl6abN3QQpSLIBVlLTkQn66fKRqmtWV89eH-yDgaq7cGuk-hZgaYtzY-RiN9r4h&sign=7545710D85889AA3E1852E383AFCD65B04E8CFD60BC08C36533D1CC617FA0A0E&sign_type=HMAC-SHA256&timestamp=1649746476", "riskcode": "0" };

                let rescode = res.rc;
                let riskcode = res.riskcode;
                try {
                    Business.sendUbt({ a: 'submitPayholdfrominit', c: 30010, d: 'submitPayholdfrominit callback ok rc:' + rescode });
                } catch (e) {};

                if (fromHoldPage) {

                    try {
                        Business.sendUbt({ a: 'submitPayholdfromHoldPage', c: 30010, d: 'submitPayholdfromHoldPage:' + fromHoldPage });
                    } catch (e) {};

                    return callback(res)
                } else {
                    try {
                        Business.sendUbt({ a: 'submitPayholdfromHoldPageelse', c: 30010, d: 'submitPayholdfromHoldPageelse' });
                    } catch (e) {};
                    if (rescode == 0) {
                        return callback({
                            errCode: 0,
                            result: 1,
                            response: res,
                            errMsg: '开通免密服务2002返回成功'
                        });
                    } else if (rescode == 18) {
                        return callback({
                            errCode: 0,
                            result: 18,
                            response: res,
                            errMsg: '需要开通免密服务'
                        });
                    } else {
                        //Train ticket add risk tip
                        if (busType == 4 && rescode == 1 && riskcode == 300) {
                            cwx.hideLoading();
                            cwx.hideToast();
                            cwx.showModal({
                                title: '提示',
                                content: res.rmsg,
                                showCancel: false,
                                success: function(res) {

                                }
                            });
                            return;
                        }

                        return callback({
                            errCode: 1,
                            errMsg: '开通免密服务2002返回失败 - 1'
                        });
                    }

                }
            },
            fail: function(res = {}) {
                if (fromHoldPage) {
                    return that.requestFail(res);
                } else {
                    try {
                        Business.sendUbt({ a: 'submitPayholdfrominit', c: 30010, d: 'submitPayholdfrominit callback fall! res: ' + JSON.stringify(res || '') });
                    } catch (e) {};
                    let resCode = res.retCode;
                    if (resCode == 1) {
                        return callback({
                            errCode: 2,
                            errMsg: 'SOA执行失败！'
                        })
                    } else {
                        return callback({
                            errCode: 3,
                            errMsg: '获取代扣服务返回Fail - 2'
                        })
                    }
                }
            },
            complete: function(res) {
                if (fromHoldPage) {
                    that.rquestTimeout(res, '31002002');
                } else {
                    errComplete(res, '31002002', callback)
                }
            }
        }).excute();
    },
    //2301服务接口
    getHoldResult: function(params, callback) {
        let that = this;
        let respJson;
        let bustype;
        let auth;
        if (_.isObject(params)) {

            bustype = params.bustype;
            auth = params.auth;


            if (auth == '') {
                respJson = {
                    errCode: 1,
                    errMsg: 'auth传递错误'
                }
                try {
                    Business.sendUbt({ a: 'auth error', c: 30010, d: 'auth error! auth: ' + JSON.stringify(auth || '') });
                } catch (e) {};
                return callback(respJson);
            }
        } else {
            try {
                Business.sendUbt({ a: 'params error', c: 30010, d: 'params error! params: ' + JSON.stringify(params || '') });
            } catch (e) {};
            return callback({
                errCode: 2,
                errMsg: 'params参数必须是json数据！'
            });
        }
        let tempOid = 0; //no oid tag
        holdData = that.holdData; //代扣页面自己调用时通过作用域传值
        if (holdData && holdData.oid) tempOid = holdData.oid; //代扣页面自己调用传递BU oid
        orderDetailStore.setAttr('auth', auth);

        let rData = {
            bustype: bustype,
            bid: params.bid || 'WechatQuick',
            oid: tempOid,
            extend: cwx.appId
        };

        if (params.collectionid) {
            rData.collectionid = params.collectionid;
        }
        try {
            Business.sendUbt({ a: 'getholdResult', c: 30011, d: 'getholdResult start! payFrom:' + holdData.fromHoldPage });
        } catch (e) {};
        WxholdResultModel({
            data: rData,
            success: function(res = {}) {
                let rescode = res.rc;
                if (holdData && holdData.fromHoldPage) {
                    return callback(res)
                } else {
                    try {
                        Business.sendUbt({ a: 'getHoldResultfrombu', c: 30011, d: 'getholdResult callback! rescode:' + holdData + '  /status：' + res.status });
                    } catch (e) {};

                    if (rescode == 0 && res.status == 1) {
                        return callback({
                            errCode: 0,
                            result: 1, //1为代扣授权成功， 0为代扣授权失败
                            errMsg: '该用户已经授权过代扣服务'
                        });
                    } else {
                        return callback({
                            errCode: 2,
                            result: 0, //1为代扣授权成功， 0为代扣授权失败
                            errMsg: '该用户未授权过代扣服务'
                        });
                    }
                }
            },
            fail: function(res = {}) {
                try {
                    Business.sendUbt({ a: 'getHoldResultfrombu', c: 30011, d: 'getholdResult fail! res:' + JSON.stringify(res || '') });
                } catch (e) {};

                if (holdData && holdData.fromHoldPage) {
                    return that.requestFail(res);
                } else {
                    let resCode = res.retCode;
                    if (resCode == 1) {
                        return callback({
                            errCode: 3,
                            errMsg: 'SOA执行失败！'
                        })
                    } else {
                        return callback({
                            errCode: 4,
                            errMsg: '获取代扣服务返回Fail - 2'
                        })
                    }
                }
            },
            complete: function(res) {
                if (holdData && holdData.fromHoldPage) {
                    that.rquestTimeout(res, '31002301');
                } else {
                    errComplete(res, '31002301', callback);
                }
            }
        }).excute();
        try {
            Business.sendUbt({ a: 'getholdResultEnd', c: 30011, d: 'getholdResult End! oid:' + tempOid });
        } catch (e) {};
    },
    //Processing opening payment points
    initWxScore: function(params) {
        var that = this;
        params.isSelfCall = true;
        that.init(params, 0, () => {});
    },
    holdWaysCtrl: function(resData, busdata, uicxt) {
        const that = this;
        let thirdPayData = resData.thirdpay || [];
        let thirdPayRes = null;
        let resinfo = resData.resinfo || {};
        let wxScoreChannel = false;
        let isWxScoreConfrimChannel = false;
        let scoreParams = {};
        let status;

        thirdPayData.map(function(item, i) {
            if (item.brandid == 'WechatQuick') {
                thirdPayRes = {
                    paymentwayid: item.paymentwayid,
                    brandid: item.brandid,
                    brandtype: item.brandtype,
                    channelid: item.channelid,
                    collectionid: item.collectionid,
                    status: item.status,
                    paysign: resData.paysign || '',
                    merchantid: resData.merchantid,
                    brandname: item.brandname || '',
                    paytip: item.paytip || ''
                };
            }
        });


        //更新 title文案   文案使用顺序 BU传->CBU下发->默认文案
        let orderDetail = orderDetailStore.get() || {};
        let displayTitle = '购票成功后自动扣款';
        let navData = {};
        let payresultInfo = payResultOStore.get() || {};
        //返回BU回调函数
        let backParam = {
            orderID: orderDetail.oid || '',
            busType: orderDetail.bustype || '',
            price: orderDetail.amount || ''
        };

        if (payresultInfo.realoid) {
            backParam.orderID = payresultInfo.realoid;
        }

        let serverTitleObj = _.find(resData.dsettings || [], function(object) {
            return object.type == 43;
        }) || {};

        if (serverTitleObj && serverTitleObj.value) {
            displayTitle = serverTitleObj.value;
        } else if (orderDetail && orderDetail.paytitle) {
            displayTitle = orderDetail.paytitle;
        }

        navData.payTitle = displayTitle;

        if (thirdPayRes) {
            thirdPayRes.resinfo = resinfo;
            payResultOStore.set(thirdPayRes);


            //判断是支付分还是免密支付
            if ((thirdPayRes.status & 2) === 2) {
                //这种情况是微信支付分
                if ((thirdPayRes.status & 16) === 16) {
                    //这种情况是微信支付分需确认模式
                    status = 5;
                } else {
                    if ((thirdPayRes.status & 1) === 1) {
                        //这种情况是微信支付分免确认模式已经签约情况
                        status = 3;
                    } else {
                        //这种情况是微信支付分免确认模式未签约情况
                        status = 4;
                    }
                }
            } else {
                //这种情况是免密支付
                if ((thirdPayRes.status & 1) === 1) {
                    //这种情况是微信免密已经签约情况
                    status = 1;
                } else {
                    //这种情况是微信免密未签约情况
                    status = 0;
                }
            }

            Business.sendUbt({ actionType: 'holdWaysCtrl_Start_2001_respnse_status', a: 'getholdWays', c: 30011, d: 'holdWaysCtrl status:' + status });
            //无需确认
            if (status === 3 || status === 4) {
                wxScoreChannel = true;

                scoreParams = {
                    bustype: orderDetail.bustype,
                    scoreType: 2,
                    serverOpened: true
                }

                if (orderDetail.suborderType) {
                    scoreParams.suborderType = orderDetail.suborderType
                }
            }

            //微信分免确认——未签约，则直接跳转签约
            // if(status === 4){
            //     if(wxScoreChannel){
            //         //Call payment processing function

            //         that.initWxScore({
            //             data: scoreParams,
            //             busData: busdata,
            //             backData: backParam,
            //             wxScoreChannel: wxScoreChannel,
            //             tempObj : {
            //                 _payToken : payToken,
            //                 thirdPayRes : thirdPayRes,
            //                 wxScoreChannel : wxScoreChannel
            //             }
            //         }, uicxt);
            //         return;        
            //     }
            // }

            //需确认 微信分需确认模式，前端需要根据16=微信分需确认模式，直接唤起微信的确认页面 2021-7-8
            if (status === 5) {
                isWxScoreConfrimChannel = true;
                wxScoreChannel = false;

                scoreParams = {
                    bustype: orderDetail.bustype,
                    scoreType: 2,
                    serverOpened: true
                }

                if (orderDetail.suborderType) {
                    scoreParams.suborderType = orderDetail.suborderType
                }
            }

            if (status === 0) { //没有开通
                //微信支付分路由 status=2为微信支付分
                return holdNavigate(navData, busdata);
            } else {
                uicxt.showLoading('提交中..');
                let callback = function(res) {
                    uicxt.hideLoading();
                    try {
                        Business.sendUbt({ a: 'SubmitPayholdback', c: 30011, d: 'SubmitPayholdback res: ' + JSON.stringify(res || '') });
                    } catch (e) {};
                    if (res.result === 1) { //开通授权成功
                        try {
                            Business.sendUbt({ a: 'SubmitPayholdback sbackcallback', c: 30011, d: 'SubmitPayholdbacksbackcallback' + busdata.sbackCallback });
                        } catch (e) {};
                        return busdata.sbackCallback(backParam);
                    } else if (res.result === 18) {

                        if (isWxScoreConfrimChannel) {
                            let tempObj = {};
                            let lastData = null;
                            tempObj.isWxScoreConfrimChannel = isWxScoreConfrimChannel;
                            tempObj._payToken = payToken;
                            tempObj.thirdPayRes = thirdPayRes;
                            tempObj.extData = transStr2Obj(res.response.sig);
                            lastData = Object.assign(tempObj, navData);
                            if (that.direct) {
                                that.directCallback(lastData, busdata);
                                return;
                            }
                            holdNavigate(lastData, busdata);
                            Business.sendUbt({ actionType: 'holdWaysCtrl_Start_2002_response_r18', a: 'isWxScoreConfrimChannel', c: 30011, d: 'navData' + Object.assign(tempObj, navData) });
                            return;
                        }

                        if (wxScoreChannel) {
                            let tempObj = {};
                            let lastData = null;
                            const resultParams = {
                                requestid: busdata.payLoad.requestId
                            };
                            // if (vData.requestid) {
                            //     resultParams.requestid = vData.requestid
                            // }
                            tempObj.wxScoreChannel = wxScoreChannel;
                            tempObj._payToken = payToken;
                            tempObj.thirdPayRes = thirdPayRes;
                            tempObj.extData = JSON.parse(res.response.sig);
                            lastData = Object.assign(tempObj, navData);
                            lastData.resultParams = resultParams;
                            holdNavigate(lastData, busdata);
                        } else {
                            holdNavigate(navData, busdata);
                        }
                        return;
                    } else {
                        return busdata.ebackCallback(backParam);
                    }
                };

                that.submitPayhold(callback);
            }
        } else {
            //H5直联逻辑
            if (that.direct) {
                return that.directCallback({
                    payTitle: displayTitle,
                    nopayment: true
                })
            }
            /////////////////////////

            navData.nopayment = true;
            return holdNavigate(navData, busdata);
        }
    },
    //2001服务接口
    getholdWay: function(uicxt, busdata) {
        let that = this;
        let rData = getParams();
        const orderStore = orderDetailStore.get();
        const serverDatas = HoldDatas.setServerDatas(orderStore);
        rData.payorderinfo = serverDatas;
        try {
            Business.sendUbt({ a: 'getholdWay', c: 30009, d: 'getholdWay fun start!' });
        } catch (e) {};
        WxholdWayModel({
            data: rData,
            success: function(res = {}) {
                uicxt.hideLoading();
                let rescode = res.rc;
                try {
                    Business.sendUbt({ a: 'WayModelgetholdWay', c: 20010, dd: '20010 success callback', d: JSON.stringify(res) });
                } catch (e) {};

                // 0=成功
                // 1=失败
                // 2=账户冻结
                // 3=没有绑卡
                // 4=已绑卡但不能用
                // 5=只包含第三方或拿去花 
                if (rescode == 0 || rescode == 3 || rescode == 5) {
                    if (!payToken) {
                        payToken = res.paytoken;
                    }
                    return that.holdWaysCtrl(res, busdata, uicxt)
                } else { //errno:1:服务端错误即原errorInformation， res; 2:解析错误
                    try {
                        Business.exceptionInfoCollect({
                            bustype: 4,
                            excode: 3003,
                            extype: 1,
                            exdesc: '2001服务返回RC=1错误, ' + JSON.stringify(res)
                        }, '1');
                        Business.sendUbt({ a: 'WxholdWayModel', c: 20011, dd: '2001server success callback rc=1', d: JSON.stringify(res) });
                    } catch (e) {};
                    uicxt.modalConfirm(res.rmsg || '系统异常，请稍后再试 -5121', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });

                    return;
                }
            },
            fail: function(res) {
                try {
                    Business.sendUbt({ a: 'requestfail', c: 300500, d: JSON.stringify(res || '') });
                } catch (e) {};
                uicxt.hideLoading();
                if (res && res.retCode && res.retCode != 2) {
                    uicxt.modalConfirm('系统异常，请稍后再试 -505', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });
                } else {
                    uicxt.modalConfirm('系统异常，请稍后再试 -505.2', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });
                }
            },
            complete: function(res) {
                try {
                    Business.sendUbt({ a: 'complete', c: 300501, d: JSON.stringify(res || '') });
                } catch (e) {};
                errComplete(res, '31002001');
            }
        }).excute();
    },
    //代扣接口API初始化
    init: function(busdata, direct = false, callBack = function() {}) {
        const that = this;
        let loadingTxt = '连接中.';

        //scoreType 1:查询  2：开通
        let type = busdata.scoreType; //根据前置接口路由到相应的功能
        let scoreDatas = {}; //设置支付分数据
        const isSelfCall = busdata.isSelfCall; //内部自己调用
        that.direct = direct; //H5直联
        that.directCallback = callBack; //H5直联回调函数或查询接口回调
        if (isSelfCall) {
            scoreDatas = busdata;
            that.holdpayData = busdata.data;
            type = busdata.data.scoreType;
        } else {
            that.holdpayData = busdata; //保存数据到Pay
        }

        try {
            Business.sendUbt({ a: 'holdpayinit', c: 1011, d: 'holdpayinit start!' });
        } catch (e) {};

        GetHoldata.call(that, function(tokenJson) {
            const self = this;
            if (direct) {
                loadingTxt = '服务中.';
            }
            try {
                Business.sendUbt({ a: 'GetHoldWay', c: 1010, dd: '发起2001服务开始', d: 'GetHoldWay start!' });
            } catch (e) {}
            that.valiData = tokenJson;
            self.showLoading(loadingTxt);
            switch (type) {
                case 1:
                    that.getScoreState(callBack, self);
                    break;
                case 2:
                    that.openWxScore(callBack, self, scoreDatas);
                    break;
                default:
                    payToken = '';
                    that.getholdWay(self, busdata);
                    break;
            }
        });
    },
    getholdWays: function(holdDatas) {
        const that = this;
        HoldUi.showLoading('服务发送中.');
        const payLoads = holdDatas.payLoad;

        // 添加appid
        if (cwx.appId) {
            payLoads.rextend = {
                sbitmap: 7,
                extend: cwx.appId
            }
        }

        paymodels.WxholdWaysModel({
            data: payLoads,
            success: function(res = {}) {
                HoldUi.hideLoading();
                const { rc, rmsg, payorderinfo, resinfo, thirdpay, paysign, merchantid, dsettings } = res;
                if (rc == 0) {
                    const reBuildDatas = HoldDatas.buildSData(payorderinfo, payLoads.requestId);
                    if (reBuildDatas) {
                        const holdsData = {
                            fromServer: true,
                            data: reBuildDatas
                        }
                        that.holdpayData = holdsData;
                        GetHoldata.call(that, function(tokenJson) {
                            const self = this;
                            that.valiData = tokenJson;
                            const resData = {
                                "resinfo": resinfo,
                                "paysign": paysign,
                                "thirdpay": thirdpay,
                                "dsettings": dsettings,
                                "merchantid": merchantid
                            }
                            that.holdWaysCtrl(resData, holdDatas, self);
                        })
                    }
                } else {
                    HoldUi.modalConfirm(rmsg || '系统异常，请稍后再试 -5104', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });
                }
            },
            fail: function(res = {}) {
                try {
                    Business.sendUbt({ a: 'getholdWays', c: 30011, d: 'getholdWays fail! res:' + JSON.stringify(res || '') });
                } catch (e) {};

                const resCode = res.retCode;
                HoldUi.hideLoading();
                if (resCode && resCode != 2) {
                    HoldUi.modalConfirm('系统异常，请稍后再试 -5105', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });
                } else {
                    HoldUi.modalConfirm('系统异常，请稍后再试 -5105.2', function() {
                        //H5直联逻辑
                        if (that.direct) {
                            cwx.navigateBack({
                                delta: 1
                            });
                        }
                        ////////////////////////////
                    });
                }
            }
        }).excute();
    },
    //服务端传值
    init2: function({ busdata, isDirect }, callBack = () => {}) {
        const that = this;
        const tokenData = busdata.token;
        that.direct = isDirect; //H5直联
        that.directCallback = callBack; //H5直联回调函数或查询接口回调
        payToken = tokenData.payToken;
        holdOrderInfoOrderStore.set(tokenData);
        let loadingTxt = '连接中.';
        HoldUi.showLoading(loadingTxt);
        const getSRequest = HoldDatas.getServerData(tokenData);
        if (getSRequest) {
            const holdDatas = {
                payLoad: getSRequest
            }

            if (!isDirect) {
                holdDatas.sbackCallback = busdata.sbackCallback;
                holdDatas.ebackCallback = busdata.ebackCallback;
                holdDatas.rbackCallback = busdata.rbackCallback;
                holdDatas.fromCallback = busdata.fromCallback;
            }
            that.getholdWays(holdDatas);
        }
    }

}