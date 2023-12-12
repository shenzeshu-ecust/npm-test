import { cwx, _ } from '../../../../cwx/cwx';
const ServerUrls = {
    getUserBaseInfo: "/restapi/soa2/16575/getUserInfo", //获取用户信息
    getActivityConfig: '/restapi/soa2/18083/getActivityConfig',             
    // 20200722 获取offline活动配置
    userTodoTask: '/restapi/soa2/22598/todoTask', // 领任务+做任务
    taskAssistant: '/restapi/soa2/22598/taskAssistant'
}

/** 接口请求方法封装，新增任务队列，拒绝ES5 的 callback 写法，全部改成ES7 */
const apiServer = function (urlName, params) {
    return new Promise((resolve, reject) => {
        cwx.request({
            url: ServerUrls[urlName],
            data: params,
            success(res) {
                resolve(res)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}


/**
 * 如果存在wx.getAppBaseInfo 就根据wx.getAppBaseInfo的值来判断
 * 如果不存在就取路径的参数isInQQ
 *
 */
let appBaseInfo = {}
export function isInQQ(pageOptions) {
  let isInQQParam = false
  let h5Url = decodeURIComponent(pageOptions.from) // h5路径
  let isInQQShellParams = !!pageOptions.isInQQApp // 壳子是否带了参数
  isInQQParam = isInQQShellParams
  if (h5Url.includes('isInQQApp')) {
    isInQQParam = true
  }
  if (typeof wx.getAppBaseInfo === 'function') {
    appBaseInfo = appBaseInfo.host ? appBaseInfo : wx.getAppBaseInfo()
    if (appBaseInfo?.host?.appId === 'wxf0a80d0ac2e82aa7') {
      console.log('miniEnv=====appBaseInfo存在, 是qq环境')
      return true
    }
    console.log('miniEnv=====appBaseInfo存在, 非qq环境')
    return false
  } else {
    // 不存在这个方法
    console.log('miniEnv=====不存在, isInQQParam', isInQQParam ? '是qq环境' : '不是qq环境')
    return isInQQParam
  }
}
/** 常用的工具函数 */

module.exports = {
    apiServer: apiServer,
    isInQQ
};