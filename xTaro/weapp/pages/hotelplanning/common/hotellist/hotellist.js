import hPromise from "../../common/hpage/hpromise";

const ModelUtil = require('../../common/utils/model.js');
import commonrest from '../../common/commonrest'
const util = require('../../common/utils/util');
import hrequest from "../../common/hpage/request"
const casReq = require('../../cas/casReqNew')

var generateAdditionalInformation = function (result) {
	if (result.data.hotelInfoList) {
		result.data.hotelInfoList.forEach((h) => {
			h.commentScoreText =
				(h.commentScore + "").indexOf(".") > -1
					? h.commentScore + ""
					: h.commentScore + ".0";
			h.logoPic && (h.rpxInLogoPic = /[0-9]+rpx/i.test(h.logoPic));
		});
	}

	if (result.data.recommendHotelInfoList) {
		result.data.recommendHotelInfoList.forEach((h) => {
			h.commentScoreText =
				(h.commentScore + "").indexOf(".") > -1
					? h.commentScore + ""
					: h.commentScore + ".0";
			h.logoPic && (h.rpxInLogoPic = /[0-9]+rpx/i.test(h.logoPic));
		});
	}

	if (result.data.nearbySameTypeHotelInfoList) {
		result.data.nearbySameTypeHotelInfoList.forEach((h) => {
			h.commentScoreText =
				(h.commentScore + "").indexOf(".") > -1
					? h.commentScore + ""
					: h.commentScore + ".0";
			h.logoPic && (h.rpxInLogoPic = /[0-9]+rpx/i.test(h.logoPic));
		});
	}
};
module.exports = {
	doRequest: function (page, request, onSuccess, onError) {
		request.head = null;
		const fetchNewHotelList = page?.data?.fetchNewHotelList || false;

		const tasks = [];
		tasks.push(
			// 酒店列表服务
			new hPromise((resolve, reject) => {
				casReq.request({
					url: ModelUtil.serveUrl(
						fetchNewHotelList
							? "integratedHotelList"
							: "newhotellist"
					),
					data: request,
					success: function (result) {
						if (util.successSoaResponse(result)) {
							// listtrace.trace(page, {request, result});
							generateAdditionalInformation(result);
							resolve(result.data);
						} else {
							reject(result);
						}
					},
					fail: function (error) {
						reject(error);
					},
				});
			})
		);

		tasks.push(
			// 起价为返后价开关
			new hPromise((resolve) => {
				const fc = "WechatShowCashbackPrice";
				const ServerCalcRefund = "WechatEnableServerCalcRefund";
				const detailSwitchName = "WechatDetailSwitch";
				commonrest.getSwitch(
					[fc, ServerCalcRefund, detailSwitchName],
					(switches) => {
						resolve({
							cashbackPriceSwitch:
								switches && switches[fc]
									? switches[fc] === 1
									: false,
							listServerCalcRefund:
								switches && switches[ServerCalcRefund]
									? switches[ServerCalcRefund] === 1
									: false,
							detailSwitch:
								switches && switches[detailSwitchName]
									? switches[detailSwitchName] === 1
									: false,
						});
					},
					() => {
						resolve({
							cashbackPriceSwitch: false,
							listServerCalcRefund: false,
							detailSwitch: false,
						});
					}
				);
			})
		);

		hPromise
			.all(tasks)
			.then((options) => {
				const rsp = options[0];
				const {
					cashbackPriceSwitch,
					listServerCalcRefund,
					detailSwitch,
				} = options[1];

				if (
					rsp.relatedCityInfo &&
					rsp.relatedCityInfo.text &&
					rsp.relatedCityInfo.placeHolder
				) {
					const textArray = rsp.relatedCityInfo.text.split("{0}");
					if (textArray.length > 1) {
						rsp.relatedCityInfo.prefix = textArray[0];
						rsp.relatedCityInfo.suffix = textArray[1];
					}
					rsp.relatedCityInfo.index =
						rsp.relatedCityInfo.index +
						request.pageSize * (request.pageIndex - 1);
				}

				if (!util.isEmpty(rsp.hotelInfoList)) {
					rsp.hotelInfoList.map((hotel) => {
						hotel.cashbackPriceSwitch = cashbackPriceSwitch;

						hotel.listServerCalcRefund = listServerCalcRefund;

						if (!hotel.listServerCalcRefund) {
							hotel.refundAmount = hotel.refundAmount || 0;
							hotel.price -= hotel.refundAmount;
						}

						return hotel;
					});
				}

				if (!util.isEmpty(rsp.recommendHotelInfoList)) {
					rsp.recommendHotelInfoList.map((hotel) => {
						hotel.cashbackPriceSwitch = cashbackPriceSwitch;

						hotel.listServerCalcRefund = listServerCalcRefund;

						if (!hotel.listServerCalcRefund) {
							hotel.refundAmount = hotel.refundAmount || 0;
							hotel.price -= hotel.refundAmount;
						}

						return hotel;
					});
				}

				util.isFunction(onSuccess) && onSuccess(rsp, detailSwitch);
			})
			.catch((error) => {
				util.isFunction(onError) && onError(error);
			});
	},
};
