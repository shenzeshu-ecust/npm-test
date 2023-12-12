// import ret from '../../thirdPlugin/pay/common/util.js';
import { cwx, _, TPage } from '../common.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var Controllers = require('../../thirdPlugin/pay/controllers/index.js').CPayPopbox;

var paymentStore = require('../../thirdPlugin/pay/models/stores.js');
var orderDetailStore = paymentStore.OrderDetailStore();
var orderDetailExtendStore = paymentStore.OrderDetailExtendStore();

// h5支付跳转
var options = {
    name: 'ttdpay',
    data: {
        nopayment: false,
		payData: {},
		introButtonShow: false, // 担保按钮是否显示
		instructionsModalHidden: true, //是否显示微信担保说明
    introTextData: '',
    onPaying:false,
    },
    onLoad: function(options){
        let that = this;
        let serverDataStat = false;
        if (options == '' || !options || _.isEmpty(options) ) {
            cwx.showModal({
                title: '提示',
                content: '系统异常，请重新提交订单(10000-0)',
                showCancel: false,
                success: function(res) {
                    wx.navigateBack({
                        delta: 1
                    });
                }
            })
            return;
        }
        let orderData = {};
        //新版服务端传参
        if (options.payToken && options.requestId) {
            orderData.serverData = {
                'requestId': options.requestId,
                'orderId':options.oid,
                'payToken':options.payToken,
                'busType':options.bustype
            };
            serverDataStat = true;
        }else {
            //老的
            orderData.data = options || {};
        }
        //初始化数据，并提交102服务
		Controllers.init(orderData, true, function(response){
			//验证是否有微信支付方式
			// if(!response.paymentwayid){
			// 	that.setData({
			// 		nopayment: true
			// 	})
      // }
            response = response || {};
            //guaranted add
            if(response.guaranted){
                that.setData({
                    carData: response.cards
                })
            }else{
                //验证是否有微信支付方式
                if(!response.paymentwayid){
                    that.setData({
                        nopayment: true
                    })
                }else{
                    that.setData({
                        weiChatPay: true
                    })
                }
            }
            // if(serverDataStat){
                that.setOrderData(options)
            // }
        });
    },
    setOrderData: function(options){
      let that = this;
      const orderInfo = orderDetailStore.get() || {};
      const extendInfo = orderDetailExtendStore.get() || {};
      const dispAmount = orderInfo.amount || orderInfo.totalamount;
      let introButton = false;
      let introText = '';

      if(that.isInteger(dispAmount)){
        orderInfo.disp_Amount = dispAmount.toFixed(2);
      }else {
        orderInfo.disp_Amount = dispAmount;
      }

      if(extendInfo.useEType == 2){
        orderInfo.btnTxt = '担保';
        introButton = true;
        introText = extendInfo.creditCardUseExplain || '';
        setTimeout(function(){
            cwx.setNavigationBarTitle({
                title: '担保方式'
            })
        }, 1000)
      } else {
        orderInfo.btnTxt = '支付'
      }
      that.setData({
        payData: orderInfo,
        introButtonShow: introButton,
        introTextData: introText,
        orderData: options
      });
    },
    onShow: function(){
    },
    isInteger: function(obj) {
		return (obj | 0) === obj
	},
	weicatPaysubmit: function(){
        const self = this;
        if(this.data.onPaying) {
          // 这里 setData 拿不到，但是不影响主逻辑
          self && self.setData && self.setData({
            onPaying:false,   //防止支付错误未回来导致状态未重制
          });
          return;
        };
        console.log('支付提交中...');
        Controllers.showLoading('支付提交中...');
        const {orderData} = this.data;
        this.dopay(orderData);
	},
	openInstructionsModal: function(){
        this.setData({ instructionsModalHidden: false });
    },
    closeInstructionsModal: function(){
		this.setData({ instructionsModalHidden: true });
    },
    dopay: function (options) {
      const self = this;
      self.setData({
        onPaying:true,  //正在支付中的标识，防止快速点击
      });
      var args = {
        bustype: +options.bustype,
        oid: +options.oid,
        token: options.token,
        extend: options.extend
      };
      if (options.payToken && options.requestId) {
        args = {
          'requestId': options.requestId,
          'orderId': +options.oid,
          'payToken': options.payToken,
          'busType': +options.bustype
        }
      }

      var url = '/pages/ticket/order/detail?orderid=' + options.oid;
      if (options.sign) {
        args.sign = options.sign;
      }

      var webviewUrl = options.webviewUrl;
      if (options.payToken && options.requestId) {
        cwx.payment.callPay2({
          "serverData": args,
          "sbackCallback": function (result) {
            if (!!webviewUrl) {
              cwx.component.cwebview({
                data: {
                  url: webviewUrl,
                  needLogin: true,
                }
              });
            } else {
              cwx.redirectTo({ url: url });
            }
            self.setData({
              onPaying:false,
            })
          },
          "fromCallback": function (result) {
            console.log(result,'result');
            self.setData({
              onPaying:false,
            })
          },
          "ebackCallback": function (result) {
            console.log(result,'result');

            self.setData({
              onPaying:false,
            })
          },
          "rbackCallback": function (result) {
            console.log(result,'result');
            self.setData({
              onPaying:false,
            })
          }
        });
        return;
      }

        cwx.payment.callPay({
          data: args,
          "sbackCallback": function () {
            if (!!webviewUrl) {
              cwx.component.cwebview({
                data: {
                  url: webviewUrl,
                  needLogin: true,
                }
              });
            } else {
              cwx.redirectTo({ url: url });
            }
            self.setData({
              onPaying:false,
            })
          },
          "fromCallback": function () {
            cwx.navigateBack();
            self.setData({
              onPaying:false,
            })
          },
          "ebackCallback": function () {
            cwx.redirectTo({ url: url });
            self.setData({
              onPaying:false,
            })
          }
        })

    }

}
TPage(options);
