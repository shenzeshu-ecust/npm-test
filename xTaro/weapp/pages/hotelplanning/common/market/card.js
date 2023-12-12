import { cwx } from "../../../../cwx/cwx.js";

const sendTrace = (page, key, val) => {
	if (page && page.ubtTrace) {
		page.ubtTrace(key, val);
	}
};
/**
 * 根据策略id列表发放微信卡券
 * @param {Array} strategyList 策略id列表
 * @param {Function} success 成功回调
 * @param {Function} error 失败回调
 * @return void
 */
const addWxCard = function (page, strategyList, success, error) {
	if (strategyList && strategyList.length) {
		const idsStr = strategyList.join(",");
		try {
			cwx.mkt.addCard(
				strategyList,
				"STRATEGY",
				(data) => {
					success && success();
					sendTrace(page, 103791, { Ack: "success", ids: idsStr });
				},
				(err) => {
					error && error();
					sendTrace(page, 103792, { Ack: "fail", ids: idsStr });
				}
			);
		} catch (e) {
			sendTrace(page, 103792, { Ack: "exception", ids: idsStr });
		}
	}
};

module.exports = {
	addWxCard,
};
