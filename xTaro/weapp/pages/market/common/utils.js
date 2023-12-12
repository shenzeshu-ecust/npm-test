import { cwx, _ } from '../../../cwx/cwx.js';
const API_BASE_URI = '/restapi/soa2/'
import storage from './storage';
/**
 * 获取openid
 * 07-05 加unionid判断逻辑，可同时获取unionid
 * @param {function} onSuccess [成功回调]
 * @param {function} onError [失败回调]
 */
var getOpenid = function (onSuccess, onError) {
  var interval;
  var checkCount = 60;
  //侦听openid - 定时器模式
  interval = setInterval(function () {
    checkCount--;
    if (checkCount < 0) {
      clearInterval(interval);
      onError && onError();
    } else if (cwx.cwx_mkt.openid && cwx.cwx_mkt.unionid) {
      console.log("定时器模式");
      clearInterval(interval);
      onSuccess && onSuccess();
    }
  }, 100);
};

/**
 * 获取用户信息
 * @param {function} onSuccess [成功回调]
 * @param {function} onError [失败回调]
 */
var getUserInfo = function (onComplete, onSuccess, onFail) {
  wx.getUserInfo({
    complete: function (res) {
      var userInfo = res.userInfo || {};
      onComplete && onComplete(userInfo)
    },
    success: function (res) {
      console.log("授权用户信息成功");
      var userInfo = res.userInfo;
      onSuccess && onSuccess(userInfo);
    },
    fail: function () {
      console.log("获取用户信息失败");
      onFail && onFail();
    }
  })
};

//授权用户信息
var getUserProfile = function (callback) {
  if (wx.getUserProfile) {
    wx.getUserProfile({
      desc: '获取您的头像昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      complete: (res) => {
        console.log('complete')
        console.log(res)
        //拒绝进失败回调
        var userInfo = res.userInfo || {};
        if (userInfo.nickName) {
          storage.set('mkt_user_info', { nickName: userInfo.nickName, avatarUrl: userInfo.avatarUrl }, 24 * 7);
        }
        callback && callback(userInfo)
      }
    })
  } else {
    callback && callback({})
  }

}

/**
 * 新版获取用户信息
 * @param {function} callback [回调]
 */
var getUserInfoNew = function (callback) {
  let userInfo = storage.get('mkt_user_info') || {}
  //返回业绩参数
  if (callback && _.isFunction(callback)) {
    try {
      callback(userInfo);
    } catch (e) {

    }
  } else {
    return userInfo;
  }
};


/**
 * 加/改url参数
 * @param {String} arg [参数名]
 * @param {String} val [值]
 * return
 */
var changeUrlArg = function (url, arg, val) {
  let urlArr = url.split('?');
  let newArgs = '?';
  let hasKey = false; // 是否有匹配的key

  // 没参数：url不带?、url带?但后面没值
  if (urlArr.length < 2 || !urlArr[1]) {
    newArgs += arg + '=' + val;
  } else {
    // 过滤 & 后为空的情况
    let argArr = urlArr[1].split('&').filter(item => {
      return item;
    });

    let strArr = argArr.map((item, index) => {
      let str = '';
      let itemArr = item.split('=');
      let key = itemArr[0] || '';
      let value = itemArr[1] || '';
      // 过滤 key 为空的
      if (!key) { return; }
      if (key === arg) {
        value = val;
        hasKey = true;
      }
      return str = `${key}=${value}`;
    })
    // 原先的参数里没有要替换的 arg 的
    !hasKey && (strArr.push(`${arg}=${val}`));
    newArgs += strArr.join("&");
  }
  return urlArr[0] + newArgs;
}

/**
 * 保存图片到手机相册
 * @param [String] url 图片网络路径
 */
var toSave = function (url) {
  console.log("tosave");
  wx.getSetting({
    success(res) {
      if (res.authSetting['scope.writePhotosAlbum'] == undefined) {
        console.log("undefined");
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            savePic(url);
          },
          fail() {
            console.log("未授权");
            console.log(res);
          }
        })
      } else if (res.authSetting['scope.writePhotosAlbum'] == false) {
        console.log("false");
        wx.hideLoading();
        wx.showModal({
          title: "提示",
          content: "相册系统未授权，请重新授权并保存图片",
          success: function (stRes) {
            console.log(stRes);
            if (stRes.confirm) {
              wx.openSetting({
                success(res) {
                  //重新授权
                }
              })
            } else if (stRes.cancel) {
              console.log('用户点击取消');
            }
          }
        })
      } else {
        console.log("true");
        savePic(url);
      }
    },
    fail(res) {
      console.log("fail");
      console.log(res);
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success() {
          savePic(url);
        },
        fail() {
          console.log("未授权");
          console.log(res);
        }
      })
    }
  })
}

