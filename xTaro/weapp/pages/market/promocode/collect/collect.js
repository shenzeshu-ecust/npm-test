import { cwx, __global,CPage, _ } from '../../../../cwx/cwx'
import { GetCaptchaInfoModel, ValidationCaptchaModel, CollectCouponForReceiveCenterModel } from '../common/model'
import util from '../common/util'
CPage({
	pageId: util.collectPageId(),
	data:{
		errMsg : {
			errorShow : false,
			msg : ''
		},
		btnStatus : {
			disabled : true
		},
		input : {
			inputValue : ''
		},
		captchainputValue:'',
		captchainputKey:'',
		captchainputSrc:'',
		token:'',
		version:'',
		rid:'',
		captchaRefresh:false,
		businessSite:'market_couponexchange_miniapp_pic'
	},
	bindOutInput(e) {this.setData({input : {inputValue: e.detail.value}})}, 
	bindKeyInput(e) {this.setData({input : {inputValue: e.detail.value}})},
	showErrMsg(t) {
		this.setData({
			errMsg : {
				errorShow:true,
				msg: t || '失败'
			}
		});
	},
	/*刷新验证码*/
	refreshCollectCaptchaAction() {
		let that = this;
		let width = wx.getSystemInfoSync().windowWidth * 0.88
		that.setData({
			settings1: {//settings为captcha标签内settings属性的值，可自行定义
				codeImageType: 'embed', //拼图验证码的模式 popup弹窗式，embed嵌入式
				appId: "100003972", // 申请的appId值
				businessSite: 'market_couponexchange_miniapp_pic', // 申请的businessSite值
				dev: __global.env === "prd" ? "pro" : "uat", // 接口环境
				width: width + 'px', // 拼图窗口宽度
				height: '40px', // 滑块宽度
				margin: 'auto', //拼图窗口边距
				language: cwx.util.systemInfo.language, //选择的语言
				// 单击选字右上角叉后调用的函数
				onSelectClose: function () {
					//self.closeVerifyModule();
				},
				// 风险检测结果
				resultHandler: function (e) {
					if (
						e.checkState == "success" ||
						e.checkState == "hidden"
					) {
						that.setData({
							captchainputValue: true,
							token:e.token,
							version:e.version,
							rid:e.rid,
						});
					} else {
						return that.showErrMsg("验证错误");
					}
				}
			}
		});
    },
	/* 口令兑换-验证 验证码*/
	/*收藏优惠券*/
	collectAction() {
		var that = this,openid,unionid;
		if(that.data.input.inputValue.length > 40){
			that.showErrMsg('优惠代码字符过长');
			return;
		} else {
			that.setData({
				errMsg : {
					errorShow : false,
					msg : ''
				}
			});			
		}
		util.showLoading();
		that.refreshCollectCaptchaAction();
		that.ubtTrace('mkt_promocode_collect_collectclick', {pageid:that.pageId});	
		var params = {
			couponCode: that.data.input.inputValue,
			platform: 'miniapp',
			openid:cwx.cwx_mkt.openid,
			unionid:cwx.cwx_mkt.unionid,
			token:that.data.token,
			version:that.data.version,
			rid:that.data.rid,
			businessSite:that.data.businessSite
		};
		CollectCouponForReceiveCenterModel(params,function(data){
			util.hideLoading();
			if(data.isWordsPackage){
				var returnCode = data.returnCode,contentMsg;
				if (returnCode == "0") {
					setTimeout(function(){
						util.showToast('领券成功')
					},500);
				} else {
					contentMsg = '领券失败';
					util.showModal(contentMsg);
				}
			} else {
				if(data && data.code === 0) {
					setTimeout(function(){
						util.showToast('领券成功')
					},500);
				} else {
					if (data) {
						var msg = '领券失败';
						util.showModal(msg);
					} else {
						util.showModal("此券好火，队伍好长，冷静一下再来吧~");
					}					
				}
			}
			that.setData({
				captchaRefresh:true
			})
        }, function(data){
			util.hideLoading();
			util.showModal('此券好火，队伍好长，冷静一下再来吧~');	            
        },function(){
			that.refreshCollectCaptchaAction();
			util.hideLoading();
		});			
	},
	onLoad(options){
		//util.showLoading();
		if(!cwx.user.isLogin()) {
			cwx.user.login({
				callback: function(res){
					if(res && res.ReturnCode == 0){
						this.refreshCollectCaptchaAction();
					}
				}
			})
		} else {
			this.refreshCollectCaptchaAction();
		}
	},
	onShareAppMessage() {
		return {
		  title: '优惠券兑换',
		  desc: '快来使用活动口令或兑换码，兑换携程优惠券吧！',
		  path: 'pages/market/promocode/collect/collect'
		}
	}
})