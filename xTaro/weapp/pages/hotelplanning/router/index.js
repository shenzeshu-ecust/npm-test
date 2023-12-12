import { cwx, CPage } from "../../../cwx/cwx.js";
import trace from "../common/trace/smztrace";
import Api from "../common/apis/restapi";

CPage({
	pageId: "10650026882",
	/**
	 * 页面的初始数据
	 */
	data: {},

	showLoading(msg) {
		wx.showToast({
			title: msg || "加载中",
			icon: "loading",
			duration: 20000,
			mask: true,
		});
	},
	hideLoading() {
		wx.hideToast();
	},
	goToHotelList() {
		cwx.reLaunch({
			url: "/pages/hotel/list/index",
		});
	},
	async onLoad(options) {
		const self = this;
		const { allianceid, sid, source, appid, path, query, a: hotelID, officialuid, hotelid, q, appscan } = options || {};

		// 第三方云迹渠道 通过hotelid和source请求接口单独处理
		if (source === "yunji" && hotelid) {
			this.getWechatUrl({
				originUrl: `https://m.ctrip.com/events/w/${hotelid}.html?source=yunji`,
			});
			return;
		}

		// 不带原始码参数跳转酒店列表页
		if (!q) {
			this.goToHotelList();
			return;
		}

		const params = {
			originUrl: decodeURIComponent(q),
			scene: cwx.scene + "",
			appscan: appscan ? "1" : "0",
		}
		// app扫码渠道 同步app登录态
		if (appscan) {
			cwx.dynamicLogin.subscribe((res) => {
				// console.log('登录态同步结果：' + res);
				self.getWechatUrl(params);
			});
		} else {
			self.getWechatUrl(params);
		}

		try {
			this.ubtDevTrace &&
				this.ubtDevTrace("d_HTL_WX_router_source", options);
		} catch (e) { }
	},

	async getWechatUrl(params) {
		this.showLoading("...请稍后");
		const data = await Api.getWechatUrl(params) || {};
		this.hideLoading();

		if (data?.ResponseStatus?.Ack === "Success") {
			const url = data?.wechatUrl || "";
			
			// 从路由页跳转到引导登录页，记一个埋点
			if (url.includes("guidelogin")) {
				trace.traceGuideLoginPage(this, {
					sourceid: cwx.scene,
					cid: cwx.clientID,
				});
			}

			cwx.redirectTo({
				url,
			});
			
			return
		}

		this.goToHotelList();
	}
});
