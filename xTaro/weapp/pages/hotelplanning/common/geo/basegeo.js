import { cwx, _ } from "../../../../cwx/cwx.js";

const util = require('../utils/util.js');
import commonrest from '../commonrest'

const EMPTY_FUNCTION = function () {};

const logWithUbtTrace = function (ubtKey, data) {
    if (!ubtKey) return;
    let log = cwx.sendUbtByPage.ubtTrace;
    log(ubtKey, data);
};

const __kMaxAddressCacheTime = 2 * 60;
const caches = {};
class BaseGeo {
	wrapCallback(callback) {
		return util.isFunction(callback) ? callback : EMPTY_FUNCTION;
	}

	// 第四个参数manual赋值要谨慎，除特定情况外不能赋值为true
	getPoint(nocache, success, error, manual = false, traceExposeFlag, traceAuthFlag, hotelId) {
		success = this.wrapCallback(success);
		error = this.wrapCallback(error);

		const cachedPoint = !nocache ? cwx.locate.getCachedGeoPoint() : null;
		if (cachedPoint) {
			return success({
				lat: cachedPoint.latitude,
				lng: cachedPoint.longitude,
			});
		}
		if (traceExposeFlag === true) {
			logWithUbtTrace("199242", {
				masterhotelid: hotelId,
			});
		}

		cwx.locate.startGetGeoPoint({
			success: function (resp) {
				if (traceAuthFlag === true) {
					// 允许授权埋点
					logWithUbtTrace("199243", {
						masterhotelid: hotelId,
						IsAllow: "T",
					});
				}
				success({
					lat: resp.latitude,
					lng: resp.longitude,
				});
			},
			fail: function (e) {
				if (traceAuthFlag === true) {
					// 拒绝授权埋点
					logWithUbtTrace("199243", {
						masterhotelid: hotelId,
						IsAllow: "F",
					});
				}
				error(e);
			},
			manual
		});
	}
}

module.exports = BaseGeo;
