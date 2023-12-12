import { cwx } from "../../../cwx/cwx.js";
var ModelUtil = require("../common/utils/model.js");
import hrequest from "../common/hpage/request"

module.exports = {
	request: function (opts) {
		cwx.createAntiSpiderRequest({
			url: ModelUtil.serveUrl("getSessionKey"),
			requestFn: hrequest.hrequest,
			fixedParams: {
				appid: "100014036",
			},
			callback: function (token, res) {
				let sessionKey = res?.data?.sessionKey || "";
				opts.data.session = {
					key: token,
					sessionKey: sessionKey,
				};
				hrequest.hrequest(opts);
			},
			getScriptFromRsp: function (rsp) {
				return rsp && rsp.data && rsp.data.data;
			},
		});
	},
};
