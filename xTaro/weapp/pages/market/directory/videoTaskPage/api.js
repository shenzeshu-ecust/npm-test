import { cwx, _ , __global} from '../../../../cwx/cwx';
import { nowTimeStemp } from "./../../common/utils";
const ServerUrls = {
  getUserBaseInfo: "/restapi/soa2/16575/getUserInfo", //获取用户信息
  getActivityConfig: '/restapi/soa2/18083/getActivityConfig',             // 20200722 获取offline活动配置
  userTodoTask: '/restapi/soa2/22598/todoTask', // 领任务+做任务
  getVideo: `/restapi/soa2/16016/getVideoInfo`, // 查询视频号列表
  getMemberInfo: `/restapi/soa2/22559/getMemberInfo`, // 查询视频号列表
  uploadImage: `https://m.ctrip.com/image/v1/api/upload?channel={channel}&token={token}&public={0|1}&oversea={0|1}&koe={0|1}`, // 上传图片
  getOssImageInfo: `https://uploadimg.fx.ctripcorp.com/image/v1/api/getimageinfos`, // 查询图片
  getProxyOssImageInfo: `https://nephele.ctrip.com/image/v1/api/get?channel=market_wechatuserinfo`, // 代理访问图片
  getAiPhoto: `/restapi/soa2/16894/getImageCartoonIcon`, // 查询AI算法返回
  getQrcode: `/restapi/soa2/13242/getWxqrCode`, // 查询活动二维码
  getPosterByQrcode: `/restapi/soa2/22559/greetingCardPoster`, // 查询活动二维码
  queryLegaoProductScene: `/restapi/soa2/13458/queryPrizeInfo`, // 查询乐高场景值
  ctripLiveProducts: `/restapi/soa2/13184/json/getGoodsList`, // 直播间的商品列表

}

const getRandomStr = (num) => {
  var array = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    randomNum = "";
  for (var i = 0; i < num; i++) {
    randomNum += array[parseInt(Math.random() * 36)];
  }
  return randomNum;
}

const timerToUTC = (timeStamp) => {
  timeStamp = parseInt(timeStamp);
  var date = new Date();
  if (timeStamp < 90000000000) {
    date.setTime(timeStamp * 1000);
  } else {
    date.setTime(timeStamp);
  }
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '' + m + '' + d + h + minute;
}

const exportAuthToken = function () {
  const credentialKeyStr = nowTimeStemp('number') + "" + getRandomStr(19),
    dateStr = timerToUTC(nowTimeStemp('number'), 'str'),
    channelStr = "market_wechatuserinfo",
    credentialStr = `auth-ctrip:${wx.getStorageSync('auth')}`;

  const password = credentialStr;
  const utf8 = cwx.aes.enc.Utf8.parse(password);
  const base64Res = cwx.aes.enc.Base64.stringify(utf8);
  const resultAuth = `Nephele ${credentialKeyStr}/${dateStr}/${channelStr}/${base64Res}`
  return {
    resultAuth,
    credentialKeyStr
  }
}

const apiUpload = function (query, urlName, params) {
  const { resultAuth, credentialKeyStr } = exportAuthToken()
  // console.log('当前授权凭证 after 传给框架的', resultAuth)
  const apiQuery = `channel=market_wechatuserinfo&scene=8ZvZtfYrKYjmcMN7X119&public=1&rand=${credentialKeyStr}`
  const baseUrl = __global.env == 'fat' ? `https://uploadimg.fws.qa.nt.ctripcorp.com/image/v2/api/base64upload?${apiQuery}` : `https://m.ctrip.com/restapi/soa2/22559/mktUploadAssets`

  return new Promise((resolve, reject) => {
    cwx.request({
      // 20230419进行改造
      url: baseUrl,
      data: {
        "rand": apiQuery,
        "resultAuth": resultAuth,
        ...params,
      },
      method: "POST",
      header: {
        "Content-Type": "application/json",
        "Authorization": resultAuth
      },

      success(res) {
        console.log('32526图片返回值', res)
        if(__global.env == 'fat') {
          if (res && res.statusCode == 200 && (res.data.Code === 2000 || res.data.Message === "Ok")) {
            res.data = {
              ...res.data,
              file_name: res.data.Content.file_name,
              url: res.data.Content.url,
            }
            resolve(res)
          } else {
            reject(res)
          }
        } else {
          if (res && res.statusCode == 200 && (res.data.statusCode === 200 || res.data.errCode === 0)) {
            res.data = {
              ...res.data.content,
              file_name: res.data.content.Content.file_name,
              url: res.data.content.Content.url,
            }
            resolve(res)
          } else {
            reject(res)
          }
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
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

/** 常用的工具函数 */
module.exports = {
  apiServer: apiServer,
  apiUpload: apiUpload,
  exportAuthToken
};
