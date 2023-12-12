import { cwx , __global} from "../../../../cwx/cwx.js";
const ServerUrls = {
  getList: '/restapi/soa2/18083/playingYoTicketActivityQuery', // 获取列表
  getMyList: '/restapi/soa2/18083/myYoTicketActivityQuery', // 我的列表
  yoTicketVoteInfoQuery: '/restapi/soa2/18083/yoTicketVoteInfoQuery', // YO票夺宝投注信息
  yoTicketActivityInfoQuery: '/restapi/soa2/18083/yoTicketActivityInfoQuery', // 活动详情
  yoTicketFreeReceive: '/restapi/soa2/18083/yoTicketFreeReceive', // 首次赠送
  yoTicketNumQuery: '/restapi/soa2/18083/yoTicketNumQuery', // Yo数量
  yoTicketDetailQuery: '/restapi/soa2/18083/yoTicketDetailQuery', // Yo明细
  yoTicketVote: '/restapi/soa2/18083/yoTicketVote', //投注
  yoTicketPopInfoQuery: '/restapi/soa2/18083/yoTicketPopInfoQuery', // 是否中奖
  getActivityConfig: '/restapi/soa2/18083/getActivityConfig', // cms活动配置
  yoTicketAwardHistoryQuery: '/restapi/soa2/18083/yoTicketAwardHistoryQuery', // 轮播数据
  yoTicketTotalRewardQuery: '/restapi/soa2/18083/yoTicketTotalRewardQuery', // 当月夺宝5次领奖信息
  yoTicketTotalRewardReceive: '/restapi/soa2/18083/yoTicketTotalRewardReceive', // 当月夺宝5次领奖
}
const OS_TYPE = {
  ios: 'ios',
  android: 'android',
  windows: 'windows',
  mac: 'mac',
  devtools: 'ios'
}
function getOsTypeFactory() {
  let osType = ''
  return () => {
    if (osType) return osType
    try {
      const res = wx.getSystemInfoSync()
      osType = OS_TYPE[res.platform]
    } catch (e) {
      // Do something when catch error
    }
  }
}
const getOsType = getOsTypeFactory()

function mergeParams(params) {
  params.version = '3'
  params.platform = 'miniprogramOrigin'
  params.osType = getOsType()
}

const requestUrl = (urlName, params, successCallback, errCallback) => {
  mergeParams(params)
  cwx.request({
    url: ServerUrls[urlName],
    method: 'POST',
    data: params,
    success: function (res) {
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

const fetch = (urlName, params = {}) => {
  mergeParams(params)
  return new Promise((resolve, reject) => {
    cwx.request({
      url: ServerUrls[urlName],
      method: 'POST',
      data: params,
      success: function (res) {
        if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  })
}

export {
  requestUrl,
  fetch
};