import { cwx,  _ } from '../../../cwx/cwx.js';

const ServerUrls = {
  getUserBaseInfo: "/restapi/soa2/16575/getUserInfo", //获取用户信息
  signin: "/restapi/soa2/16575/signin", //执行签到动作
  touchSigninSwitch: "/restapi/soa2/16575/touchSigninSwitch", // 触发每日签到提醒开关
  getUserTaskList: "/restapi/soa2/16575/getUserTaskList", //获取用户任务列表
  startTask: "/restapi/soa2/16575/startTask", //开始任务
  userIntegrationInfo: "/restapi/soa2/16575/userIntegrationInfo", // 获取用户积分信息
  shareSigninActivity: "/restapi/soa2/16575/shareSigninActivity", // 分享日签获得2积分
  getPageConfig: "/restapi/soa2/15253/pageConfig", //获取配置
  getReceiveRecords: "/restapi/soa2/16575/getReceiveRecords", // 获取用户领奖记录
  registLichengVIP: "/restapi/soa2/16843/registLichengVIP", //丽程注册 + 签到接口
  boundLichengVIP: "/restapi/soa2/16843/boundLichengVIP", //是否已注册丽程会员
  getLiveList: "/restapi/soa2/12673/getlivelist", //获取直播房间列表
  getReplayList: "/restapi/soa2/12673/getReplayList", //获取回放视频列表
  countSubscribe: "/restapi/soa2/12673/clickCount", //记录点击预约直播按钮数\

  getPKInfo: "/restapi/soa2/12673/getPKInfo", // 获取话题PK信息
  getCommonConfig: "/restapi/soa2/12673/getCommonConfig", //获取签到页直播及开放式话题配置
  participationPK: "/restapi/soa2/12673/participationPK", //参与PK
  saveLiveScene: "/restapi/soa2/12673/saveLiveScene", //获取签到页直播及开放式话题配置
  getAwardPKUser: "/restapi/soa2/12673/getAwardPKUser", //获取话题PK中奖用户列表
  notifyAwardPK: "/restapi/soa2/12673/notifyAwardPK", //订阅话题PK
  
  getLiveProducts: "/restapi/soa2/12673/getLiveProducts", //根据房间ID 获取房间下挂载的商品
  getSignRecondProduct: "/restapi/soa2/16575/getProductList", // 查询积分兑礼商品列表（默认销量前三）
  getSignGameList: "/restapi/soa2/16575/getGameActInfo", // 获取玩转携程活动列表 
  collectBarrage: "/restapi/soa2/16575/collectBullet", // 收集弹幕
  getBarrage: "/restapi/soa2/16575/getBulletList", // 获取弹幕
  getActivityConfig: "/restapi/soa2/18083/getActivityConfig", // 获取全部自定义信息
} 

/**
 * @description 当errcode符合某些范围时，不显示toast提示
 * @param {} urlName 
 * @param {*} params 
 * @param {*} successCallback 
 * @param {*} errCallback 
 */
const errorCodeList = [3]

/**
 * @description 当errcode为某些特殊值时，展示不同的errmsg
 * @param {} urlName 
 * @param {*} params 
 * @param {*} successCallback 
 * @param {*} errCallback 
 */
const errCodeMsg = {
  "3": "今日已签到"
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
      // console.log(params);
      // console.log(ServerUrls[urlName]);
      // console.log(res);
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
        if(!errorCodeList.includes(res.data.errcode)){
          successCallback && successCallback(res.data);
        } 
        if(errorCodeList.includes(res.data.errcode) && errCodeMsg[res.data.errcode]) {
          wx.showToast({
            title: errCodeMsg[res.data.errcode],
            icon: 'none'
          })
        }
      } else {
        errCallback && errCallback(res);
      }
    }
  });
}

module.exports = {
  requestUrl: requestUrl
};