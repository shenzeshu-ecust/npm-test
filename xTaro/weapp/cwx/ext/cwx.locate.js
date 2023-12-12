/**
 * @name locate
 * @module cwx/locate
 */
 import {
    cwx,
    __global
} from '../cwx.js';

let __kMaxAddressCacheTime = 2 * 60;
let __kMaxCtripCityCacheTime = 10 * 60;

let _cachedGeoPoint = {}; // 数据结构 { 坐标系类型: {cachedDate: xxx, ...res}} 
let _cachedAddress = null;
let _cachedCtripCity = null;

//add a callback queue, fix showAlert more times
const DEFAULT_COORDTYPE = "gcj02";
const LBS_REQUEST_URL = "/restapi/soa2/12378/json/lBS";
const TIMEOUT_PERIOD = 8000;
/**
 * 通过坐标点获取城市信息信息，所以不需要知道详细坐标类型
 * @param latitude
 * @param longitude
 * @param callback
 * @private
 */
function _queryCtripCity(latitude, longitude, callback, source, type) {
    const errorMsg = 'Request_Ctrip_City_Failed';
    const currentPage = cwx.getCurrentPage();

    if (typeof source === 'undefined' || !source) {
        console.error('source 的值不能为空！必须提供调用接口来源，不填写将禁用服务。')
        callback && callback({ error: 'Source is required!' });
        return;
    }
    sendUbtMetric('wxapp_cwx_locate_LBS_source', { 
        source: source || '',
        pagePath: currentPage && currentPage.route || ''
    }, 1) // 1 表示是 _queryCtripCity
    
    cwx.request({
        url: LBS_REQUEST_URL,
        method: "POST",
        data: {
            "appId": __global.mcdAppId, // 必填
            "source": source, // 必填（必须提供调用接口来源，才能访问此接口）
            "latitude": latitude, // 纬度
            "longitude": longitude, // 经度
            "type": 1, // 经纬度类型：1 国内；2 国际。todo??? 
            "coordType": type.toUpperCase(), // 坐标系 (WGS84/GCJ02)
            "isNeedCityID": true, // 是否需要返回城市ID
            "language": "zh-cn", //之前传递是CN现在改成zh-cn
            // needNearbySearch // 是否需要返回附近地址。服务端接口契约有此参数，未启用
            // nearbySearchType // 是否需要返回附近poi的请求参数。服务端接口契约有此参数，未启用
            "head": {},
            "extension": {
                "openid": cwx.cwx_mkt.openid || ''
            }
        },
        success: function (res) {
            // console.log('====== success, res:', res);
            // console.log(JSON.stringify(res));
            if (res && res.data && res.data.pOIInfo && res.data.pOIInfo.longitude) {
              let { pOIInfo = {} , ctripPOIInfo = [] } = res.data;
              let cityIDList = [];
              if(ctripPOIInfo && ctripPOIInfo.cityIDList && ctripPOIInfo.cityIDList.length) {
                cityIDList = ctripPOIInfo.cityIDList;
              } else if (res.data.htlCurrentCity || res.data.gsCurrentCity){
                cityIDList = [res.data.htlCurrentCity || res.data.gsCurrentCity];
              }

                Object.assign(res.data, {
                    "CityLongitude": pOIInfo.longitude,
                    "CityLatitude": pOIInfo.latitude,
                    "CountryName": pOIInfo.country,
                    "CityEntities": cityIDList.map(function (i) {
                        i.CityName = i.cityName;
                        i.CityID = i.cityID;
                        return i;
                    }),
                    /*[ {
                        "CityName" : res.ctripPOIInfo.districtName,
                        "CityID" : res.ctripPOIInfo.districtID
                    } ],*/
                    "LBSType": ctripPOIInfo.lbsType,
                    "DistrictId": ctripPOIInfo.districtID,
                })
                if(typeof res.type === 'undefined') {
                    res.type = type; // 返回值 添加 坐标系类型
                }
                if(typeof res.latitude === 'undefined') {
                    res.latitude = latitude; // 返回值 添加 纬度
                }
                if(typeof res.longitude === 'undefined') {
                    res.longitude = longitude; // 返回值 添加 经度
                }
                _cachedCtripCity = res;
                _cachedCtripCity.cachedDate = new Date();
                callback && callback(res);
            } else {
                console.log("Fail for ctrip city");
                callback && callback({ error: errorMsg });
            }
        },
        fail: function (err) {
            console.log("Fail for ctrip city");
            cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_locate_LBS_fail_queryCity', {
                err: JSON.stringify(err)
            });
            callback && callback({ error: errorMsg });
        }
    });
}

/**
 * @function
 * @return {point}
 */

function getCachedGeoPoint(type) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    if (_cachedGeoPoint && typeof _cachedGeoPoint[type] !== 'undefined' && _cachedGeoPoint[type].cachedDate) {
        let interval = new Date().getTime() / 1000 - _cachedGeoPoint[type].cachedDate.getTime() / 1000;
        if (interval < __kMaxAddressCacheTime) {
            return _cachedGeoPoint[type];
        }
    }

    return null;
}

