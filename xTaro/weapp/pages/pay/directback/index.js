import { cwx, CPage, _ } from '../../../cwx/cwx.js';
var Business = require('../../thirdPlugin/pay/common/business.js');
CPage({
    pageId: '10320674321',
    checkPerformance: true, // 白屏检测
    data: {
		backData: {
			url: ''
		}
    },
    shareData: {
        bu: '',
        title: '携程支付订单完成页',
        path: '',
        imageUrl: '',
        desc: '携程支付订单完成页面',
        customer: null
    },
    onLoad: function (options) {
            var backUrl = options.cb || '';
            this.action = options.action || '';
			if(backUrl){
				backUrl = decodeURIComponent(backUrl);
				Business.sendUbt({a:'d-rd-start', c:200000, d:'d-onload-start', dd : '跳转BU页面开始，url : ' + backUrl});	
				cwx.syncLogin.load({
                    url:backUrl,
                    success: (sucUrl)=> {
                      console.log('success',sucUrl)
                      this.setData({
                        backData: {
                          url: sucUrl
                        }
                      })
                    },
                    fail: (errorUrl)=> {
                      console.log('fail',errorUrl)
                      this.setData({
                        backData: {
                          url: backUrl
                        }
                      })
                    }
                })
			}
            Business.sendUbt({a:'d-rd-end', c:200001, d:'d-onload-end', dd : '跳转BU页面结束' + backUrl});

            if(this.action === 'sback'){
                wx.showShareMenu({
                    withShareTicket: true
                })
            }else{
                wx.hideShareMenu(); 
            }
			
    },
	onShow: function (res) {

    },
    webPostMessage: function(e) {
        var postArr = e.detail.data;
        var postCount = postArr.length;
        for (var i = 0; i < postCount; i++) {
            var sData = postArr[i];
            if (sData.type.toLowerCase() === 'onshare') {
                this.shareData = _.extend(this.shareData, sData.shareData || {});
            }
        }
    },
	onShareAppMessage: function (res) {
        let webViewUrl = res.webViewUrl;
        if (!this.shareData.path) {
            this.shareData.path = '/pages/pay/directback/index?cb=' + encodeURIComponent(webViewUrl) + '&action=' + this.action;
        }
        return this.shareData;
	}
})

