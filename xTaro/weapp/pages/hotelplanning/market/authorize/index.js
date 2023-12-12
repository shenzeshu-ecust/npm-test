import { cwx, CPage } from "../../../../cwx/cwx.js";
const util = require("../../common/utils/util");
const urlUtil = require("../../common/utils/url.js");
const StorageUtil = require("../../common/utils/storage.js");
const CUT_PRICE_SAVE_USER_INFO = "CUT_PRICE_SAVE_USER_INFO";

CPage({
	/**
	 * 页面的初始数据
	 */
	data: {
		hiddenAll: true,
		canIUseProfile: wx.canIUse("getUserProfile"),
	},

	pageId: "10650080116",
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let self = this;
		this.options = options;
		let title = decodeURIComponent(options.title || "携程酒店");
		wx.setNavigationBarTitle({
			title,
		});

		if (!this.data.canIUseProfile) {
			wx.getSetting({
				success(res) {
					if (res.authSetting["scope.userInfo"]) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称
						wx.getUserInfo({
							success: function (res) {
								if (res.userInfo) {
									self.gotoEvent(res.userInfo);
								}
							},
						});
					} else {
						self.setData({
							hiddenAll: false,
						});
					}
				},
			});
		} else {
			const userInfo = StorageUtil.getStorage(CUT_PRICE_SAVE_USER_INFO);
			if (userInfo) {
				self.gotoEvent(userInfo);
			} else {
				self.setData({
					hiddenAll: false,
				});
			}
		}
	},

	onGotUserInfo: function (res) {
		if (
			this.data.canIUseProfile &&
			!StorageUtil.getStorage(CUT_PRICE_SAVE_USER_INFO)
		) {
			wx.getUserProfile({
				desc: "获取您的头像昵称", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				success: (result) => {
					if (result.userInfo) {
						StorageUtil.setStorage(
							CUT_PRICE_SAVE_USER_INFO,
							result.userInfo
						); // 1天
						this.gotoEvent(result.userInfo);
					}
				},
			});
		} else {
			let userInfo = !this.data.canIUseProfile
				? res.detail.userInfo
				: StorageUtil.getStorage(CUT_PRICE_SAVE_USER_INFO);
			if (userInfo) {
				this.gotoEvent(userInfo);
			}
		}
	},

	formSubmit: function (e) {
		const formId = e.detail.formId;
		try {
			cwx.mkt.saveUserFormID(formId, 2);
		} catch (e) {
			console.error("上传formid失败", e);
		}
	},

	gotoEvent: function (userInfo) {
		let options = util.clone(this.options);
		const prefix = options.prefix;
		const title = options.title;

		delete options.prefix;
		delete options.title;
		const paramsObj = util.extend(
			{
				band: 1,
				avatar: encodeURIComponent(
					encodeURIComponent(userInfo.avatarUrl)
				),
				nick: encodeURIComponent(encodeURIComponent(userInfo.nickName)),
			},
			options || {},
			true
		);
		const params = urlUtil.param(paramsObj);

		const data = {
			needLogin: true,
			title: encodeURIComponent(title),
			url: `${prefix}${encodeURIComponent(`?${params}`)}`,
		};
		const finalUrl = `../../../hotel/components/webview/webview?data=${JSON.stringify(
			data
		)}`;
		cwx.navigateTo({
			url: finalUrl,
		});
	},
});