/**
 * @function
 * @return {point}
 */
function getCachedAddress() {
    if (_cachedAddress && _cachedAddress.cachedDate) {
        let interval = new Date().getTime() / 1000 - _cachedAddress.cachedDate.getTime() / 1000;
        if (interval < __kMaxAddressCacheTime) {
            return _cachedAddress;
        }
    }

    return null;
}

/**
 * @function
 * @return {point}
 */
function getCachedCtripCity() {
    if (_cachedCtripCity && _cachedCtripCity.cachedDate) {
        let interval = new Date().getTime() / 1000 - _cachedCtripCity.cachedDate.getTime() / 1000;
        if (interval < __kMaxCtripCityCacheTime) {
            return _cachedCtripCity;
        }
    }

    return null;
}


/**
 * 开始根据传入参数获取定位信息
 * @function
 * @param {map} cbData
 */
function startGetGeoPoint(options) {
    let _success = options.success || function () {};
    options.success = function (res) {
        let type = options.type || DEFAULT_COORDTYPE;
        _cachedGeoPoint[type] = res || {};
        _cachedGeoPoint[type].cachedDate = new Date();
        if (_success && typeof _success === 'function') {
            _success(res);
        }
    }
    cwx.getLocation(options);
}

function sendUbtMetric(keyId, data, value) {
    cwx.sendUbtByPage.ubtMetric({
        name: keyId,
        tag: data,
        value: value
    });
}

function _getAddress(latitude, longitude, callback, source, type) {
    let cbData = {
        "type": type,
        "latitude": latitude,
        "longitude": longitude
    };
    const currentPage = cwx.getCurrentPage();
    if (typeof source === 'undefined' || !source) {
        console.error('source 的值不能为空！必须提供调用接口来源，不填写将禁用服务。')
        cbData.error = 'Source is required!'
        callback && callback(cbData);
        return;
    }
    sendUbtMetric('wxapp_cwx_locate_LBS_source', { 
        source: source || '',
        pagePath: currentPage && currentPage.route || ''
    }, 2) // 2 表示是 _getAddress

    cwx.request({
        url: LBS_REQUEST_URL,
        method: "POST",
        data: {
            "appId": __global.mcdAppId, // 必填
            "source": source, // 必填（必须提供调用接口来源，才能访问此接口）
            "latitude": latitude, // 纬度
            "longitude": longitude, // 经度
            "type": 1, // 经纬度类型：1 国内；2 国际。todo??? 
            "coordType": type.toUpperCase(), // 坐标系 (WGS84/GCJ02)
            "isNeedCityID": true, // 是否需要返回城市ID
            "language": "zh-cn", //之前传递是CN现在改成zh-cn
            // needNearbySearch // 是否需要返回附近地址。服务端接口契约有此参数，未启用
            // nearbySearchType // 是否需要返回附近poi的请求参数。服务端接口契约有此参数，未启用
            "head": {},
            "extension": {
                "openid": cwx.cwx_mkt.openid || ''
            }
        },
        success: function (res) {
            // console.log('====== _getAddress success, res:', res);
            // console.log(JSON.stringify(res));

            if (res && res.statusCode === 200 && res.data && res.data.originalPOIInfo) { // 服务器成功处理请求
                if(res.data.resultCode && res.data.resultCode === 1) { // “服务端LBS接口”文档上写着： resultCode 1为成功，非1表示失败
                    let data;
                    try {
                        data = JSON.parse(res.data.originalPOIInfo);
                    } catch(e) {
                        data = {};
                        console.log(e);
                    }
                    if(typeof data.result === 'undefined') {
                        data.result = {};
                    }
                    
                    try {
                        // 这里是为了与之前 请求 "/restapi/soa2/12378/json/reverseAddress" 的返回值包含的属性名保持一致
                        Object.assign(cbData, {
                            ...data.result,
                            "ResponseStatus": res.data.ResponseStatus || null,
                            "address": typeof data.result.formatted_address !== 'undefined' ? data.result.formatted_address : null,
                            "cachedDate": new Date(),
                            "cityName": data.result.addressComponent && typeof data.result.addressComponent.city ? data.result.addressComponent.city : null,
                            "formattedAddress": typeof data.result.formatted_address !== 'undefined' ? data.result.formatted_address : null,
                            "sematicDescription": typeof data.result.sematic_description !== 'undefined' ? data.result.sematic_description : null
                        })

                        // 将 cbData.addressComponent 中包含下划线的属性名转成驼峰式命名
                        cbData.addressComponent = cbData.addressComponent || {};
                        Object.assign(cbData.addressComponent, {
                            "countryCode": typeof cbData.addressComponent.country_code !== 'undefined' ? cbData.addressComponent.country_code : null,
                            "streetNumber": typeof cbData.addressComponent.street_number !== 'undefined' ? cbData.addressComponent.street_number : null
                        })
                    } catch(e) {
                        console.log(e);
                    }
                    
                    _cachedAddress = cbData;
                    _cachedAddress.cachedDate = new Date();
                } else {
                    cbData.error = `Request_Address_Error(resultCode_${res.data.resultCode || ""}_resultMsg_${res.data.resultMsg || ""})`;
                }
            } else {
                cbData.error = `Request_Address_Error(HTTP_${res.statusCode})`;
            }

            callback && callback(cbData);
        },
        fail: function () {
            cbData.error = "Request_Address_Failed";
            callback && callback(cbData);
        }
    });
}

