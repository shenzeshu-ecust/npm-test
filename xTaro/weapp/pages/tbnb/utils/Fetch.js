import { twx } from '../business/tjbase/index';
import variableJs from '../business/variable_config/js/variable.ctrip';
import mpConfig from '../config/ctrip/mp_config';
import { handleSetOpenId } from '../business/common/setOpenId';
var IS_TUJIA = variableJs.platformName === 'tujia';
var IS_CTRIP = variableJs.platformName === 'ctrip';
var IS_QUNAR = variableJs.platformName === 'qunar';
var TJ_OPENID_KEY = mpConfig.MP_STORAGE_KEY.TJ_OPENID_KEY;
var Fetch = function () {
  function Fetch(_a) {
    var resHandle = _a.resHandle,
      reqHandle = _a.reqHandle;
    this.httpReqLoadingCount = 0;
    this.locationInfo = '';
    this.isLocationCancel = false;
    this.reqHandle = reqHandle;
    this.resHandle = resHandle;
  }
  Fetch.prototype.post = function (url, _a) {
    var _b = _a === void 0 ? {} : _a,
      _c = _b.data,
      data = _c === void 0 ? {} : _c,
      _d = _b.params,
      params = _d === void 0 ? {} : _d,
      _e = _b.headers,
      headers = _e === void 0 ? {} : _e,
      _f = _b.withCredentials,
      withCredentials = _f === void 0 ? false : _f,
      _g = _b.timeout,
      timeout = _g === void 0 ? 10000 : _g,
      _h = _b.isLoading,
      isLoading = _h === void 0 ? false : _h,
      _j = _b.loadingDelayTime,
      loadingDelayTime = _j === void 0 ? 200 : _j,
      _k = _b.loadingText,
      loadingText = _k === void 0 ? '请稍候...' : _k,
      _l = _b.dataType,
      dataType = _l === void 0 ? 'json' : _l,
      _m = _b.isHeaderGeo,
      isHeaderGeo = _m === void 0 ? false : _m,
      _o = _b.isPassportApi,
      isPassportApi = _o === void 0 ? false : _o;
    return this.http({
      url: url,
      method: 'post',
      data: data,
      params: params,
      headers: headers,
      withCredentials: withCredentials,
      timeout: timeout,
      isLoading: isLoading,
      loadingDelayTime: loadingDelayTime,
      loadingText: loadingText,
      dataType: dataType,
      isHeaderGeo: isHeaderGeo,
      isPassportApi: isPassportApi
    });
  };
  Fetch.prototype.get = function (url, _a) {
    var _b = _a === void 0 ? {} : _a,
      _c = _b.data,
      data = _c === void 0 ? {} : _c,
      _d = _b.params,
      params = _d === void 0 ? {} : _d,
      _e = _b.headers,
      headers = _e === void 0 ? {} : _e,
      _f = _b.withCredentials,
      withCredentials = _f === void 0 ? false : _f,
      _g = _b.timeout,
      timeout = _g === void 0 ? 10000 : _g,
      _h = _b.isLoading,
      isLoading = _h === void 0 ? false : _h,
      _j = _b.loadingDelayTime,
      loadingDelayTime = _j === void 0 ? 300 : _j,
      _k = _b.loadingText,
      loadingText = _k === void 0 ? '请稍候...' : _k,
      _l = _b.isHeaderGeo,
      isHeaderGeo = _l === void 0 ? false : _l,
      _m = _b.isPassportApi,
      isPassportApi = _m === void 0 ? false : _m;
    return this.http({
      url: url,
      method: 'get',
      data: data,
      params: params,
      headers: headers,
      withCredentials: withCredentials,
      timeout: timeout,
      isLoading: isLoading,
      loadingText: loadingText,
      loadingDelayTime: loadingDelayTime,
      isHeaderGeo: isHeaderGeo,
      isPassportApi: isPassportApi
    });
  };
  Fetch.prototype.http = function (options) {
    var _this = this;
    var loadingTimer = this.setLoading(options);
    options.params = options.params || {};
    if (this.reqHandle) {
      this.reqHandle(options);
    }
    return new Promise(function (resolve, reject) {
      var requestObj = {
        url: options.url,
        data: options.params,
        method: options.method,
        dataType: options.dataType || 'json',
        header: options.headers,
        success: function (res) {
          if (res.statusCode === 200) {
            var responseData = res.data;
            if (IS_CTRIP && responseData.resultCode === 0 && responseData.result) {
              var resResult = responseData.result;
              if (resResult && typeof resResult !== 'object') {
                resResult = JSON.parse(resResult);
              }
              responseData = resResult;
            }
            if (IS_QUNAR && responseData.status === 200) {
              responseData = responseData.value;
            }
            if (_this.resHandle) {
              return _this.resHandle(responseData, {
                resolve: resolve,
                reject: reject
              }, options);
            }
            resolve({
              data: responseData.data
            });
          } else {
            reject({
              errorNo: -1000,
              errorMsg: '网络请求错误'
            });
          }
        },
        fail: function (err) {
          if (err.response || err.request) {
            reject({
              errorNo: -1000,
              errorMsg: '网络请求错误'
            });
          } else {
            reject(err);
          }
        },
        complete: function () {
          if (options.isLoading) {
            _this.removeLoading(loadingTimer);
          }
        }
      };
      var request = function () {
        var _a, _b;
        if ((_a = twx.tjTbnb) === null || _a === void 0 ? void 0 : _a.TSigner) {
          (_b = twx.tjTbnb) === null || _b === void 0 ? void 0 : _b.TSigner({
            url: options.url,
            data: options.params,
            header: options.headers
          }).then(function (header) {
            requestObj.header = header;
            twx.request(requestObj);
          }).catch(function () {
            twx.request(requestObj);
          });
        } else {
          twx.request(requestObj);
        }
      };
      if (options.isHeaderGeo) {
        if (_this.locationInfo) {
          _this._setLocHeader(options);
          _this._requestHandle(options, request);
        } else {
          getLocationInfoLazy().then(function (res) {
            _this.locationInfo = "LON=" + res.longitude + ";LAT=" + res.latitude;
          }).catch(function (err) {
            console.log('getLocationInfoLazy err:', err);
          }).finally(function () {
            if (_this.locationInfo) {
              _this._setLocHeader(options);
            }
            _this._requestHandle(options, request);
          });
        }
      } else {
        _this._requestHandle(options, request);
      }
    });
  };
  Fetch.prototype._requestHandle = function (options, cb) {
    if (IS_TUJIA && !/\/thirdAuth\/getOpenId/.test(options.url) && options.headers && !options.headers.openId) {
      addFetchHeaderOpenId().then(function (openId) {
        var curOpenId = openId || wx.getStorageSync(TJ_OPENID_KEY);
        options.headers.openId = curOpenId;
        typeof cb === 'function' && cb();
      });
    } else {
      typeof cb === 'function' && cb();
    }
  };
  Fetch.prototype._setLocHeader = function (options) {
    options.headers['X-App-Client'] = this.locationInfo;
  };
  Fetch.prototype.setLoading = function (_a) {
    var _this = this;
    var isLoading = _a.isLoading,
      loadingDelayTime = _a.loadingDelayTime,
      loadingText = _a.loadingText;
    if (isLoading) {
      return this.loadingTimer = setTimeout(function () {
        if (!_this.httpReqLoadingCount) {
          wx.showLoading({
            title: loadingText,
            mask: true
          });
        }
        _this.httpReqLoadingCount++;
      }, loadingDelayTime);
    }
  };
  Fetch.prototype.removeLoading = function (loadingTimer) {
    clearTimeout(loadingTimer);
    if (this.httpReqLoadingCount) {
      this.httpReqLoadingCount--;
    }
    if (!this.httpReqLoadingCount) {
      wx.hideLoading();
    }
  };
  return Fetch;
}();
export default Fetch;
var locationInfo;
function getLocationInfoLazy() {
  if (locationInfo) {
    return Promise.resolve(locationInfo);
  }
  return new Promise(function (resolve, reject) {
    if (IS_CTRIP) {
      twx && twx.methods.startGetGeoPoint({
        type: 'wgs84',
        success: function (res) {
          locationInfo = res;
          resolve(res);
        },
        fail: function (err) {
          reject(err);
        }
      });
    } else {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          locationInfo = res;
          resolve(res);
        },
        fail: function (err) {
          reject(err);
        }
      });
    }
  });
}
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    var P = this.constructor;
    return this.then(function (value) {
      return P.resolve(callback()).then(function () {
        return value;
      });
    }, function (reason) {
      return P.resolve(callback()).then(function () {
        throw reason;
      });
    });
  };
}
function addFetchHeaderOpenId() {
  return new Promise(function (resolve) {
    handleSetOpenId().then(function (resp) {
      resolve(resp.openId);
    }).catch(function () {
      resolve('');
    });
  });
}