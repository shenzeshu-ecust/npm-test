import { cwx, _ } from '../../../../cwx/cwx.js';

var Business = require('../common/business.js');
var storesRequire = require('../../paynew/models/stores.js');
var orderDetailStore = storesRequire.HoldTokenStore();
var HoldUi = require('./holdui.js');
const errAlert = function(ErrorMsg) {
    //显示modal提示框信息
    HoldUi.modalConfirm(ErrorMsg, function() {
        cwx.navigateBack();
    });
}

function getData(callback) {
    var that = this;
    //验证整体变量定义
    var holdpayData = that.holdpayData;
    var fromServer = holdpayData.fromServer;
    var type = holdpayData.scoreType;
    var serverOpened = holdpayData.serverOpened;
    var bizJson = null;
    var bizStr = '';
    var direct = that.direct;
    var decodePayToken = null,
        payToken = null;
    var order_obj = {},
        dataErrortype = 0;

    function showAlert(ErrorMsg, hasBack = 1) {
        try {
            switch (dataErrortype) {
                case 1:
                    Business.sendUbt({ a: 'getholddata', c: 100103, dd: 'Bu传递url解析异常!', d: 'BU传过来的参数token: ' + holdpayData.token });
                    break;
                case 2:
                    Business.sendUbt({ a: 'getholddata', c: 100104, dd: 'Bu传递token内必填字段填写错误!', d: 'BU传过来的参数token: ' + holdpayData.token });
                    break;
            }
        } catch (e) {}
        //显示modal提示框信息
        HoldUi.modalConfirm(ErrorMsg, function() {
            if (hasBack) {
                cwx.navigateBack();
            }
        });
        return null;
    }

    function getBizParmas(bizJson) {
        var bizTmpData; //? biz参数临时参数
        if (typeof bizJson === 'string') {
            bizJson = JSON.parse(bizJson);
        }
        // try {

        //     if (typeof bizJson === 'string') {
        //         bizJson = JSON.parse(bizJson);
        //     }
        //     dataErrortype = 2;

        //     //! riskInfo必填字段
        //     if (bizJson.riskInfo) {
        //         bizTmpData = bizJson.riskInfo;
        //         if (!bizTmpData.riskMark) {
        //             return showAlert('获取bizparam.riskMark失败！-1503.1', 0);
        //         }
        //     } else {
        //         return showAlert('获取bizparam.riskInfo失败！-1503', 0);
        //     }


        //     //! orderInfo必填字段
        //     if (bizJson.orderInfo) {
        //         bizTmpData = bizJson.orderInfo;
        //         //订单总金额（分）
        //         if (!bizTmpData.orderAmount) {
        //             return showAlert('获取bizparam.orderAmount失败！-1506.1', 0);
        //         }

        //         //服务信息，用于介绍本订单所提供的服务，不超过20个字符
        //         if (!bizTmpData.serviceIntroduction) {
        //             return showAlert('获取bizparam.serviceIntroduction失败！-1506.2', 0);
        //         } else if (bizTmpData.serviceIntroduction.length > 20) {
        //             return showAlert('bizparam.serviceIntroduction长度大于20个字符了！-1506.3', 0);
        //         }
        //     } else {
        //         return showAlert('获取bizparam.orderInfo失败！-1506', 0);
        //     }

        //     //! fees必填字段
        //     if ((_.isArray(bizJson.fees)) && (bizJson.fees.length > 0)) {
        //         bizTmpData = bizJson.fees;
        //         for (let i = 0; i < bizTmpData.length; i++) {
        //             const element = bizTmpData[i];
        //             const feeName = element.feeName;
        //             if (!feeName) {
        //                 return showAlert('获取fees.feeName失败！-1507.1', 0);
        //             } else if (feeName.length > 20) {
        //                 return showAlert('fees.feeName长度大于20个字符了！-1507.2', 0);
        //             }

        //             if (!element.feeAmount) {
        //                 return showAlert('获取fees.feeAmount失败！-1507.3', 0);
        //             }

        //             if (!element.feeDesc) {
        //                 return showAlert('获取fees.feeDesc失败！-1507.4', 0);
        //             } else if (element.feeDesc.length > 30) {
        //                 return showAlert('fees.feeDesc长度大于30个字符了！-1507.5', 0);
        //             }
        //         }
        //     } else {
        //         return showAlert('获取bizparam.fees失败！-1507', 0);
        //     }
        // } catch (e) {
        //     showAlert('格式化bizparam字段失败！-1510', 0);
        //     Business.sendUbt({ a: 'getholddata', c: 1001, dd: '解析bizparam参数错误', d: 'errormessage: ' + e.message || '' });
        //     return null;
        // }

        //TODO 将bizparam转为json字符串
        return JSON.stringify(bizJson);
    }

    //查询微信支付分状态或开通微信支付分
    if (type === 1 || type === 2) {
        // if (!holdpayData.bustype) {
        //     return showAlert('获取bustype参数失败！- 1501', 0);
        // }

        // if (!holdpayData.auth) {
        //     return showAlert('获取auth参数失败！- 1502', 0);
        // }

        const scoreJson = {
            bustype: holdpayData.bustype,
            brandid: "WechatQuick",
            auth: holdpayData.auth
        };

        if (holdpayData.requestid) {
            scoreJson.requestid = holdpayData.requestid;
        }

        //open weichat score add bizparam
        if (type === 2) {
            if (!serverOpened) {
                if (!holdpayData.suborderType) {
                    return showAlert('获取suborderType参数失败！- 1504', 0);
                }
            }

            if (holdpayData.suborderType) {
                scoreJson.subordertype = holdpayData.suborderType;
            }

            bizJson = holdpayData.bizparam;
            if (bizJson) {
                bizStr = getBizParmas(bizJson);
                if (bizStr) {
                    scoreJson.bizparam = bizStr
                }
            };
        }

        orderDetailStore.setAttr("auth", holdpayData.auth);
        callback.call(HoldUi, scoreJson);
        return;
    }

    try {
        try {
            Business.sendUbt({ a: 'getholddata', c: 1001, dd: '开始解析BU参数', d: 'getholddata start!' });
        } catch (e) {}

        if (fromServer) {
            payToken = holdpayData.data;
        } else {
            payToken = decodeURIComponent(holdpayData.token || ''),
                decodePayToken = cwx.util.base64Decode(payToken);
            //判断BU过来之后是否传token
            if (decodePayToken.length > 0) {
                payToken = JSON.parse(decodePayToken);
            } else {
                try {
                    Business.sendUbt({ a: 'getholddata', c: 1001 - 1, dd: '解析BU参数传入token为空', d: 'token empty!' });
                } catch (e) {}
                return showAlert('获取token字段为空 - (1001-1)');
            }
        }


        if (payToken.oid) {
            payToken.oid += '';
        }

        //代码做兼容处理  如果decodeUrlToken.length == 0 则 token为""，那么下面的代码直接报错了
        for (var key in payToken) {
            var value = payToken[key];
            //过滤bu传递参数的头尾空格
            if (value && _.isString(value)) {
                value = value.replace(/(^\s*)|(\s*$)/g, '');
            }
            order_obj[key] = value;
        }

        //选填字段，设置默认值
        typeof(order_obj.currency) == 'undefined' && (order_obj.currency = 'CNY');
        typeof(order_obj.auth) == 'undefined' && (order_obj.auth = '');

        //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
        if (_.isString(order_obj.currency) && order_obj.currency.toLowerCase() === 'rmb') {
            order_obj.currency = 'CNY';
        }

        order_obj['totalamount'] = order_obj.amount;
        order_obj['origamount'] = order_obj.amount;
    } catch (e) {
        dataErrortype = 1;
        return showAlert('系统异常，请重新提交订单(1001)');
    }

    if (!order_obj.amount && order_obj.amount == 0) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1005)');
    }

    if (!order_obj.oid) {
        dataErrortype = 2;
        ErrorMsg = '系统异常，请重新提交订单(1006)';
    }

    if (!order_obj.auth || order_obj.auth == 'isnull') {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1004)');
    }

    if (!order_obj.bustype && !fromServer) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1007)');
    }

    if (!order_obj.payee) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1008)');
    }

    if (!order_obj.paytype) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1009)');
    }

    if (!order_obj.requestid) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1010)');
    }


    if (direct && !order_obj.sback) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1013)');
    }

    if (direct && !order_obj.eback) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(1014)');
    }

    //提交订单到微信支付分
    bizJson = order_obj.bizparam;

    if (bizJson) {
        bizStr = getBizParmas(bizJson);
        if (bizStr) {
            order_obj.bizparam = bizStr
        } else {
            return;
        }
    };

    try {
        Business.sendUbt({ a: 'getholddata', c: 1001, dd: '开始解析BU参数', d: 'getdata end!' });
        Business.sendUbt({ a: 'getholddataend', c: 10010, dd: '解析BU参数完成', d: '解析成功的参数paytype：' + order_obj.paytype });
    } catch (e) {}

    orderDetailStore.set(order_obj);
    return callback.call(HoldUi, order_obj);
}

