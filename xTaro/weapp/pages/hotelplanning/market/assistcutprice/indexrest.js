import hrequest from "../../common/hpage/request"
const ModelUtil = require("../../common/utils/model.js");
const util = require("../../common/utils/util.js");
import { cwx } from "../../../../cwx/cwx.js";
import hPromise from "../../common/hpage/hpromise";

// 将 hrequest 及其相关转化为 promise
function call(name, search) {
	let param = createParam[name](search);
	return new hPromise((resolve, reject) => {
		hrequest.hrequest({
			url: ModelUtil.serveUrl(name),
			data: param,
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

const createParam = {
	getHomeInfo(searches) {
		return {
			orderId: searches?.orderId || "",
			user: {
				avatar: searches.avatar,
				nick: searches.nickName,
				mktOpenId: cwx.cwx_mkt.openid,
			},
		};
	},
	assistCutPrice(searches) {
		return {
			orderId: searches.orderId,
			user: {
				avatar:
					searches.user.avatar ||
					"https://dimg04.c-ctrip.com/images/t1/headphoto/646/318/109/a865fe5f5465407d8befd5dc487a8554_C_100_100.jpg",
				nick: searches.user.nick || "微信用户",
				MktOpenId: searches.user.mktOpenId || cwx.cwx_mkt.openid || "",
			},
			from: searches.from || "",
			appFrom: searches.appFrom || "",
			currentCheckpoint: searches.currentCheckpoint || 0,
		};
	},

	createCut(searches) {
		return {
			orderId: searches.orderId,
			user: {
				avatar: searches.avatar,
				nick: searches.nickName,
			},
		};
	},
	getSwitch(searches) {
		return { keys: searches };
	},
	gethoteldetail(hotelId) {
		return { hotelId };
	},
	cutPriceVerifyToken(params) {
		return {
			token: params.token || "",
			rid: params.rid || "",
			version: params.version || "",
			extensions: params.extensions || []
		};
	},
	userBrowseRecord(hotelId) {
		return { hotelId };
	},
	assistingCutPriceList(searches) {
		// from: 1 表示来源是小程序
		return { orderId: searches.orderId, from: 1 };
	},
	assistingAvatarCarousel(searches) {
		return { orderId: searches.orderId };
	},
	assistcheckpoint(searches) {
		return { orderId: searches.orderId };
	},
	getHotelABTest(searches) {
		return { abKeys: searches.abKeys };
	},
	assistNotice(searches) {
		return {
			checkpointNum: searches.point,
			orderId: searches.orderId,
			mktOpenId: cwx.cwx_mkt.openid || "",
			acceptStatus: searches.acceptStatus,
		};
	},
	assistingWeWorkWelfare(searches) {
		return { orderId: searches.orderId };
	},
	receiveAssistingWeWorkWelfare(searches) {
		return { orderId: searches.orderId };
	},
};

export default {
	getHomeInfo(searches) {
		return call("getHomeInfo", searches).catch(() => ({ result: false }));
	},
	getAssistList(searches) {
		return call("assistingCutPriceList", searches).catch(() => ({
			result: false,
		}));
	},
	assistCutPrice(searches) {
		return call("assistCutPrice", searches).catch(() => ({}));
	},
	createCut(searches) {
		return call("createCut", searches).catch(() => ({}));
	},
	getSwitch(keys) {
		if (!util.isArray(keys)) {
			keys = [keys];
		}

		return call("getSwitch", keys).catch(() => ({ result: [] }));
	},
	getHotelDetail(hotelId) {
		return call("gethoteldetail", hotelId).catch(() => ({ result: [] }));
	},
	cutPriceVerifyToken(params) {
		return call("cutPriceVerifyToken", params).catch(() => ({}));
	},
	userBrowseRecord(hotelId) {
		return call("userBrowseRecord", hotelId).catch(() => ({}));
	},
	assistingAvatarCarousel(searches) {
		return call("assistingAvatarCarousel", searches).catch(() => ({
			result: false,
		}));
	},
	assistcheckpoint(searches) {
		return call("assistcheckpoint", searches).catch(() => ({
			result: false,
		}));
	},
	getHotelABTest(searches) {
		return call("getHotelABTest", searches).catch(() => ({}));
	},
	assistNotice(searches) {
		return call("assistNotice", searches).catch(() => ({
			result: false,
		}));
	},
	assistingWeWorkWelfare(searches) {
		return call("assistingWeWorkWelfare", searches).catch(() => ({
			result: false,
		}));
	},
	receiveAssistingWeWorkWelfare(searches) {
		return call("receiveAssistingWeWorkWelfare", searches).catch(() => ({
			result: false,
		}));
	}
};
