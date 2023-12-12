var _ = require('../libs/lodash.core.min.js');
var WeAPP_models = require('../models/models.js');
var WeAPP_paymentWayModel = WeAPP_models.PaymentWayModel;
var WeAPP_paymentWayServerModel = WeAPP_models.PaymentWayServerModel;

var WeAPP_paymentStore = require('../models/stores.js');
var WeAPP_orderDetailStore = WeAPP_paymentStore.OrderDetailStore();
var WeAPP_payResultOStore = WeAPP_paymentStore.PayResultOrderStore();
var WeAPP_GD = require('../components/getdata.js');


module.exports.CPayPopbox = {
    init: function(settings, direct=false, callback){
        var self = this;
        self.guarantedPage = false;  //Guarantee to Hotel API Pay

        //初始化data
	    self.data = {
            serverData: false, //serverData tag
	        weicat: null, //微信支付102服务下发信息
	        payData: {},   //保存SBU传递过来的参数
            unionData: null,  //保存BU异步获取到的aid, sid
            isPayPlugin: false, //是否是小程序支付插件
            payPluginSback: null, //支付插件获取sign签名成功后执行的函数
            payPluginEback: null,  //支付插件获取sign签名失败后执行的函数
            pluginEmsg: '' //支付插件错误提示信息
	    };
		
        //存储支付原始信息
        self.originalOrderDetailData = settings.data || {};
        self.settings = settings;
        self.isDebug = false; //开启调试日志
    
        
        if(_.isObject(callback) && callback.payPlugin){
            self.data.isPayPlugin = true;
            self.data.payPluginSback = callback.successCallback;
            self.data.payPluginEback = callback.failCallback;
            self.settings.fromCallback = function(errMsg) {
                const errobj = {
                    type: 1,
                    errMsg: errMsg.msg,
                    callback: 'fromCallback',
                    param: {}
                }
                self.data.payPluginEback(errobj);
            }
        }
        
        //server data
        if(_.isObject(settings.serverData)){
            self.data.serverData = true;
            self.getPaywayByServer(function(resPayInfos) {
                self.showLoading('服务获取中..');
                self.originalOrderDetailData = WeAPP_GD.buildServerData.call(self, resPayInfos);
                return self.defaultBusData(direct, callback, resPayInfos);
            })
        }else{
            return self.defaultBusData(direct, callback);
        }
    },

    //Default BU pass-through process
    defaultBusData: function (direct, callback, resPayInfos) {
        var self = this;
        if(direct){
            
        } else {
            //验证SBU传递过来的参数是否正确
            WeAPP_GD.getData.call(self, function({unifiedData, guaranteeHotel}){


                if(unifiedData) {
                    const resCtrlData = {
                        callback,
                        direct,
                        guaranteeHotel,
                        resInfo: resPayInfos
                    };
                    const payWayResult = self.payWayCtrl(resCtrlData);
                    if(payWayResult && payWayResult.autoPay) {
                        self.showLoading('支付提交中...');
                        self.requestSubmit();
                    }
                } else {
                    //验证成功后，发送102服务
                    self.getPayway(function(){
                        self.showLoading('支付提交中...');
                        self.requestSubmit();
                    });
                }
            }); 
        }
    },

    //错误提示框，点击按钮事件处理
    modalConfirm: function(str, callback){
        var that = this;
        that.hideLoading();
        if(that.data.isPayPlugin){
            if(callback) {
                that.data.pluginEmsg = str;
                callback.call(that);
            }else {
                that.settings.fromCallback({msg:str})
            }
            return;
        }
        wx.showModal({
            title: '提示',
            content: str || '',
			showCancel: false,
            success: function(res) {
                if (res.confirm) {
                    if(callback){
                        return callback.call(that)
                    }
                }
            }
        })
    },
	hideLoading: function(){
		try{
			wx.hideToast();
			wx.hideLoading();
		}catch(err){}
		
		try{
			var res = wx.getSystemInfoSync(),
				sys = res.system || '';
				sys = sys.toLowerCase();
			if(sys.indexOf('ios') > -1){
				wx.hideToast();
				wx.hideLoading();
				wx.hideToast();
				wx.hideLoading();
				wx.hideToast();
				wx.hideLoading();
				wx.hideToast();
				wx.hideLoading();
			}
		}catch(e){}
	},
	showLoading: function(title){
		title = title || '';
		try{
			wx.showLoading({
				title: title,
				mask: true
			});
	    }catch(err){
			wx.showToast({
				title: title,
				icon: 'loading',
				duration: 10000,
				mask: true
			});	
	    }

	},
    //Toast 错误提示
    showToast: function(str, icon, duration, callback){
        var that = this;
        var icon = icon || 'success',
            str  = str || '网络不给力，请稍候重试',
            duration = duration || 2000;
        wx.showToast({
            title: str,
            icon: icon,
            duration: duration,
			mask: true,
			complete: function(){
				if(callback){
					return callback()
				}
			}
        });
    },
    //获取返回BU需要传递的参数
    getBackParams: function(rc, status){
        var orderinfo = WeAPP_orderDetailStore.get() || {};
        var payresultInfo = WeAPP_payResultOStore.get() || {};
        var param = {
            orderID: orderinfo.oid || '',
            externalNo: orderinfo.extno || '',
            billNo: orderinfo.bilno || '',
            payType:  payresultInfo.realpaytype || '',
            busType: orderinfo.bustype || '',
            price: orderinfo.totalamount || ''
        };

        if(typeof status !== 'undefined'){
            param.Status = status;
        }

        if (payresultInfo.realoid) {
            param.orderID = payresultInfo.realoid;
        }

        if (rc == 2) {
            delete param.payType;
            param.ErrorCode = 888;
            param.ErrorMessage = '';
        } else if(rc == 4) {
            delete param.payType;
            param.ErrorCode = orderinfo.ErrorCode;
            param.ErrorMessage = orderinfo.ErrorMessage;
        } else if (rc == 3) {
            delete param.payType;
        }
        return param;
    },
    //获取公共完成Request参数
    getParames: function(parames){
        var that = this;
        var payData = that.originalOrderDetailData;
        var thatData = that.data.payData;
        var extParam = thatData.extParam || {};
        var thatPayToken = that.data.payToken;
        var unionData = that.data.unionData || {}; //BU商户aid,sid数据
        var oneselfInfos = extParam.accountinfo;
        //解析封装白名单 变量定义
        var payrestrict = {},
            tempArray = [],
            tempList = [],
            i = 0,
            len = 0;
		
        var publicParames = {
            "clienttoken": payData.token || '',
            "clientextend": payData.extend || '',
            "clientsign": payData.sign || '',
            "subpay": 0
        };
		
		if(thatPayToken){
			publicParames.paytoken = thatPayToken;
		}
		
		var insuranceinfos = extParam.insuranceinfos || [];
		
		try {
			//解析封装白名单 向服务端传递
			if (extParam.payTypeList) {
				payrestrict.paytypelist = extParam.payTypeList;
			}
			if (extParam.subPayTypeList) {
				payrestrict.subpaytypelist = extParam.subPayTypeList;
			}
			//支付白名单
			if (extParam.payWayWhiteList) {
				tempList = extParam.payWayWhiteList.split(',');
				len = tempList.length;
				for (; i < len; i++) {
					tempArray.push({"whiteid": tempList[i]});
				}
				payrestrict.whitelist = tempArray;
			}
			//支付黑名单
			if (extParam.PayWayBlackList) {
				tempArray = [];
				tempList = extParam.PayWayBlackList.split(',');
				i = 0;
				len = tempList.length;
				for (; i < len; i++) {
					tempArray.push({"blackid": tempList[i]});
				}
				payrestrict.blacklist = tempArray;
			}

			publicParames.payrestrict = payrestrict;
			//解析封装白名单 End
			
			//保险分帐
			if(_.isArray(insuranceinfos) && insuranceinfos.length > 0){
				publicParames.insinfos = [];
				 _.each(insuranceinfos, function (obj) {
                    //设置默认值
                    if ((!obj.currency) || (typeof obj.currency == "string" && obj.currency.toLowerCase() == "rmb")) {
                        obj.currency = "CNY";
                    }
                    publicParames.insinfos.push({
                        "insamount": obj.amount || 0,
                        "inscurrency": obj.currency,
                        "provider": obj.provider
                    });
                })
			}
      
            //本人帐户
            if(oneselfInfos){
                const { name, idcardtype, idcardnumber } = oneselfInfos;
                publicParames.myaccountinfo = {
                    "name"    : name,
                    "idtype"  : idcardtype,
                    "idnumber": idcardnumber
                }
            }
      
			for(var attr in parames){
				publicParames[attr]=parames[attr];
            }
            
            //验证BU商户aid, sid
            if(_.isObject(unionData)){
                if(!publicParames.sourceinfo){
                    publicParames.sourceinfo = {};
                }
                
                if(unionData.allianceid){
                    publicParames.sourceinfo.allianceid = unionData.allianceid
                }
                
                if(unionData.sid){
                    publicParames.sourceinfo.sid = unionData.sid
                }
            }
			if(that.data.isPayPlugin){
				publicParames.h5plat = 7; //支付插件平台号为 7
			}
		} catch(e){
		}
        return publicParames;
    },
    payWayComplete: function (res) {
        res = res || {};
        var that = this;
        var rmsg = res.errMsg || '';
        var _msg;
        if(rmsg.indexOf('request:fail timeout') > -1){

            _msg = "网络不给力，请稍候重试 - 521";

            that.modalConfirm(_msg, function(){
                if(typeof that.settings.fromCallback === 'function'){
                    return that.settings.fromCallback.call(that,{msg: _msg});
                }
            });	

            // that.modalConfirm("网络不给力，请稍候重试 - 521");
            return;
        }               
        if(rmsg.indexOf('request:fail') > -1){

            _msg = "网络不给力，请稍候重试 - 522";

            that.modalConfirm(_msg, function(){
                if(typeof that.settings.fromCallback === 'function'){
                    return that.settings.fromCallback.call(that,{msg: _msg});
                }
            });
        }
    },
    //start server get data
    getPaywayByServer: function(callBack) {
        var that = this;
        var serverRequestData = WeAPP_GD.getServerData.call(that, that.settings.serverData);
        if(!serverRequestData){
            return;
        }
        serverRequestData.clientinfo = {
            "extendbitmap": 64
        }
        
        if(that.data.isPayPlugin){
            serverRequestData.h5plat = 7; //支付插件平台号为 7
        }
        serverRequestData.clientCheckIdStr = serverRequestData.paytoken;
        serverRequestData.isUnifiedPay = true;
        //Submit BU performance parameters and recommendation code and submit payment
        WeAPP_paymentWayServerModel({
            data: serverRequestData,
            success: function(res){

                if (res.rc == 1) {//errno:1:服务端错误即原errorInformation， res; 2:解析错误
                    
                    var _msg = res.rmsg || "系统异常，请稍后再试 -5121-2";

                    that.modalConfirm(_msg, function(){
                        if(typeof that.settings.fromCallback === 'function'){
                            return that.settings.fromCallback.call(that,{msg: _msg});
                        }
                    });						
                    return;
                }

                //rc=0 request success
                if(res.rc == 0){
                    const resInfo = res.resinfo101 || '{}';
                    that.clientCheckData = res.clientCheckData;
                    return callBack(resInfo);
                }
            },
            fail: that.failFn.bind(that),
            complete:that.payWayComplete.bind(that)
        }).excute();
    },
    payWayCtrl: function(responseData={}) {
        const that = this;
        const {
            callback = ()=>{}, 
            direct,
            resInfo,
            guaranteeHotel
        } = responseData;

        const {
            cards,
            paytype,
            thirdpartylist
        } = resInfo;

        const cardPayDatas = {
            guaranted: false,
            cards: []
        };

        //add guarantee to Hotel
        if(guaranteeHotel === 2){
            WeAPP_orderDetailStore.setAttr("payType", 2);
            if(cards.length > 0){
                cardPayDatas.cardLimit = true;
                const tmpCardObj = {};
                _.map(cards, function(card, key) {
                    const cardStat = card.status;
                    const cardTypeid = card.typeid;
                    const cardPolicy = card.policy;
                    const passPolicy = cardPolicy - 128;
                    const tmpCard = tmpCardObj[cardTypeid];
                    //new card and Wild card
                    if((cardStat & 0) === 0 && (cardStat & 2) === 2){
                        //Channel not maintenance
                        if((cardStat & 2048) !== 2048 && (67 & passPolicy) === passPolicy){
                            if(tmpCard !== 1){
                                cardPayDatas.guaranted = true;
                                tmpCardObj[cardTypeid] = 1;
                                cardPayDatas.cards.push(card);
                            }
                        }
                    }
                });
            }else if((paytype & 2) === 2){
                cardPayDatas.guaranted = true;
                cardPayDatas.cardLimit = false;
                cardPayDatas.cards.push({
                    typename: "",
                    typeid: 5600000
                })
            }
        }else{
            WeAPP_orderDetailStore.setAttr("payType", 4);
            if(_.isArray(thirdpartylist) && thirdpartylist.length > 0){
                _.map(thirdpartylist, function(item, key){
                    const thStat = item.thirdstatus && (item.thirdstatus & 4);
                    if((item.paymentwayid == "WechatScanCode" || item.paymentwayid == "OGP_WechatScanCode") && !thStat){
                        //更新数据
                        that.data.weicat = item;

                    }
                })
            }
        }

        //直连操作
        if(direct){
            return callback(that.data.weicat);
        }
        
        //服务没有下发第三方微信支付显示提示信息内容
        if(!that.data.weicat || !that.data.weicat.paymentwayid){           
            
            var _msg = "无法支付，请至携程应用程序进行支付";

            that.modalConfirm(_msg, function(){
                if(typeof that.settings.fromCallback === 'function'){
                    return that.settings.fromCallback.call(that,{msg: _msg});
                }
            });	
            return;
        }else{
            if(_.isFunction(callback)){
                callback();
            }
            return {autoPay: true};
        }                   
    },
    //发起102服务请求
    getPayway: function(callback, direct){
        var that = this;
        var thatData = that.data.payData;
        var orderdetail = thatData.orderDetail || {},
            extParam = thatData.extParam || {};
        var guaranteeHotel = 0;
        var params = {};
        var clientCheckIdStr = orderdetail.requestid + '|' + orderdetail.oid;

	
		try{
	        params = {
	            "reqpayInfo": {
	                "requestid": orderdetail.requestid,
	                "paytype": 1,//默认支付
	                "payee": 1,//默认到携程 支付类型
	                "paybitmap": 0
	            },
	            "oinfo": {
	                "bustype": orderdetail.bustype,
	                "oid": orderdetail.oid,
	                "odesc": orderdetail.title,
	                "currency": orderdetail.currency,
	                "oamount": orderdetail.amount
	            },
	            "extendinfo": {
	                "extendbitmap": 64
                }
            };
            
            params.PayOrderInfo = WeAPP_GD.setServerData({
                orderDetail: orderdetail,
                extParam: extParam
            });

			//是否担保
			if (extParam.useEType == 2) {
                guaranteeHotel = guaranteeHotel + 1;
				params.reqpayInfo.paytype = 2;
			}

			//是否预授权
			if (extParam.IsNeedPreAuth) {
				params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 4;
			}

			//区分先付 后付  Native传了  H5没传 先按照先付流程
			params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 8;

			//支付类型
			if (extParam.subPayType == 1) {
                guaranteeHotel = guaranteeHotel + 1;
				params.reqpayInfo.payee = 2;
			}else if(extParam.subPayType == 2){
				params.reqpayInfo.payee = 3;
			}
			
			//微信小程序BU APPID
			params.extend = 'wx0e6ed4f51db9d078';


		} catch(e){


			var _msg = "系统异常，请稍后再试 -561";

            that.modalConfirm(_msg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: _msg});
				}
			});
			return;
		}

        try{
            var _data = that.getParames(params) || {};


            _data.clientCheckIdStr = clientCheckIdStr;


            WeAPP_paymentWayModel({
                data: _data,
                success: function(res){

                    if (res.rc == 1) {//errno:1:服务端错误即原errorInformation， res; 2:解析错误
						
						var _msg = res.rmsg || "系统异常，请稍后再试 -5121";

						that.modalConfirm(_msg, function(){
							if(typeof that.settings.fromCallback === 'function'){
								return that.settings.fromCallback.call(that,{msg: _msg});
							}
						});						
                        return;
                    }

                    const resInfoData = res.resinfo101 || {};
                    const resCtrlData = {
                        callback,
                        direct,
                        guaranteeHotel,
                        resInfo: resInfoData
                    };
                    that.clientCheckData = res.clientCheckData;
                    return that.payWayCtrl(resCtrlData);
                },
                fail: that.failFn.bind(that),
                complete:that.payWayComplete.bind(that)
			}).excute();
        }catch(err){		
			return;
        }

        
    },
	//获取BU业绩参数和推荐码(aid,sid)
	getUnion: function () {
		
	},
    //网络请求失败提示信息
    failFn: function(res){
		var that = this;

		if(res && res.retCode && res.retCode != 2){
			var _msg = "系统异常，请稍后再试 -505" + JSON.stringify(res);

			that.modalConfirm(_msg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: _msg});
				}
			});	

	        // this.modalConfirm("系统异常，请稍后再试 -505");
	    }
    },
    
    //支付提交返回
    paySubmitBack: function(item){
        var that = this;
        if (item.rc > 0) {//errno:1:服务端错误即原errorInformation， res; 2:解析错误		
            that.data.payPluginEback({
                type: 1,
                errMsg: item.rmsg,
                callback: 'ebackCallback'
            });
            return;
        }
        if(that.data.isPayPlugin && that.data.payPluginSback) {
            return that.data.payPluginSback(item);
        }
    },
    //发送支付提交
    requestSubmit: function(cardParams){
        var that = this;
		var onFail = function(res){
			if(res && res.retCode && res.retCode != 2){

				var _msg = "系统异常，请稍后再试 -512";

				that.modalConfirm(_msg, function(){
					if(typeof that.settings.fromCallback === 'function'){
						return that.settings.fromCallback.call(that,{msg: _msg});
					}
				});	
		    }

        };

    
        var unionData = that.data.unionData || {}; //BU商户aid,sid数据
        var payData = that.data.payData; //SBU传入的数据
        var orderDetail = payData.orderDetail || {};
        var extParam = payData.extParam || {};
        var weicatPayData = that.data.weicat; //102服务下发的微信第三方支付数据
        var paywayid = extParam.useEType == 2 ? "OGP_WechatScanCode" : "WechatScanCode"; //6.11 担保支付传入paymentwayid值需要修改
        var lastpaytime = extParam.paydeadline; //BU传入的最晚收款时间
        var usetype = extParam.useEType || 1; //useEType默认为支付 1
        var isPreAuth = extParam.IsNeedPreAuth; //是否支持预授权
        var subusetype = isPreAuth ? 1 : 0;
        var subpay = extParam.subPayType || 0; //默认支付到携程 0
        var typecode = extParam.typecode || '';
        var isAutoApplyBill = extParam.isAutoApplyBill ? true : false;
        var goodstag = extParam.goodstag;  //微信立减金

        var dataParam = {
            "opttype": 1,
            "paytype": 4,
            "requestid": orderDetail.requestid,
            "bustype": orderDetail.bustype,
            "usetype": usetype,
            "subusetype": subusetype,
            "subpay": subpay,
            "forcardfee": 0,
            "forcardcharg": 0,
            "stype": 0,
            "oinfo": {
                "bustype": orderDetail.bustype,
                "oid": orderDetail.oid,
                "odesc": orderDetail.title,
                "currency": orderDetail.currency,
                "oamount": orderDetail.amount,
                "oidex": orderDetail.oid,
                "displayCurrency": orderDetail.displayCurrency,
                "displayAmount": orderDetail.displayAmount,
                "extno": orderDetail.extno,
                "notify": orderDetail.paymentnotifyurl, //支付通知接口
                "autoalybil": isAutoApplyBill,
                "recall": orderDetail.recall
            }
        };

        if (lastpaytime) {
            dataParam.lastpaytm = lastpaytime;//BU传入的最晚收款时间
        }
        
        dataParam.extend = "wx0e6ed4f51db9d078";
        
        //weichat pay
        if(weicatPayData){
            dataParam.thirdpartyinfo = {
                "paymentwayid": paywayid, //微信
                "typeid": 0,
                "subtypeid": 4, //微信小应用
                "typecode": typecode,
                "amount": orderDetail.amount,
                "brandid": paywayid,
                "brandtype": weicatPayData.brandtype,
                "channelid": weicatPayData.channelid,
                "thirdfee": 0,
                "wechatCode" : that.settings.code
            }

            //微信立减
            if(typeof goodstag === 'string' && goodstag.length !==0){
                dataParam.thirdpartyinfo.extendjson = goodstag;
            }
            
            //ouid, sourceid
            dataParam.thirdpartyinfo.ouid = unionData.ouid || '';
            dataParam.thirdpartyinfo.sourceid = unionData.sourceid || '';
        }
        dataParam = that.getParames(dataParam); //获取整体Request参数
		
        WeAPP_models.PayMentV3Model({
            data: that.getParames(dataParam),
            success: that.paySubmitBack.bind(that),
            fail: onFail.bind(that),
            complete : function(res){
                var rmsg = res.errMsg || '';
                var _msg;
                if(rmsg.indexOf('request:fail timeout') > -1){
                    _msg = "网络不给力，请稍候重试 - 514";
                    that.modalConfirm(_msg, function(){
                        if(typeof that.settings.fromCallback === 'function'){
                            return that.settings.fromCallback.call(that,{msg: _msg});
                        }
                    });	
                    return;
                }	

                if(rmsg.indexOf('request:fail') > -1){
                    _msg = "网络不给力，请稍候重试 - 515";

                    that.modalConfirm(_msg, function(){
                        if(typeof that.settings.fromCallback === 'function'){
                            return that.settings.fromCallback.call(that,{msg: _msg});
                        }
                    });	
                }

            }
        }).excute();


    }
};