function savePic(url) {
  console.log("savePic");
  console.log(url);
  if (wx.saveImageToPhotosAlbum) {
    wx.saveImageToPhotosAlbum({
      filePath: url,
      success: function (res) {
        console.log(res);
        wx.showToast({ title: '图片已保存至相册，立刻分享至朋友圈吧~', icon: 'none', mask: true, duration: 3000 });
      },
      fail: function (res) {
        console.log("保存失败");
        console.log(res);
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}

/**
 * 获取图片本地路径
 * @param url [String] 图片路径
 * @param callback [function] 成功回调 
 */
var getImgInfo = function (url, callback) {
  wx.getImageInfo({
    src: url,
    success: function (data) {
      console.log("获取图片信息成功")
      console.log(data);
      callback && callback(data.path);
    },
    fail: function () {
      wx.showToast({ title: '图片小哥跑偏了，再重试下吧', icon: 'none', mask: true })
      console.log("获取图片信息失败");
    }
  })
}

/**
 * 用户进入活动任一页面，都推模板消息，并且所有页面只推一次，推完后数据持久化标记，之后不再推送
 */
var sendTemplateMsg = function (activityId) {
  let hasSendTemplateMsg = cwx.getStorageSync('mkt_lucky_sendTemplateMsg')

  if (!hasSendTemplateMsg) {
    cwx.request({
      url: '/restapi/soa2/14097/sendTemplateMsg',
      data: {
        'appid': cwx.appId,
        'openid': cwx.cwx_mkt.openid,
        'activeid': 0, //activityId,
        'templateId': 'luckyGroupStatus'
      },
      success: function (res) {
        if (res && res.data && res.data.errcode === 0) {
          console.log('<== 模板消息发送成功 ==>')
          cwx.setStorageSync('mkt_lucky_sendTemplateMsg', true)
        } else {
          console.log('<== 模板消息发送失败 ==>')
        }
      },
      fail: function (res) {
        console.log('<== 模板消息发送异常 ==>')
      }
    })
  }
}

/**
 * 获取页面配置
 */
var getPageSetting = function (activityId, pageId, callback) {

  cwx.request({
    url: '/restapi/soa2/15253/pageConfig',
    data: {
      'activeid': activityId,
      'pageId': pageId
    },
    success: function (res) {
      if (res && res.data && res.data.errcode === 0) {
        console.log('<== 页面配置 ==>')
        console.log(res.data.messages)

        callback && _.isFunction(callback) && callback(res.data)
      } else {
        console.log('<== 页面配置获取失败 ==>')
      }
    },
    fail: function (res) {
      console.log('<== 页面配置获取异常 ==>')
    }
  })
}

/**
 * 获取活动基本配置及产品列表
 */
var getLucyBaseInfo = function (activityId, callback) {

  cwx.request({
    url: '/restapi/soa2/15253/openLuckyDoor',
    data: {
      'activeId': activityId
    },
    success: function (res) {
      if (res && res.data && res.data.errcode === 0) {
        callback && _.isFunction(callback) && callback(res.data)
      } else {
        wx.showToast({ title: res.errmsg + '(' + res.errcode + ')', icon: 'none', mask: true })
      }
    },
    fail: function (res) {
      wx.showToast({ title: res.errmsg + '(' + res.errcode + ')', icon: 'none', mask: true })
    }
  })
}

/**
 * 获取当前系统日期和时间
 */

var formatTime = function (date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getUrlQuery(url, key) {
  var locationArr = url.split('?')
  if (locationArr.length < 2) {
    return
  }
  var query = locationArr[1]
  if (!query) {
    return
  }
  var params = query.split('&')

  for (let i = 0; i < params.length; i++) {
    var pair = params[i].split('=')
    if (pair[0] === key) {
      return pair[1]
    }
  }
  return
}

/**
 * 接口请求方法封装
 * @param serviceCode 
 * @param serviceName [接口路径]
 * @param params [传参]
 * @param successCallback [成功回调]
 * @param errCallback [失败回调]
 */
const requestUrl = function (serviceCode, serviceName, params, successCallback, errCallback) {
  cwx.request({
    url: API_BASE_URI + serviceCode + '/' + serviceName,
    data: params,
    success: function (res) {
      console.log('【' + serviceName + '】')
      console.log(params)
      console.log(res.data)
      if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == "Success") {
        successCallback && successCallback(res.data)
      } else {
        errCallback && errCallback(res)
      }
    },
    fail: function (res) {
      console.log('【' + serviceName + '】', res)
      console.log(params)
      errCallback && errCallback(res);
    }
  })
}


var logUbtTrace = function (pagename, pageid, aid, sid, ouid, activityid, context) {
  var _ubtInfo = JSON.parse(cwx.getStorageSync('CTRIP_UBT_M') || "{}") || {};
  context.ubtTrace(101114, { pageName: pagename, pageId: pageid, allianceid: aid || '', sid: sid || '', ouid: ouid || '', activityID: activityid, openid: cwx.cwx_mkt.openid || '', vid: _ubtInfo['vid'] || '', appid: cwx.appId });
}

var showToast = function (msg, duration, callback) {
  wx.showToast({
    title: msg || '',
    icon: 'none',
    duration: duration || 1500,
    mask: true,
    complete: () => {
      callback && callback()
    }
  })
}

var showLoading = function () {
  wx.showLoading({
    title: '加载中'
  })
}

var hideLoading = function () {
  wx.hideLoading()
}



var goTargetUrl = function (targetUrl, cb) {
  if (targetUrl) {
    // 跳转独立小程序
    if (targetUrl.indexOf('thirdAppId') > 0) {
      targetUrl = targetUrl.match(/^\//) ? targetUrl : `/${targetUrl}`
      console.log('跳转独立小程序thirdAppId', getUrlQuery(targetUrl, 'thirdAppId'))
      console.log('跳转独立小程序', targetUrl)
      cwx.cwx_navigateToMiniProgram({
        appId: getUrlQuery(targetUrl, 'thirdAppId'),
        path: targetUrl.trim(),
        openEmbedded: targetUrl.indexOf('openEmbedded') > 0 ? true : false,//跳转半屏
        extraData: {

        },
        success(res) {
          // console.info('独立小程序打开成功：',res);
        }
      });
    } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
      // 跳转H5页面
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(targetUrl)
        }
      })
    } else {
      if (targetUrl[0] == '/' && targetUrl.slice) {
        targetUrl = targetUrl.slice(1)
      }
      const isplugin = targetUrl.startsWith('plugin')
      let url = isplugin ? targetUrl.trim() : "/" + targetUrl.trim()
      cwx.navigateTo({
        url,
        success: function (res) {
          res.eventChannel.emit('taskpage', { from: 'tasklist' })
        },
        fail: function (e) {
          cb && cb();
        }
      });
    }

  } else {
    cb && cb();
  }
}

var goHome = function () {
  cwx.switchTab({
    url: "/pages/home/homepage"
  });
}

var generateQrcode = function (path, centerUrl, pathName, fromId, callback) {
  if (path && typeof path == 'string' && path[0] == '/') {
    path = path.replace('/', '')
  }
  var data = { "appId": cwx.appId, "path": path, "centerUrl": centerUrl, "page": "pages/market/midpage/midpage", "pathName": pathName, "fromId": fromId, "needData": false, "width": 220, "autoColor": false, "lineColor": { "r": "0", "g": "0", "b": "0" }, "buType": "mkt" };
  cwx.request({
    url: '/restapi/soa2/13242/getWxqrCode',
    data: data,
    method: 'POST',
    success: function (res) {
      console.log(res)
      if (res.data && res.data.errcode == 0 && res.data.qrUrl) {
        callback && callback(res.data.qrUrl);
      } else {
        failLoading();
      }
    },
    fail: function (res) {
      failLoading();
    }
  });
}

function failLoading() {
  wx.showToast({ title: '图片小哥跑偏了，再重试下吧', icon: 'none', mask: true })
}


var formatDate = function (date, template) {
  var result;

  var YYYY = '0000' + date.getFullYear();
  var MM = '00' + (date.getMonth() + 1);
  var DD = '00' + date.getDate();
  var hh = '00' + date.getHours();
  var mm = '00' + date.getMinutes();
  var ss = '00' + date.getSeconds();

  YYYY = YYYY.substring(YYYY.length - 4);
  MM = MM.substring(MM.length - 2);
  DD = DD.substring(DD.length - 2);
  hh = hh.substring(hh.length - 2);
  mm = mm.substring(mm.length - 2);
  ss = ss.substring(ss.length - 2);

  if (!template) {
    result = date.getUTCFullYear() + "-"
      + (date.getUTCMonth() + 1) + "-"
      + date.getUTCDate() + " "
      + (date.getUTCHours() < 10 ? "0" + date.getUTCHours() : date.getUTCHours()) + ":"
      + (date.getUTCMinutes() < 10 ? "0" + date.getUTCMinutes() : date.getUTCMinutes()) + ":"
      + (date.getUTCSeconds() < 10 ? "0" + date.getUTCSeconds() : date.getUTCSeconds());
  } else {
    result = template;
    result = result.replace("YYYY", YYYY);
    result = result.replace("MM", MM);
    result = result.replace("DD", DD);
    result = result.replace("hh", hh);
    result = result.replace("mm", mm);
    result = result.replace("ss", ss);
  }

  return result;
};

// 基础库版本号对比
var compareVersion = function (v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

var subcribeVersionCompare = function () {
  const sdkVersion = wx.getSystemInfoSync().SDKVersion || '0' //sdk版本
  const system = wx.getSystemInfoSync().system || ''
  const version = wx.getSystemInfoSync().version || '0'  //微信版本号
  if (compareVersion(sdkVersion, '2.8.2') >= 0) {
    if ((system.indexOf('iOS') > -1 && compareVersion(version, '7.0.7') >= 0) || (system.indexOf('Android') > -1 && compareVersion(version, '7.0.8') >= 0)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}


//用户是否已同意授权信息
var hasAuthUserInfo = function (callback) {
  wx.getSetting({
    complete(res) {
      if (!!res.authSetting['scope.userInfo']) {
        callback && callback(true);
      } else {
        callback && callback(false);
      }
    }
  })
}



var isIphoneX = function () {
  const res = cwx.wxSystemInfo || cwx.getSystemInfoSync()
  if (res.model.indexOf('iPhone X') > -1) {
    return true
  }
  return false
}

//异形屏机型判断
const isIphoneXModel = function () {
  const res = wx.getSystemInfoSync()
  if (res.safeArea && res.safeArea.top && res.safeArea.top > 20) {
    return true
  }
  return false
}


const fetch = function (serviceCode, serviceName, params) {
  return new Promise((resolve, reject) => {
    cwx.request({
      url: API_BASE_URI + serviceCode + '/' + serviceName,
      data: params,
      success: (res) => {
        console.log('【' + serviceName + '】')
        console.log(JSON.stringify(params))
        console.log(JSON.stringify(res.data))
        if (res && res.data && res.data.ResponseStatus && (res.data.ResponseStatus.Ack == "Success" || res.data.ResponseStatus.ack == "Success")) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        console.log('【' + serviceName + '】', err)
        console.log(JSON.stringify(params))
        reject(JSON.stringify(err));
      }
    })
  })
}

//未登录情况下获取登录凭证
const getLoginCode = function () {
  cwx.user.wxLogin((errCode, funtionName, errorMsg) => {
    console.log('errCode', errCode)
    if (errCode != 0) {
      this.showToast(errorMsg)
    }
  })
}


//手机号授权快捷登录
const loginPhone = function (e, url, callback) {
  cwx.user.wechatPhoneLogin(e, '', url, (resCode, funtionName, resMsg) => {
    if (resCode == 0) {
      callback && callback()
    } else {
      this.showToast(resMsg + '【' + resCode + '】')
    }
  });
}


//微信头像昵称授权快捷登录
const loginWechat = function (callback) {
  if (wx.getUserProfile) {
    wx.getUserProfile({
      desc: '获取您的头像昵称',
      complete: (res) => {
        if (res.errMsg == "getUserProfile:ok") {
          var userInfo = res.userInfo || {};
          if (userInfo.nickName) {
            //缓存用户头像昵称
            storage.set('mkt_user_info', { nickName: userInfo.nickName, avatarUrl: userInfo.avatarUrl }, 24 * 7);
          }
          cwx.user.getThirdToken(res, (resCode, funtionName, errorMsg, thirdToken) => {
            if (resCode != 0) {
              this.showToast(errorMsg + '【' + resCode + '】')
            } else {
              cwx.user.thirdTokenLogin(thirdToken, (resCode, funtionName, errorMsg) => {
                if (resCode == 0) {
                  callback && callback(userInfo)
                } else {
                  this.showToast(errorMsg + '【' + resCode + '】')
                }
              });
            }
          });
        } else {
          //this.showToast('授权登陆才可以参与活动哦')
        }
      }
    })
  } else {
    callback && callback({})
  }

}

const toNavigate = function (e) {

  let { url = '' } = e.currentTarget.dataset
  console.log(url)
  if (!url) {
    return
  }
  cwx.navigateTo({
    url: patchUrl(url)
  })
}

const toRedirect = function (e) {
  let { url = '' } = e.currentTarget.dataset
  if (!url) {
    return
  }
  cwx.redirectTo({
    url: patchUrl(url)
  })
}

/**
 * 补全url
 * 兼容h5地址，加webview
 * 小程序地址判断前缀/
 */
const patchUrl = function (url) {
  const cWebView = '/cwx/component/cwebview/cwebview?data';
  if (!url.match(/(?:cwx|pages)\//)) {
    const data = JSON.stringify({
      url: encodeURIComponent(url),
    });
    url = `${cWebView}=${data}`;
  } else {
    url = url.match(/^\//) ? url : `/${url}`
  }
  return url
}


const checkLogin = (cb, param = {}) => {
  cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
    if (!checkLoginRes) {
      // 跳转去登录页
      cwx.user.login({
        param: {
          sourceId: "market",
          ...param
        },
        callback: () => {
          cb && typeof cb == 'function' && cb()
        }
      });
    } else {
      cb && typeof cb == 'function' && cb()
    }
  });
}

/** 时间戳 转 UTC格式时间, 入参是时间戳、返回的类型 */
const timerToUTC = (timeStamp, returnType) => {
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
  if (returnType == 'str') {
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  }
  if (returnType == 'assistEndTime') {
    return (y * 1 - 2000) + '/' + m + '/' + d
  }
  return [y, m, d, h, minute, second];
}



/*函数节流*/
const throttleFunc = (fn, interval) => {
  var enterTime = 0;//触发的时间
  var gapTime = interval || 300;//间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date();//第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/*函数防抖*/
const debounceFunc = (fn, interval) => {
  var timer;
  var gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, ...args);
    }, gapTime);
  };
}

/** 保留N位小数 roundFlag 表示是否四舍五入 */
const numberGetFloat = (number, n, roundFlag = false) => {
  n = n ? parseInt(n) : 0;
  if (n <= 0) {
    return Math.round(number);
  }
  if (roundFlag) {
    number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n); // 四舍五入
  } else {
    number = number; // 不四舍五入
  }
  number = Number(number).toFixed(n); // 补足位数
  return number;
}

