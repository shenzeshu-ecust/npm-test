import { cwx, _ } from '../../../../cwx/cwx.js';
import __global from '../../../../cwx/ext/global.js'

var config = require('../config/config.js');
let detailStore = require('../../paynew/models/stores.js');
var orderDetailStore = detailStore.OrderDetailStore();
var HoldTokenStore = detailStore.HoldTokenStore();
var Util = require('../../paynew/common/util.js');

var getRequestHeader = function(){
    var requestHeader = {
        "cid": "",
        "ctok": "",
        "cver": "1.0",
        "lang": "01",
        "sid": "8888",
        "syscode": "09",
        "auth": ""    
    };

    requestHeader.auth = orderDetailStore.getAttr('auth') || HoldTokenStore.getAttr('auth');
    requestHeader.cid = cwx.clientID;
    return requestHeader;
}




function BaseModel( settings ){
    this.settings = _.extend({
        url : "",
        method : "POST",
        data : {

        },
        success : function(){},
        fail : function(){},
		serviceCode : ''
    }, settings || {});
}

_.extend(BaseModel.prototype, {
    constructor : BaseModel,
    buildUrl : function(){
        const globalEnv = __global.env || 'prd';
        const currentEnv = globalEnv.toLowerCase();
        let serverDomain = 'https://gateway.secure.ctrip.com';
        let subEnv = '';
        let requestUrl = '';

        if(currentEnv !== 'prd') {
            serverDomain = 'http://gateway.secure.fws.qa.nt.ctripcorp.com';
            subEnv = 'fat20'
        }

        requestUrl = Util.appendQuery(serverDomain + this.settings.url, '_fxpcqlniredt=' + (cwx && cwx.clientID || '') + '&paytimestamp=' + (+new Date()));

        if(!!subEnv) {
            requestUrl += '&subEnv=' + subEnv;
        }

        return requestUrl;
    },
    excute : function(){
        var self = this;                 

		try{
			var _data = self.getData();       
			const url = self.buildUrl();
			try{						
				var desObj = {
					url							
					};
				var c = 3021;
				var a = 'request start';
				var dd = 'cwx.request 请求开始';
				cwx.payment.sendUbtTrace({a:a, c:c, dd : dd, d: JSON.stringify(desObj)});
			} catch(e){}	

			cwx.request({
				url,
				data : _data,
				method : "POST",
				header: {
					'Content-Type': 'application/json'
				},
				success: function(json) {
					var result = null;

					try{						
						var desObj = {
								statusCode : json.statusCode,
								ResponseStatus : json.data.ResponseStatus								
							};
							
						var c = 3020;
						var a = 'request ComSuc status 200';
						var dd = 'cwx.request success 响应 200';
												
						cwx.payment.sendUbtTrace({a:a, c:c, dd : dd, d: JSON.stringify(desObj)});
					} catch(e){}	

					if(json && json.statusCode && json.statusCode == 200 && json.data && json.data.ResponseStatus && json.data.ResponseStatus.Ack && json.data.ResponseStatus.Ack === 'Success'){
						result = json.data || {};
						result.ResponseStatus = result.ResponseStatus || {};
						result.retCode = 0;
						result.retMsg = "SOA2执行成功";
                        result.clientCheckData = {
                            clientCheckIdStr: _data.clientCheckIdStr,
                            isUnifiedPay: _data.isUnifiedPay || false
                        }
						self.settings.success(result);
					}else{
						try{
							var jsonData = json.data || {};
							var message = jsonData.ResponseStatus && jsonData.ResponseStatus.Errors && jsonData.ResponseStatus.Errors.length && jsonData.ResponseStatus.Errors[0].Message || "";
							var logParam = "";
							if (message) {
								if (/No auth/img.test(message) || /authentication/img.test(message)) {
									logParam = { pagename: "index", id: "o_pay_getpayway_exception_noauth", message: message };
								} else if (/deserialize/img.test(message)) {
									logParam = { pagename: "index", id: "o_pay_getpayway_exception_DeserializeException", message: message };
								} else if (/RuntimeException/img.test(message)) {
									logParam = { pagename: "index", id: "o_pay_getpayway_exception_RuntimeException", message: message };
								} else {
									logParam = { pagename: "index", id: "o_pay_getpayway_exception_NotIncludeException", message: message };
								}
							} else {
								logParam = jsonData;
							}
							cwx.payment.sendUbtTrace({a:"SOA200", c:"Ack:fail", dd : "SOA服务返回失败", d: JSON.stringify(logParam)});
						} catch(e){}
						self.settings.fail({
							retCode : 1,
							retMsg : "SOA2执行失败"
						});                     
					}
					
				},
				fail : function(e){
					self.settings.fail({
						retCode : 2,
						retMsg : "SOA2执行失败"
					}); 
					
					try{						
						var c = 3025;
						var a = 'requestComFail';
						var dd = 'cwx.request fail 响应';
						cwx.payment.sendUbtTrace({a:a, c:c, dd:dd,d: JSON.stringify(e || '')});
					} catch(e){}					
					
				},
				complete : function(res){
					
					try{		
						var ret = null;	
						var c = 3300;
						var a = 'cwx.requestCom';
						var dd = 'cwx.request complete 响应';	
						cwx.payment.sendUbtTrace({a:a, c:c, dd : dd, d:JSON.stringify(ret || '')});						
					} catch(e){}					
					
					self.settings.complete && self.settings.complete(res); 
				}
			}); 
		} catch(e){
			try{
				cwx.payment.sendUbtTrace({a:'cwx.requestErr', c:3400, dd : 'cwx.request请求报错', d:e + ''});
			} catch(e){}
		}
    },
    getData : function(){

    	var that = this;
    	var retObj = null;
    	var getRheader = null;

    	try{
	        that.settings.data = that.settings.data || {};
	        retObj = _.extend({
	            "head" : getRequestHeader(),
	            "plat" : 5,
              "h5plat" : 3,
	            "ver" : config.APP_VER,
	            "contentType": "json"
	        }, that.settings.data);
	        getRheader = getRequestHeader();
	        if(that.settings.data.head){
	            getRheader = _.extend(getRheader, that.settings.data.head);
	            retObj.head = getRheader;
			}
    	}catch(e){
    		try{
    			cwx.payment.sendUbtTrace({a:'cwx.getData', c:3405, dd : 'cwx.request getData报错', d:e + ''});
    		} catch(e){}
        }

        return retObj;
    }
});


module.exports = {
    BaseModel : BaseModel
}