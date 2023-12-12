var _ = require('../libs/lodash.core.min.js');
var config = require('../config/config.js');
var detailStore = require('../models/stores.js');
var orderDetailStore = detailStore.OrderDetailStore();
var HoldTokenStore = detailStore.HoldTokenStore();
var Util = require('../common/util.js');

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
    requestHeader.cid = "";
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
        let serverDomain = 'https://gateway.secure.ctrip.com';
        let subEnv = '';
        let requestUrl = '';

        // if(false) {
        //     serverDomain = 'https://gateway.secure.fws.qa.nt.ctripcorp.com';
        //     subEnv = 'fat103'
        // }

		requestUrl = Util.appendQuery(serverDomain + this.settings.url, 'paytimestamp=' + (+new Date()));
		// requestUrl = Util.appendQuery(requestUrl, 'isCtripCanaryReq=1');

        // if(!!subEnv) {
        //     requestUrl += '&subEnv=' + subEnv;
        // }

        return requestUrl;
    },
    excute : function(){
        var self = this;                 

		try{
			var _data = self.getData();       

			wx.request({
				url: self.buildUrl(),
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

						} catch(e){}
						self.settings.fail({
							retCode : 1,
							//retMsg : "SOA2执行失败" + message
							retMsg : JSON.stringify(jsonData) + JSON.stringify(_data) + self.buildUrl()
						});                     
					}
					
				},
				fail : function(e){
					self.settings.fail({
						retCode : 2,
						retMsg : "SOA2执行失败"
					}); 
				},
				complete : function(res){
					// self.settings.fail({
					// 	retCode : 1,
					// 	//retMsg : "SOA2执行失败" + message
					// 	retMsg : JSON.stringify(res) + JSON.stringify(_data) + self.buildUrl()
					// }); 
					self.settings.complete && self.settings.complete(res); 
				}
			}); 
		} catch(e){

		}
    },
    getData : function(){

    	var that = this;
    	var retObj = null;
    	var getRheader = null;


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


        return retObj;
    }
});


module.exports = {
    BaseModel : BaseModel
}