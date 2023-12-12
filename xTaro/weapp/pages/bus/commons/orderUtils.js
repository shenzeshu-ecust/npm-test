/**
 * @Author: jhyi jhyi@trip.com
 * @Date: 2023-02-07 17:38:44
 * @LastEditTime: 2023-04-13 22:32:50
 * @LastEditors: jhyi jhyi@trip.com
 * @Description:
 * @FilePath: /bus/commons/orderUtils.js
 * @
 */

import { cwx, __global } from './cwx/index';
import { Pservice } from './productservice';
import { stepTrace, BUS_PAY_STEP, point } from './utils/traceStep';
let realPay = (param, serverData, orderNumber) => {
    return new Promise((resolve, reject) => {
        let payData = {
            sbackCallback: function (result) {
                // 支付成功
                let data = {
                    pointName: 'afterPayToken',
                    result: 1,
                    ext: '收银台支付成功',
                    orderNumber: orderNumber,
                };
                point(data);
                resolve(result);
            },
            fromCallback: function (result) {
                // 跳转至支付也后直接返回
                // this.getCouponList();
                console.log(result);

                let data = {
                    pointName: 'afterPayToken',
                    result: 0,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                let err = { ...result, type: 1 };
                point(data);
                reject(err);
            },
            ebackCallback: function (result) {
                // 支付失败
                let data = {
                    pointName: 'afterPayToken',
                    result: 0,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                let err = { ...result, type: 1 };
                point(data);
                reject(err);
            },
            rbackCallback: function (result) {
                console.log(result);
                // 取消支付
                let err = { ...result, type: 0 };
                let data = {
                    pointName: 'afterPayToken',
                    result: 0,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                point(data);
                reject(err);
            },
        };
        if (param) {
            payData.data = param;
        } else if (serverData) {
            payData.serverData = serverData;
        }
        cwx.payment.callPay2(payData);
    });
};

let holdPay2 = (param, orderNumber) => {
    return new Promise((resolve, reject) => {
        cwx.payment.withholdPay2({
            token: param || {},
            sbackCallback: function (result) {
                // 支付成功
                let data = {
                    pointName: 'afterPayToken',
                    result: 1,
                    ext: '收银台支付成功',
                    orderNumber: orderNumber,
                };
                point(data);
                resolve(result);
            },
            fromCallback: function (result) {
                // 跳转至支付也后直接返回
                // this.getCouponList();
                console.log(result);
                let err = { ...result, type: 1 };
                let data = {
                    pointName: 'afterPayToken',
                    result: 10,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                point(data);
                reject(err);
            },
            ebackCallback: function (result) {
                // 支付失败
                let err = { ...result, type: 1 };
                let data = {
                    pointName: 'afterPayToken',
                    result: 0,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                point(data);
                reject(err);
            },
            rbackCallback: function (result) {
                console.log(result);
                // 取消支付
                let err = { ...result, type: 0 };
                let data = {
                    pointName: 'afterPayToken',
                    result: 0,
                    ext: '收银台支付失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: orderNumber,
                };
                point(data);
                reject(err);
            },
        });
    });
};

const getLaunchPay = (_data) => {
    return Pservice.getLaunchPay({
        orderNumber: _data.orderNumber,
        disableRealNameGuid: _data.disableRealNameGuid ? true : false,
        postPay: _data.payment === 'QAPAY' || false,
        optWrap: _data.optWrap
    })
        .then((res) => {
            let payParam = (res.data && res.data.evokeCashier) || {};

            if (!payParam.payToken) {
                throw {
                    error: 'no pay token',
                };
            } else {
                return { ...payParam, busType: payParam.busType || 14 };
            }
        })
        .catch((err) => {
            console.log('get pay param error');

            throw err;
        });
};

const getOfflinePayParams = (_data) => {
    return Pservice.offlineGetPayParams({
        orderNumber: _data.orderNumber,
        optWrap: _data.optWrap
    })
        .then((res) => {
            point({
                pointName: 'afterFetchOfflinePayParams',
                result: 1,
                ext: '获取支付参数成功',
                orderNumber: _data.orderNumber,
            });
            let payParam = (res.data && res.data.payParams) || {};
            if (!payParam.payToken) {
                throw {
                    error: 'no pay token',
                };
            } else {
                return { ...payParam, busType: payParam.busType || 14 };
            }
        })
        .catch((err) => {
            point({
                pointName: 'afterFetchOfflinePayParams',
                result: 1,
                ext: '获取支付参数失败',
                errMsg: JSON.stringify(err),
                orderNumber: _data.orderNumber,
            });
            return getLaunchPay(_data);
        });
};

let getPayParam = (_data) => {
    if (_data.isOfflinePay) {
        return getOfflinePayParams(_data);
    } else {
        return getLaunchPay(_data);
    }
};

let pay = (_data, success, fail) => {
    // 获取流水号之前埋点
    // 实际调用支付
    cwx.showLoading({
        title: '正在支付...',
    });
    const pageId = cwx.getCurrentPage().pageId;
    stepTrace({
        step: BUS_PAY_STEP.beforeFetchData,
        apiName: 'getPayParam',
        pageId: pageId,
    });
    point({
        pointName: 'beforeFetchOfflinePayParams',
        result: 1,
        ext: '获取支付参数前',
        orderNumber: _data.orderNumber,
    });
    return getPayParam(_data)
        .then((payParam) => {
            stepTrace({
                step: BUS_PAY_STEP.afterFetchData,
                apiName: 'getPayParam',
                pageId: pageId,
            });
            point({
                pointName: 'beforePayToken',
                result: 1,
                ext: '收银台支付调起前',
                orderNumber: _data.orderNumber,
            });
            if (_data.payment === 'QAPAY') {
                return holdPay2(payParam, _data.orderNumber);
            } else {
                return realPay(null, payParam, _data.orderNumber);
            }
        })
        .then((res) => {
            cwx.hideLoading();
            return res;
        })
        .catch((err) => {
            cwx.hideLoading();
            throw err;
        });
};

let addOrder = (data) => {
    let param = data;
    cwx.showLoading({
        title: '正在下单...',
    });

    param.isSocket = false;

    stepTrace({
        step: BUS_PAY_STEP.beforeFetchData,
        apiName: 'newAddorder',
    });

    return Pservice.createBookingOrder(param)
        .then((res) => {
            stepTrace({
                step: BUS_PAY_STEP.afterFetchData,
                apiName: 'newAddorder',
            });
            let order = res.data;
            if (order.orderNumber) {
                cwx.hideLoading();
                const currentPage = cwx.getCurrentPage();
                cwx.mkt.sendUnionTrace(currentPage, order.orderNumber, 'BUS');
                return order;
            } else {
                throw res;
            }
        })
        .catch((err) => {
            cwx.hideLoading();
            return {
                message: err.message || '下单失败',
                code: err.code || '-1001',
            };
        });
};

export default {
    pay,
    realPay,
    getPayParam,
    getOfflinePayParams,
    addOrder,
};
