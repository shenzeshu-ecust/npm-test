/** 登录页JS逻辑 抽出来供售货机和联合会员引导登录页复用 */

/* global wx, getCurrentPages */
import { _, cwx, CPage } from "../../../cwx/cwx";
import Api from "../common/apis/restapi";
const huser = require("../common/hpage/huser.js");

const aggregateloginCommon = {
	inputContent: {},
	data: {
		successAction: "go",
		source: "", // 设备供应商来源
		loginImg: "", // 登录背景图片
		freeBackGround: "", // 一期背景图片
	},

	pageData: {
		// 验证码发送次数
		verificationCodeSendTimes: 0,
	},

	async onLoad(options) {
		const source = options && options.source;
		const hasLogin = await huser.checkLoginStatus(true);
		this.query = options || {};
		this.setData({
			source: source,
			isLogin: hasLogin,
		});
		if (options && options.from === "jiuxu") {
			this.setData({
				successAction: "back", // 登陆成功后的动作：回退
			});
		}
		wx.hideHomeButton();
		if (this.pageId === "10650054682") {
			this.getSupplierConfig(options);
		}

		if (options.d) {
			if (options.d.includes("wifiaggregate") || options.d.includes("wifi-landing") || options.d.includes("highstar") || options.d.includes("high-star-aggregate")) {
			    // 续住码
				this.codeType = "continue-live-code";
			} else {
				// 订房码
			    this.codeType = "order-code";
			}
		  } else if (this.pageId === "10650054682") {
			// 售货机
			this.codeType = "autosall";
		  } else {
			// 兜底续住码
			this.codeType = "continue-live-code";
		  }

		// 小机器 峰翔、小帅 && 平台企微
		const isJumpLogin = options && options.d && (options.d.indexOf("third")> -1 || options.d.indexOf("xshuai")> -1 || options.d.includes("ctripwechat")) 
      
		if (isJumpLogin) {
			// 小机器、平台企微强登；基于原落地页拼接scene，所以要优先判断，不能和后面的else合并
			this.loginFirst(options, hasLogin);
		} else if (this.codeType === "continue-live-code") {
			// 续住场景先进落地页，非强登
			this.setData({ showForceLogin: false });
			this.navigateToHome(this.query);
		} else {
			this.loginFirst(options, hasLogin);
		}
	},
	loginFirst(options, hasLogin) {
		if (hasLogin) {
			this.setData({ showForceLogin: false });
			this.navigateToHome(this.query);
			return
		}
		// 页面载入时强制重新获取wechatcode
		cwx.user.login({
			param: { IsAuthentication: "F" },
			callback: function (data = {}) {
				if (data.ReturnCode === "0") {
					this.setData({ showForceLogin: false });
					this.navigateToHome(this.query);
				} else {
					this.setData({ showForceLogin: true });
				}
			},
		});
	},
	async getSupplierConfig(options) {
		const res = await Api.roomVendingSupplierConfig({
			sourceFrom: this.data.source || "",
		});
		this.setData({
			loginImg: res.loginImg,
		});
	},
	onUnload() {},
	onReady() {},

	async navigateToHome(query) {
		const { successAction } = this.data;
		this.setData({
			isLogin: true,
		});
		if (successAction === "back") {
			const eventChannel = this.getOpenerEventChannel();
			eventChannel.emit("loginSuccess");
			cwx.navigateBack();
		} else {
			if (this.pageId === "10650054682") {
				this.gotoBuy();
			} else if (this.pageId === "10650047003") {
				const {
					d,
					allianceid,
					sid,
					source,
					appid,
					path,
					query,
					a,
					hotelStar,
				} = this.query || {};
				cwx.redirectTo({ url: decodeURIComponent(d) });
			}
		}
	},
	gotoBuy() {
		let param = this.getParam(this.query);
		cwx.redirectTo({
			url: `../buy/index${param}`,
		});
	},
	getParam(obj) {
		if (obj === null) return "";
		let str = "?";
		Object.keys(obj).forEach((key) => {
			str += `${key}=${obj[key]}&`;
		});
		return str.slice(0, str.length - 1);
	},

	forceToLogin(e) {
		this.setData({ showForceLogin: false });
		cwx.user.login({
			param: { IsAuthentication: "F" },
			callback: function (data = {}) {
				if (data.ReturnCode === "0") {
					this.navigateToHome(this.query);
				} else {
					this.setData({ showForceLogin: true });
				}
			},
		});
	},
};

export default aggregateloginCommon;
