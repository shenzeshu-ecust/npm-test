import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
var MP_TUJIA_HOST = hostConfig.MP_TUJIA_HOST;
var apiConfig = {
  commonConfig: MP_TUJIA_HOST + "/mpconfig/getcommonconfigs",
  mpSunCodeImage: MP_TUJIA_HOST + "/bingo/mp/promotion/share/common_share"
};
var api = {
  getCommonConfig: function () {
    return tjFetch.post(apiConfig.commonConfig, {}).then(function (res) {
      return Promise.resolve(res);
    }).catch(function (err) {
      return Promise.reject(err);
    });
  },
  getMpSunCodeImage: function (params) {
    return tjFetch.post(apiConfig.mpSunCodeImage, {
      params: params
    });
  }
};
export default api;