/** 计算2个时间之间的天数 */
const getDaysBetween = (dateString1, dateString2) => {
  var startDate = Date.parse(dateString1);
  var endDate = Date.parse(dateString2);
  if (startDate > endDate) {
    return 0;
  }
  if (startDate == endDate) {
    return 1;
  }
  var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
  return days;
}

/** 按照指定属性排序 */
const sortBy = (attr, rev) => {
  // 第二个参数没有传递 默认升序排列
  if (rev == undefined) {
    rev = 1;
  } else {
    rev = (rev) ? 1 : -1;
  }
  return function (a, b) {
    a = a[attr];
    b = b[attr];
    if (a < b) {
      return rev * -1;
    }
    if (a > b) {
      return rev * 1;
    }
    return 0;
  }
}

/** 非标准的UTC格式(不带时分秒)  时间 转时间戳 */
const toTimeStamp = (timeStamp) => {
  var reg = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
  var res;
  try {
    res = timeStamp.match(reg);
  } catch (error) {
    res = null
  }
  if (res == null) {
    var reg2 = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
    var res2;
    try {
      res2 = timeStamp.match(reg2);
    } catch (error) {
      res2 = null
    }
    if (res2 == null) {
      console.log('时间格式错误 E001');
      return false;
    }
    var year = parseInt(res2[3]);
    var month = parseInt(res2[1]);
    var day = parseInt(res2[2]);
  } else {
    var year = parseInt(res[1]);
    var month = parseInt(res[2]);
    var day = parseInt(res[3]);
  }
  if (year < 1000) {
    console.log('时间格式错误');
    return false;
  }
  return Date.parse(new Date(year, month - 1, day));
}

