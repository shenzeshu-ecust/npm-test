import { cwx, CPage } from "../../../cwx/cwx.js";
import Apis from "../common/apis/restapi";

CPage({
	pageId: "10650071309",
	checkPerformance: true,// 白屏标志位
	/**
	 * 页面的初始数据
	 */
	data: {
		navigationBar: {
			title: "",
			back: false,
			color: "#fff",
			background: "",
		},
		restaurantList: []
	},

	pageStatus: {
		navigationBackground: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		this.options = options;
		this.fetchRestaurantProductInfoList()
	},

	onScroll: function (e) {
		const scrollTop = e.detail.scrollTop;
		if (scrollTop > 100) {
			if (!this.pageStatus.navigationBackground) {
				this.pageStatus.navigationBackground = true;
				this.setData({
					"navigationBar.title": "客房点单",
					"navigationBar.background": "#fff",
					"navigationBar.color": "#000",
					"navigationBar.back": true,
				});
			}
		} else {
			if (this.pageStatus.navigationBackground) {
				this.pageStatus.navigationBackground = false;
				this.setData({
					"navigationBar.title": "",
					"navigationBar.background": "",
					"navigationBar.color": "#fff",
					"navigationBar.back": false,
				});
			}
		}
	},

	fetchRestaurantProductInfoList: async function () {
		const res = await Apis.restaurantProductInfoList({
			masterHotelId: this.options.hotelId,
		});
		
		if (!res?.restaurantProductList?.length) {
			return;
		}
		this.setData({
			restaurantList: res.restaurantProductList,
		});
	},

	backToHotelSearchPage: function() {
		cwx.navigateBack();
	},

	phoneOrder: function(e) {
		const { phone, resname } = e?.currentTarget?.dataset || {}
		this.ubtTrace("213094", {
			masterhotelid: this.options.hotelId,
			restaurauntname: resname
		});
		if (!phone) return;
		cwx.makePhoneCall({
			phoneNumber: phone,
		})
	}
});
