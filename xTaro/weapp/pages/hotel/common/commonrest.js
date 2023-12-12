import util from './utils/util.js';
import dateUtil from './utils/date.js';
import urlUtil from './utils/url.js';
import model from './utils/model.js';
import country from './geo/country.js';
import hrequest from './hpage/request';

function sendRequest (name, params, onSuccess, onError) {
    hrequest.hrequest({
        url: model.serveUrl(name),
        data: params,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                onSuccess && onSuccess(result.data);
            } else {
                onError && onError();
            }
        },
        fail: function (error) {
            onError && onError(error);
        }
    });
}

// 获取服务器北京时间
function getServerTime (callback) {
    const success = util.type(callback) === 'function' ? callback : () => {};
    const pattern = 'yyyy/MM/dd hh:mm:ss';
    const url = urlUtil.setParams(model.serveUrl('getbeijingtime'), {
        ts: +new Date()
    });

    hrequest.hrequest({
        url,
        success: function (res) {
            if (util.successSoaResponse(res)) {
                // res.data.beijingTime = "2020/06/16 01:31:03";
                success(res.data.beijingTime);
            } else {
                success(dateUtil.formatTime(pattern));
            }
        },
        fail: function () {
            success(dateUtil.formatTime(pattern));
        }
    });
}

const timeZoneCaches = {};
function timezone (cityId, lat, lng, hotelId, callback) {
    callback = util.type(callback) === 'function' ? callback : () => {};

    if (cityId && timeZoneCaches[cityId]) {
        return callback(timeZoneCaches[cityId]);
    }

    let request;
    if (cityId) {
        request = {
            cityId: ~~cityId
        };
    } else if (hotelId) {
        request = {
            hotelId: ~~hotelId
        };
    } else {
        const coordType = country.outOfChina(lng, lat) ? 0 : 2;
        request = {
            coordType,
            lat,
            lng
        };
    }

    hrequest.hrequest({
        url: model.serveUrl('timezone'),
        data: request,
        success: function (result) {
            if (!util.successSoaResponse(result) || result.data.code !== 200) {
                callback();
                return;
            }

            const zoneInfo = result.data.data;
            const rsp = {
                tzone: zoneInfo.timeZone,
                cityId: zoneInfo.cityId,
                cityName: zoneInfo.cityName,
                biz: zoneInfo.countryId === 1 ? 1 : 2
            };

            if (cityId && cityId > 0) {
                timeZoneCaches[cityId] = rsp;
            }
            callback(rsp);
        },
        fail: function () {
            callback();
        }
    });
}

function lbs (lat, lng, callback) {
    if (util.type(callback) !== 'function') return;
    const errorMsg = { error: 'Request_Ctrip_City_Failed' };
    hrequest.hrequest({
        url: model.serveUrl('lbslocatecity'),
        data: {
            latitude: lat,
            longitude: lng,
            language: 'CN'
        },
        success: function (res) {
            if (util.successSoaResponse(res)) {
                callback(res);
            } else {
                callback(errorMsg);
            }
        },
        fail: function () {
            callback(errorMsg);
        }
    });
}

function getSwitch (switchList, success, fail) {
    if (!util.isFunction(success) || !(switchList && switchList.length > 0)) {
        return;
    }

    hrequest.hrequest({
        url: model.serveUrl('hotelswitch'),
        data: { switchList },
        success: function (result) {
            if (util.successSoaResponse(result)) {
                success(result.data.switchMap);
            } else {
                fail && fail(result.data.ResponseStatus ? result.data.ResponseStatus.errors : '');
            }
        },
        fail: function (err) {
            fail && fail(err);
        }
    });
}

/**
 * 新开关接口，后续把14036的getswitch切换到该应用上
 *
 * */
function getSwitchList (switchList, success, fail) {
    if (!util.isFunction(success) || !(switchList && switchList.length > 0)) {
        return;
    }

    hrequest.hrequest({
        url: model.serveUrl('getswitchlist'),
        data: { switchList },
        success: function (result) {
            if (util.successSoaResponse(result)) {
                success(result.data.switchMap);
            } else {
                fail && fail(result.data.ResponseStatus ? result.data.ResponseStatus.errors : '');
            }
        },
        fail: function (err) {
            fail && fail(err);
        }
    });
}

function getWechatSoaSwitch (keys, callback, output) {
    if (!util.isFunction(callback) || util.isEmpty(keys)) {
        return;
    }

    hrequest.hrequest({
        url: model.serveUrl('h5switchresult'),
        data: { keys },
        success: function (res) {
            if (!util.successSoaResponse(res)) {
                return callback();
            }

            const { result } = res.data;
            if (util.isEmpty(result) || !util.isArray(result)) {
                return callback();
            }

            const obj = { result };

            switch (String(output).toLowerCase()) {
            case 'json':
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
        }
    });
}

function askhotelTPK (thirdPartytoken, success, fail) {
    if (!util.isFunction(success) || !thirdPartytoken) {
        return;
    }

    hrequest.hrequest({
        url: model.serveUrl('addtoken'),
        data: { token: JSON.stringify(thirdPartytoken) },
        success: function (result) {
            if (util.successSoaResponse(result)) {
                success(result.data.id);
            } else {
                fail && fail(result.data.ResponseStatus.errors);
            }
        },
        fail: function (err) {
            fail && fail(err);
        }
    });
}

function getHotelFilter (params, success, fail) {
    const url = model.serveUrl('gethotelfilter');
    const reqData = {
        cityId: params.cityId,
        indate: params.indate,
        outdate: params.outdate,
        districtId: params.districtId,
        userCoordinate: params.userCoordinate,
        channel: params.channel || 0,
        category: params.category,
        isHourRoomSearch: params.isHourRoomSearch || false
    };
    hrequest.hrequest({
        url,
        data: reqData,
        success: function (result) {
            if (util.successSoaResponse(result)) {
                success && success(result.data);
            } else {
                fail && fail();
            }
        },
        fail: function () {
            fail && fail();
        }
    });
}

// 领券
function receiveCoupon (params, onSuccess, onError) {
    hrequest.hrequest({
        url: model.serveUrl('receivecoupon'),
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

/**
 * 支持领取多张券
 * @param {*} params 券id list
 */
function receiveMutilCoupon (params, onSuccess, onError) {
    hrequest.hrequest({
        url: model.serveUrl('receivemutilcoupon'),
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

/**
 * GraphQL查询
 * @param { query } GraphQL query
 * @param { source } search source
 * @param { onSuccess } success callback function
 * @param { onError } fail callback function
 */
function graphQLExecute (query, source, onSuccess, onError) {
    if (!query) return;

    hrequest.hrequest({
        url: model.serveUrl('graphqldata'),
        data: {
            query: query.replace(/\n/g, ' ').replace(/\s+/g, ' '),
            source
        },
        success: function (result) {
            if (util.successSoaResponse(result)) {
                const d = result.data || {};
                if (d.errors && d.errors.length) {
                    onError && onError(d);
                }
                onSuccess && onSuccess(d.data);
            } else {
                onError && onError();
            }
        },
        fail: function (error) {
            onError && onError(error);
        }
    });
}
/**
 * 新客好礼，弹窗+优惠券
 */
function getNewerGift () {
    sendRequest('newguestgift', ...arguments);
}

export default {
    getServerTime,
    lbs,
    timezone,
    getSwitch,
    getSwitchList,
    getWechatSoaSwitch,
    askhotelTPK,
    getHotelFilter,
    receiveCoupon,
    receiveMutilCoupon,
    graphQLExecute,
    getNewerGift
};
