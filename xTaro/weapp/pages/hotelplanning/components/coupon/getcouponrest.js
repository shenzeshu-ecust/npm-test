import hrequest from "../../common/hpage/request"
const model = require("../../common/utils/model");
const util = require("../../common/utils/util");
// const card = require('../../common/market/card');

module.exports = {
	getCouponById: function (params, callback, errCallback) {
		const promotionId = params.promotionId;
		const d = {
			loginType: params.loginType || 0,
			promotionId: "" + promotionId,
			type: params.type,
			hotelId: params.hotelId
		};
		const sourceFrom = params.sourceFrom || 0;
		if (sourceFrom > 0) {
			d.sourceFrom = sourceFrom;
		}
		hrequest.hrequest({
			url: model.serveUrl("getCouponById"),
			checkAuth: true,
			data: d,
			success: function (res) {
				if (!util.successSoaResponse(res)) {
					return callback();
				}

				callback && callback(res.data);
			},
			fail: function () {
				errCallback && errCallback();
			},
		});
	},
};
