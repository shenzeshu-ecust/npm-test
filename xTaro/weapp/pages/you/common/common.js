import { cwx, __global } from '../../../cwx/cwx.js';

let API_HOST = 'https://m.ctrip.com',
  DEBUG = true, //切换数据入口
  ISLOCAL = false; //是否测试本地页面

//判断手机型号是否是iPhone X，用于iPhone X适配使用
function isIphoneX() {
  console.log('commonJS ---isIphoneX---');
  console.log(cwx.util.systemInfo);
  let mobileType = cwx.util.systemInfo.model;
  if (mobileType.match('iPhone X')) {
    return true;
  } else {
    return false;
  }
}

function getQueryString(url, name) {
  //获取url里的参数

  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
  var url_index = url.indexOf('?');
  var new_url = url.substr(url_index);
  var r = new_url.substr(1).match(reg); //匹配目标参数
  if (r != null) return decodeURI(r[2]);
  return; //返回参数值
}

function delUrlParam(url, ref) {
  //删除url里的参数
  if (url.indexOf(ref) == -1) return url;
  var arr_url = url.split('?');
  var base = arr_url[0];
  var arr_param = arr_url[1].split('&');
  var index = -1;
  for (var i = 0; i < arr_param.length; i++) {
    var paired = arr_param[i].split('=');
    if (paired[0] == ref) {
      index = i;
      break;
    }
  }
  if (index == -1) {
    return url;
  } else {
    arr_param.splice(index, 1);
    return base + '?' + arr_param.join('&');
  }
}

function webviewHomeConfig() {
  let url, param, urlconfig;
  if (__global.env.toLowerCase() === 'uat') {
    url =
      'https://m.uat.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/home/home?isMini=2&disable_redirect_https=1&seo=0';
  } else {
    url =
      'https://m.ctrip.com/webapp/you/tripshoot/paipai/home/home?isMini=2&seo=0';
  }
  param = {
    url: encodeURIComponent(url),
    needLogin: false,
    isNavigate: true,
  };
  urlconfig = JSON.stringify(param);
  return urlconfig;
}

function removeHtmlTagAddBr(str) {
  str = str || ''; // undefined posibility
  str = str.replace(/<\/p>/g, '<br></p>');
  str = str.replace(/<\/div>/g, '<br></div>');
  str = str.replace(/<(?!\/?br)[^<>]*>/g, '');
  str = str.replace(/<\/?[^>]*>/gi, '\r\n\n');
  return str;
}

//数据判断，超过10000转文字单位，保留1位小数,四舍五入; 小于10000时，按实际展示
function formateNum(num) {
  var result;
  if (num == 0 || num == undefined) {
    return 0;
  }
  if (num >= 10000000) {
    num = (num / 10000000).toFixed(1);
    result = num + 'kw';
  } else if (num >= 10000) {
    num = (num / 10000).toFixed(1);
    result = num + 'w';
  } else {
    result = num;
  }
  return result;
}

function urlPrefix() {
  let prefix;
  if (__global.env.toLowerCase() === 'uat') {
    if (ISLOCAL) {
      prefix = 'http://a.uat.qa.nt.ctripcorp.com/webapp/you/paipai/';
    } else {
      prefix = 'http://m.uat.qa.nt.ctripcorp.com/webapp/you/livestream/paipai/';
    }
  } else {
    prefix = 'https://m.ctrip.com/webapp/you/livestream/paipai/'; //生产
  }
  return prefix;
}

function newUrlPrefix() {
  let prefix;
  if (__global.env.toLowerCase() === 'uat') {
    if (ISLOCAL) {
      prefix = 'http://a.uat.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
    } else {
      prefix = 'https://m.uat.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
    }
  } else if (__global.env.toLowerCase() === 'fat') {
    prefix =
      'https://m.ctrip.fat325.qa.nt.ctripcorp.com/webapp/you/tripshoot/paipai/';
  } else {
    prefix = 'https://m.ctrip.com/webapp/you/tripshoot/paipai/'; //生产
  }
  return prefix;
}

function urlCommonPrefix() {
  let prefix;
  if (__global.env.toLowerCase() === 'uat') {
    if (ISLOCAL) {
      prefix = 'http://a.uat.qa.nt.ctripcorp.com/webapp/you/';
    } else {
      prefix = 'http://m.uat.qa.nt.ctripcorp.com/webapp/you/livestream/';
    }
  } else {
    prefix = 'https://m.ctrip.com/webapp/you/livestream/'; //生产
  }
  return prefix;
}

