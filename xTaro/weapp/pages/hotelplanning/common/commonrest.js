import { __global } from "../../../cwx/cwx.js";
import dateUtil from './utils/date.js';
import hrequest from "./hpage/request"
const util = require('./utils/util.js');
const urlUtil = require('./utils/url.js')
const model = require('./utils/model.js');

function getSwitch(switchList, success, fail) {
	if (!util.isFunction(success) || !(switchList && switchList.length > 0)) {
		return;
	}

	hrequest.hrequest({
		url: model.serveUrl("hotelswitch"),
		data: { switchList: switchList },
		success: function (result) {
			if (util.successSoaResponse(result)) {
				success(result.data.switchMap);
			} else {
				fail && fail(result.data?.ResponseStatus?.errors);
			}
		},
		fail: function (err) {
			fail && fail(err);
		},
	});
}

function getWechatSoaSwitch(keys, callback, output) {
	if (!util.isFunction(callback) || util.isEmpty(keys)) {
		return;
	}

	hrequest.hrequest({
		url: model.serveUrl("h5switchresult"),
		data: { keys: keys },
		success: function (res) {
			if (!util.successSoaResponse(res)) {
				return callback();
			}

			const { result } = res.data;
			if (util.isEmpty(result) || !util.isArray(result)) {
				return callback();
			}

			const obj = { result: result };

			switch (String(output).toLowerCase()) {
				case "json":
					obj.result = {};
					result.forEach((item) => {
						obj.result[item.key] = item.value;
					});
					break;
			}

			callback(obj);
		},
		fail: function () {
			callback();
		},
	});
}

function getWechatSoaSwitchCutPrice(keys, callback, output) {
	if (!util.isFunction(callback) || util.isEmpty(keys)) {
		return;
	}
	hrequest.hrequest({
		url: model.serveUrl("cutpriceswitchresult"),
		data: { keys: keys },
		success: function (res) {
			if (!util.successSoaResponse(res)) {
				return callback();
			}

			const { result, icons, assistIcons } = res.data;
			if (util.isEmpty(result) || !util.isArray(result)) {
				return callback();
			}

			const obj = { result: result, icons: icons, assistIcons };

			switch (String(output).toLowerCase()) {
				case "json":
					obj.result = {};
					result.forEach((item) => {
						obj.result[item.key] = item.value || "";
					});
					break;
			}

			callback(obj);
		},
		fail: function () {
			callback();
		},
	});
}

/**
 * 支持领取多张券
 * @param {*} params 券id list
 */
 function receiveMutilCoupon (params, onSuccess, onError) {
    hrequest.hrequest({
        url: model.serveUrl('batchreceivecoupon'),
        data: params,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess(result.data);
            } else {
                onError && onError();
            }
        },
        fail: function (err) {
            onError && onError(err);
        }
    });
}

// 将 hrequest 及其相关转化为 promise
function call(param) {
	// let param = createParam[name](search);
	return new Promise((resolve, reject) => {
		hrequest.hrequest({
			url: model.serveUrl(param.url),
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

export default {
    getSwitch,
    getWechatSoaSwitch,
    getWechatSoaSwitchCutPrice,
    receiveMutilCoupon,
	call
};
