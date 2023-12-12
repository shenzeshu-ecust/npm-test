import { cwx, CPage, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
var Controllers = require('../../thirdPlugin/pay/controllers/index.js').CPayPopbox;

var paymentStore = require('../../thirdPlugin/paynew/models/stores.js');
var CardPay = require('./cardpay.js').CardPay;

var orderDetailStore = paymentStore.OrderDetailStore();
var orderDetailExtendStore = paymentStore.OrderDetailExtendStore();


CPage(Object.assign({
    pageId: '10320674321',
    checkPerformance: true, // 白屏检测
    data: {
		nopayment: false,
        payData: {},
        weiChatPay: false,
        carData: [],
        cardInfos: {},
        cardLimit: false,
        showMoreTitle: false,
        isMoreTitle: false,
		introButtonShow: false, // 担保按钮是否显示
		instructionsModalHidden: true, //是否显示微信担保说明
		introTextData: {  //showTips data
            title: '担保说明',
            subTitle: '',
            img: '',
            desc: ''
        },
        inputKeys:{  //input vals
            "256": '',
            "2": '',
            "512": ''   //cvv true value
        },
        focusKey: 0, //input foucs data
        cardBin: false, //cardBin status
        cardBinScuess: false, //request cardBin scuess status
        cardBinTxt: '', //cardBin tips txt
        cardCvvMax: 3, //cardcvv max length
        policy: 0, //Card element verification
        focusList: { //input focusArr
            "1": false,
            "256": false
        },
        clearIconHide: true, //show clearIcon status
        cinputData: { //Multiple input box set val
            "256": '',
            "1": '',
            "2": ''
        },
        oneselfInfos: null  //one self account
    },
    onLoad: function (options) {
        Business.sendUbt({a:'d-onload-start', c:100000, d:'d-onload-start', dd : '直连H5进入支付页面 onload start'});
		cwx.payment.traceNoW = 1;
		if(!cwx.payment.sendUbtTrace) {
			cwx.payment.sendUbtTrace = Business.sendUbtTrace;
		};
		let that = this;
        let orderData = {};
        let navigateData = {};
        let serverDataStat = false;
		if(options == '' || !options || _.isEmpty(options) ){
			cwx.showModal({
			  title: '提示',
			  content: '系统异常，请重新提交订单(10000-0)',
			  showCancel: false,
			  success: function(res) {
				wx.navigateBack({
					delta: 1
				});
			  }
			});

			Business.sendUbt({a:'d-onload-start-receivedata', c:100001, d:'d-onload-start-receivedata', dd : '直连H5进入支付页面 onload 参数:' + 'directpayData: ' + JSON.stringify(options || '')});		

			Business.exceptionInfoCollect({
				bustype: 4,
				excode: "30200",
				extype: 1,
				exdesc: 'directpayData: ' + JSON.stringify(options || '')
			}, '1');
			return;
		}
		
        orderData.data = options || {};
        //Add server-side value entry
        if(options.hasOwnProperty('payToken')){
            orderData.serverData = options;
            serverDataStat = true;
        }

        Business.sendUbt({a:'d-onload-start-parse', c:100002, d:'d-onload-start-parse', dd : '直连H5进入支付页面 onload start-parse'});
        
        if(options.data){
            navigateData = options.data;
        }else {
            Business.clearStore();
        }

        if(!navigateData.guaranted){
            //初始化数据，并提交102服务
            Controllers.init(orderData, true, function(response){
                response = response || {};
                //guaranted add
                if(response.guaranted){
                    that.setData({
                        carData: response.cards,
                        cardLimit: response.cardLimit || false
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
                if(serverDataStat){
                    that.setOrderData(navigateData)
                }
            });
        }
		
		Business.sendUbt({a:'d-onload-start-parse-end', c:100003, d:'d-onload-start-parse-end', dd : '直连H5进入支付页面 onload start-parse-end'});		
        
        that.setOrderData(navigateData);
		

		Business.sendUbt({a:'d-onload-start-render-end', c:100004, d:'d-onload-start-render-end', dd : '直连H5进入支付页面 onload start-render-end'});

    },
    setOrderData: function(navigateData) {
        const that = this;
        const orderInfo = orderDetailStore.get() || {};
		const extendInfo = orderDetailExtendStore.get() || {};
        const dispAmount = orderInfo.amount || orderInfo.totalamount;
        const customTitle = extendInfo.customtitle || [];
        const oneselfInfos = extendInfo.accountinfo;
		let introButton = false;
		let introText = '';
		if(that.isInteger(dispAmount)){
			orderInfo.disp_Amount = dispAmount.toFixed(2);
		}else {
			orderInfo.disp_Amount = dispAmount;
		}
		
		if(extendInfo.useEType == 2){
			orderInfo.btnTxt = '担保';
            introText = extendInfo.creditCardUseExplain || '';
            if(introText.length > 0){
                introButton = true;
            }
			setTimeout(function(){
                wx.setNavigationBarTitle({
                    title: '担保方式'
                })
            }, 1000)
		} else {
			orderInfo.btnTxt = '支付'
        }
        
        if(customTitle.length > 0){
            orderInfo.customTitle = customTitle[0];
        }

		
        const newIntroData = Object.assign(that.data.introTextData, {desc: introText});
        let setDatas = {
			payData: orderInfo,
			introButtonShow: introButton,
            introTextData: newIntroData
        }

        //本人帐户
        if(oneselfInfos) {
            const { name, idcardnumber } = oneselfInfos;
            const idLen = idcardnumber.length - 2;
            const maskNum = idcardnumber.substr(0, 1).padEnd(idLen, '*') + idcardnumber.substr(-1);
            const selfInfos = {
                "name"     : name,
                "idNum"    : idcardnumber,
                "maskIdNum": maskNum
            };

            setDatas.oneselfInfos = selfInfos;
        }

        if(navigateData && navigateData.cards){
            setDatas.carData = navigateData.cards || [];
            setDatas.cardLimit = navigateData.cardLimit || false;
        }
		that.setData(setDatas, ()=>{
            const titleTxt = wx.createSelectorQuery();
            const titleWrap = wx.createSelectorQuery();
            titleWrap.select('#detail-titlewrap').boundingClientRect();
            titleTxt.select('#detail-titletxt').boundingClientRect();
            titleTxt.exec(function (res) {
                const titleRes = res[0] || {};
                const titleHeight = titleRes.height;
                titleWrap.exec(function(res){
                    const wrapRes = res[0] || {};
                    const wrapHeight = wrapRes.height;
                    if(titleHeight > wrapHeight) {
                        that.setData({
                            isMoreTitle: true
                        })
                    }
                })
            })
        });
    },
	onShow: function (res) {

    },
    onUnload: function () {
        cwx.hideToast();
		cwx.hideLoading();
    },
	isInteger: function(obj) {
		return (obj | 0) === obj
	},
	weicatPaysubmit: function(){
		Business.sendUbt({a:'d-weichat-submit-start', c:100005, d:'d-weichat-submit-start', dd : '开始提交支付 weichat-submit-start'});
		Controllers.showLoading('支付提交中...');
		Controllers.requestSubmit();
		Business.sendUbt({a:'d-weichat-submit-end', c:100006, d:'d-weichat-submit-end', dd : '结束提交支付 weichat-submit-end'});
	},
	openInstructionsModal: function(){
        Business.sendUbt({a:'d-db-ins', c:100007, d:'d-db-ins', dd : '担保说明点击'});
        const extendInfo = orderDetailExtendStore.get();
        this.setData({
            introTextData: {
                title: '担保说明',
                subTitle: '',
                img: '',
                desc: extendInfo.creditCardUseExplain || ''
            },
            cardBin: false,
            instructionsModalHidden: false
        });
    },
    closeInstructionsModal: function(){
		Business.sendUbt({a:'d-db-ins-close', c:100008, d:'d-db-ins', dd : '担保说明关闭'});
		this.setData({
            instructionsModalHidden: true
        });
    },
    showMoreTitle: function(e) {
        const { showMoreTitle } = this.data;
        this.setData({
            "showMoreTitle": !showMoreTitle
        });
    }
}, CardPay))
