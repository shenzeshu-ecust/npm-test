import passportApi from '../../api/passportApi';
import mpConfig from '../../config/ctrip/mp_config';
var _a = mpConfig.MP_STORAGE_KEY,
  TJ_OPENID_KEY = _a.TJ_OPENID_KEY,
  TJ_UNIONID_KEY = _a.TJ_UNIONID_KEY;
function handleSetOpenId(isUpdateSessionKey) {
  if (isUpdateSessionKey === void 0) {
    isUpdateSessionKey = false;
  }
  return new Promise(function (resolve, reject) {
    try {
      var openId = wx.getStorageSync(TJ_OPENID_KEY);
      var unionId = wx.getStorageSync(TJ_UNIONID_KEY);
      if (openId && !isUpdateSessionKey) {
        _handleSetOpenidAndUnionidStorage({
          openId: openId,
          unionId: unionId
        });
        resolve({
          openId: openId,
          unionId: unionId
        });
      } else {
        passportApi.getOpenId().then(function (res) {
          if (res) {
            _handleSetOpenidAndUnionidStorage({
              openId: res.openId,
              unionId: res.unionId
            });
            resolve(res);
          }
        }).catch(function (err) {
          return reject(err);
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}
function _handleSetOpenidAndUnionidStorage(_a) {
  var openId = _a.openId,
    unionId = _a.unionId;
  wx.setStorageSync(TJ_OPENID_KEY, openId);
  wx.setStorageSync(TJ_UNIONID_KEY, unionId);
}
export { handleSetOpenId };