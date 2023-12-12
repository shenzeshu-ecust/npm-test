import { cwx, CPage, _ } from "../../../cwx/cwx.js";
import restApi from "../common/apis/restapi";

CPage({
	pageId: "10650079793",
	/**
	 * 页面的初始数据
	 */
	data: {
		qrCodeUrl: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		
		restApi
			.getWeComQrCode({
				hotelId: options.hotelid,
				eid: options.eid,
			})
			.then((res) => {
				const { resultCode, qrCodeUrl } = res
				if (resultCode === 0) {
					this.setData({
						qrCodeUrl
					})
				}
			});
			
		this.ubtTrace("220166", {
			page: this.pageId,
			masterhotelid: options.hotelid,
		});
	},
});
