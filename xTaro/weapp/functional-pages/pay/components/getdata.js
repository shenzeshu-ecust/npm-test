
var _ = require('../libs/lodash.core.min.js');
var Util = require('../common/util.js');
var storesRequire = require('../models/stores.js');
var orderDetailStore = storesRequire.OrderDetailStore();
var orderDetailExtendStore = storesRequire.OrderDetailExtendStore();

function lowerName(data){
    var tmpObj = {};
    if(_.isObject(data)){
        _.each(data, function(val, key){
            key = key.toLowerCase();
            tmpObj[key] = val;
        });
    }else{
        tmpObj = data;
    }
    return tmpObj;
};

function lowerNames (data) {
    var tmpArr = [];
    if (_.isArray(data)) {
        _.map(data, function (v, i) {
            var tmpObj = lowerName(v);
            tmpArr.push(tmpObj);
        })
    } else {
        tmpArr = lowerName(data);
    }
    return tmpArr
};

function setServerData(payData) {
    var orderdetail = payData.orderDetail || {};
    var extParam    = payData.extParam || {};

    var payExtend = {}; //服务端传值扩展字段
    var payRestrict = {}; //服务端传值 限制支付信息
    var payOrderInfos = {
        "header": {
            "version": "1.0",
            "scene": "INP",
            "clientType": "MiniApp",
            "requestId": orderdetail.requestid
        },
        "paymentType": {
            "payType" :  1,
            "payee" : 1
        },
        "order": {
            "orderId" : orderdetail.oid,
            "orderAmount": orderdetail.amount,
            "orderCurrency": orderdetail.currency,
            "orderTitle": orderdetail.title
        },
        "merchant": {
            "merchantId": "",
            "busType": orderdetail.bustype
        }
    }

    //是否担保
    if (extParam.useEType && extParam.useEType == 2) {
        payOrderInfos.paymentType.payType = 2;
    }

    //是否预授权
    if (extParam.IsNeedPreAuth) {
        payOrderInfos.paymentType.payType = 1 * payOrderInfos.paymentType.payType + 4;
    }
	
	var subPay = extParam.subPayType;
	if (subPay && subPay == 1) {
		payOrderInfos.paymentType.payee = 2;
	} else if (subPay && subPay == 2) {
		payOrderInfos.paymentType.payee = 3;
	}

    //区分先付 后付  Native传了  H5没传 先按照先付流程
    payOrderInfos.paymentType.payType = 1 * payOrderInfos.paymentType.payType + 8;

    //是否自动发起扣款，默认1
    if(_.isNumber(extParam.isAutoApplyBill)){
        payOrderInfos.order.autoApplyBill = extParam.isAutoApplyBill
    }
    //ltp模式必传
    if(orderdetail.extno){
        payOrderInfos.order.externalNo = orderdetail.extno
    }
    //最晚支付时间
    if(extParam.paydeadline){
        payOrderInfos.order.payDeadLine = extParam.paydeadline
    }
    //订单有效时间
    if(extParam.orderavailabletime){
        payOrderInfos.order.orderAvailableTime = extParam.orderavailabletime
    }

    //merchant字段补齐
    //===========================
    if(orderdetail.recall){
        payOrderInfos.merchant.recallUrl = orderdetail.recall
    }

    if(orderdetail.paymentnotifyurl){
        payOrderInfos.merchant.notifyUrl = orderdetail.paymentnotifyurl
    }

    //限制支付信息
    //支付方式大类
    if (extParam.payTypeList) {
        payRestrict.payWayTypes = extParam.payTypeList;
    }
    //支付小类
    if (extParam.subPayTypeList) {
        payRestrict.subPayWayTypes = extParam.subPayTypeList;
    }
    //支付白名单
    if (extParam.payWayWhiteList) {
        payRestrict.whitePayWays = extParam.payWayWhiteList;
    }
    //支付黑名单
    if (extParam.PayWayBlackList) {
        payRestrict.blackPayWays = extParam.PayWayBlackList;
    }

    if(!_.isEmpty(payRestrict)){
        payOrderInfos.payRestrict = payRestrict;
    }

    //! 出行人信息列表
    if (extParam.travelerlist && extParam.travelerlist.length > 0) {
        payExtend.travelerList = [];
        _.each(extParam.travelerlist, function (obj) {
            payExtend.travelerList.push({
                "name": obj.name,
                "idCardType": parseInt(obj.idcardtype, 10),
                "idCardNumber": obj.idcardnumber
            });
        })
    }
    //? 保险分帐
    if (extParam.insuranceinfos && extParam.insuranceinfos.length) {
        payExtend.productList = [];
        _.each(extParam.insuranceinfos, function (obj) {
            payExtend.productList.push({
                "amount": obj.amount || 0,
                "currency": obj.currency,
                "provider": obj.provider
            });
        })
    }

    //本人帐户支付
    if(_.isObject(extParam.accountinfo)){
		const extAccInfo = extParam.accountinfo;
		const myInfos = {
			name: extAccInfo.name,
			idCardType: extAccInfo.idcardtype,
			idCardNumber: extAccInfo.idcardnumber
		};
		
        payExtend.myAccountinfo = myInfos;
    }
    //发票快递
    if (orderdetail.needInvoice.toString() == "true") {
        payExtend.InvoiceInfo = {};
        payExtend.InvoiceInfo.needInvoice = true;
        payExtend.InvoiceInfo.includeInTotalPrice = orderdetail.includeInTotalPrice;
        //快递费用
        payExtend.InvoiceInfo.invoiceDeliveryFee = orderdetail.invoiceDeliveryFee || 0;
    }

    //	attach
    if(extParam.attach){
        payExtend.attach = extParam.attach
    }

    // islogin
    payExtend.islogin = orderdetail.islogin;
    //	thirdBankType
    if(extParam.thirdbanktype){
        payExtend.thirdBankType = extParam.thirdbanktype;
    }
    

    //优惠次数限制活动Key
    if(extParam.ActivityKey){
        payExtend.activityKey = extParam.ActivityKey
    }
    //最大优惠次数
    if(_.isNumber(extParam.MaxActivityCount)){
        payExtend.activityMaxCount = extParam.MaxActivityCount
    }
   
    //是否支持优惠券
    if(extParam.restrictbit === 1){
        payExtend.disableDiscount = true
    }
    //支持的优惠券ID列表
    if(extParam.discountidlist){
        payExtend.supportedDiscountIds = extParam.discountidlist
    }
    //微信立减金标记
    if(extParam.goodstag){
        payExtend.goodstag = extParam.goodstag
    }
    //	银联支付优惠ID
    if(extParam.couponid){
        payExtend.couponId = extParam.couponid
    }
    //	担保有效期
    if(extParam.lastGuranteeDay){
        payExtend.lastGuranteeDay = extParam.lastGuranteeDay
    }
    
    //	支付提醒
    if(extParam.payremind){
        try{
            payExtend.payRemind = JSON.stringify(extParam.payremind);
        }catch(e){}
    }
    //	渠道信息
    if(extParam.allianceid){
        payExtend.allianceid = extParam.allianceid
    }
    //	渠道信息
    if(extParam.sid){
        payExtend.sid = extParam.sid
    }
    
    if(!_.isEmpty(payExtend)){
        payOrderInfos.payExtend = payExtend
    }

    return JSON.stringify(payOrderInfos);
}

