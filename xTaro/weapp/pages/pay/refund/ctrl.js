/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2022-04-20 18:53:49
 * @LastEditors: lh_sun
 * @LastEditTime: 2022-04-20 18:58:26
 */
import { cwx, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var PayModels = require('../../thirdPlugin/pay/models/models.js');
var getRefundData = require('./getrefunddata.js').getRefundData;
var RefundQuery = PayModels.RefundQuery;

module.exports = {
    /**
     * Get order refund status
     * @function
     * @name getRefundState
     * @param {Function} callBack Callback function after execution is completed
     * @return {Object} Return the service delivery data
     * @description Get order refund status
     * @author sqsun@ctrip.com
     * @inner
     */
    getRefundState: function(rData, callBack) {
        const that = this;
        const billNoArr = [...new Set(rData.billNo)];
        const requestData = {
            oid: rData.orderId,
            bustype: rData.businessType,
            auth: rData.auth
        }
        let billNoArrData = [];
        if (rData.externalNo) {
            requestData.extno = rData.externalNo
        }

        if (billNoArr.length > 0) {
            billNoArr.map(function(v, i) {
                v = v + '';
                const VAL = v.trim();
                if (VAL) {
                    billNoArrData.push({
                        "bilno": VAL
                    })
                }
            });
            requestData.billlst = billNoArrData;
        }

        RefundQuery({
            data: requestData,
            success: function(res) {
                const rc = res.rc;
                if (rc == 0) {
                    return callBack(res.refundinfos)
                } else {
                    that.modalConfirm('查询退款信息失败，请重试！-P10', function() {
                        cwx.navigateBack();
                    });
                }
            },
            fail: function() {
                that.modalConfirm('查询退款信息失败，请重试！-P11', function() {
                    cwx.navigateBack();
                });
            },
            complete: function() {
                that.hideLoading();
            }
        }).excute();
    },

    //Refund API initialization
    init: function(refundData, callBack = function() {}) {
        const that = this;
        Business.sendUbt({ a: 'refundinit', c: 1011, d: 'refundinit start!' });
        that.refundData = refundData;
        getRefundData.call(that, function(refundJson) {
            const self = this;
            Business.sendUbt({ a: 'GetHoldWay', c: 1010, dd: '发起2001服务开始', d: 'GetHoldWay start!' });
            self.showLoading('服务查询中.');
            that.getRefundState.call(self, refundJson, callBack);
        })
    }
}