// 标砖的UCT时间 转 字符串转时间戳
const utcTimeToStamp = (timeStamp) => {
  var reg = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
  var res = timeStamp.match(reg);
  if (res == null) {
    var reg2 = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
    var res2 = timeStamp.match(reg2);
    if (res2 == null) {
      console.log('时间格式错误 E001');
      return false;
    }
    var year = parseInt(res2[3]);
    var month = parseInt(res2[1]);
    var day = parseInt(res2[2]);
    var h = parseInt(res2[4]);
    var i = parseInt(res2[5]);
    var s = parseInt(res2[6]);
  } else {
    var year = parseInt(res[1]);
    var month = parseInt(res[2]);
    var day = parseInt(res[3]);
    var h = parseInt(res[4]);
    var i = parseInt(res[5]);
    var s = parseInt(res[6]);
  }
  if (year < 1000) {
    console.log('时间格式错误');
    return false;
  }
  if (h < 0 || h > 24) {
    console.log('时间格式错误');
    return false;
  }
  if (i < 0 || i > 60) {
    console.log('时间格式错误');
    return false;
  }
  if (s < 0 || s > 60) {
    console.log('时间格式错误');
    return false;
  }
  return Date.parse(new Date(year, month - 1, day, h, i, s));
}

/** 传入一个类型和时间，计算时间戳 */
const nowTimeStemp = (type, addTime) => {
  var dateObj = new Date();
  var cTime = dateObj.getTime();
  try {
    if (addTime) {
      cTime += addTime;
    }
    if (!type) {
      type = 'number';
    }
    if (type == 'number') {
      return cTime;
    } else if (type == 'str') {
      return timerToUTC(cTime / 1000, 'str');
    } else if (type == 'array') {
      return timerToUTC(cTime / 1000, 'array');
    }
  } catch (error) {
    return cTime;
  }
}

