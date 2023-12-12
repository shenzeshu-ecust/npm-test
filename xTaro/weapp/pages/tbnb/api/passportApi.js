import { twx } from '../business/tjbase/index';
import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
import mpConfig from '../config/ctrip/mp_config';
import { handleSetOpenId } from '../business/common/setOpenId';
var PASSPORT_API_TUJIA_HOST = hostConfig.PASSPORT_API_TUJIA_HOST,
  M_TUJIA_HOST = hostConfig.M_TUJIA_HOST;
var USER_INFO_KEY = mpConfig.MP_STORAGE_KEY.USER_INFO_KEY;
var platformName = 'ctrip';
var apiUrlConfig = {
  getOpenId: PASSPORT_API_TUJIA_HOST + "/" + platformName + "/thirdAuth/getOpenId",
  checkLogin: PASSPORT_API_TUJIA_HOST + "/" + platformName + "/thirdAuth/smallApp/checkLogin",
  getUnionId: PASSPORT_API_TUJIA_HOST + "/" + platformName + "/thirdAuth/smallApp/getUnionId",
  checkToken: M_TUJIA_HOST + "/bnbapp-node-mp/mp/login/checkToken"
};
var globalGetOpenidPromise;
var passportApi = {
  getOpenId: function (_a) {
    var _b = (_a === void 0 ? {} : _a).isLoading,
      isLoading = _b === void 0 ? false : _b;
    var getOpenidPromise = globalGetOpenidPromise || new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          tjFetch.post(apiUrlConfig.getOpenId, {
            params: {
              parameter: {
                code: res.code,
                thirdType: mpConfig.THIRD_TYPE
              }
            },
            isLoading: isLoading,
            isPassportApi: true
          }).then(function (dt) {
            if (dt && dt.openId) {
              resolve(dt);
            } else {
              reject();
            }
          }).catch(function (err) {
            reject(err);
          });
        },
        fail: function fail(err) {
          reject(err);
        }
      });
    });
    if (!globalGetOpenidPromise) {
      globalGetOpenidPromise = getOpenidPromise;
    }
    return getOpenidPromise.then(function (res) {
      return Promise.resolve(res);
    }).catch(function (err) {
      return Promise.reject(err);
    }).finally(function () {
      if (globalGetOpenidPromise) {
        globalGetOpenidPromise = null;
      }
    });
  },
  checkLogin: function (_a) {
    var _b = (_a === void 0 ? {} : _a).isLoading,
      isLoading = _b === void 0 ? true : _b;
    return new Promise(function (resolve, reject) {
      var userInfo = wx.getStorageSync(USER_INFO_KEY);
      handleSetOpenId().then(function (res) {
        var _a;
        tjFetch.post(apiUrlConfig.checkLogin, {
          params: {
            parameter: {
              openId: res.openId,
              unionId: res.unionId,
              thirdType: mpConfig.THIRD_TYPE,
              userInfo: userInfo ? JSON.stringify(userInfo) : ''
            },
            client: {
              cookieRecord: (_a = twx.tjTbnb) === null || _a === void 0 ? void 0 : _a.cookieRecord.getCookieRecord()
            }
          },
          isLoading: isLoading,
          loadingDelayTime: 100,
          isPassportApi: true
        }).then(function (checkRes) {
          var data = checkRes.data;
          data.openId = res.openId;
          data.unionId = res.unionId;
          data.userId = data.userID;
          resolve(data);
        }).catch(function (err) {
          if (err && err.errorNo === 55030) {
            return resolve({
              openId: res.openId,
              unionId: res.unionId,
              userId: 0
            });
          }
          reject(err);
        });
      }).catch(function (err) {
        console.error('setOpenId error---', err);
        reject(err);
      });
    });
  },
  getUnionId: function (_a) {
    var thirdType = _a.thirdType,
      openId = _a.openId,
      encryptedData = _a.encryptedData,
      iv = _a.iv,
      code = _a.code;
    return tjFetch.post(apiUrlConfig.getUnionId, {
      params: {
        parameter: {
          thirdType: thirdType,
          openId: openId,
          encryptedData: encryptedData,
          iv: iv,
          code: code
        }
      }
    });
  },
  checkToken: function (tjUserToken) {
    var mode = wx.getStorageSync('TEST_HOST') || 'build';
    var host = mode === 'build' ? 'tujia.com' : 'fvt.tujia.com';
    var checkTokenLogin = new Promise(function (resolve, reject) {
      tjFetch.post(apiUrlConfig.checkToken, {
        headers: {
          cookie: host + "_PortalContext_UserId=" + String(tjUserToken === null || tjUserToken === void 0 ? void 0 : tjUserToken.userId) + ";" + host + "_PortalContext_UserToken=" + (tjUserToken === null || tjUserToken === void 0 ? void 0 : tjUserToken.userToken)
        },
        isPassportApi: true
      }).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        reject(err);
      });
    });
    return checkTokenLogin.then(function (res) {
      return Promise.resolve(res);
    }).catch(function (err) {
      return Promise.reject(err);
    });
  }
};
export default passportApi;