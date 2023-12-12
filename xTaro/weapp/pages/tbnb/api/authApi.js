import tjFetch from './tjFetch';
import utils from '../utils/index';
import hostConfig from '../config/ctrip/host';
var BAPI_TUJIA_HOST = hostConfig.BAPI_TUJIA_HOST;
var apiUrlConfig = {
  newClientAuthCheck: utils.distinguishPlatform({
    tujia: BAPI_TUJIA_HOST + "/v1/haspullnewauthory",
    ctrip: '',
    qunar: ''
  })
};
var authApi = {
  newClientAuthCheck: function (_a) {
    var _b = (_a === void 0 ? {} : _a).userToken,
      userToken = _b === void 0 ? '' : _b;
    return tjFetch.post(apiUrlConfig.newClientAuthCheck, {
      data: {
        client: {},
        user: {
          userToken: userToken
        }
      }
    });
  }
};
export default authApi;