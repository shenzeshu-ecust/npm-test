/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2022-03-23 14:37:08
 * @LastEditors: lh_sun
 * @LastEditTime: 2022-04-07 18:00:46
 */
import { _ } from '../../../cwx/cwx.js';
import mainBusiness from '../controllers/index.js';
import * as Business from '../common/combus';

var Pay = {};
var getDefaultSettings = function() {
    return {
        "data": {

        },
        "serverData": null,
        "sbackCallback": function() {},
        "fromCallback": function() {},
        "ebackCallback": function() {},
        //"rbackCallback" : function(){},
        "env": "pro"
    };
};

var pay = function(settings) {
    //console.log('================================================================BU传过来的参数为开始============================================================================================');
    //console.log(settings);
    //console.log('================================================================BU传过来的参数为结束============================================================================================');
    clearInterval();
    clearTimeout();
    Business.clearStore(); //清除所有支付缓存
    Pay.timeStamp = +new Date();
    Pay.traceNo = 1;
    wx.getNetworkType({
        success: function(res) {
            Pay['networkType'] = res.networkType;
        }
    });

    mainBusiness.init(_.extend(getDefaultSettings(), settings || {}));
};

Pay.callPay = pay;
Pay.callPay2 = pay;
Pay.version = '1.0.1';
Pay.sendUbtTrace = Business.sendUbtTrace;

module.exports = Pay;