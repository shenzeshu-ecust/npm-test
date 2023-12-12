import { cwx, _ } from '../../../../cwx/cwx.js';

const ServerUrls = {
  getZzlActivityConfig: "/restapi/soa2/16575/getZzlActivityConfig",  //获取活动基本信息
  getZzlUserCard: "/restapi/soa2/16575/getZzlUserCard",  //获取用户卡牌
  getZzlCardConfig: "/restapi/soa2/16575/getZzlCardConfig",  //获取用户卡牌
  getZzlPeriodCard: "/restapi/soa2/16575/getZzlPeriodCard",  //获取当期中奖卡牌
  getZzlChannelConfig: "/restapi/soa2/16575/getZzlChannelConfig",  //获取渠道配置
  ViewZzlUserCard: "/restapi/soa2/16575/viewZzlUserCard",  //查看用户卡牌
  sendZzlCardToUser: "/restapi/soa2/16575/sendZzlCardToUser",  //发放卡牌
  participateZzlActivity: "/restapi/soa2/16575/participateZzlActivity",  //邀请用户来玩 加抽卡机会
  zzlFirstCard: "/restapi/soa2/16575/zzlFirstCard",  //新用户
  addZzlUserCard: "/restapi/soa2/12673/addZzlUserCard",  //用户看广告做任务加机会
  subscribeTemplateMsg: "/restapi/soa2/16575/subscribeTemplateMsg",  //用户每日订阅结果 发送给服务端
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
      console.log(params);
      console.log(ServerUrls[urlName]);
      console.log(res);
      errCallback && errCallback(res);
    }
  });
}


module.exports = {
  requestUrl: requestUrl
};