function getServerData(data) {
    try {
        const {
            requestId,
            orderId,
            payToken
        } = data;

        if (!requestId) {
            return errAlert('系统繁忙，请稍后重试(P2)');
        }

        if (!orderId) {
            return errAlert('系统繁忙，请稍后重试(P3)');
        }

        if (!payToken) {
            return errAlert('系统繁忙，请稍后重试(P4)');
        }
        const auth = cwx.user.auth;
        orderDetailStore.setAttr("auth", auth);
        return { requestId, orderId, payToken };
    } catch (e) {
        return errAlert('系统繁忙，请稍后重试(P1)')
    }

}

function buildSData(resData, requestId) {
    try {
        resData = JSON.parse(resData);
        const { order, paymentType, merchant, payExtend } = resData;
        const auth = cwx.user.auth;
        let {
            orderId,
            payTitle,
            displayTitle,
            orderAmount,
            subOrderType,
            orderCurrency
        } = order;

        let displayTitleObj = null;
        if(!payTitle){
            if (_.isString(displayTitle)) {
                displayTitleObj = JSON.parse(displayTitle);
            }
            let { customTitle } = displayTitleObj;
    
            if (_.isArray(customTitle) && customTitle.length) {
                if (!payTitle) {
                    payTitle = customTitle[0].title;
                }
            }
        }
        

        const { payee, payType } = paymentType;
        const { busType, notifyUrl, sback, eback, rback } = merchant;
        const { bizParam } = payExtend;
        const reBuildData = {
            "oid": orderId,
            "auth": auth,
            "payee": payee,
            "amount": orderAmount,
            "paytype": payType,
            "bustype": busType,
            "paytitle": payTitle,
            "currency": orderCurrency,
            "requestid": requestId,
            "sback": sback,
            "eback": eback,
            "rback": rback
        }

        if (notifyUrl) {
            reBuildData.notify = notifyUrl;
        }

        if (subOrderType) {
            reBuildData.suborderType = subOrderType;
        }

        if (bizParam) {
            reBuildData.bizparam = bizParam;
        }

        return reBuildData;
    } catch (e) {
        console.log('发生的报错：', e);
        return errAlert('系统异常，请重新提交订单(P5)');
    }
}

