import { cwx } from "../../../../cwx/cwx";
const util = require("../../common/utils/util");
const huser = require("./huser");
const ModelUtil = require("../utils/model.js");

const sdkVersion = wx.getSystemInfoSync().SDKVersion || "NA";
const waitCIQueue = [];
let waitCICount = 5;
let timer = null;

const hrequest = function (object, nosoa2) {
	if (!nosoa2) {
		if (!object.data) {
			object.data = {};
		}

		buildExtension(object);

		// clientid 强依赖
		if (!cwx.clientID && waitCICount > 0) {
			waitForClient(object);
			return;
		}

		// 服务依赖auth, 如果未登陆则跳去登录
		authentication(object);
	}

	object.isSocket = true;
	return cwx.request(object);
};

/**
 * check auth is valid
 * @param res
 * @returns {*}
 */
const invalidTokenError = function (res) {
	if (!res || !res.data) {
		return false;
	}

	if (util.successSoaResponse(res)) {
		return false;
	}

	if (util.isEmpty(res.data.ResponseStatus)) {
		return false;
	}

	const responseStatus = res.data.ResponseStatus;
	return (
		util.isArray(responseStatus.Errors) &&
		responseStatus.Errors.filter(
			(e) => e.ErrorCode === "MobileRequestFilterException"
		).length > 0
	);
};

/**
 * strong dependence clientid
 * @param object
 */
const waitForClient = function (object) {
	waitCIQueue.push(object);

	if (!timer) {
		timer = setInterval(() => {
			waitCICount--;

			if (cwx.clientID || waitCICount <= 0) {
				waitCIQueue.forEach((w) => {
					cwx.request(w);
				});

				clearInterval(timer);
			}
		}, 100);
	}
};

/**
 * attach env extensions
 * @param object
 */
const buildExtension = function (object) {
	let webp = cwx.getStorageSync("P_HOTEL_S_WBEP");
	const extension = [
		{
			name: "sdkversion",
			value: sdkVersion,
		},
		{
			name: "openid",
			value: cwx.cwx_mkt.openid,
		},
		{
			name: "pageid",
			value: cwx.getCurrentPage().pageId || "NA",
		},
		{
			name: "supportWebP",
			value: (webp && webp.val) || "false",
		},
	];

	if (
		object.data.head &&
		util.isArray(object.data.head.extension) &&
		object.data.head.extension.length > 0
	) {
		const targetExtension = object.data.head.extension;

		targetExtension.forEach((ext) => {
			if (["sdkversion", "openid", "pageid"].indexOf(ext.name) === -1) {
				extension.push(ext);
			}
		});
		delete object.data.head.extension;
	}

	util.extend(
		object.data,
		{
			head: {
				extension: extension,
			},
		},
		true
	);
};

/**
 * strong dependence auth
 * @param object
 */
const authentication = function (object) {
	if (!object || !object.checkAuth || !util.isFunction(object.success)) {
		return;
	}

	const _success = object.success;
	const _fail = object.fail;
	const _object = cwx.util.copy(object);

	object.success = function (res) {
		const args = Array.prototype.slice.call(arguments, 0);

		if (!invalidTokenError(res)) {
			return _success.apply(this, args);
		}

		huser.login({
			callback: (loginRes) => {
				if (loginRes.ReturnCode === "0") {
					return cwx.request(_object);
				}

				if (util.isFunction(_fail)) {
					_fail.apply(this, args);
				}
			},
		});
	};
};

export default {
	cancel: cwx.cancel.bind(cwx),
	hrequest: hrequest,
};
