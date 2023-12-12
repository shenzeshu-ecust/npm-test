import { cwx, _ } from '../../../../cwx/cwx.js';
var models = require('../models/models.js');
var paymentStore = require('../../paynew/models/stores.js');
var exceptionInfoCollectModel = models.ExceptionInfoCollectModel;
var orderDetailStore = paymentStore.OrderDetailStore();
var extStore = paymentStore.OrderDetailExtendStore();
var payResultOBStore = paymentStore.PayResultOrderStore();
var HoldTokenStore = paymentStore.HoldTokenStore();
var HoldResultOrderStore = paymentStore.HoldResultOrderStore();
var ret = {};
ret.exceptionInfoCollect = function(settings, type){
	var oid = orderDetailStore.getAttr('oid') || HoldTokenStore.getAttr('oid');
	if(settings && settings.exdesc){
		if(settings.excode == '10010'){
			settings.exdesc = '' + oid
		}else{
			if(type){
				settings.exdesc = 'wxhold pay wxhp - oid:' + oid + '; ' + settings.exdesc + '; timestamp : ' + cwx.payment.timeStamp;
			}else{
				settings.exdesc = 'wechatapplet - oid:' + oid + '; ' + settings.exdesc + '; timestamp : ' + cwx.payment.timeStamp;
			}
			
			try {
				 settings.exdesc += '; systemInfos: ' + JSON.stringify(cwx.util.systemInfo)
			} catch(e){}
		}
	}

    exceptionInfoCollectModel({
        data : settings
    }).excute();
},
/**
* 设置oid
* @function
* @name setTempOid
* @description 设置oid
* @author lh_sun@ctrip.com
* @memberof common/business
* @inner
*/
ret.setTempOid = function (data) {
    //门票刚进支付的时候，传的是临时单号，301返回的是正式单号
    if (data && data["oidex"] && data["oidex"] != 0) {
        payResultOBStore.setAttr('realoid', data["oidex"]);
    }

};

/**
* 设置清除相应的缓存数据
* @function
* @name setTempOid
* @description 设置oid
* @author lh_sun@ctrip.com
* @memberof common/business
* @inner
*/
ret.clearStore = function(){
    orderDetailStore.remove();
    extStore.remove();
	payResultOBStore.remove();
	HoldTokenStore.remove();
	HoldResultOrderStore.remove();
}

/**
* 发送UBT埋点信息
* @function
* @name sendUbtTrace
* @description 发送UBT埋点信息
* @author sqsun@ctrip.com
* @memberof common/business
* @inner
*/

ret.sendUbtTrace = function (ubtdata){
    try{
		var mPage = cwx.getCurrentPage(),
			oId = orderDetailStore.getAttr('oid'),
			requestId = orderDetailStore.getAttr('requestid'),
			buStype = orderDetailStore.getAttr('bustype'),
			UbtTrace_num = cwx.payment.traceNo,
			networkType = cwx.payment['networkType'],
			cTime = new Date().toString(),
			devicemode = '';
			// cTime = cTime.format('yyyy-MM-dd h:mm:ss');
			devicemode = cwx.util.systemInfo || {};
			ubtdata.devicemode = devicemode.model || '';
			ubtdata.devicesystem = devicemode.system || '';
			ubtdata.version = devicemode.version || '';
			ubtdata.sdkv = devicemode.SDKVersion || '';
		
		if (mPage && mPage.ubtTrace && _.isObject(ubtdata)) {
			ubtdata.orderid = oId;
			ubtdata.requestid = requestId;
			ubtdata.bustype = buStype;
			ubtdata.timestamp = cwx.payment.timeStamp;
			mPage.pageId && (ubtdata.pageId = mPage.pageId);
			ubtdata[UbtTrace_num] = UbtTrace_num;
			ubtdata['networkType'] = networkType;
			ubtdata.time = cTime;
			ubtdata = JSON.stringify(ubtdata);
			mPage.ubtTrace(100742, ubtdata);
			cwx.payment.traceNo++;
		}else{
			//插件UBT埋点记录
			ubtdata.orderid = oId;
			ubtdata.requestid = requestId;
			ubtdata.bustype = buStype;
			ubtdata.timestamp = cwx.payment.timeStamp;
			ubtdata[UbtTrace_num] = UbtTrace_num;
			ubtdata['networkType'] = networkType;
			ubtdata.time = cTime;
			ubtdata = JSON.stringify(ubtdata);
			cwx.ubtTrace(102042, ubtdata);
			cwx.payment.traceNo++;
		}
	}catch(e){}
	
	// console.log('支付UBT ：' + (UbtTrace_num));
	// console.log('支付UBT content ：' + ubtdata);
	// console.log('==========================================================================================');
}


/**
* 发送UBT埋点信息
* @function
* @name sendUbt
* @description 发送UBT埋点信息
* @author sqsun@ctrip.com
* @memberof common/business
* @inner
*/

ret.sendUbt = function (ubtdata){
	var mPage = cwx.getCurrentPage(),
		oId = orderDetailStore.getAttr('oid') || HoldTokenStore.getAttr('oid'),
		requestId = orderDetailStore.getAttr('requestid') || HoldTokenStore.getAttr('requestid'),
		buStype = orderDetailStore.getAttr('bustype') || HoldTokenStore.getAttr('bustype'),
        cTime = new Date().toString(),
        devicemode = '',
		UbtTrace_num = cwx.payment.traceNoW,
        networkType = cwx.payment['networkTypeW'];      

    try{
    	// cTime = cTime.format('yyyy-MM-dd h:mm:ss');
    	devicemode = cwx.util.systemInfo || {};
    	ubtdata.devicemode = devicemode.model || '';
    	ubtdata.devicesystem = devicemode.system || '';
    	ubtdata.version = devicemode.version || '';
    	ubtdata.sdkv = devicemode.SDKVersion || '';
    }catch(e){}


	if (mPage && mPage.ubtTrace && _.isObject(ubtdata)) {

		// console.log('支付UBT ：' + (UbtTrace_num));
		// console.log('支付UBT content ：' + ubtdata);
		// console.log('支付UBT content ：' + ubtdata);
		// console.log('==========================================================================================');

		ubtdata.orderid = oId;
		ubtdata.requestid = requestId;
		ubtdata.bustype = buStype;
		mPage.pageId && (ubtdata.pageId = mPage.pageId);
        ubtdata.time = cTime;
		

		ubtdata[UbtTrace_num] = UbtTrace_num;
        ubtdata['networkType'] = networkType;

        // console.log(JSON.stringify(ubtdata));

        ubtdata = JSON.stringify(ubtdata);
        mPage.ubtTrace('101466', ubtdata);
        cwx.payment.traceNoW++;
    } 

}


module.exports = ret;

