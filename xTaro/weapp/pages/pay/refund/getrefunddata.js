import { cwx, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var HoldUi = require('../../thirdPlugin/pay/components/holdui.js');

var storesRequire = require('../../thirdPlugin/paynew/models/stores.js');
var orderDetailStore = storesRequire.OrderDetailStore();


function getRefundData(callback) {
    const that = this;
    //Verify global variable definition
    let refundData = that.refundData;
    refundData = decodeURIComponent(refundData || '').trim();
    let refundJson = {};
    let dataErrortype = 0;
    let auth = cwx.user.auth;

    function showAlert(ErrorMsg, hasBack = 1) {
        try {
            switch (dataErrortype) {
                case 1:
                    Business.sendUbt({ a: 'getRefundData', c: 100103, dd: 'Bu传递refundData解析异常!', d: 'BU传过来的参数refundData: ' + refundData });
                    break;
                case 2:
                    Business.sendUbt({ a: 'getRefundData', c: 100104, dd: 'Bu传递refundData内必填字段填写错误!', d: 'BU传过来的参数refundData: ' + refundData });
                    break;
            }
        } catch (e) {}
        //Display modal prompt box information
        HoldUi.modalConfirm(ErrorMsg, function() {
            if (hasBack) {
                cwx.navigateBack();
            }
        });
        return null;
    }

    try {
        Business.sendUbt({ a: 'getRefundData', c: 1001, dd: '开始解析BU参数', d: 'getRefundData start!' });

        refundData = cwx.util.base64Decode(refundData);
        //Determine whether to pass refundData after the BU comes
        if (refundData.length > 0) {
            refundJson = JSON.parse(refundData);
        } else {
            Business.sendUbt({ a: 'getRefundData', c: 1001 - 1, dd: '获取refundData字段为空', d: 'token empty!' });
            return showAlert('获取refundData字段为空 - P01');
        }

        if (refundJson.orderId) {
            refundJson.orderId += '';
        }

        //Compatible code
        for (let key in refundJson) {
            var value = refundJson[key];
            //Filter head and tail spaces of bu passed parameters
            if (value && _.isString(value)) {
                value = value.replace(/(^\s*)|(\s*$)/g, '');
            }
            refundJson[key] = value;
        }
    } catch (e) {
        Business.sendUbt({ a: 'getRefundData err', c: 1001 - 1, dd: 'getRefundData err', d: 'errinfo:' + e.message });
        dataErrortype = 1;
        return showAlert('系统异常，请重新提交订单(P02)');
    }

    if (!auth) {
        dataErrortype = 2;
        return showAlert('系统异常，请重新提交订单(P09)');
    } else {
        orderDetailStore.setAttr('auth', auth);
    }

    if (!refundJson.orderId) {
        dataErrortype = 2;
        return showAlert('系统繁忙，请稍后重试（P3101）');
    }

    if (!refundJson.businessType) {
        dataErrortype = 2;
        return showAlert('系统繁忙，请稍后重试（P3102）');
    }

    let billNo = refundJson.billNo;
    let extNo = refundJson.externalNo;
    if (billNo) {
        if (_.isArray(billNo)) {
            const billNoLen = billNo.length;
            //externalNo and billNo cannot coexist 
            if (billNoLen > 0 && extNo) {
                dataErrortype = 2;
                return showAlert('系统繁忙，请稍后重试（P3104）');
            }

            if (billNoLen < 1) {
                billNo = null;
            }
        } else {
            dataErrortype = 2;
            return showAlert('系统异常，请重新提交订单(P03)');
        }
    }

    if (!billNo && !extNo) {
        dataErrortype = 2;
        return showAlert('系统繁忙，请稍后重试（P3103）');
    }


    return callback.call(HoldUi, refundJson);
}

module.exports = {
    getRefundData: getRefundData
}