function getServerData(orderDetailData={}) {
    var that = this;
    var params = {};
    var detailJson = orderDetailData;
    var ErrorMsg = '';
    var auth;

    //plugin auth add
    if(that.data.isPayPlugin) {
        auth = detailJson.auth;
    }
    
    if(!detailJson.requestId){
        ErrorMsg = '系统异常，请重新提交订单(1501)';
        that.modalConfirm(ErrorMsg, function(){
            if(typeof that.settings.fromCallback === 'function'){
                return that.settings.fromCallback.call(that,{msg: ErrorMsg});
            }
        });
        return;
    }else{
        params.requestid = detailJson.requestId;
    }
    
    
    if(!detailJson.orderId){
        ErrorMsg = '系统异常，请重新提交订单(1502)';
        that.modalConfirm(ErrorMsg, function(){
            if(typeof that.settings.fromCallback === 'function'){
                return that.settings.fromCallback.call(that,{msg: ErrorMsg});
            }
        });
        return;
    }else{
        params.orderid = detailJson.orderId;
        params.oid = detailJson.orderId;
    }

    if(!detailJson.payToken){
        ErrorMsg = '系统异常，请重新提交订单(1503)';
        that.modalConfirm(ErrorMsg, function(){
            if(typeof that.settings.fromCallback === 'function'){
                return that.settings.fromCallback.call(that,{msg: ErrorMsg});
            }
        });
        return;
    }else{
        params.paytoken = detailJson.payToken;
    }

    // if(!detailJson.busType){
    //     ErrorMsg = '系统异常，请重新提交订单(1504)';
    //     that.modalConfirm(ErrorMsg, function(){
    //         if(typeof that.settings.fromCallback === 'function'){
    //             return that.settings.fromCallback.call(that,{msg: ErrorMsg});
    //         }
    //     });
    //     return;
    // }else{
    //     params.bustype = detailJson.busType;
    // }

    if(!auth){
        ErrorMsg = '系统异常，请重新提交订单(1505)';
        that.modalConfirm(ErrorMsg, function(){
            if(typeof that.settings.fromCallback === 'function'){
                return that.settings.fromCallback.call(that,{msg: ErrorMsg});
            }else {

			}
        });
		
        return;
    }else{
        orderDetailStore.setAttr('auth', auth);
    }

    that.data.payData = {
        orderDetail: params
    };
	//paytoken add
	that.data.payToken = detailJson.payToken;
    
    return params;
}

