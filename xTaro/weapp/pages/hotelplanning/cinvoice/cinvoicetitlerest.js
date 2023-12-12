import { cwx, _ } from "../../../cwx/cwx.js";

const ModelUtil = require("../common/utils/model.js");
const util = require("../common/utils/util.js");
import hrequest from "../common/hpage/request"

// 将 hrequest 及其相关转化为 promise
function call(param) {
	return new Promise((resolve, reject) => {
		hrequest.hrequest({
			url: ModelUtil.serveUrl(param.url),
			data: param.data,
			success: function (res) {
				if (!util.successSoaResponse(res)) {
					reject(res);
					return;
				}
				resolve(res.data);
			},
			error: function () {
				reject();
			},
		});
	});
}

module.exports = {
	onSubmit: function (requestData, success, error) {
		const url = ModelUtil.serveUrl("putinvoiceinfo");

		hrequest.hrequest({
			url: url,
			data: requestData,
			checkAuth: true,
			success: function (result) {
				success && success(result.data);
			},
			fail: function (error) {
				typeof error === "function" && error(error);
			},
		});
	},

	getUnionVipEntity: function (hotelID) {
		const params = {
			data: {
				hotelID,
			},
			url: "getUnionVipEntity",
		};
		return call(params).catch(() => ({ result: {} }));
	},
};
