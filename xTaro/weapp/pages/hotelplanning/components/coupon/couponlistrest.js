const model = require("../../common/utils/model");
const util = require("../../common/utils/util");
import hrequest from "../../common/hpage/request"

const convertResponse = (res) => {
	if (!res.data) {
		return;
	}

	let {
		coupons,
		loginType,
		type,
		remarkForLayer,
		couponPrompt,
		remarks,
		isLogin,
		discount,
		needReceive,
		newCouponInfoList,
		couponItemList,
		rightItemList
	} = res.data;
	
	let params = {
		discount,
		needReceive,
		newCouponInfoList,
		couponItemList,
		rightItemList
	}

	if (util.isEmpty(coupons)) {
		return params;
	}

	if (!coupons.length) {
		if (couponPrompt != "") {
			return {
				...params, 
				couponPrompt,
			};
		} else {
			return params;
		}
	}

	let owned = true;
	coupons.forEach((c) => {
		if (!c.owned) {
			owned = false;
		}
	});

	return {
		...params,
		loginType,
		coupons,
		owned,
		isLogin,
		remarkForLayer,
		couponPrompt,
		remarks,
		type,
	};
};

module.exports = {
	doRequest: function (params, callback, errCallback) {
		if (!params) return;

		const userCouponGetInfo = params.userCouponGetInfo || {};
		const pageFrom = userCouponGetInfo.pageFrom || 0;
		const isFirstPage = params.isFirstPage || 0;
		const presentYoyoAndFlightSwitch =
			params.presentYoyoAndFlightSwitch || false;
		let requestData = {
			isOversea: params.isOversea || 0,
			userCouponGetInfo: userCouponGetInfo,
			isFirstPage: isFirstPage,
			isNewCoupon: params.isNewCoupon || 0
		};

		hrequest.hrequest({
			url: model.serveUrl("getCouponList"),
			checkAuth: true,
			data: requestData,
			success: function (res) {
				if (!util.successSoaResponse(res)) {
					errCallback && errCallback();
				}

				let result = res.data;

				// 查询页不走过滤逻辑
				if (pageFrom !== 3) {
					result = convertResponse(res);
				}

				if (result) {
					callback(result);
				} else {
					errCallback && errCallback(res);
				}
			},
		});
	},
};
