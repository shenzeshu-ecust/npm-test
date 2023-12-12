import { cwx, _ } from "../../../cwx/cwx.js";

var ModelUtil = require("../common/utils/model.js");
var util = require("../common/utils/util.js");
import hrequest from "../common/hpage/request"

var serviceModel = {
	queryService: function (params, onSuccess, onError) {
		if (!params) return;
		let reqData = {
			masterHotelId: params.hotelId,
		};
		hrequest.hrequest({
			url: ModelUtil.serveUrl("guestServiceList"),
			data: reqData,
			success: function (result) {
				if (util.successSoaResponse(result)) {
					onSuccess && onSuccess(result.data);
				} else {
					onError && onError();
				}
			},
			fail: function (error) {
				onError && onError(error);
			},
		});
	},
};

module.exports = serviceModel;
