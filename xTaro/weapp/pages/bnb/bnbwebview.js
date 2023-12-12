import {
	cwx,
	CPage,
	__global
} from '../../cwx/cwx.js';
// var __global = require('../../cwx/ext/global.js');


// cwx/component/cwebview/cwebview.js
CPage({

	/**
	 * 分享数据
	 */
	shareData: {
		bu: '',
		title: '携程民宿·客栈',
		path: '',
		imageUrl: '',
		desc: '',
		customer: null
	},

	/**
	 * 页面的初始数据
	 */
	data: {
		canWebView: cwx.canIUse('web-view'),
		pageName: 'bnbwebview',
		url: '',
		wsg: '',
		envIsMini: true, //true 小程序 ，false为h5跳转
		isNavigate: true, //跳转方式
		loginErrorUrl: '', //登录失败自定义显示地址  默认：url值
	},

	showUrlError: function () {
		this.setData({
			url: '',
			wsg: '目标地址出了点问题，请重新打开该页面'
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var self = this;
    self.jumpToHome('inn-v2', options);
	},

	jumpToHome: function (path, options) {
		var data = options.data  || options;
		// data = { url: "https://m.ctrip.com/webapp/inn/miniindex?channelid=26&minjump=1&pay=1&share=1&jump=https://m.ctrip.com/webapp/inn/newdetail/9518645.html"};
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (e) {
				this.showUrlError()
			}
		}
		// var url = decodeURIComponent(data.url)
		// if (url.length <= 0) {
		//   this.showUrlError()
		//   return
		// }
		// var needLogin = data.needLogin;
		// var envIsMini = data.envIsMini || false
		// var isNavigate = true //默认true
		// if (typeof data.isNavigate != 'undefined') {
		//   isNavigate = data.isNavigate
		// }
		// var loginErrorUrl = decodeURIComponent((data.loginErrorUrl || url))

		//inn/singlechat?isHideNavBar=YES&jid=X0lNVEpDMjQwMjgzNDg3Mg==&pid=9518645"

    var url = data && data.url && decodeURIComponent(data.url) || (options.url && decodeURIComponent(options.url)) || (__global.env.toLowerCase() === 'prd' ? ("https://m.ctrip.com/webapp/" + path + "/miniindex?channelid=11&minjump=1&pay=1&share=1&detail=1") : ((path === 'inn' ? "https://m.ctrip.fat2323.qa.nt.ctripcorp.com/webapp/": "https://m.fat2726.qa.nt.ctripcorp.com/webapp/") + path + "/miniindex"))

		var unionData = cwx.mkt.getUnion() || {
			allianceid: 262684,
			sid: 711465
		}
		var {
			allianceid = '', sid = '', ouid = '', sourceid = ''
		} = unionData
		url += `${url.indexOf('?') > -1 ? '&' : '?'}allianceid=${allianceid}&sid=${sid}&ouid=${ouid}&sourceid=${sourceid}`
		
		let isLogin = data.needLogin && (!data.noForceLogin) ? {} : false;
		if (isLogin) {
				if (data.IsAuthentication || options.IsAuthentication) {
						isLogin.IsAuthentication = data.IsAuthentication || options.IsAuthentication;
				}
				if (data.showDirectLoginBtn || options.showDirectLoginBtn) {
						isLogin.showDirectLoginBtn = data.showDirectLoginBtn || options.showDirectLoginBtn;
				}
		}
		const self = this;
		cwx.syncLogin.load({
			url,
			isLogin,
			loginErrorUrl: self.data.loginErrorUrl,
			success: function (sucUrl) {
					self.webLoadUrl(sucUrl, true);

					//解析出jump的值
					if (options && options.url) {
						var jumpUrl;
						var optionsUrl = decodeURIComponent(options.url);
						var paramArray = optionsUrl.split('&');
						if (paramArray && paramArray.length > 1) {
							for (var i = 0; i < paramArray.length; i++) {
								if (paramArray[i]) {
									var index = paramArray[i].indexOf('jump');
									if (index > -1) {
										var value = paramArray[i].replace('jump=', '');
										if (value && value.indexOf('https') > -1) {
											jumpUrl = value;
										}
									}
								}
							};
						}
						if (jumpUrl) {
							cwx.navigateTo({
								url: 'detailwebview?data={"url":"' + encodeURIComponent(jumpUrl) + '","needLogin":false}'
							});
						}
					}
					//清理由订单详情页回退回来的标识,防止出现销毁页面的问题
					cwx.setStorageSync("BNB_ORDER_RETURN_TAG_CACHE", false);
			},
			fail: function (errorUrl) {
					if (self.data.isNavigate) {
							cwx.navigateBack()
					} else {
							self.setData({
									wsg: data.wsg,
									url: errorUrl
							})
					}
			}
		})


		//options={};
		//options.url = "https://m.ctrip.com/webapp/inn/miniindex?channelid=26&minjump=1&pay=1&share=1&jump=https://m.ctrip.com/webapp/inn/newdetail/9518645.html?share=1";
		
	},

	/*
	 * 加载页面
	 */
	webLoadUrl: function (url) {
		this.setData({
			url: url
		})
	},

	/*
	 * 将要获取token
	 */
	webGetToken: function (url) {
		var auth = cwx.user.auth
		if (auth.length > 0) {
			this.webGetTokenByAuth(url, auth)
		} else {
			this.webToLogin(url)
		}
	},

	/*
	 * 跳登录获取toekn
	 */
	webToLogin: function (url) {
		var self = this
		cwx.user.login({
			callback: function () {
				var auth = cwx.user.auth
				if (auth.length > 0) {
					self.webGetTokenByAuth(url, auth)
				} else {
					self.loginedErrorHandler() //
				}
			}
		});
	},

	/*
	 * auth 获取token (token 有效时间2分钟)
	 */
	webGetTokenByAuth: function (url, auth) {
		var self = this
		self.showLoading('')
		cwx.request({
			url: '/restapi/soa2/14458/checkCrossTicket.json',
			method: "POST",
			data: {
				context: {
					'platform': 'miniapp',
					'clientid': cwx.clientID
				}
			},
			success: function (res) {
				self.hideLoading()
				var data = res.data
				if (res.statusCode == 200 && data && data.token) {
					var responseStatus = data.ResponseStatus;
					var resultStatus = data.resultStatus;
					if (responseStatus && responseStatus.Ack === "Success" && resultStatus && resultStatus.returnCode == 0) {
						var token = data.token
						var host = '';
						if (__global.env.toLowerCase() === 'uat') {
							host = 'accounts.uat.qa.nt.ctripcorp.com'
						} else if (__global.env.toLowerCase() === 'fat') {
							host = 'accounts.fat466.qa.nt.ctripcorp.com';
						} else {
							host = 'accounts.ctrip.com'; //生产
						}
						var currentHost = "https://" + host;
						var newUrl = currentHost + '/H5Login/writecrossticket?ctok=' + token + '&backurl=' + encodeURIComponent(url)
						self.webLoadUrl(newUrl)
					}
				} else {
					self.loginedErrorHandler(url)
					cwx.showToast({
						title: '登录异常',
						icon: 'none'
					})
				}
			},
			fail: function (res) {
				self.hideLoading()
				self.loginedErrorHandler(url)
				cwx.showToast({
					title: '登录失败',
					icon: 'none'
				})
			}
		})
	},

	/**
	 * 授权失败操作
	 */
	loginedErrorHandler: function () {
		var loginErrorUrl = this.data.loginErrorUrl
		if (this.data.isNavigate) {
			// if (this.data.envIsMini) {  
			// } else { //h5跳转 
			// }
			cwx.navigateBack()
		} else if (!this.data.isNavigate) {
			this.webLoadUrl(loginErrorUrl) //redirect方式 登录失败 加载loginErrorUrl
		}
	},

	/**
	 * web回调数据
	 */
	webPostMessage: function (e) {
		console.log('data:' + e)
		var postArr = e.detail.data;
		var postCount = postArr.length
		for (var i = 0; i < postCount; i++) {
			var sData = postArr[i]
			if (sData.type.toLowerCase() === 'onshare') {
				this.shareData = sData.shareData;
			}
		}
	},

	hideLoading: function () {
		try {
			cwx.hideToast();
			cwx.hideLoading();
		} catch (err) {

		}
	},
	showLoading: function (title) {
		title = title || '';
		try {
			cwx.showLoading({
				title: title,
				mask: true
			});
		} catch (err) {
			cwx.showToast({
				title: title,
				icon: 'loading',
				duration: 10000,
				mask: true
			});
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		var tag = cwx.getStorageSync("BNB_ORDER_RETURN_TAG_CACHE");
		if (tag) {
			cwx.setStorageSync("BNB_ORDER_RETURN_TAG_CACHE", false);
			//如果访问的路径是从收藏,或者历史页面进去,再通过详情页下单,最后返回回来的时候,需要重新加载首页
			this.webLoadUrl("https://m.ctrip.com/webapp/inn-v2/miniindex?channelid=11&minjump=1&pay=1&share=1&detail=1");
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function (options) {
		if (!this.shareData.title) {
			this.shareData.title = '携程民宿·客栈';
		}

		var index = options.webViewUrl.indexOf("pname");
		if (index >= 0) {
			var titleUrl = options.webViewUrl.substring(index + 6);
			var index2 = titleUrl.indexOf("&");

			if (index2 > 0) {
				this.shareData.title = decodeURIComponent(titleUrl.substring(0, index2));
			} else {
				this.shareData.title = decodeURIComponent(titleUrl);
			}
		}

		if (!this.shareData.path) {
			this.shareData.path = 'pages/bnb/bnbwebview';

			var index = options.webViewUrl.indexOf("inn/detail");
			if (index < 0) {
				index = options.webViewUrl.indexOf("inn/newdetail");
			}
      if(index < 0){
        index = options.webViewUrl.indexOf("inn-v2/detail");
      }
			if (index >= 0) {
				if (options.webViewUrl.indexOf("?") > 0) {
					this.shareData.path = "pages/bnb/bnbwebview?url=" + encodeURIComponent(options.webViewUrl + "&channelid=27");
				} else {
					this.shareData.path = "pages/bnb/bnbwebview?url=" + encodeURIComponent(options.webViewUrl);
				}
			}
		}
		return this.shareData
	},
})