function buildServerData(response) {
    var that = this;
    var ErrorMsg = '系统异常，请重新提交订单(1001-2)';
    var detailJson = {};
    var extendJson = {};
    var tmpData;
    var tmpList=[];
    try{
        var payInfos    = JSON.parse(response.payOrderInfo)|| {};
        var order       = payInfos.order || {};
        var header      = payInfos.header || {};
        var displayTitle= JSON.parse(order.displayTitle);
        var paymentType = payInfos.paymentType || {};
        var payRestrict = payInfos.payRestrict || {};
        var merchant    = payInfos.merchant || {};
        var payExtend   = payInfos.payExtend || {};
    }catch(e){

        that.modalConfirm(ErrorMsg, function(){
            if(typeof that.settings.fromCallback === 'function'){
                return that.settings.fromCallback({msg: ErrorMsg});
            }else{
            }
        });
        return;
    }

    detailJson.amount = order.orderAmount;
    detailJson.totalamount = order.orderAmount;
    detailJson.currency = order.orderCurrency;
    detailJson.bustype = merchant.busType;
    detailJson.islogin = payExtend.islogin;
    detailJson.sback = merchant.sback;
    detailJson.eback = merchant.eback;
    detailJson.title = order.orderTitle;
    detailJson.oid = order.orderId;
    detailJson.requestid = header.requestId;
    detailJson.auth = orderDetailStore.getAttr('auth');

    if(merchant.recallUrl){
        detailJson.recall = merchant.recallUrl
    }

    if(merchant.fromUrl){
        detailJson.from = merchant.fromUrl
    }

    if(merchant.rback){
        detailJson.rback = merchant.rback
    }

    //LTP模式流水号
    if(order.externalNo){
        detailJson.extno = order.externalNo
    }

    //需要展示的辅币金额
    if(order.displayAmount){
        detailJson.displayAmount = order.displayAmount
    }

    //需要展示的辅币种
    if(order.displayCurrency){
        detailJson.displayCurrency = order.displayCurrency
    }

    if(_.isObject(payExtend.invoiceInfo)){
        tmpData = payExtend.invoiceInfo;
        //客户是否需要发票
        detailJson.needInvoice = tmpData.needInvoice;
        //发票快递费用
        detailJson.invoiceDeliveryFee = tmpData.invoiceDeliveryFee;
        //订单总额是否包含发票快递费用
        detailJson.includeInTotalPrice = tmpData.includeInTotalPrice;
    }

    //Paymentnotify通知地址，必须是有效的url(6.19新增)，此url不用urlencode
    if(merchant.notifyUrl){
        detailJson.paymentnotifyurl = merchant.notifyUrl
    }

    //==========token end===================

    //1=支付2=担保
    tmpData = paymentType.payType;
	if((tmpData & 1) == 1){
		extendJson.useEType = 1;
	}
	
	if((tmpData & 2) == 2){
		extendJson.useEType = 2;
	}
	
	//是否支持预授权(5.6新增) 
    if((tmpData & 4) == 4){
        extendJson.IsNeedPreAuth = true;
    }
	
    //服务端传参定义和之前的定义不一致 需转换一下
    if(paymentType.payee && typeof (1 * paymentType.payee) == "number"){
        extendJson.subPayType = 1 * paymentType.payee - 1;
        // 微信小程序支持预付到酒店  走的担保
        if(paymentType.payee == 2){
            extendJson.useEType = 2;
        }

    }
	
    tmpData = displayTitle;
    extendJson.titletype = tmpData.titleType;
    _.map(tmpData.customTitle, function(v, i){
        detailJson.subtitle = v.content;
        tmpList.push(v);
    })
    extendJson.customtitle = lowerNames(tmpList);

    
    
    //支付大类限制(5.6新增)
    if(_.isNumber(payRestrict.payWayTypes)){
        extendJson.payTypeList = payRestrict.payWayTypes;
    }

    //支付小类限制
    if(_.isNumber(payRestrict.subPayWayTypes)){
        extendJson.subPayTypeList = payRestrict.subPayWayTypes;
    }

    //白名单
    if(payRestrict.whitePayWays){
        extendJson.payWayWhiteList = payRestrict.whitePayWays;
    }

    //默名单
    if(payRestrict.blackPayWays){
        extendJson.PayWayBlackList = payRestrict.blackPayWays;
    }

    //是否实时支付 0非实时 (微信小程序已经全部走实时)
    if(paymentType.paySubType){
        extendJson.isRealTimePay = paymentType.paySubType;
    }

    //实时支付时是否自动发起扣款 0不会自动发起扣款
    if(_.isNumber(order.autoApplyBill)){
        extendJson.isAutoApplyBill = order.autoApplyBill;
    }

    //最大优惠次数(6.1新增)
    if(_.isNumber(payExtend.activityMaxCount)){
        extendJson.MaxActivityCount = payExtend.activityMaxCount;
    }

    //渠道信息
    if(payExtend.allianceid){
        extendJson.allianceid = payExtend.allianceid;
    }

    if(payExtend.sid){
        extendJson.sid = payExtend.sid;
    }

    //优惠次数限制活动Key(6.1新增)
    if(payExtend.activityKey){
        extendJson.ActivityKey = payExtend.activityKey;
    }

    //1=不支持优惠券
    if(payExtend.disableDiscount){
        extendJson.restrictbit = 1;
    }

    //最晚付款时间
    if(order.payDeadLine){
        extendJson.paydeadline = order.payDeadLine
    }

    //出行人信息列表
    if(payExtend.travelerList && payExtend.travelerList.length > 0){
        extendJson.travelerlist = [];
        _.each(payExtend.travelerList, function (obj) {
            extendJson.travelerlist.push({
                "name": obj.name,
                "idcardtype": '' + obj.idCardType,
                "idcardnumber": obj.idCardNumber
            });
        })
    }

    //分账信息
    if(_.isArray(payExtend.productList)){
        extendJson.insuranceinfos = [];
        _.each(payExtend.productList, function (obj) {
            extendJson.insuranceinfos.push({
                "amount": obj.amount,
                "currency": obj.currency,
                "provider": obj.provider
            });
        })
    }

    //本人帐户支付
    if(_.isObject(payExtend.myAccountinfo)){
        extendJson.accountinfo = lowerNames(payExtend.myAccountinfo);
    }

    //支持的优惠券ID列表，多个使用 | 分割
    if(payExtend.supportedDiscountIds){
        extendJson.discountidlist = payExtend.supportedDiscountIds;
    }

    //微信立减金标记
    if(payExtend.goodstag){
        extendJson.goodstag = payExtend.goodstag;
    }

    //支付附加字段String
    if(payExtend.attach){
        extendJson.attach = payExtend.attach;
    }

    //担保有效期
    if(payExtend.lastGuranteeDay){
        extendJson.lastGuranteeDay = payExtend.lastGuranteeDay;
    }

    //订单有效时间 格式yyyy/mm/dd hh:mm:ss
    if(order.orderAvailableTime){
        extendJson.orderavailabletime = order.orderAvailableTime
    }

    return {
        token: Util.base64Encode(JSON.stringify(detailJson)),
        extend: Util.base64Encode(JSON.stringify(extendJson)),
        unifiedData: true
    }
}

