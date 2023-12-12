// 纵横埋点接入文档（目前按旧版）：http://conf.ctripcorp.com/pages/viewpage.action?pageId=1140386457

import { cwx } from '../../cwx/cwx';
const { sendUbtByPage } = cwx;

// 替换时间戳函数
function replaceTsFn(url) {
  let nowTs = new Date().getTime()
  if (url.indexOf('__TS__') != -1 || url.indexOf('{{TS}}') != -1) {
    url = url.replace('__TS__', nowTs)
    url = url.replace('{{TS}}', nowTs)
    return url
  } else {
    return url
  }
}
// 客户端曝光链接监测发送
export default function sendExposeFn(pvObj, type) {
  if (pvObj.moniterLinkList && pvObj.moniterLinkList.length > 0) {
    pvObj.moniterLinkList.forEach(item => {
      let sendUrl = type == 'show' ? item.showLink : item.clickLink
      if (sendUrl) {
        let logItem = {
          data: JSON.parse(JSON.stringify(item)),
          event: type,
          type:'min_app'
        }
        sendUrl = replaceTsFn(sendUrl)
        try{
          cwx.request({
            url: sendUrl,
            method: "GET",
            success: function (res) {
              logItem.success = JSON.stringify(res)
              sendUbtByPage.ubtTrace('129055', logItem)
            },
            fail: function (e) {
              logItem.error = JSON.stringify(e)
              // 请求失败埋点
              sendUbtByPage.ubtTrace('129056', logItem)
            }
          })
        } catch(err){
          logItem.error = JSON.stringify(err) +'catch error'
          // 请求失败埋点
          sendUbtByPage.ubtTrace('129056', logItem)
        }

      }
    })
  }
}