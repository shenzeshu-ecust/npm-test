/**
 * @module cwx/market
 * @file 市场用来请求openid的文件
 */
let __global = require('./global.js').default;
let cwx = __global.cwx;
var DebugLog = false ? console.log : function(){};


//用来获取openid unionid
var _code = '';
var _encryptedData = '';
var _iv = '';
var _appId = cwx.appId;
var _userNotAllow = false;
var MAX_Retry = 100;
var current_retryCount = 0;
var kRetryCountTimestamp = 50

//埋点相关
var kOpenIdServerSuccess = "100965"
var kOpenIdServerFailture = "100966"
var kOpenIdWxLoginFail = "102626" 

var cwx_market = {
    openid: "",
    unionid: "",
    fromopenid: "",
    fromunionid: "", 
    openGId:"",
    _getShareTicketInfo:function(shareTicket,callback){
      _getShareTicketInfo(shareTicket,callback)
    },
    _getMarketOpenIDHash:function(callback){ /** 获取openid新的服务*/
      _getMarketOpenIDHash(callback)
    },
    refreshSessionKey:function(callback){
      _refreshSessionKey(callback)
    },
    storeUnionID:function(unionID){
      cwx_market.unionid = unionID
      var storeData = {
        openid: cwx_market.openid,
        unionid: cwx_market.unionid,
      } 
      _setStore(storeData)
    } 
};



/** 
 *  OenID & unionID 获取将由市场和登陆分别提供
 * 
 * */

/**** Public ***/
var _refreshSessionKey = function(callback){
  /** 如果还未获取到Openid,加到noti中 */
  if(cwx_market.openid.length <= 0){
    cwx.Observer.addObserverForKey('OpenIdObserver', (value) => {
      DebugLog('OpenIdObserver cwx.cwx_mkt. = ', value)
      callback && callback()
    })
    return;
  }
  /** 获取到openid */
  _getMarketOpenIDHashService(callback)

}

/*
* 获取OpenID使用市场提供的新的服务
*/

var _getMarketOpenIDHash = function (callback) {
  var data = _getStore();
  if(data && data.openid && data.openid.length > 0 && data.unionid){
    // console.log('>>>>>>>>> 从缓存中取到 openid')
    _ubtMetric(kOpenIdServerSuccess, { "openId": cwx_market.openid,"cid": cwx.clientID, "appID": _appId, "code": _code, "statusCode": 200, "retryCount": current_retryCount, "useCache": 1 })
    callback && callback()
    return;
  }
  var reduceCallback = function (response) {
    cwx_market.openid = ((response && response.data && response.data.mktOpenID) || "")
    cwx_market.unionid = ((response && response.data && response.data.unionID) || "")
    DebugLog("reducecallback cwx.cwx_markt = ", cwx_market.openid)
    var storeData = {
      openid: cwx_market.openid,
      unionid: cwx_market.unionid,
    }
    // console.log('>>>>>>>>> 从请求返回值中成功取到 openid')
    callback && callback(storeData)
    _setStore(storeData)

  }
  _getMarketOpenIDHashService(reduceCallback)

}

/**** Private  */




var _getMarketOpenIDHashService = function (callback) {
  var fail = function (response) {
    current_retryCount += 1;
    var tag = { "cid": cwx.clientID, "appID": _appId, "statusCode": (response && response.statusCode) || "", "retryCount": current_retryCount }
    if(response && response.data){
      tag.resultCode = response.data.resultCode || ""
    }
    tag.platform = cwx.wxSystemInfo.platform || ""
    tag.errMsg = (response && response.errMsg) || ""
    tag.wxVersion = cwx.wxSystemInfo.version || ""
    _ubtMetric(kOpenIdServerFailture,tag )
    _retryOpenIDService(callback)
  }
  var success = function (response) {
    DebugLog("success ", response)
    var tmpOpenid = response.data.mktOpenID || ""

    if (tmpOpenid.length <= 0) {
      fail && fail(response);
      return;
    }
    callback && callback(response)

    _ubtMetric(kOpenIdServerSuccess, { "openId": cwx_market.openid, "cid": cwx.clientID, "appID": _appId, "code": _code, "statusCode": (response && response.statusCode) || "", "retryCount": current_retryCount ,"useCache":0})

  }


  var loginCallback = function () {
    DebugLog("code = ", _code)
    var marketObj = cwx.mkt.getUnion() || {
      allianceid: 262684,
      sid: 711465
    }
    var mPage = cwx.getCurrentPage();

    cwx.request({
      url: '/restapi/soa2/13447/getMKTOpenID.json',
      data: {
        "appID": _appId,
        "code": _code,
        "platformType": cwx.wxSystemInfo.platform || "ios",
        "allianceID": (marketObj.allianceid || "") + "",
        "sID": (marketObj.sid || "") + "",
        "oUID": (marketObj.ouid || "") + "",
        "sourceID": (marketObj.sourceid || "") + "",
        "exMKTID": (marketObj.exmktid || "") + "",
        "pageID": mPage? (mPage.pageid ? mPage.pageid + "" : mPage.pageId + ""): ""
      },
      success: success,
      fail: fail
    })
  }
  _getLoginCode(loginCallback)

}

