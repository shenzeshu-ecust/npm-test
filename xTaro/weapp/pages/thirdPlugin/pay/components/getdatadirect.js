import { cwx, _ } from '../../../../cwx/cwx.js';

var Business = require('../common/business.js');
var storesRequire = require('../../paynew/models/stores.js');
var orderDetailStore = storesRequire.OrderDetailStore();
var orderDetailExtendStore = storesRequire.OrderDetailExtendStore();
var Util = require('../../paynew/common/util.js');

function redirectUrl(url, data){
    const Urldata = Util.pageQueryStr(data);
    const action = data.action;

    const urlRegStr ='^((https|http|ftp|file)?://)';
    const urlReg = new RegExp(urlRegStr);

    //H5直联跳转
    if(urlReg.test(url)){ 
        url = Util.appendQuery(url, Urldata);
        cwx.redirectTo({
            url: '/pages/pay/directback/index?cb=' + encodeURIComponent(url) + '&action=' + action,
            success: function(res){
                Business.sendUbtTrace({a:'redirectUrl', c:1001011, dd:'跳转直连回跳URL地址成功', d:'redirectUrl success!'});
            },
            fail: function(res){
                Business.sendUbtTrace({a:'redirectUrl', c:1001012, dd:'跳转直连回跳URL地址失败', d:'redirectUrl fail! res::::' + JSON.stringify(res || '')});
            }
        })
    }else {
        cwx.redirectTo({
            url: url + '?' + Urldata + '&action=' + action,
            success: function(res){
                Business.sendUbtTrace({a:'redirectUrl', c:1001011, dd:'跳转直连回跳URL地址成功', d:'redirectUrl success!'});
            },
            fail: function(res){
                Business.sendUbtTrace({a:'redirectUrl', c:1001012, dd:'跳转直连回跳URL地址失败', d:'redirectUrl fail! res::::' + JSON.stringify(res || '')});
            }
        })
    }
    
    
    Business.sendUbtTrace({a:'redirectUrl', c:1001010, dd:'跳转直连回跳URL地址解析完成', d:'redirectUrl  URL::::' + url});
	
}

function resetFromCallback(){
    this.settings.fromCallback = function(data){
        wx.navigateBack({
            delta: 1
        });
    }
}

