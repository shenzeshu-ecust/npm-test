import { cwx } from "../../../../cwx/cwx.js";

import date from '../../common/utils/date.js';
const ModelUtil = require('../../common/utils/model.js');
const util = require('../../common/utils/util');
import hrequest from "../../common/hpage/request"
import hPromise from '../../common/hpage/hpromise';

module.exports = {
	doRequest: function (params, onSuccess, onError, page = {}) {
		const request = {
			hotelId: ~~params?.a,
			checkinDate: params?.inday || date.today(),
			checkoutDate: params?.outday || date.tomorrow(),
		};

		hrequest.hrequest({
			url: ModelUtil.serveUrl(
				page.hoteldetailAjaxUrl || "gethoteldetail"
			),
			data: request,
			success: function (result) {
				if (util.successSoaResponse(result)) {
					result.data.commentScoreText =
						(result.data.commentScore + "").indexOf(".") > -1
							? result.data.commentScore + ""
							: result.data.commentScore + ".0";
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
