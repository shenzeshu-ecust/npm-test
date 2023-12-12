import { cwx, _ } from '../../../../cwx/cwx.js';
var Cwecahtpay = require('../controllers/index.js');
var Business = require('../common/business.js');
var HoldPayCtrl = require('../holdpay/ctrl.js');

//中台入口引入文件
import mainBusiness from '../../paynew/controllers/index.js';
import * as mdBusiness from '../../paynew/common/combus';
import * as Util from '../../paynew/common/util.js';
import {queryMiddlegroundRouteInfo} from '../../paynew/libs/index'
import __global from '../../../../cwx/ext/global.js';
import HoldPayCtrlNew from '../../paynew/holdpay/ctrl.js'

const reportErrorLog = mdBusiness.reportErrorLog

var GetHoldResult = HoldPayCtrl.getHoldResult;
let timeLastCall = 0  //节流时间戳

var Pay = {};
var getDefaultSettings = function () {
	return {
		"data": {

		},
		"serverData": null,
		"sbackCallback": function () { },
		"fromCallback": function () { },
		"ebackCallback": function () { },
		//"rbackCallback" : function(){},
		"env": "pro"
	};
};

var getDefaultToken = function () {
	return {
		"token": {},
		"sbackCallback": function () { },
		"fromCallback": function () { },
		"ebackCallback": function () { },
		"env": "pro"
	}
}

var pay = function (settings) {
	//console.log('================================================================BU传过来的参数为开始============================================================================================');
	//console.log(settings);
	//console.log('================================================================BU传过来的参数为结束============================================================================================');
	clearInterval();
	clearTimeout();
  mdBusiness.initFullChain('pre_payment')

	Pay.timeStamp = +new Date();
	Pay.traceNo = 1;
	try {
		wx.getNetworkType({
			success: function (res) {
				Pay['networkType'] = res.networkType;
			}
		});
	} catch (e) { }
	settings.serverData = settings.serverData || {}
	if (checkIsNew()) {
		//中台逻辑
		console.log('中台逻辑')
		// 如果没有payLink,则命中切量，需要设置payLink
		if (!settings.serverData.payLink) {
			const payLink = `/pages/paynew/directpay/index?tradeNo=${settings.serverData.payToken}`
			settings.serverData.payLink = payLink
		}
		mdBusiness.clearStore();
		mainBusiness.init(_.extend(getDefaultSettings(), settings || {}));
	} else {
		//老的逻辑
    console.log('老的逻辑')
		Business.clearStore(); //清除所有支付缓存
		Cwecahtpay.CPayPopbox.init(_.extend(getDefaultSettings(), settings || {}));
	}

	// 检查是否走中台： 有 payLink 字段， 或者 token 中带字符串 ‘TP’
	function checkIsNew() {
		const withPayLink = () => settings.serverData.payLink && Util.getParam('fromMid', settings.serverData.payLink) == 1
		const withTokenTP = () => settings.serverData.payToken && /TP/.test(settings.serverData.payToken)
		return withPayLink() || withTokenTP()
	}

};

// 前端传值
Pay.withholdPay = function (settings) {
    let that = this;
    Business.clearStore(); //清除所有支付缓存
    settings = _.extend(getDefaultToken(), settings || {});
  
    Pay.timeStamp = +new Date();
    Pay.traceNoW = 1;
    try {
      wx.getNetworkType({
        success: function (res) {
          Pay['networkTypeW'] = res.networkType;
        }
      });
    } catch (e) { }
  
    HoldPayCtrl.init(settings); //执行代口接口
};

