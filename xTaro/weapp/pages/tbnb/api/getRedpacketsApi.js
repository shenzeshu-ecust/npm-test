import tjFetch from './tjFetch';
import hostConfig from '../config/ctrip/host';
import utils from '../utils/index';
var MP_TUJIA_HOST = hostConfig.MP_TUJIA_HOST;
var apiUrlConfig = {
  getredpackets: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/promoactivity/getredpackets",
    ctrip: '/restapi/soa2/18191/getRedPacketsForBnb',
    qunar: '/app/promoactivity/getredpackets/bnb'
  }),
  receiveredpacketsync: utils.distinguishPlatform({
    tujia: MP_TUJIA_HOST + "/bingo/mp/promoactivity/receiveredpacketsync",
    ctrip: '/restapi/soa2/18191/receiveRedPacketSyncForBnb',
    qunar: '/app/promoactivity/receiveredpacketsync/bnb'
  })
};
var getRedpacketsApi = {
  getredpackets: function (params) {
    return tjFetch.post(apiUrlConfig.getredpackets, {
      data: params
    });
  },
  receiveredpacketsync: function (params) {
    return tjFetch.post(apiUrlConfig.receiveredpacketsync, {
      data: params
    });
  }
};
export default getRedpacketsApi;