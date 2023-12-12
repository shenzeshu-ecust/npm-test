import { cwx, _ } from '../../../../cwx/cwx.js';

const ServerUrls = {
  enterAct: "/restapi/soa2/16575/enterAct",  //我的奖品列表
  getUserReceiveAward: "/restapi/soa2/16575/getUserReceiveAward",  //我的奖品列表
  updateReceiveAwardInfo: "/restapi/soa2/16575/updateReceiveAwardInfo",  //保存奖品收货地址
  getAwardList: "/restapi/soa2/16575/getAwardByCondition",  //兑换中心奖品列表
  getEnergyUserInfo: "/restapi/soa2/16575/getEnergyExchangeUserInfo",  //获取用户信息
  exchangeAward: "/restapi/soa2/16575/exchangeAward",  //兑换奖品
  getTopExchange:"/restapi/soa2/16575/getTopExchange",
  getActivityConfig:"/restapi/soa2/18083/getActivityConfig",
  getEnergyExchangeUserTaskList:"/restapi/soa2/16575/getEnergyExchangeUserTaskList",
  roll:"/restapi/soa2/16575/roll",
  getHomeAwardList:"/restapi/soa2/16575/getHomeAwardByCondition",
  getProductList:"/restapi/soa2/16575/getProductList",
  completeEnergyExchangeUserTask:"/restapi/soa2/16575/completeEnergyExchangeUserTask",
  receiveTaskAward:"/restapi/soa2/16575/receiveTaskAward",
  updateUser:"/restapi/soa2/16575/updateUser",
  receiveExtEnergy:"/restapi/soa2/16575/receiveExtEnergy"
}

/**
 * 接口请求方法封装
 * @param urlName [接口路径]
 * @param params [传参]
 * @param successCallback [成功回调]
 * @param errCallback [失败回调]
 */
var requestUrl = function (urlName, params, successCallback, errCallback) {
  cwx.request({
    url: ServerUrls[urlName],
    data: params,
    success: function (res) {
      console.log(params);
      console.log(ServerUrls[urlName]);
      console.log(res);
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
        successCallback && successCallback(res.data);
      } else {
        errCallback && errCallback(res);
      }
    },
    fail: function (res) {
      errCallback && errCallback(res);
    }
  });
}


module.exports = {
  requestUrl: requestUrl
};