/**
 * 路径参数拼接
 * @param {路径参数} obj eg" { name: 'xx', age: '10' }
 * @returns {路径} string eg: name=xx&age=10
 */
function genUrlParams(obj) {
  let ret = ''
  let keys = Object.keys(obj)
  keys.forEach((key, index) => {
    ret += (`${key}=${obj[key]}` + (keys.length - 1 == index ? '' : '&'))
  })
  return ret
}

/**
 * @param {页面实例} context 包含属性 keyname pageId allianceid sid
 * @param {其他参数} more 
 */
function logTrace(context, more = {}) {
  try {
    let params = {
      openid: cwx.cwx_mkt.openid,
      clientID: cwx.clientID,
      keyname: context.keyname,
      pageId: context.pageId,
      allianceid: context.allianceid,
      sid: context.sid,
      ...more
    }
    context.ubtTrace(context.ubtCode, params)
  } catch (e) {
    console.log(e)
  }
}


const toLoginPage = (successCb, errorCb) => {
  cwx.user.login({
    callback: function (res) {
      if (res && res.ReturnCode == "0") {
        successCb && (typeof successCb === 'function') && successCb(res)
      } else {
        errorCb && (typeof errorCb === 'function') && errorCb(res)
      }
    }
  })
}

module.exports = {
  getOpenid,
  getUserInfo,
  getUserInfoNew,
  getUserProfile,
  toSave,
  getImgInfo,
  sendTemplateMsg,
  getPageSetting,
  getLucyBaseInfo,
  formatTime,
  getUrlQuery,
  requestUrl,
  changeUrlArg,
  logUbtTrace,
  showToast,
  showLoading,
  hideLoading,
  goTargetUrl,
  goHome,
  generateQrcode,
  formatDate,
  compareVersion,
  subcribeVersionCompare,
  hasAuthUserInfo,
  isIphoneX,
  isIphoneXModel,
  fetch,
  getLoginCode,
  loginPhone,
  loginWechat,
  toNavigate,
  toRedirect,
  checkLogin,
  numberGetFloat,
  timerToUTC,
  getDaysBetween,
  sortBy,
  toTimeStamp,
  nowTimeStemp,
  utcTimeToStamp,
  genUrlParams,
  logTrace,
  throttleFunc,
  debounceFunc,
  toLoginPage
};