/**
 * @function
 * @param {function} callback
 * @param {number} request timeout
 */
function startGetAddress(callback, source, type, timeout = TIMEOUT_PERIOD) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_Address_Timeout");

    startGetGeoPoint({
        type: type,
        success: function (res) {
            let latitude = res.latitude;
            let longitude = res.longitude;
            _getAddress(latitude, longitude, callbackWrapper, source, type)
        },
        fail: function () {
            callbackWrapper({ error: "Read_GeoPoint_Failed" });
        }
    });
}

function timeoutCenter(callback, source, timeout, errorMsg) {
    let startTime = new Date();
    let hasCallbackDone = false;
    let callbackWrapper = function(res) {
        clearTimeout(timer);
        if(hasCallbackDone) {
            return;
        }
        callback && callback(res);
        hasCallbackDone = true; // callback 只执行一次
    }
    let timer = setTimeout(function () {
        // console.log(errorMsg, '已超时===========')
        // 记录，超时的情况有多少？
        sendUbtMetric('wxapp_cwx_locate_timeout', {
            source,
            timeout,
            errorMsg
        }, (new Date().getTime() - startTime))
        callbackWrapper({ error: errorMsg });
    }, timeout)
    return callbackWrapper;
}

/**
 * @function
 * @param {function} callback
 */
function startGetCtripCity(callback, source, type, timeout = TIMEOUT_PERIOD) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_CtripCity_Timeout");
    
    startGetGeoPoint({
        type: type,
        success: function (res) {
            let latitude = res.latitude
            let longitude = res.longitude
            _queryCtripCity(latitude, longitude, callbackWrapper, source, type);
        },
        fail: function () {
            callbackWrapper({ error: "Read_GeoPoint_Failed" });
        }
    })
}

// 自己传入 经纬度，逆解析得到相应的地址
// type 标明入参的经纬度是什么坐标系类型的
function startGetCtripCityByCoordinate(latitude, longitude, callback, source, type, timeout = TIMEOUT_PERIOD) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_CtripCity_Timeout");
    
    _queryCtripCity(latitude, longitude, callbackWrapper, source, type);
}

function startGetAddressByCoordinate(latitude, longitude, callback, source, type, timeout = TIMEOUT_PERIOD) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_Address_Timeout");

    _getAddress(latitude, longitude, callbackWrapper, source, type);
}

//获取经纬度信息，先取缓存，缓存没有则去请求
function getGeoPoint(options) {
    let res = getCachedGeoPoint();
    if (res || typeof options.getCacheOnly !== 'undefined' && options.getCacheOnly) {
        options.success && options.success(res);
        options.complete && options.complete(res);
        return;
    }
    startGetGeoPoint(options);
}

//获取地址信息，先取缓存，缓存没有则去请求
function getAddress(callback, source, type = DEFAULT_COORDTYPE, timeout = TIMEOUT_PERIOD, getCacheOnly) {
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_Address_Timeout");

    let res = getCachedAddress();
    if (res || typeof getCacheOnly !== 'undefined' && getCacheOnly) {
        callbackWrapper && callbackWrapper(res);
        return;
    }
    startGetAddress(callbackWrapper, source, type, timeout);
}

//获取携程城市，先取缓存，缓存没有则去请求
function getCtripCity(callback, source, type, timeout = TIMEOUT_PERIOD, getCacheOnly) {
    if (!type) {
        type = DEFAULT_COORDTYPE;
    }
    let callbackWrapper = timeoutCenter(callback, source, timeout, "Get_CtripCity_Timeout");

    let res = getCachedCtripCity();
    if (res || typeof getCacheOnly !== 'undefined' && getCacheOnly) {
        callbackWrapper && callbackWrapper(res);
        return;
    }
    startGetCtripCity(callbackWrapper, source, type, timeout);
}

//public API to export

//public API to export
export default {
    //获取当前经纬度，调用微信定位
    startGetGeoPoint,
    //获取当前地址信息，调用微信定位，逆地址解析当前位置信息
    startGetAddress,
    //获取当前城市信息，调用微信定位，逆地址解析当前城市信息
    startGetCtripCity,
    // 根据传入经纬度，查询对应城市信息
    startGetCtripCityByCoordinate,
    startGetAddressByCoordinate,
    //获取缓存的经纬度信息, 2min过期
    getCachedGeoPoint,
    //获取缓存的地址信息, 2min过期
    getCachedAddress,
    //获取缓存的携程城市，10min过期
    getCachedCtripCity,
    getGeoPoint,
    getAddress,
    getCtripCity
}