function setServerDatas(busDatas) {
    const {
        bustype,
        currency,
        amount,
        oid,
        payee,
        paytype,
        paytitle,
        requestid,
        suborderType,
        notify,
        goodstag,
        sback,
        eback,
        rback,
        bizparam
    } = busDatas;

    const serverDatas = {
        "paymentType": {
            "payType": paytype,
            "payee": payee
        },
        "order": {
            "orderId": oid,
            "orderAmount": amount,
            "orderCurrency": currency,
            "payTitle": paytitle
        },
        "merchant": {
            "busType": bustype
        },
        "header": {
            "version": "1.0",
            "scene": "IQP",
            "requestId": requestid,
            "clientType": "MiniApp"
        }
    }

    if (goodstag) {
        if (!serverDatas.payExtend) {
            serverDatas.payExtend = {};
        }
        serverDatas.payExtend.goodstag = goodstag;
    }

    if (bizparam) {
        if (!serverDatas.payExtend) {
            serverDatas.payExtend = {};
        }
        serverDatas.payExtend.bizParam = bizparam;
    }

    if (suborderType) {
        serverDatas.order.subOrderType = suborderType;
    }

    if (notify) {
        serverDatas.merchant.notifyUrl = notify;
    }

    if (sback) {
        serverDatas.merchant.sback = sback;
    }

    if (eback) {
        serverDatas.merchant.eback = eback;
    }

    if (rback) {
        serverDatas.merchant.rback = rback;
    }

    return JSON.stringify(serverDatas);
}

module.exports = {
    getData: getData,
    buildSData: buildSData,
    setServerDatas: setServerDatas,
    getServerData: getServerData
}