function getData(callback, direct){
		var that = this;
        //验证整体变量定义
        
        try {
            var payData = that.originalOrderDetailData || {},
                unifiedData = payData.unifiedData;

            var guaranteeHotel = 0;
            var payToken = payData.token || '',
                payExtend = payData.extend || '',
                mp360 = payData.mp360, //360 applet scan code to WeChat applet identification field
                mp360Sback = decodeURIComponent(payData.mp360sback),
                mp360Rback = decodeURIComponent(payData.mp360rback),
                decodePayToken = null,
                decodePayExtend = null,
                orderObj = {},
                extendObj = {},
                dataError = 0,
                errorMsg = '系统异常，请重新提交订单(1001)';

            try{
                Business.sendUbtTrace({a:'getdirectdata', c:1001, dd:'开始解析BU参数', d:'getdirectdata start!'});
            }catch(e){}

            if(payToken.length > 0 && payToken != 'undefined') {
                payToken       = decodeURIComponent(payToken);
                decodePayToken = cwx.util.base64Decode(payToken);
                payToken = JSON.parse(decodePayToken);
            }else {
                errorMsg = '系统异常，请重新提交订单(P1001)';
                throw errorMsg;
            }

            if(payExtend.length > 0 && payExtend != 'undefined') {
                payExtend       = decodeURIComponent(payExtend);
                decodePayExtend = cwx.util.base64Decode(payExtend);
                payExtend = JSON.parse(decodePayExtend);
            }else {
                payExtend = {};
            }

            //判断BU过来之后是否传token
            if(direct){
                //from URL回调
                if(payToken.from){
                    that.settings.fromCallback = function(data){
                        wx.navigateBack({
                            delta: 1
                        });
                    }
                }
                //sback URL回调
                if(payToken.sback){
                    that.settings.sbackCallback = function(data){
                        data.action = 'sback'; //set webview share tag
                        //360 applet resets incoming sback URL
                        if(mp360 && mp360Sback.length > 4){ 
                            return redirectUrl(mp360Sback, data);
                        }
                        return redirectUrl(payToken.sback, data);
                    }
                }
                //eback URL回调
                if(payToken.eback){
                    that.settings.ebackCallback = function(data){
                        data.action = 'eback'; //set webview share tag
                        return redirectUrl(payToken.eback, data)
                    }
                }
                //rback URL回调
                if(payToken.rback){
                    that.settings.rbackCallback = function(data){
                        data.action = 'rback'; //set webview share tag
                        //360 applet resets incoming sback URL
                        if(mp360 && mp360Rback.length > 4){ 
                            return redirectUrl(mp360Rback, data);
                        }
                        return redirectUrl(payToken.rback, data)
                    }
                }
                try{
                    Business.sendUbtTrace({a:'directSettings', c:1001013, dd:'设置直连CallBack成功！', d:'directSettings success!'});
                }catch(e){}
            }

            if (payToken.oid) {
                payToken.oid += '';
            }

            //代码做兼容处理  如果decodeUrlToken.length == 0 则 token为""，那么下面的代码直接报错了
            for(var key in payToken){
                var value = payToken[key];
                //过滤bu传递参数的头尾空格
                if (value && _.isString(value)) {
                    value = value.replace(/(^\s*)|(\s*$)/g, "");
                }
                orderObj[key] = value;
            }

            //选填字段，设置默认值
            typeof (orderObj.currency) == "undefined" && (orderObj.currency = "CNY");
            typeof (orderObj.displayCurrency) == "undefined" && (orderObj.displayCurrency = "CNY");
            typeof (orderObj.displayAmount) == "undefined" && (orderObj.displayAmount = "");
            typeof (orderObj.recall) == "undefined" && (orderObj.recall = "");
            typeof (orderObj.extno) == "undefined" && (orderObj.extno = "");
            typeof (orderObj.needInvoice) == "undefined" && (orderObj.needInvoice = false);
            typeof (orderObj.invoiceDeliveryFee) == "undefined" && (orderObj.invoiceDeliveryFee = 0);
            typeof (orderObj.includeInTotalPrice) == "undefined" && (orderObj.includeInTotalPrice = false);
            typeof (orderObj.auth) == "undefined" && (orderObj.auth = "");

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(orderObj.currency) && orderObj.currency.toLowerCase() === 'rmb') {
                orderObj.currency = 'CNY';
            }

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(orderObj.displayCurrency) && orderObj.displayCurrency.toLowerCase() === 'rmb') {
                orderObj.displayCurrency = 'CNY';
            }
			
			//如果BU传过的币种是null空对象
			if(!orderObj.currency) {
				orderObj.currency = 'CNY';
			}
			
			if(!orderObj.displayCurrency) {
				orderObj.currency = 'CNY';
			}
			
            orderObj["totalamount"] = orderObj.amount;
        } catch (e) {
            resetFromCallback.call(that);           
            dataError = 1;
			console.log("DEBUG BU_DATA:"+ JSON.stringify(that.originalOrderDetailData));
        }
        if (dataError) {
            //显示modal提示框信息
            that.modalConfirm(errorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: errorMsg});
				}
			});
			Business.sendUbtTrace({a:'getdata', c:100103, dd:'Bu传递url解析异常!', d:'BU传过来的参数token: ' + payData.token + '; extend: ' + payData.extend});
            return;
        }

        if (!orderObj.oid || !orderObj.bustype || !orderObj.amount || !orderObj.auth) {

            if (!orderObj.amount && orderObj.amount == 0) {
                errorMsg = '系统异常，请重新提交订单(1005)';
            }

            if (!orderObj.oid) {
                errorMsg = '系统异常，请重新提交订单(1006)';
            }
			
            if (!orderObj.auth || orderObj.auth == 'isnull') {
                errorMsg = '系统异常，请重新提交订单(1004)';
            }
            resetFromCallback.call(that);           
            //显示modal提示框信息
			that.modalConfirm(errorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: errorMsg});
				}
			});
			Business.sendUbtTrace({a:'getdata', c:100104, dd:'Bu传递url解析异常!必传项缺少', d:'BU传过来的参数token: ' + payData.token + '; extend: ' + payData.extend});
            return;
        }

        //extend
        for( key in payExtend){
            var value = payExtend[key];
            if(value == 'null' || value == 'undefined'){
                value = ''
            }
            extendObj[key] = value;
        }

        //本人帐户支付
        if(_.isObject(extendObj.accountinfo)){
            const accountInfo = extendObj.accountinfo;
            if(!accountInfo.name || accountInfo.idcardtype != '1'){
                extendObj.accountinfo = null;
                dataError = 1;
                errorMsg = '证件信息不正确';
            }

            if(unifiedData){
				if(!accountInfo.idcardnumber){
					extendObj.accountinfo = null;
					dataError = 1;
					ErrorMsg = '证件信息不正确';
				}
			}else {
				if(!Util.checkIDCard(accountInfo.idcardnumber)){
					extendObj.accountinfo = null;
					dataError = 1;
					ErrorMsg = '证件信息不正确';
				}
			}
        }

        //是否担保到酒店
        if(extendObj.useEType == 2) {
            guaranteeHotel = guaranteeHotel + 1;
        }

        //支付类型
        if(extendObj.subPayType == 1) {
            guaranteeHotel = guaranteeHotel + 1;
        }
		
        if (dataError) {
            resetFromCallback.call(that);          
            //显示modal提示框信息
			that.modalConfirm(errorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: errorMsg});
				}
			});
			Business.sendUbtTrace({a:'getdata', c:100105, dd:'必填参数解析失败！', d:'BU传过来的参数extend: ' + payData.extend});
            return;
        }

        orderDetailStore.set(orderObj);
        orderDetailExtendStore.set(payExtend);

        that.data.payData = {
			orderDetail: orderObj,
			extParam: payExtend
		};


        return callback({unifiedData, guaranteeHotel});
}
    
module.exports = {
    getData : getData
}