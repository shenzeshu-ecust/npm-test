export function getAuthByUidtoken({
  uidtoken,
  isDev = false,
  success,
  fail
}) {
  const UrlMap = {
    fat: 'https://passport.fat466.qa.nt.ctripcorp.com/gateway/api/soa2/12559/crossTokenLogin',
    prod: 'https://passport.ctrip.com/gateway/api/soa2/12559/crossTokenLogin',
  }
  console.log(
    'getAuthByUidtoken',
    uidtoken,
    success,
    fail)
  wx.request({
    url: isDev ? UrlMap.fat : UrlMap.prod,
    data: {
      "strategyCode": "CROSSTOKENLOGINWITHOUTUSERINFO",
      "crossToken": uidtoken,
      "accountHead": {
        "accessCode": "PAYPLATFORMMINIAPPLOGIN",
        "sceneCode": "String",
        "locale": "zh-CN",
        "platform": "MINIAPP",
        "group": "ctrip"
      }
    },
    method: 'POST',
    success(res) {
      const data = JSON.parse(res.data.Result)
      console.log('getAuthByUidtoken res', data)
      if (data.resultStatus.returnCode !== 0 || !data.ticket) {
        console.log('登录token错误', data.resultStatus.returnCode, data.ticket)
        fail()
        return
      }
      success(data)
    },
    fail(e) {
      console.log('getAuthByUidtoken res fail', e)
      fail(e)
    }
  })
}