// 服务传值
Pay.withholdPay2 = function (settings) {
  mdBusiness.initFullChain('post_payment')
  mdBusiness.sendUbt({
    a: 'withholdPay2 init',
    c: 9001,
    dd: '发起后付',
    extend: settings
  })
  // 节流
  if(new Date() - timeLastCall < 3000){
    mdBusiness.sendUbt({ a: 'doPay.throttle', c: 1000, d: 'throttle', dd: '命中后付节流' });
    reportErrorLog({
      errorType: '31011',
      errorMessage: `后付节流`,
      extendInfo: settings
    })
    timeLastCall = new Date()
    return
  }else{
    timeLastCall = new Date()
  }
  const payToken = settings.tradeNo || settings.token.payToken || settings.token.tradeNo
  if(payToken){
    checkIsNew({
      payToken, 
      callback:(res)=>{
      // 切量，进中台
      if (res.isNew) {
        // const payLink = `/pages/paynew/directpay/index?tradeNo=${payToken}`
        // 调用后付api
        HoldPayCtrlNew.init({
          tradeNo: payToken,
          ...settings
        })
      } else {
        // 走原支付
        start()
      }
    }})
  }else {
    try {
      mdBusiness.sendUbt({ a: 'withholdPay2-start-nopayToken', c: 10022, dd: '没有payToken，默认降级', d: JSON.stringify(settings) });
    } catch (error) {}
    start()
  }

  // 原后付逻辑
  function start(){
    Business.clearStore(); //清除所有支付缓存
    mdBusiness.sendUbt({
      type: 'warning',
      warningCode: 'old_post_pay',
      level: 'p2',
      desc: '小程序老支付',
      devOriKey: `warning_old_pay`,
      extend: settings
    })
    settings = _.extend(getDefaultToken(), settings || {});
  
    Pay.timeStamp = +new Date();
    Pay.traceNoW = 1;
    try {
      wx.getNetworkType({
        success: function (res) {
          Pay['networkTypeW'] = res.networkType;
        }
      });
    } catch (e) { }
  
    HoldPayCtrl.init2({ busdata: settings, isDirect: false }); //执行代口接口
  }
};

function checkIsNew({payToken, callback}){
      mdBusiness.sendUbt({ a: 'check-isNew-start', c: 10010, dd: '检查是否中台' });
        queryMiddlegroundRouteInfo({
          data: {
            payToken
          },
          h5plat: 29,
          context: {
            cwx: cwx,
            env: __global.env,
            subEnv: 'fat5068'
          },
          success: (res) => {
            if (res.head && res.head.code !== 100000) {
              wx.showToast({
                title: '网络不给力，请稍候重试 -2001',
                icon: 'none'
              })
              callback({
                isNew: false
              })
              try {
                mdBusiness.sendUbt({
                  a: 'cpay.init',
                  c: 9004,
                  d: 'CPayPopbox init',
                  dd: '换取token， 其他错误:' + JSON.stringify(res)
                });
              } catch (e) {};
              return
            }
            if (res.status != 1) {
              try {
                mdBusiness.sendUbt({
                  a: 'cpay.init',
                  c: 9005,
                  d: 'CPayPopbox init',
                  dd: 'status不是1，非中台'
                });
              } catch (e) {};
              callback({
                isNew: false
              })
            } else {
              try {
                mdBusiness.sendUbt({
                  a: 'cpay.init',
                  c: 9006,
                  d: 'CPayPopbox init',
                  dd: 'status是1，中台'
                });
              } catch (e) {};
              callback({
                isNew: true,
              })
            }
          },
          fail: (e) => {
            // this.showToast('网络不给力，请稍候重试 -2002')
            callback({
              isNew: false
            })
          },
          complete: () => {}
      }).excute()
    }

//查询代扣授权服务接口
Pay.getHoldResult = GetHoldResult;

//微信支付分对外接口
//查询当前微信支付分开通状态
Pay.getScoreResult = function (params = {}, callback) {
	params.scoreType = 1;
	HoldPayCtrl.init(params, 0, callback);
}

//开通微信支付分
Pay.openScored = function (params = {}, callback) {
	params.scoreType = 2;
	HoldPayCtrl.init(params, 0, callback);
}

//refound

Pay.getRefund = function (params = {}) {
	let currentPage = cwx.getCurrentPage();
	try {
		Business.sendUbt({ a: 'holdNavigate', c: 80010, d: 'holdNavigate start!' });
	} catch (e) { };
	currentPage.navigateTo({
		url: '/pages/pay/refund/index',
		data: params,
		callback: function (json) {

		},
		success: function (data) {
			try {
				Business.sendUbt({ a: 'getRefund.navigateTo', c: 8002, d: 'getRefund.navigateTo success', dd: 'callback返回结果' + JSON.stringify(data) });
			} catch (e) { };
		},
		fail: function (data) {
			try {
				Business.sendUbt({ a: 'getRefund.navigateTo', c: 8001, d: 'getRefund.navigateTo fail', dd: 'callback返回结果' + JSON.stringify(data) });
			} catch (e) { };

			cwx.showModal({
				title: '提示',
				content: '系统异常，请稍后再试 -P002',
				showCancel: false,
				success: function (res) {

				}
			});

		}
	});
}

Pay.callPay = pay;
Pay.callPay2 = pay;
Pay.version = '1.0.1';
Pay.sendUbtTrace = mdBusiness.sendUbt;

module.exports = Pay;