function getData(callback){
		var that = this;
        //验证整体变量定义
        var decodePayToken = null,
            decodePayExtend = null,
            order_obj = {},
            extendObj = {},
            dataError = 0,
            ErrorMsg = '系统异常，请重新提交订单(1001)';
		console.log('20201028 relase ======');
        var guaranteeHotel = 0;
        try {
            var payData     = that.originalOrderDetailData,
                payToken    = payData.token || '',
                payExtend   = payData.extend || '',
                unifiedData = payData.unifiedData;
            
            if(payToken.length > 0 && payToken != 'undefined') {
                payToken       = decodeURIComponent(payToken);
                decodePayToken = Util.base64Decode(payToken);
                payToken = JSON.parse(decodePayToken);
            }else {
                ErrorMsg = '系统异常，请重新提交订单(P1001)';
                throw ErrorMsg;
            }

            if(payExtend.length > 0 && payExtend != 'undefined') {
                payExtend       = decodeURIComponent(payExtend);
                decodePayExtend = Util.base64Decode(payExtend);
                payExtend = JSON.parse(decodePayExtend);
            }else {
                payExtend = {};
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
                order_obj[key] = value;
            }

            //选填字段，设置默认值
            typeof (order_obj.currency) == "undefined" && (order_obj.currency = "CNY");
            typeof (order_obj.displayCurrency) == "undefined" && (order_obj.displayCurrency = "CNY");
            typeof (order_obj.displayAmount) == "undefined" && (order_obj.displayAmount = "");
            typeof (order_obj.recall) == "undefined" && (order_obj.recall = "");
            typeof (order_obj.extno) == "undefined" && (order_obj.extno = "");
            typeof (order_obj.needInvoice) == "undefined" && (order_obj.needInvoice = false);
            typeof (order_obj.invoiceDeliveryFee) == "undefined" && (order_obj.invoiceDeliveryFee = 0);
            typeof (order_obj.includeInTotalPrice) == "undefined" && (order_obj.includeInTotalPrice = false);
            typeof (order_obj.auth) == "undefined" && (order_obj.auth = "");

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(order_obj.currency) && order_obj.currency.toLowerCase() === 'rmb') {
                order_obj.currency = 'CNY';
            }

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(order_obj.displayCurrency) && order_obj.displayCurrency.toLowerCase() === 'rmb') {
                order_obj.displayCurrency = 'CNY';
            }
			
			//如果BU传过的币种是null空对象
			if(!order_obj.currency) {
				order_obj.currency = 'CNY';
			}
			
			if(!order_obj.displayCurrency) {
				order_obj.currency = 'CNY';
			}
			
			
            order_obj["totalamount"] = order_obj.amount;
            order_obj["origamount"] = order_obj.amount;
        } catch (e) {
            dataError = 1;
			console.log("DEBUG BU_DATA:"+ JSON.stringify(that.originalOrderDetailData));
        }

        if (dataError) {
            //显示modal提示框信息
            that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});
            return;
        }

        if (!order_obj.oid || !order_obj.bustype || !order_obj.amount || !order_obj.auth) {

            if (!order_obj.amount && order_obj.amount == 0) {
                ErrorMsg = '系统异常，请重新提交订单(1005)';
            }

            if (!order_obj.oid) {
                ErrorMsg = '系统异常，请重新提交订单(1006)';
            }
			
            if (!order_obj.auth || order_obj.auth == 'isnull') {
                ErrorMsg = '系统异常，请重新提交订单(1004)';
            }
            //显示modal提示框信息
			that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});
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
                ErrorMsg = '证件信息不正确';
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
            //显示modal提示框信息
			that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});
            return;
        }

        orderDetailStore.set(order_obj);
        orderDetailExtendStore.set(payExtend);

        that.data.payData = {
            orderDetail: order_obj,
			extParam: payExtend
		};

        return callback({unifiedData, guaranteeHotel});
}
    
module.exports = {
    getData : getData,
    getServerData: getServerData,
    buildServerData: buildServerData,
    setServerData: setServerData
}