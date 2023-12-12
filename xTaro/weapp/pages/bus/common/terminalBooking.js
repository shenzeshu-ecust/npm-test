import {
    _,
    cwx,
    URLUtil,
    traceStep,
    BusRouter,
    Pservice,
    orderUtils,
} from './index';
const { stepTrace, BUS_PAY_STEP, point } = traceStep;

var updateInfo = function (info) {
    stepTrace({
        step: BUS_PAY_STEP.beforeFetchData,
        apiName: 'aiMiniAppUpdateOrderContent',
    });
    Pservice.aiMiniAppUpdateOrderContent(info)
        .then((res) => {
            stepTrace({
                step: BUS_PAY_STEP.afterFetchData,
                apiName: 'aiMiniAppUpdateOrderContent',
            });
        })
        .catch((err) => {
            console.log(err);
            Pservice.aiMiniAppUpdateOrderContent(info).catch((err) => err);
        });
};
var pay = (order, success, fail) => {
    // 获取流水号之前埋点
    // 实际调用支付
    stepTrace({
        step: BUS_PAY_STEP.beforePay,
    });
    return orderUtils
        .pay({ ...order, isOfflinePay: true }, success, fail)
        .then((res) => {
            stepTrace({
                step: BUS_PAY_STEP.afterPay,
                payStatus: 'success',
            });
            return {
                ...order,
                ...res,
            };
        })
        .catch((err) => {
            stepTrace({
                step: BUS_PAY_STEP.afterPay,
                payStatus: 'error',
            });
            throw {
                ...order,
                ...err,
            };
        });
};

let toOrder = ({ orderNumber, productLine }, success, type) => {
    stepTrace({
        step: BUS_PAY_STEP.beforeJump,
    });
    let toUrl = () => {
        let payparam = getPayParam(type);
        let url = '';
        if (success) {
            url = payparam.sback;
        } else {
            url = payparam.eback;
        }
        BusRouter.redirectTo(url, { oid: orderNumber, bShow: true }, true);
    };
    if (type == 'pointBus') {
        toUrl();
    } else {
        if (productLine === 2) {
            //shiporder
            BusRouter.redirectTo(
                '/pages/ship/orderdetail/orderdetail?orderId=' + orderNumber
            );
        } else if (productLine === 3) {
            toUrl();
        } else {
            let params = {
                oid: orderNumber,
                fromPage: success ? 'booking' : '',
            };
            BusRouter.redirectTo('orderdetail', params, true, 5);
        }
    }
};
var getPayParam = function (type) {
    if (type == 'pointBus') {
        return {
          islogin: 1,
          from: 'https://m.ctrip.com/webapp/tourbus/yueche/order?frompay=1',
          sback: 'https://m.ctrip.com/webapp/tourbus/yueche/order',
          eback: 'https://m.ctrip.com/webapp/tourbus/yueche/order?f=1',
          rback: '',
        };
    } else {
        return {
            islogin: 1,
            from: 'https://m.ctrip.com/webapp/bus/bus/orderdetail?frompay=1',
            sback: 'https://m.ctrip.com/webapp/bus/bus/result',
            eback: 'https://m.ctrip.com/webapp/bus/bus/result?f=1',
            rback: '',
        };
    }
};

function terminalBooking(page, id, ordertype = '', params = {}) {
    let newApi = parseInt(params.newapi || 0);
    let addorderApi = newApi
        ? Pservice.offlineMiniAppSubOrderNew
        : Pservice.offlineMiniAppSubOrder;

    var getOfflinePayParam = () => {
        const openId = cwx && cwx.cwx_mkt && cwx.cwx_mkt.openid;
        stepTrace({
            step: BUS_PAY_STEP.beforeFetchData,
            apiName: newApi
                ? 'offlineMiniAppSubOrderNew'
                : 'offlineMiniAppSubOrder',
        });
        point({
            pointName: 'beforeAppSubOrder',
            result: 1,
            ext: '携程下单前',
            orderNumber: id,
        });
        return addorderApi({
            id: id,
            ordertype: ordertype,
            ...params,
            payParam: getPayParam(ordertype),
            openid: openId,
        })
            .then((res) => {
                stepTrace({
                    step: BUS_PAY_STEP.afterFetchData,
                    apiName: newApi
                        ? 'offlineMiniAppSubOrderNew'
                        : 'offlineMiniAppSubOrder',
                });
                if (newApi) {
                    if (res.data && res.data.ctripOrderNumber) {
                        point({
                            pointName: 'afterAppSubOrder',
                            result: 1,
                            ext: '携程下单成功',
                            orderNumber: res.data.ctripOrderNumber,
                        });
                        return {
                            orderNumber: res.data.ctripOrderNumber,
                            productLine: res.data.productLine,
                        };
                    } else {
                        throw res;
                    }
                } else {
                    if (res.OrderNumber) {
                        point({
                            pointName: 'afterAppSubOrder',
                            result: 1,
                            ext: '携程下单成功',
                            orderNumber: res.OrderNumber,
                        });
                        return {
                            orderNumber: res.OrderNumber,
                        };
                    } else {
                        throw {
                            code: res.Code,
                            message: res.Message,
                            orderNumber: res.OrderNumber,
                        };
                    }
                }
            })
            .catch((err) => {
                point({
                    pointName: 'afterAppSubOrder',
                    result: 0,
                    ext: '携程下单失败',
                    errMsg: JSON.stringify(err),
                    orderNumber: err.orderNumber || err.OrderNumber || '',
                });
                throw {
                    code: err.code || err.Code || -1001,
                    message: err.message || err.Message || '支付失败',
                    orderID: err.orderNumber || err.OrderNumber || '',
                    data: err.data || {},
                };
            });
    };

    var start = (success, fail) => {
        return new Promise(function (resolve, reject) {
            Pservice.aiMiniAppAddOrderInfo({ Id: id })
                .then((data) => {
                    var info = {
                        Id: id,
                        BookingStatus: 1,
                    };
                    updateInfo(info);
                    if (cwx.user.isLogin()) {
                        var info = {
                            Id: id,
                            BookingStatus: 2,
                        };
                        updateInfo(info);
                        var orderSuccess = (order) => {
                            var info = {
                                Id: id,
                                OrderId: order.orderNumber,
                                BookingStatus: 4,
                            };
                            updateInfo(info);
                            success && success(order);
                            resolve(order);
                        };
                        var orderFail = (err) => {
                            var info = {
                                Id: id,
                                BookingStatus: 5,
                                Msg: err.message || '下单失败',
                            };
                            updateInfo(info);
                            fail && fail(err);
                            reject(err);
                        };
                        addorder(JSON.parse(data.OrderInfo), true)
                            .then((res) => orderSuccess(res.return))
                            .catch((err) => orderFail(err));
                    } else {
                        var err = {
                            Id: id,
                            BookingStatus: 3,
                            Msg: '登陆失败',
                        };
                        updateInfo(err);
                        fail && fail(err);
                        reject(err);
                    }
                })
                .catch((err) => {
                    fail && fail(err);
                    reject(err);
                });
        }).catch((err) => {
            if (!fail) {
                throw err;
            }
        });
    };

    return {
        start,
        pay,
        updateInfo,
        getPayParam,
        getOfflinePayParam,
        toOrder,
    };
}
Object.setPrototypeOf(terminalBooking, {
    pay,
    updateInfo,
    getPayParam,
    toOrder,
});

export default terminalBooking;
