const ModelUtil = require("../../common/utils/model.js");
import hPromise from "../../common/hpage/hpromise";
import hrequest from "../../common/hpage/request"
const util = require("../../common/utils/util.js");

// 将 hrequest 及其相关转化为 promise
function call(param) {
	// let param = createParam[name](search);
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

// 获取酒店 & wifi列表
function getWifiInit(hotelId, topPublicFlag, urlKey) {
	const params = {
		data: {
			hotelId: hotelId,
			topPublicFlag: topPublicFlag,
			urlKey: urlKey
		},
		url: "wifiHome",
	};
	return call(params).catch(() => ({ result: [] }));
}

module.exports = {
	getWifiInit,
};