//跳转到webview页面
function jumpToWebview(param, methods = 'navigateTo') {
  // let param = {
  //   url: encodeURIComponent('https://m.ctrip.com/webapp/you/livestream/plan/crhList.html?isHideNavBar=YES&inMini=1&fromPage=home&autoawaken=close&popup=close'),
  //   needLogin: false,
  //   isNavigate: true,
  // }
  console.log('jumpToWebview', JSON.stringify(param));
  var url = '/pages/you/lvpai/webview/webview?data=' + JSON.stringify(param);
  wx[methods]({
    url: url,
  });
}

function formateData(obj) {
  var date = new Date(obj);
  var y = 1900 + date.getYear();
  var m = '0' + (date.getMonth() + 1);
  var d = '0' + date.getDate();
  return (
    y +
    '-' +
    m.substring(m.length - 2, m.length) +
    '-' +
    d.substring(d.length - 2, d.length)
  );
}

function formateTime(obj) {
  var unixtimestamp = new Date(obj);
  var year = 1900 + unixtimestamp.getYear();
  var month = '0' + (unixtimestamp.getMonth() + 1);
  var date = '0' + unixtimestamp.getDate();
  var hour = '0' + unixtimestamp.getHours();
  var minute = '0' + unixtimestamp.getMinutes();
  var second = '0' + unixtimestamp.getSeconds();
  return (
    year +
    '-' +
    month.substring(month.length - 2, month.length) +
    '-' +
    date.substring(date.length - 2, date.length) +
    ' ' +
    hour.substring(hour.length - 2, hour.length) +
    ':' +
    minute.substring(minute.length - 2, minute.length) +
    ':' +
    second.substring(second.length - 2, second.length)
  );
}

/*检查接口异常，必须加在最外层判断，
 * res: 接口返回;
 * callback: 会话过期的时候重新登录可进行的操作
 * toastFlag: 返回false的时候是否显示toast弹框,默认是true
 *
 */
function checkResponseAck(res, callback, toastFlag) {
  var status = false;
  if (
    res &&
    res.statusCode == 200 &&
    res.data &&
    res.data.ResponseStatus &&
    res.data.ResponseStatus.Ack.toLowerCase() === 'success'
  ) {
    status = true;
  } else if (
    res &&
    res.data &&
    res.data.ResponseStatus &&
    res.data.ResponseStatus.Ack.toLowerCase() === 'failure' &&
    res.data.ResponseStatus.Errors[0].ErrorCode ==
      'MobileRequestFilterException'
  ) {
    toastFlag = false;
    cwx.user.logout((logoutres) => {
      cwx.user.login({
        callback: function (loginres) {
          console.log('isLogin', loginres);
          if (loginres && loginres.ReturnCode == 0) {
            return callback && callback();
          }
        },
      });
    });
  }
  if (toastFlag == undefined) {
    toastFlag = false;
  }
  if (!status && toastFlag) {
    wx.showToast({
      title: '请求异常，请重试~',
      icon: 'none',
    });
  }
  return status;
}

function checkSessionOverTime(res) {
  var status = true; //未过期
  if (
    res &&
    res.data &&
    res.data.ResponseStatus &&
    res.data.ResponseStatus.Ack.toLowerCase() === 'failure' &&
    res.data.ResponseStatus.Errors[0].ErrorCode ==
      'MobileRequestFilterException'
  ) {
    status = false; //已过期
  }
  return status;
}

function logoutAndLogin(callback) {
  cwx.user.logout((logoutres) => {
    cwx.user.login({
      callback: function (loginres) {
        console.log('isLogin', loginres);
        if (loginres && loginres.ReturnCode == 0) {
          return callback && callback();
        }
      },
    });
  });
}
// 版本号比较函数
function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}

// 跳转兼容
function jumpToDetail(url, methods = 'navigateTo') {
  if (url.indexOf('/pages/') > -1 || url.indexOf('cwebview') > -1) {
    cwx[methods]({
      url: url,
      fail(error) {
        if (error) {
          cwx.switchTab({
            url: url,
          });
        }
      },
    });
  } else if (url.indexOf('https') > -1) {
    let param = {
      url: encodeURIComponent(url),
      needLogin: false,
      isNavigate: true,
    };
    this.jumpToWebview(param, methods);
  }
}

function tryJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

module.exports = {
  API_HOST,
  DEBUG,
  ISLOCAL,
  isIphoneX,
  getQueryString,
  delUrlParam,
  webviewHomeConfig,
  removeHtmlTagAddBr,
  formateNum,
  urlPrefix,
  newUrlPrefix,
  jumpToWebview,
  formateData,
  formateTime,
  checkResponseAck,
  compareVersion,
  urlCommonPrefix,
  checkSessionOverTime,
  logoutAndLogin,
  jumpToDetail,
  tryJSONParse,
};
