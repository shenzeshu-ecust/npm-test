import { cwx, CPage, _ } from "../../../cwx/cwx.js";

const BaseGeo = require("../common/geo/basegeo");
const basegeo = new BaseGeo()

CPage({
	pageId: "10650080114",
	checkPerformance: true,// 白屏标志位
	data: {
		showGeoFailure: false,
		geoFailureInfo: {},
		failureStatus: 0 // 0表示初始化中，1表示未授权小程序，2表示未开启系统定位，3表示未知错误
	},
	onLoad: function () {},
	onShow: function () {
		// 先getsetting拿授权信息，如果为false，表示用户未授权小程序，展示btn 点击后opensetting去原生设置页
		// 如果为true，可能是已授权，也可能是用户未开启系统定位
		// 再通过basegeo拿用户位置信息，如果能拿到 表示用户已授权
		// 否则表示用户未开系统定位，提示用户开启
		wx.getSetting({
			success: (res) => {
				const { authSetting } = res;
				if (authSetting["scope.userLocation"]) {
					// 再调用一次basegeo判断能否拿到经纬度
					// 这里manual字段只能传true，不然就会有12s调用频率限制
					basegeo.getPoint(true, this.onLocateSucc, this.onLocateFail, true)
				} else {
					// 未授权
					this.setData({
						failureStatus: 1
					})
				}
			},
			fail: (err) => {
				this.setData({
					failureStatus: 3
				})
			}
		});
	},
	smzReGetPosition: function () {
		// openSetting 返回后会触发onShow,重新定位，所以这里不需要做其他操作
		wx.openSetting();
	},
	onLocateSucc: function() {
		cwx.navigateBack();
	},
	onLocateFail: function() {
		this.setData({
			failureStatus: 2
		})
	}
});
