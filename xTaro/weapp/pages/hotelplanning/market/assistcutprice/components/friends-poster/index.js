import { cwx } from "../../../../../../cwx/cwx";

Component({
	properties: {
		showPoster: {
			type: Boolean,
			value: false,
		},
		imageUrl: {
			type: String,
			value: "",
		},
		showBtn: {
			type: Boolean,
			value: false,
		},
	},
	data: {},
	lifetimes: {
		ready: function () {},
	},
	methods: {
		posterError(e) {
			cwx.showToast({
				title: "图片加载失败，请重试",
				icon: "none",
				duration: 3000,
			});
			cwx.hideLoading();
			this.toggleFriendsPoster();
		},

		posterLoad(e) {
			this.setData({ showBtn: true });
			cwx.hideLoading();
		},

		downLoadPoster() {
			const self = this;

			this.downloadPic((tempFilePath) => {
				self._tempFilePath = tempFilePath;
				self.saveSharePic();
			});
		},

		downloadPic: function (callback) {
			const self = this;
			const imageUrl = this.data.imageUrl;

			wx.downloadFile({
				url: imageUrl,
				success: function (res) {
					if (res.statusCode !== 200) {
						self.logWithUbtTrace("202453", {
							page: "10650010043",
							type: "1",
							saveresult: "0",
							failedsavereason: res?.errMsg,
						});
						cwx.showToast({
							title: "图片下载失败， 请重试",
							icon: "none",
							duration: 3000,
						});
						this.toggleFriendsPoster();
						return;
					}

					callback && callback(res.tempFilePath);
				},
				fail: function (err) {
					self.logWithUbtTrace("202453", {
						page: "10650010043",
						type: "1",
						saveresult: "0",
						failedsavereason: err?.errMsg,
					});
					cwx.showToast({
						title: "图片下载失败， 请重试",
						icon: "none",
						duration: 3000,
					});
					this.toggleFriendsPoster();
				},
			});
		},

		saveSharePic: function () {
			const self = this;
			const tempFilePath = this._tempFilePath;

			wx.saveImageToPhotosAlbum({
				filePath: tempFilePath,
				success: () => {
					self.logWithUbtTrace("202453", {
						page: "10650010043",
						type: "1",
						saveresult: "1",
					});
					cwx.showToast({
						title: "图片保存成功，请将图片分享到朋友圈",
						icon: "none",
						duration: 3000,
					});
					this.toggleFriendsPoster();
				},
				fail: (err) => {
					self.logWithUbtTrace("202453", {
						page: "10650010043",
						type: "1",
						saveresult: "0",
						failedsavereason: err?.errMsg,
					});
					if (err?.errMsg.indexOf("auth") !== -1) {
						return self.reopenAuth();
					}
					if (err?.errMsg.indexOf("system") !== -1) {
						cwx.showToast({
							title: "您的相册权限未开启，请打开后重新尝试",
							icon: "none",
							duration: 3000,
						});
						return;
					}
					cwx.showToast({
						title: "图片保存失败，请重试",
						icon: "none",
						duration: 3000,
					});
					this.toggleFriendsPoster();
				},
			});
		},

		reopenAuth: function () {
			const self = this;

			wx.getSetting({
				success: function (res) {
					const authRes = res.authSetting["scope.writePhotosAlbum"];

					if (authRes == null) {
						cwx.cwx_mkt.refreshSessionKey();
					} else if (!authRes) {
						self.logWithUbtTrace("202453", {
							page: "10650010043",
							type: "1",
							saveresult: "0",
							failedsavereason: res?.errMsg,
						});
						cwx.showModal({
							title: "提示",
							content: "相册系统未授权，请重新授权并保存图片",
							success: function (res) {
								if (res.confirm) {
									self.openWXSetting();
								}
							},
						});
					} else {
						cwx.cwx_mkt.refreshSessionKey();
						self.saveSharePic();
					}
				},
			});
		},

		logWithUbtTrace: function (ubtKey, data) {
			if (!ubtKey) return;
			let log = cwx.sendUbtByPage.ubtTrace || this.ubtTrace;
			log(ubtKey, data);
		},
		picError: function (e) {
			this.logWithUbtTrace("202453", {
				page: "10650010043",
				type: "0",
				saveresult: "0",
				failedsavereason: e?.detail?.errMsg,
			});
		},
		openWXSetting: function () {
			const self = this;
			wx.openSetting({
				success: function (res) {
					if (
						res.authSetting &&
						res.authSetting["scope.writePhotosAlbum"]
					) {
						cwx.cwx_mkt.refreshSessionKey();
						self.saveSharePic();
					}
				},
			});
		},
		toggleFriendsPoster: function () {
			this.triggerEvent("hidePoster");
		},
		noop: function () {},
	},
});