/** 重试 */
var _retryOpenIDService = function(callback){
  if(current_retryCount >= MAX_Retry){
    DebugLog(' 请求openID重试达到最大次数')
    callback && callback()
    return;
  }
  DebugLog("第【 ",current_retryCount," 】次重试")
  setTimeout(function(){
    _getMarketOpenIDHashService(callback);
  },kRetryCountTimestamp)
}

var _getStore = function(){
  var data = wx.getStorageSync('cwx_market_new')
  if (data && data.openid !== '') {
    cwx_market.openid = data.openid;
    cwx_market.unionid = data.unionid;
    cwx_market.nickName = data.nickName;
  }
  return data;
}

var _setStore = function(data){
    if (data) {
      wx.setStorage({
        key: 'cwx_market_new',
        data: data,
      })
      cwx.mkt.updateCache()
    }
  }

  var _clearStore = function () {
    wx.removeStorage({
      key: 'cwx_market_new',
      success: function (res) {
        // success
      }
    })
  }


var _ubtMetric = function(name,tag){
  if (cwx.sendUbtByPage.ubtMetric) {
    var ubt_metric = {
      name: name,
      value: 1,
      tag:tag,
      callback:function(response){
        DebugLog("Debug OpenId = ", response," tag = ",tag)
      }
    };
    cwx.sendUbtByPage.ubtMetric(ubt_metric)
  }
}


/**** **** **** **** **** **** **** **** ****  分割线 ****/



/** 解密ShareInfoTicket */
var _getShareTicketInfo = function(shareTicket,callback){
  var count = 3
  if(!shareTicket) return;
  
  var getShareInfoCallback = function (getShareInfoRes) {
    // DebugLog('shareInfo = ', res);
    /** 获取到登录code */
    _getLoginCode(function(codeRes){
      cwx.request({
        url: '/restapi/soa2/12378/json/getWeiXinData',
        data: {
          jsCode: codeRes.code,
          iv: getShareInfoRes.iv,
          encryptedData: getShareInfoRes.encryptedData,
          appID: _appId
        },
        success: serviceSuccessCallback,
        fail: serviceFailedCallback
      })
    })

    var serviceSuccessCallback =function(res){
      // DebugLog('serviceSuccessCallback = ',res);
      if (res && res.data && res.data.weiXinData){
        try {
          var data = JSON.parse(res?.data?.weiXinData)
          cwx_market.openGId = data?.openGId;
        } catch(error) {
          console.error('market handle weiXinData info occur error when serviceSuccessCallback', error)
        }
        callback && callback();
      } else {
        try {
          if(count > 0) {
            console.log('模拟失败')
            getShareInfoCallback(getShareInfoRes)
            count -= 1
          }
        } catch(e) {
          console.error(e)
        }
      }
      
    }
  
    var serviceFailedCallback = function(res){
      // 失败的话  再重新尝试几次
      // DebugLog('serviceFailedCallback = ', res);
    }
  }
  cwx.getShareInfo({
    shareTicket: cwx.shareTicket,
    success: getShareInfoCallback
  })
}


var _getLoginCode = function (callback) {
  var success = function (res) {
    if (res.code && res.code == "the code is a mock one") {
      DebugLog("请使用真实的微信开发者账号登录，否则无法获取到用户真实的openid")
      return;
    }
    _code = res.code || ""
    DebugLog("获取微信code = ", _code)

    callback && callback(res);
  }

  var fail = function (err) {
    _ubtMetric(kOpenIdWxLoginFail, { "cid": cwx.clientID, "appID": _appId, "error": err })
  }

  wx.login({
    success: success,
    fail: fail
  })
}  

export default cwx_market;