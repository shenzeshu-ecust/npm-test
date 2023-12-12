import { cwx , __global} from "../../../../cwx/cwx.js";

// const env = __global.env || 'prd'
// const prevUrl = {
//   'fat': 'http://m-fat.ctripqa.com/restapi/mkt/taskdistribute',   // fat 域名
// }

const ServerUrls = {
  getTaskList: '/restapi/soa2/22598/userTaskList', // 获取任务列表
  userTodoTask: '/restapi/soa2/22598/todoTask', // 领任务+做任务
  userAcceptPrize: '/restapi/soa2/22598/awardTask', // 用户领取奖励
  authWechatUserInfo:"/restapi/soa2/16575/authWechatUserInfo",  // 视频号任务  授权头像昵称后 更新用户信息
  loadLegaoTemplate:"/restapi/soa2/13458/loadTemplate",  // 获取乐高配置
  inviteInfo: "/restapi/soa2/22598/InviteInfo",
  inviteHelpAward: '/restapi/soa2/22598/inviteHelpAward',
  receiveTaskAward: '/restapi/soa2/22598/receiveTaskAward'
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

const fetch = (urlName, params) => {
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