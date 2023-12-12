import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
import utils from '../utils/index';
var MP_TUJIA_HOST = hostConfig.MP_TUJIA_HOST;
var apiUrlConfig = {
  heswechatgood: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/hesgood/heswechatgood"
  })
};
var goodsApi = {
  heswechatgood: function (params) {
    return tjFetch.post(apiUrlConfig.heswechatgood, {
      data: params
    });
  }
};
export default goodsApi;